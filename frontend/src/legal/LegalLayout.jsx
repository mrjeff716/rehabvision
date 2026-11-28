// =============================================================================
// LegalLayout.jsx — shared frame for the policy pages, header, title, footer.
// =============================================================================

import { Link } from 'react-router'
import Field from './Field'
import SiteFooter from '../components/SiteFooter'

const LegalLayout = ({ title, children }) => (
  <>
    <a href="#content" className="skip-link">Skip to content</a>
    <header className="border-b border-rule bg-white">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <img src="/logo-mark.png" alt="" className="h-9 w-9" />
          RehabVision
        </Link>
        <Link to="/" className="btn-secondary">Back to the app</Link>
      </div>
    </header>
    <main id="content" className="mx-auto max-w-3xl animate-fade-up px-4 pt-10 sm:px-6 sm:pt-14">
      <h1 className="mb-2 text-4xl font-bold sm:text-5xl">{title}</h1>
      <p className="mb-8 text-sm text-muted">Last updated: <Field name="lastUpdated" label="date" /></p>
      <div className="prose-legal">{children}</div>
    </main>
    <SiteFooter />
  </>
)

export default LegalLayout
