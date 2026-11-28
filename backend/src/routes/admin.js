// =============================================================================
// admin.js — the review team (emails in ADMIN_EMAILS). Business plan slides 8–9.
//   GET  /api/admin/queue                    -> pending verifications, aid, payments
//   POST /api/admin/verification/:id         { decision: 'approve'|'reject', note, specialist }
//   POST /api/admin/aid/:id                  { decision: 'approve'|'reject'|'fraud', pct, sponsorPct, note }
//   POST /api/admin/payment/:id              { decision: 'confirm'|'reject' }
//   POST /api/admin/physio/:id/free-month    -> use one referral/pilot credit
//   POST /api/admin/physio/:id/pilot         { on } -> pilot: month 1 free, then half price for 12 months
// =============================================================================

import { Router } from 'express'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Document from '../models/Document.js'
import { requireAdmin, requireAuth } from '../middleware/auth.js'
import { regionalDiscount, MAX_TOTAL } from '../data/pricing.js'
import { addMonths, currentQuote, isVerified } from '../data/physioStatus.js'

const router = Router()
router.use(requireAuth, requireAdmin)

const SECOND_REVIEW_ABOVE = 50 // % total discount that needs a second reviewer
const NOTE_MAX = 500

async function findPhysio(req, res) {
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    res.status(404).json({ error: 'Not found' })
    return null
  }
  const physio = await User.findOne({ _id: req.params.id, role: 'physio' })
  if (!physio) res.status(404).json({ error: 'Not found' })
  return physio
}

const cleanNote = (note) => (typeof note === 'string' ? note.trim().slice(0, NOTE_MAX) : undefined)

router.get('/queue', async (_req, res, next) => {
  try {
    const physios = await User.find({
      role: 'physio',
      $or: [
        { 'verification.status': 'pending' },
        { 'aid.status': 'pending' },
        { 'billing.pending.reference': { $exists: true } },
        { 'billing.freeMonths': { $gt: 0 } },
      ],
    }).select('name email publicId region phone clinic languages verification aid billing createdAt')
    const docs = await Document.find({ owner: { $in: physios.map((p) => p._id) } }).sort({ createdAt: 1 })
    const all = await User.find({ role: 'physio' }).select('name email publicId verification billing').sort({ name: 1 })
    res.json({
      queue: physios.map((p) => ({
        ...p.toJSON(),
        verified: isVerified(p),
        regionalPct: regionalDiscount(p.region),
        quote: currentQuote(p),
        docs: docs.filter((d) => d.owner.equals(p._id)),
      })),
      physios: all.map((p) => ({ ...p.toJSON(), verified: isVerified(p) })),
    })
  } catch (e) {
    next(e)
  }
})

router.post('/verification/:id', async (req, res, next) => {
  try {
    const physio = await findPhysio(req, res)
    if (!physio) return
    const { decision, note, specialist } = req.body ?? {}
    if (!['approve', 'reject'].includes(decision)) return res.status(400).json({ error: 'Invalid decision' })
    if (physio.verification?.status !== 'pending') return res.status(409).json({ error: 'Nothing to review' })

    const firstApproval = decision === 'approve' && !physio.verification.verifiedUntil
    physio.verification = {
      ...physio.toJSON().verification,
      status: decision === 'approve' ? 'approved' : 'rejected',
      reviewedAt: new Date(),
      verifiedUntil: decision === 'approve' ? addMonths(new Date(), 12) : physio.verification.verifiedUntil,
      specialist: decision === 'approve' ? !!specialist : physio.verification.specialist,
      note: cleanNote(note),
    }
    // Referral: one free month each, once, when the new physio is first verified
    if (firstApproval && physio.referredBy) {
      physio.billing = { ...physio.toJSON().billing, freeMonths: (physio.billing?.freeMonths ?? 0) + 1 }
      await User.updateOne({ _id: physio.referredBy, role: 'physio' }, { $inc: { 'billing.freeMonths': 1 } })
    }
    await physio.save()
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

router.post('/aid/:id', async (req, res, next) => {
  try {
    const physio = await findPhysio(req, res)
    if (!physio) return
    const { decision, pct, sponsorPct, note } = req.body ?? {}
    if (!['approve', 'reject', 'fraud'].includes(decision)) return res.status(400).json({ error: 'Invalid decision' })
    if (physio.aid?.status !== 'pending') return res.status(409).json({ error: 'Nothing to review' })
    const aid = physio.toJSON().aid

    if (decision !== 'approve') {
      physio.aid = {
        ...aid,
        status: 'rejected',
        note: cleanNote(note),
        // False documents: aid removed and a 12-month ban (slide 8)
        bannedUntil: decision === 'fraud' ? addMonths(new Date(), 12) : aid.bannedUntil,
      }
      await physio.save()
      return res.json({ ok: true })
    }

    const aidPct = Number(pct)
    const sponsor = Number(sponsorPct ?? 0)
    if (!Number.isInteger(aidPct) || aidPct < 0 || aidPct > MAX_TOTAL) return res.status(400).json({ error: 'Aid must be 0–75%' })
    if (!Number.isInteger(sponsor) || sponsor < 0 || sponsor > 100 || (sponsor > 0 && !aid.tracks?.E)) {
      return res.status(400).json({ error: 'Sponsor share must be 0–100%, for sponsored seats only' })
    }
    const approvals = (aid.approvals ?? []).map(String)
    if (!approvals.includes(String(req.user._id))) approvals.push(String(req.user._id))
    const total = regionalDiscount(physio.region) + aidPct
    const done = total <= SECOND_REVIEW_ABOVE || approvals.length >= 2

    physio.aid = {
      ...aid,
      approvals,
      approvedPct: aidPct,
      sponsorPct: sponsor,
      note: cleanNote(note),
      ...(done ? { status: 'approved', validUntil: addMonths(new Date(), 6) } : {}),
    }
    await physio.save()
    res.json({ ok: true, needsSecondReviewer: !done })
  } catch (e) {
    next(e)
  }
})

router.post('/payment/:id', async (req, res, next) => {
  try {
    const physio = await findPhysio(req, res)
    if (!physio) return
    const { decision } = req.body ?? {}
    const pending = physio.billing?.pending
    if (!pending?.reference) return res.status(409).json({ error: 'Nothing to review' })
    if (!['confirm', 'reject'].includes(decision)) return res.status(400).json({ error: 'Invalid decision' })

    const billing = physio.toJSON().billing
    delete billing.pending
    if (decision === 'confirm') {
      const from = billing.paidUntil && new Date(billing.paidUntil) > new Date() ? billing.paidUntil : new Date()
      billing.paidUntil = addMonths(from, pending.months || 1)
    }
    physio.billing = billing
    await physio.save()
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

router.post('/physio/:id/free-month', async (req, res, next) => {
  try {
    const physio = await findPhysio(req, res)
    if (!physio) return
    const billing = physio.toJSON().billing ?? {}
    if (!(billing.freeMonths > 0)) return res.status(409).json({ error: 'No free months to use' })
    const from = billing.paidUntil && new Date(billing.paidUntil) > new Date() ? billing.paidUntil : new Date()
    physio.billing = { ...billing, freeMonths: billing.freeMonths - 1, paidUntil: addMonths(from, 1) }
    await physio.save()
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

router.post('/physio/:id/pilot', async (req, res, next) => {
  try {
    const physio = await findPhysio(req, res)
    if (!physio) return
    const billing = physio.toJSON().billing ?? {}
    const on = req.body?.on === true
    const alreadyPilot = !!billing.pilotUntil
    physio.billing = {
      ...billing,
      pilotUntil: on ? (billing.pilotUntil ?? addMonths(new Date(), 12)) : undefined,
      // Month 1 free (slide 11), granted once
      freeMonths: (billing.freeMonths ?? 0) + (on && !alreadyPilot ? 1 : 0),
    }
    await physio.save()
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

export default router
