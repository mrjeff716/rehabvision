// =============================================================================
// pricing.js — plans, regional discounts and financial aid (business plan,
// slides 4–7). The website shows the same numbers: keep
// frontend/src/billing/pricing.js identical to this file.
//
//   price = plan price − (regional % + approved aid %), total capped at 75%
//           (a sponsor can pay more), never below $6 a month (cost ≈ $4.50).
//   Annual prepay: 12 months for the price of 10.
// =============================================================================

export const PLANS = {
  starter: { price: 20, maxPatients: 10 },
  growth: { price: 35, maxPatients: 25 },
  practice: { price: 50, maxPatients: 50 },
}

// P: typical clinic session price in the region (USD), N: need score 0–1
export const REGIONS = {
  beirut: { P: 35, N: 0 },
  keserwan_jbeil: { P: 35, N: 0.05 },
  mount_lebanon: { P: 35, N: 0.1 },
  north_koura: { P: 30, N: 0.3 },
  bekaa: { P: 27, N: 0.5 },
  north_tripoli: { P: 27, N: 0.6 },
  south: { P: 28, N: 0.6 },
  nabatieh: { P: 25, N: 0.8 },
  baalbek_hermel: { P: 23, N: 0.8 },
  akkar: { P: 22, N: 1 },
}

const REFERENCE_PRICE = 35
export const MAX_REGIONAL = 50
export const MAX_TOTAL = 75
export const MIN_MONTHLY = 6
export const ANNUAL_MONTHS_PAID = 10

// D = min(50%, 0.5 × (1 − P/35) + 0.3 × N), rounded to the nearest 5%
export function regionalDiscount(region) {
  const r = REGIONS[region]
  if (!r) return 0
  const raw = 0.5 * (1 - r.P / REFERENCE_PRICE) + 0.3 * r.N
  const pct = Math.round((raw * 100) / 5) * 5
  return Math.max(0, Math.min(MAX_REGIONAL, pct))
}

// Aid tracks (slide 7). pct: what the track adds; options: the qualifying level.
export const AID_TRACKS = {
  A: { pct: 30 },                                             // early career, once
  B: { options: { under250: 40, from250to550: 25, from550to750: 10 } }, // income hardship
  C: { options: { damaged: 30, lostPatients: 20 } },          // war or displacement
  D: { pct: 20 },                                             // community care pledge
  E: { sponsored: true },                                     // NGO / MoPH / OPTL / university seat
}

// Suggested aid % for an application, before a reviewer decides
export function suggestedAid(tracks = {}) {
  let pct = 0
  if (tracks.A) pct += AID_TRACKS.A.pct
  if (tracks.B) pct += AID_TRACKS.B.options[tracks.B] ?? 0
  if (tracks.C) pct += AID_TRACKS.C.options[tracks.C] ?? 0
  if (tracks.D) pct += AID_TRACKS.D.pct
  return pct
}

// Monthly price for a physio. aidPct: approved aid; sponsorPct: what a sponsor
// covers (lifts the 75% cap and the $6 floor). pilot: half price on top.
export function quote({ plan = 'starter', region, aidPct = 0, sponsorPct = 0, pilot = false, annual = false } = {}) {
  const list = (PLANS[plan] ?? PLANS.starter).price
  const regionalPct = regionalDiscount(region)
  const discountPct = Math.min(MAX_TOTAL, regionalPct + aidPct)
  let monthly = Math.max(MIN_MONTHLY, list * (1 - discountPct / 100))
  if (pilot) monthly /= 2
  if (sponsorPct > 0) monthly = monthly * (1 - Math.min(100, sponsorPct) / 100)
  monthly = Math.round(monthly * 100) / 100
  return {
    plan: PLANS[plan] ? plan : 'starter',
    list,
    regionalPct,
    aidPct,
    discountPct,
    sponsorPct,
    pilot,
    monthly,
    dueNow: annual ? Math.round(monthly * ANNUAL_MONTHS_PAID * 100) / 100 : monthly,
    months: annual ? 12 : 1,
  }
}
