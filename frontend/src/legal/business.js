// =============================================================================
// business.js — the ONE place for the operator's legal details.
// Shown in the footer and on the Privacy / Terms / Cookies / Accessibility pages.
//
// Every value below is a placeholder and MUST be filled in by the business
// before launch. Unfilled values are shown highlighted on the pages so they
// can't go live unnoticed (see <Field> in LegalLayout.jsx).
// =============================================================================

export const BUSINESS = {
  legalName: null,        // registered company or sole-trader name
  registrationNo: null,   // company / commercial register number
  address: null,          // registered postal address
  country: null,          // country whose law applies (governing law)
  email: null,            // contact email for users
  privacyEmail: null,     // contact for data-protection requests (can equal email)
  phone: null,            // optional
  hosting: null,          // who hosts the website and API (e.g. the hosting company)
  database: null,         // who hosts the database, and in which country
  retention: null,        // how long accounts and sessions are kept after closing an account
  minimumAge: null,       // minimum age to use the service without a guardian
  lastUpdated: null,      // date these policies were last reviewed, e.g. "1 December 2026"
}
