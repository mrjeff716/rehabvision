// =============================================================================
// User.js — patients and physiotherapists are both "users", with a role.
//
//   physio  -> has a publicId (e.g. "PT-7K3Q9X") they share with patients
//   patient -> can link to one physio (by that publicId) and receives up to
//              3 exercises the physio assigns
// =============================================================================

import mongoose from 'mongoose'
import { MAX_EXERCISES_PER_PATIENT } from '../data/exercises.js'

// One exercise the physio prescribed for a patient. All angles are in degrees,
// using the clinical convention from the exercise catalog (0° = neutral,
// e.g. a straight knee).
const assignmentSchema = new mongoose.Schema(
  {
    exerciseId: { type: String, required: true },          // id from the catalog JSON
    side: { type: String, enum: ['left', 'right'], required: true },
    startAngle: { type: Number, required: true, min: 0, max: 180 },   // resting position
    targetAngle: { type: Number, required: true, min: 0, max: 180 },  // goal of each rep
    permittedMin: { type: Number, required: true, min: 0, max: 180 }, // safe range, low end
    permittedMax: { type: Number, required: true, min: 0, max: 180 }, // safe range, high end
    reps: { type: Number, required: true, min: 1, max: 100 },         // repetitions prescribed
    stopCriteria: { type: String, required: true, maxlength: 500 },   // when to stop (pain etc.)
    clinicalClearance: { type: Boolean, required: true },             // physio confirmed it's safe
  },
  { _id: true, timestamps: true },
)

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true }, // never the real password
    role: { type: String, enum: ['patient', 'physio'], required: true },

    // Forgot password: only a SHA-256 hash of the emailed reset token is
    // stored, so a database leak can't be used to reset anyone's password.
    resetTokenHash: { type: String, default: null, index: true },
    resetTokenExpires: { type: Date, default: null },
    // Set when the password changes; login tokens issued before this stop working
    passwordChangedAt: { type: Date, default: null },

    // Physio only: the ID patients type in to find them. "sparse" lets
    // patients (who have none) share the unique index.
    publicId: { type: String, unique: true, sparse: true },

    // Patient only: their physio, and the exercises that physio assigned
    physio: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    exercises: {
      type: [assignmentSchema],
      default: undefined, // physios don't get an empty array
      validate: {
        validator: (arr) => !arr || arr.length <= MAX_EXERCISES_PER_PATIENT,
        message: `A patient can have at most ${MAX_EXERCISES_PER_PATIENT} exercises`,
      },
    },
  },
  { timestamps: true },
)

// Never send the password hash (or Mongo's internal __v) to the browser
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash
    delete ret.resetTokenHash
    delete ret.resetTokenExpires
    delete ret.passwordChangedAt
    delete ret.__v
    return ret
  },
})

export default mongoose.model('User', userSchema)
