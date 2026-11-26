// =============================================================================
// physio.js — things only a logged-in PHYSIOTHERAPIST can do.
//   GET    /api/physio/patients                    -> my linked patients + their exercises
//   PUT    /api/physio/patients/:id/exercises      -> set a patient's exercises (max 3)
//   DELETE /api/physio/patients/:id                -> remove a patient from my list
//   GET    /api/physio/patients/:id/sessions       -> a patient's recent sessions
//   GET    /api/physio/flags                       -> my patients who need attention
// A physio can only ever see or change patients linked to them.
// =============================================================================

import { Router } from 'express'
import mongoose from 'mongoose'
import User from '../models/User.js'
import Session from '../models/Session.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { isValidExerciseId, SIDES, MAX_EXERCISES_PER_PATIENT } from '../data/exercises.js'

const router = Router()
router.use(requireAuth, requireRole('physio'))

// A rep needs some movement to be countable, so start and target must differ by this much
const MIN_RANGE_DEG = 10

// Finds a patient linked to the logged-in physio, or sends a 404
async function findMyPatient(req, res) {
  // Strict check: a real 24-character id (isValidObjectId also accepts any 12-char string)
  if (!mongoose.isObjectIdOrHexString(req.params.id)) {
    res.status(404).json({ error: 'Patient not found' })
    return null
  }
  const patient = await User.findOne({ _id: req.params.id, role: 'patient', physio: req.user._id })
  if (!patient) res.status(404).json({ error: 'Patient not found' })
  return patient
}

const isAngle = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 180

// Checks the exercise list a physio sends. Returns { error } or { exercises }.
// Every rule here protects the patient, so nothing is silently "fixed" —
// a bad value is rejected with a message saying which exercise and why.
export function validateAssignments(input) {
  if (!Array.isArray(input)) return { error: 'exercises must be a list' }
  if (input.length > MAX_EXERCISES_PER_PATIENT) {
    return { error: `A patient can have at most ${MAX_EXERCISES_PER_PATIENT} exercises` }
  }

  const seen = new Set()
  const exercises = []
  for (const [i, a] of input.entries()) {
    const where = `Exercise ${i + 1}`
    if (!a || typeof a !== 'object') return { error: `${where}: invalid` }
    if (!isValidExerciseId(a.exerciseId)) return { error: `${where}: unknown exercise` }
    if (!SIDES.includes(a.side)) return { error: `${where}: side must be left or right` }

    const key = `${a.exerciseId}:${a.side}`
    if (seen.has(key)) return { error: `${where}: this exercise and side is already in the list` }
    seen.add(key)

    for (const field of ['startAngle', 'targetAngle', 'permittedMin', 'permittedMax']) {
      if (!isAngle(a[field])) return { error: `${where}: ${field} must be a number from 0 to 180` }
    }
    if (a.permittedMin >= a.permittedMax) {
      return { error: `${where}: the permitted minimum must be lower than the maximum` }
    }
    if (a.startAngle < a.permittedMin || a.startAngle > a.permittedMax) {
      return { error: `${where}: the start angle must be inside the permitted range` }
    }
    if (a.targetAngle < a.permittedMin || a.targetAngle > a.permittedMax) {
      return { error: `${where}: the target angle must be inside the permitted range` }
    }
    if (Math.abs(a.targetAngle - a.startAngle) < MIN_RANGE_DEG) {
      return { error: `${where}: start and target must be at least ${MIN_RANGE_DEG}° apart` }
    }
    if (!Number.isInteger(a.reps) || a.reps < 1 || a.reps > 100) {
      return { error: `${where}: repetitions must be a whole number from 1 to 100` }
    }
    if (typeof a.stopCriteria !== 'string' || !a.stopCriteria.trim() || a.stopCriteria.length > 500) {
      return { error: `${where}: please write when the patient should stop (max 500 characters)` }
    }
    if (a.clinicalClearance !== true) {
      return { error: `${where}: confirm clinical clearance before assigning` }
    }

    exercises.push({
      exerciseId: a.exerciseId,
      side: a.side,
      startAngle: a.startAngle,
      targetAngle: a.targetAngle,
      permittedMin: a.permittedMin,
      permittedMax: a.permittedMax,
      reps: a.reps,
      stopCriteria: a.stopCriteria.trim(),
      clinicalClearance: true,
    })
  }
  return { exercises }
}

router.get('/patients', async (req, res, next) => {
  try {
    const patients = await User.find({ role: 'patient', physio: req.user._id })
      .select('name email exercises createdAt')
      .sort({ name: 1 })
    res.json({ patients })
  } catch (e) {
    next(e)
  }
})

router.put('/patients/:id/exercises', async (req, res, next) => {
  try {
    const patient = await findMyPatient(req, res)
    if (!patient) return

    const { error, exercises } = validateAssignments(req.body?.exercises)
    if (error) return res.status(400).json({ error })

    patient.exercises = exercises
    await patient.save()
    res.json({ patient: { _id: patient._id, name: patient.name, email: patient.email, exercises: patient.exercises } })
  } catch (e) {
    next(e)
  }
})

router.delete('/patients/:id', async (req, res, next) => {
  try {
    const patient = await findMyPatient(req, res)
    if (!patient) return
    patient.physio = null
    patient.exercises = []
    await patient.save()
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

router.get('/patients/:id/sessions', async (req, res, next) => {
  try {
    const patient = await findMyPatient(req, res)
    if (!patient) return
    const sessions = await Session.find({ patient: patient._id })
      .sort({ performedAt: -1 })
      .limit(50)
    res.json({ sessions })
  } catch (e) {
    next(e)
  }
})

// Patients who need attention in the last 7 days. A patient is flagged if:
//   - fewer than 50% of their reps reached the target, or
//   - they did fewer than 3 sessions (including none at all)
//   - they rated pain 7/10 or more, or reported an incident
// Worst first.
router.get('/flags', async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000)
    const patients = await User.find({ role: 'patient', physio: req.user._id }).select('name')
    const sessions = await Session.find({
      patient: { $in: patients.map((p) => p._id) },
      performedAt: { $gte: since },
    }).select('patient totalReps goodReps performedAt painScore incident')

    const flagged = []
    for (const p of patients) {
      const mine = sessions.filter((s) => s.patient.equals(p._id))
      const total = mine.reduce((sum, s) => sum + (s.totalReps || 0), 0)
      const good = mine.reduce((sum, s) => sum + (s.goodReps || 0), 0)
      const quality = total > 0 ? good / total : 0
      const lastSeen = mine.reduce((latest, s) => (!latest || s.performedAt > latest ? s.performedAt : latest), null)

      const maxPain = mine.reduce((m, s) => Math.max(m, s.painScore ?? 0), 0)
      const incidents = mine.filter((s) => s.incident).map((s) => s.incident)

      const reasons = []
      if (mine.length < 3) reasons.push(`only ${mine.length} session(s) this week`)
      if (total > 0 && quality < 0.5) reasons.push(`only ${Math.round(quality * 100)}% of reps reached the target`)
      if (mine.length > 0 && total === 0) reasons.push('sessions had no completed reps')
      if (maxPain >= 7) reasons.push(`pain rated ${maxPain}/10`)
      if (incidents.length) reasons.push(`reported: ${incidents.join(' | ')}`)

      if (reasons.length) {
        flagged.push({ patientId: p._id, name: p.name, sessions: mine.length, total, good, quality, lastSeen, maxPain, incidents, reasons })
      }
    }
    // Safety first: incidents and high pain, then lowest quality
    flagged.sort((a, b) => (b.incidents.length > 0) - (a.incidents.length > 0) || b.maxPain - a.maxPain || a.quality - b.quality)
    res.json({ flagged })
  } catch (e) {
    next(e)
  }
})

export default router
