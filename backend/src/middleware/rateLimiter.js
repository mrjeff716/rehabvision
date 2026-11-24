// =============================================================================
// rateLimiter.js — stops one device from flooding the API with requests.
//
// Simple in-memory version (no external service or credentials needed):
// each IP address may make `max` requests per `windowMs`. Extra requests get
// HTTP 429 "Too many requests". Counts reset when the server restarts, which
// is fine for a hackathon/demo.
// =============================================================================

export function createRateLimiter({ windowMs, max, message = 'Too many requests, please try again later.' }) {
  // ip -> { start: when this window began, count: requests so far }
  const hits = new Map()

  // Every window, delete expired entries so memory doesn't grow forever.
  // .unref() means this timer won't keep the process alive on its own.
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of hits) {
      if (now - entry.start > windowMs) hits.delete(key)
    }
  }, windowMs).unref()

  return function rateLimiter(req, res, next) {
    const key = req.ip
    const now = Date.now()
    const entry = hits.get(key)

    // First request from this IP, or its last window has expired: start fresh
    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 })
      return next()
    }

    // Same window: count it, and block if over the limit
    entry.count += 1
    if (entry.count > max) {
      return res.status(429).json({ error: message })
    }
    next()
  }
}

// General limit for the whole API: 100 requests per minute per IP
export default createRateLimiter({ windowMs: 60 * 1000, max: 100 })

// Stricter limit for login/register, to slow down password guessing
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many login attempts, please wait a few minutes and try again.',
})

// Forgot password sends real emails, so keep it low: 5 requests per 15 minutes
export const resetLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many password reset requests, please wait a few minutes and try again.',
})
