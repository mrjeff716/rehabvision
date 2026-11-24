// =============================================================================
// sessions.js — exercise sessions, for logged-in PATIENTS.
//   POST /api/sessions       -> save a finished session
//   GET  /api/sessions/mine  -> my recent sessions
// (Physios see sessions through /api/physio/...)
// =============================================================================

import { Router } from 'express'
import Session from '../models/Session.js'
import { requireAuth, requireRole } from '../middleware/auth.js'
import { isValidExerciseId, SIDES } from '../data/exercises.js'

const router = Router()
router.use(requireAuth, requireRole('patient'))

const MAX_REPS_PER_SESSION = 1000
const isAngle = (v) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 180

// POST /api/sessions
// Body: { exerciseId, side, plan: {startAngle, targetAngle, permittedMin, permittedMax, reps},
//         reps: [{ peakAngle, reachedTarget, t }], painScore?, performedAt? }
// The patient is taken from the login token, never from the body, so nobody
// can save sessions for someone else.
router.post('/', async (req, res, next) => {
  try {
    const { exerciseId, side, plan, reps, painScore, performedAt } = req.body ?? {}

    if (!isValidExerciseId(exerciseId)) return res.status(400).json({ error: 'Unknown exercise' })
    if (!SIDES.includes(side)) return res.status(400).json({ error: 'side must be left or right' })

    if (!plan || typeof plan !== 'object' ||
        !['startAngle', 'targetAngle', 'permittedMin', 'permittedMax'].every((k) => isAngle(plan[k])) ||
        !Number.isInteger(plan.reps) || plan.reps < 1 || plan.reps > 100) {
      return res.status(400).json({ error: 'Invalid plan' })
    }

    if (!Array.isArray(reps) || reps.length > MAX_REPS_PER_SESSION) {
      return res.status(400).json({ error: 'Invalid reps' })
    }
    // An empty session would show the physio a session that never happened
    if (reps.length === 0) return res.status(400).json({ error: 'A session needs at least one rep' })
    for (const r of reps) {
      if (!r || !isAngle(r.peakAngle) || typeof r.reachedTarget !== 'boolean' ||
          typeof r.t !== 'number' || !Number.isFinite(r.t)) {
        return res.status(400).json({ error: 'Invalid reps' })
      }
    }

    if (painScore !== undefined && painScore !== null &&
        (!Number.isInteger(painScore) || painScore < 0 || painScore > 10)) {
      return res.status(400).json({ error: 'painScore must be a whole number from 0 to 10' })
    }

    // Sessions saved offline are sent later, so keep the time they were really
    // done — but not in the future (allow 5 minutes for clock differences).
    let when = new Date()
    if (performedAt !== undefined) {
      const d = new Date(performedAt)
      if (Number.isNaN(d.getTime()) || d.getTime() > Date.now() + 5 * 60 * 1000) {
        return res.status(400).json({ error: 'Invalid performedAt' })
      }
      when = d
    }

    const cleanReps = reps.map((r) => ({ peakAngle: r.peakAngle, reachedTarget: r.reachedTarget, t: r.t }))
    const session = await Session.create({
      patient: req.user._id,
      physio: req.user.physio ?? null,
      exerciseId,
      side,
      plan: {
        startAngle: plan.startAngle,
        targetAngle: plan.targetAngle,
        permittedMin: plan.permittedMin,
        permittedMax: plan.permittedMax,
        reps: plan.reps,
      },
      reps: cleanReps,
      // Totals are calculated here rather than trusted from the browser
      totalReps: cleanReps.length,
      goodReps: cleanReps.filter((r) => r.reachedTarget).length,
      painScore: painScore ?? undefined,
      performedAt: when,
    })
    res.status(201).json({ session })
  } catch (e) {
    next(e)
  }
})

router.get('/mine', async (req, res, next) => {
  try {
    const sessions = await Session.find({ patient: req.user._id }).sort({ performedAt: -1 }).limit(50)
    res.json({ sessions })
  } catch (e) {
    next(e)
  }
})

export default router
