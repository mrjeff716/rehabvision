// =============================================================================
// business.js — the operator's details and prices, used by the footer and the
// policy pages (in every language). Change them here only.
// =============================================================================

export const BUSINESS = {
  name: 'RehabVision',
  country: 'Lebanon',
  email: 'rehabvisionofficial@gmail.com',
  privacyEmail: 'rehabvisionofficial@gmail.com',
  lastUpdated: '2026-11-26', // date these policies take effect (YYYY-MM-DD)
}

// Monthly price per physiotherapist, by how many active patients they can have
// (business plan slide 4; the app's own numbers live in src/billing/pricing.js).
// Patients never pay.
import { PLANS as PRICED } from '../billing/pricing'
export const PLANS = Object.values(PRICED)

// Policy numbers, so all three languages always say the same thing
export const POLICY = {
  deletionDays: 30,       // account deleted within this many days of a request
  moneyBackDays: 14,      // full refund of a physiotherapist's FIRST payment within this window
  refundRequestDays: 30,  // how long after a charge a refund can be requested
  refundReplyDays: 10,    // business days to answer a refund request
  refundPayDays: 14,      // days to pay an approved refund
  outageHours: 72,        // continuous downtime that earns a pro-rata refund
  latePaymentDays: 14,    // grace period before an unpaid account is limited
  priceNoticeDays: 30,    // notice before a price change
  adultAge: 18,           // under this age, patients need a supervising parent or guardian
}

export const mailto = (address) => <a href={`mailto:${address}`}>{address}</a>
