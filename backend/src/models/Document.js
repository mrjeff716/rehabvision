// =============================================================================
// Document.js — a photo or PDF a physio uploads for verification or aid
// (ID, selfie with ID, OPTL card, receipts, letters...). Only the owner and
// reviewers can open it.
// shortcut: files live in MongoDB (fine for the pilot's few hundred files);
// move to private object storage before scaling past a few thousand physios.
// =============================================================================

import mongoose from 'mongoose'

// What each upload is. Verification (slide 9) and aid (slide 8) share some.
export const DOC_KINDS = [
  // verification
  'id_front', 'id_back', 'selfie_id', 'optl_front', 'optl_back', 'optl_dues',
  'degree', 'workplace', 'insurance', 'certificate',
  // financial aid
  'income_declaration', 'income_proof', 'municipality_letter', 'graduation_proof',
  'displacement_proof', 'pledge_letter', 'sponsor_letter',
]

export const MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
export const MAX_BYTES = 4 * 1024 * 1024

const documentSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kind: { type: String, enum: DOC_KINDS, required: true },
    mime: { type: String, enum: MIME_TYPES, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true, select: false }, // loaded only when opened
  },
  { timestamps: true },
)

documentSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.data
    delete ret.__v
    return ret
  },
})

export default mongoose.model('Document', documentSchema)
