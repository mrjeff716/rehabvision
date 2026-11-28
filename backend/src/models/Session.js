// =============================================================================
// Session.js — one time a patient did one exercise (e.g. 10 heel slides).
//
// Privacy: only numbers are stored — no video or images ever leave the
// patient's phone.
// =============================================================================

import mongoose from 'mongoose'

// One repetition inside a session
const repSchema = new mongoose.Schema(
  {
    peakAngle: Number,      // furthest the joint moved towards the target (degrees)
    reachedTarget: Boolean, // got close enough to the physio's target?
    t: Number,              // when the rep finished (timestamp in ms)
  },
  { _id: false },
)

// A copy of the plan the patient followed, so the physio can still see it
// later even if they change the patient's exercises afterwards.
const planSnapshotSchema = new mongoose.Schema(
  {
    startAngle: Number,
    targetAngle: Number,
    permittedMin: Number,
    permittedMax: Number,
    reps: Number,
  },
  { _id: false },
)

const sessionSchema = new mongoose.Schema(
  {
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    physio: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    exerciseId: { type: String, required: true }, // id from the catalog JSON
    side: { type: String, enum: ['left', 'right'], required: true },
    plan: planSnapshotSchema,
    reps: [repSchema],
    totalReps: Number, // calculated by the server from reps
    goodReps: Number,  // reps that reached the target
    painScore: { type: Number, min: 0, max: 10 }, // optional, 0–10
    // Incident log (clinical liability): the patient says something went wrong
    incident: { type: String, maxlength: 500, default: undefined },
    performedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true },
)

export default mongoose.model('Session', sessionSchema)
