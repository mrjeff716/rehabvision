// =============================================================================
// physioStatus.js — answers about one physio, used by several routes:
// are they verified, what do they pay, how many patients may they have.
// =============================================================================

import { PLANS, quote } from './pricing.js'

const DAY = 24 * 3600 * 1000
export const GRACE_DAYS = 30 // re-verification grace period (slide 9)

export const addMonths = (date, n) => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}
export const addDays = (date, n) => new Date(new Date(date).getTime() + n * DAY)

// Approved, and the yearly re-check isn't more than 30 days overdue. A yearly
// renewal under review (pending, with an earlier approval) still counts.
export function isVerified(physio, now = new Date()) {
  const v = physio?.verification
  return ['approved', 'pending'].includes(v?.status) && !!v.verifiedUntil && addDays(v.verifiedUntil, GRACE_DAYS) > now
}

export function activeAid(physio, now = new Date()) {
  const a = physio?.aid
  if (a?.status !== 'approved' || !a.validUntil || a.validUntil <= now) return { aidPct: 0, sponsorPct: 0 }
  return { aidPct: a.approvedPct ?? 0, sponsorPct: a.sponsorPct ?? 0 }
}

export function planOf(physio) {
  return PLANS[physio?.billing?.plan] ? physio.billing.plan : 'starter'
}

export function currentQuote(physio, now = new Date()) {
  return quote({
    plan: planOf(physio),
    region: physio.region,
    ...activeAid(physio, now),
    pilot: !!physio.billing?.pilotUntil && physio.billing.pilotUntil > now,
    annual: !!physio.billing?.annual,
  })
}

export const maxPatients = (physio) => PLANS[planOf(physio)].maxPatients
