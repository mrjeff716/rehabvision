// =============================================================================
// auth.js — login tokens (JWT) and route protection.
//
// After login/register, the server gives the browser a signed token. The
// browser sends it back on every request as:  Authorization: Bearer <token>
// requireAuth checks the signature, loads the user, and puts it on req.user.
// =============================================================================

import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const TOKEN_LIFETIME = '7d'

function secret() {
  const s = process.env.JWT_SECRET
  if (!s || s.startsWith('[')) throw new Error('JWT_SECRET is not set in .env')
  return s
}

// Create a token that proves "this is user X" for 7 days
export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, secret(), { expiresIn: TOKEN_LIFETIME })
}

// Blocks the request unless it carries a valid token for an existing user
export async function requireAuth(req, res, next) {
  const header = req.get('authorization') || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Please log in' })
  }

  let payload
  try {
    payload = jwt.verify(token, secret(), { algorithms: ['HS256'] })
  } catch {
    return res.status(401).json({ error: 'Your session has expired, please log in again' })
  }

  try {
    // Load the user fresh from the database, so deleted users are locked out
    const user = await User.findById(payload.sub)
    if (!user) return res.status(401).json({ error: 'Please log in' })
    // Password was reset after this token was issued: log out old devices.
    // (iat is in seconds; compare at second precision so the token issued
    // right after the reset still works.)
    if (user.passwordChangedAt && payload.iat < Math.floor(user.passwordChangedAt.getTime() / 1000)) {
      return res.status(401).json({ error: 'Your password was changed, please log in again' })
    }
    req.user = user
    next()
  } catch (e) {
    next(e)
  }
}

// Use after requireAuth: only lets one role through (e.g. requireRole('physio'))
export function requireRole(role) {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ error: `Only ${role} accounts can do this` })
    }
    next()
  }
}
