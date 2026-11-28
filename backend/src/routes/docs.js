// =============================================================================
// docs.js — verification and aid documents (photos taken in the app, or files).
//   POST   /api/docs        { kind, mime, data (base64) } -> { doc }   physio only
//   GET    /api/docs/mine                                   -> { docs }  physio only
//   GET    /api/docs/:id    -> the file itself (owner or reviewer)
//   DELETE /api/docs/:id    -> remove my upload (not while it's under review)
// =============================================================================

import { Router } from 'express'
import mongoose from 'mongoose'
import Document, { DOC_KINDS, MIME_TYPES, MAX_BYTES } from '../models/Document.js'
import { isAdmin, requireAuth, requireRole } from '../middleware/auth.js'

const router = Router()
router.use(requireAuth)

// Kinds that can hold several files (3 months of income proof, several certificates...)
const MULTI = new Set(['income_proof', 'certificate', 'displacement_proof'])
const MAX_PER_KIND = 5

// File signatures, so a renamed file can't pretend to be an image
const MAGIC = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46],
  'application/pdf': [0x25, 0x50, 0x44, 0x46],
}
const matchesType = (buf, mime) => MAGIC[mime].every((b, i) => buf[i] === b)

// Documents can't change while a reviewer is looking at them
const VERIFY_KINDS = new Set(DOC_KINDS.slice(0, 10))
const locked = (user, kind) =>
  VERIFY_KINDS.has(kind) ? user.verification?.status === 'pending' : user.aid?.status === 'pending'

router.post('/', requireRole('physio'), async (req, res, next) => {
  try {
    const { kind, mime, data } = req.body ?? {}
    if (!DOC_KINDS.includes(kind)) return res.status(400).json({ error: 'Unknown document type' })
    if (!MIME_TYPES.includes(mime) || typeof data !== 'string') {
      return res.status(400).json({ error: 'Upload a photo (JPG, PNG, WebP) or a PDF' })
    }
    if (locked(req.user, kind)) return res.status(409).json({ error: 'Documents under review cannot be changed' })
    const buf = Buffer.from(data, 'base64')
    if (!buf.length || buf.length > MAX_BYTES) return res.status(400).json({ error: 'Files must be under 4 MB' })
    if (!matchesType(buf, mime)) return res.status(400).json({ error: 'Upload a photo (JPG, PNG, WebP) or a PDF' })

    const existing = await Document.countDocuments({ owner: req.user._id, kind })
    if (!MULTI.has(kind) && existing) await Document.deleteMany({ owner: req.user._id, kind }) // retake replaces
    else if (existing >= MAX_PER_KIND) return res.status(400).json({ error: 'Too many files of this type' })

    const doc = await Document.create({ owner: req.user._id, kind, mime, size: buf.length, data: buf })
    res.status(201).json({ doc })
  } catch (e) {
    next(e)
  }
})

router.get('/mine', requireRole('physio'), async (req, res, next) => {
  try {
    res.json({ docs: await Document.find({ owner: req.user._id }).sort({ createdAt: 1 }) })
  } catch (e) {
    next(e)
  }
})

// Owner or reviewer only. Sent as a download-safe file (no HTML is ever served).
router.get('/:id', async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(404).json({ error: 'Not found' })
    const doc = await Document.findById(req.params.id).select('+data')
    if (!doc || (!doc.owner.equals(req.user._id) && !isAdmin(req.user))) return res.status(404).json({ error: 'Not found' })
    res.set({
      'Content-Type': doc.mime,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': 'inline',
    })
    res.send(doc.data)
  } catch (e) {
    next(e)
  }
})

router.delete('/:id', requireRole('physio'), async (req, res, next) => {
  try {
    if (!mongoose.isObjectIdOrHexString(req.params.id)) return res.status(404).json({ error: 'Not found' })
    const doc = await Document.findOne({ _id: req.params.id, owner: req.user._id })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    if (locked(req.user, doc.kind)) return res.status(409).json({ error: 'Documents under review cannot be changed' })
    await doc.deleteOne()
    res.json({ ok: true })
  } catch (e) {
    next(e)
  }
})

export default router
