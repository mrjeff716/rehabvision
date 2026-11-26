// =============================================================================
// physioAccount.js — the physio's own practice settings (business plan slides 4–9).
//   GET  /api/physio/account                 -> profile, verification, aid, billing, price
//   PUT  /api/physio/profile                 { region, phone, clinic, languages, listed }
//   POST /api/physio/verification            { consent: true } -> send documents for review
//   POST /api/physio/aid                     { tracks, declaration, consent } -> apply for aid
//   PUT  /api/physio/billing/plan            { plan, annual }
//   POST /api/physio/billing/payment         { method: 'whish'|'omt', reference }
// =============================================================================

import { Router } from 'express'
import User from '../models/User.js'
import Document from '../models/Document.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { AID_TRACKS, PLANS, REGIONS, suggestedAid } from '../data/pricing.js'
import { currentQuote, isVerified, maxPatients } from '../data/physioStatus.js'

const router = Router()
router.use(requireAuth, requireRole('physio'))

export const REQUIRED_VERIFICATION = ['id_front', 'id_back', 'selfie_id', 'optl_front', 'optl_back', 'optl_dues', 'degree', 'workplace']
const LANGS = ['ar', 'en', 'fr', 'hy', 'es', 'de', 'it', 'tr']

// Documents each aid track needs (slide 8). ID, OPTL card and dues come from verification.
export const AID_DOCS = {
  A: ['graduation_proof'],
  B: ['income_declaration', 'income_proof', 'municipality_letter'],
  C: ['displacement_proof', 'municipality_letter'],
  D: ['pledge_letter'],
  E: ['sponsor_letter'],
}

router.get('/account', async (req, res, next) => {
  try {
    const me = req.user
    const [patientCount, docs] = await Promise.all([
      User.countDocuments({ role: 'patient', physio: me._id }),
      Document.find({ owner: me._id }).sort({ createdAt: 1 }),
    ])
    res.json({
      profile: { region: me.region, phone: me.phone, clinic: me.clinic, languages: me.languages ?? [], listed: !!me.listed },
      verification: { status: me.verification?.status ?? 'none', ...me.toJSON().verification, verified: isVerified(me) },
      aid: { status: me.aid?.status ?? 'none', ...me.toJSON().aid },
      billing: { plan: me.billing?.plan ?? 'starter', ...me.toJSON().billing },
      quote: currentQuote(me),
      patientCount,
      maxPatients: maxPatients(me),
      docs,
    })
  } catch (e) {
    next(e)
  }
})

router.put('/profile', async (req, res, next) => {
  try {
    const { region, phone, clinic, languages, listed } = req.body ?? {}
    if (region !== undefined && region !== null && !REGIONS[region]) return res.status(400).json({ error: 'Unknown region' })
    if (phone !== undefined && phone !== null && (typeof phone !== 'string' || !/^\+?[0-9 ()-]{6,20}$/.test(phone.trim()))) {
      return res.status(400).json({ error: 'Enter a valid phone number' })
    }
    if (clinic !== undefined && clinic !== null && (typeof clinic !== 'string' || clinic.length > 120)) {
      return res.status(400).json({ error: 'Clinic name is too long' })
    }
    if (languages !== undefined && (!Array.isArray(languages) || languages.some((l) => !LANGS.includes(l)))) {
      return res.status(400).json({ error: 'Unknown language' })
    }
    const me = req.user
    // The region sets the price, so it can't change while the verification is being reviewed
    if (region !== undefined && region !== me.region && me.verification?.status === 'pending') {
      return res.status(409).json({ error: 'Documents under review cannot be changed' })
    }
    if (region !== undefined) me.region = region
    if (phone !== undefined) me.phone = phone?.trim() || null
    if (clinic !== undefined) me.clinic = clinic?.trim() || null
    if (languages !== undefined) me.languages = [...new Set(languages)]
    if (listed !== undefined) me.listed = !!listed
    await me.save()
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

router.post('/verification', async (req, res, next) => {
  try {
    const me = req.user
    if (req.body?.consent !== true) return res.status(400).json({ error: 'Please agree to have your documents checked' })
    if (me.verification?.status === 'pending') return res.status(409).json({ error: 'Your documents are already being reviewed' })
    if (!me.region || !me.phone) return res.status(400).json({ error: 'Add your region and phone number first' })
    const kinds = await Document.distinct('kind', { owner: me._id })
    const missing = REQUIRED_VERIFICATION.filter((k) => !kinds.includes(k))
    if (missing.length) return res.status(400).json({ error: `Missing documents: ${missing.join(', ')}` })

    me.verification = { ...me.toJSON().verification, status: 'pending', submittedAt: new Date(), note: undefined }
    await me.save()
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

// tracks: { A: true, B: 'under250', C: 'damaged', D: true, E: 'Sponsor name' }
function cleanTracks(tracks) {
  if (!tracks || typeof tracks !== 'object') return null
  const out = {}
  if (tracks.A === true) out.A = true
  if (tracks.B) { if (!(tracks.B in AID_TRACKS.B.options)) return null; out.B = tracks.B }
  if (tracks.C) { if (!(tracks.C in AID_TRACKS.C.options)) return null; out.C = tracks.C }
  if (tracks.D === true) out.D = true
  if (tracks.E) { if (typeof tracks.E !== 'string' || tracks.E.length > 120) return null; out.E = tracks.E.trim() }
  return Object.keys(out).length ? out : null
}

router.post('/aid', async (req, res, next) => {
  try {
    const me = req.user
    const { tracks, declaration, consent } = req.body ?? {}
    if (me.aid?.bannedUntil && me.aid.bannedUntil > new Date()) {
      return res.status(403).json({ error: 'You cannot apply for aid until the ban ends' })
    }
    if (me.aid?.status === 'pending') return res.status(409).json({ error: 'Your application is already being reviewed' })
    if (!['pending', 'approved'].includes(me.verification?.status)) {
      return res.status(400).json({ error: 'Send your verification documents first' })
    }
    const clean = cleanTracks(tracks)
    if (!clean) return res.status(400).json({ error: 'Choose at least one aid track' })
    if (clean.A && me.aid?.tracks?.A && me.aid.status === 'approved') {
      return res.status(400).json({ error: 'Early-career aid can only be given once' })
    }
    if (declaration !== true || consent !== true) {
      return res.status(400).json({ error: 'Please confirm the declaration and consent to verification' })
    }
    const kinds = await Document.distinct('kind', { owner: me._id })
    const needed = [...new Set(Object.keys(clean).flatMap((k) => AID_DOCS[k]))]
    const missing = needed.filter((k) => !kinds.includes(k))
    if (missing.length) return res.status(400).json({ error: `Missing documents: ${missing.join(', ')}` })

    me.aid = {
      ...me.toJSON().aid,
      status: 'pending',
      tracks: clean,
      suggestedPct: suggestedAid(clean),
      approvals: [],
      submittedAt: new Date(),
      note: undefined,
    }
    await me.save()
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

router.put('/billing/plan', async (req, res, next) => {
  try {
    const { plan, annual } = req.body ?? {}
    if (!PLANS[plan]) return res.status(400).json({ error: 'Unknown plan' })
    const me = req.user
    const count = await User.countDocuments({ role: 'patient', physio: me._id })
    if (count > PLANS[plan].maxPatients) {
      return res.status(400).json({ error: `This plan allows ${PLANS[plan].maxPatients} patients; you have ${count}` })
    }
    me.billing = { ...me.toJSON().billing, plan, annual: !!annual }
    await me.save()
    res.json({ quote: currentQuote(me) })
  } catch (e) {
    next(e)
  }
})

router.post('/billing/payment', async (req, res, next) => {
  try {
    const { method, reference } = req.body ?? {}
    if (!['whish', 'omt'].includes(method)) return res.status(400).json({ error: 'Choose Whish or OMT' })
    if (typeof reference !== 'string' || !/^[A-Za-z0-9-]{4,40}$/.test(reference.trim())) {
      return res.status(400).json({ error: 'Enter the transfer reference from your receipt' })
    }
    const me = req.user
    if (!isVerified(me)) return res.status(403).json({ error: 'Your account must be verified before paying' })
    const q = currentQuote(me)
    me.billing = {
      ...me.toJSON().billing,
      pending: { method, reference: reference.trim(), amount: q.dueNow, months: q.months, submittedAt: new Date() },
    }
    await me.save()
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

export default router
