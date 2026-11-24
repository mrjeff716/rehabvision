// =============================================================================
// SiteFooter.jsx — business details and links to every policy page.
// =============================================================================

import { Link } from 'react-router'
import Field from '../legal/Field'

const SiteFooter = () => (
  <footer className="site-footer">
    <nav aria-label="Legal" className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
      <Link to="/privacy">Privacy policy</Link>
      <Link to="/terms">Terms of use</Link>
      <Link to="/cookies">Cookies and storage</Link>
      <Link to="/accessibility">Accessibility</Link>
    </nav>
    <p>
      RehabVision is operated by <Field name="legalName" label="company name" />,{' '}
      <Field name="address" label="registered address" />. Registration no.{' '}
      <Field name="registrationNo" label="registration number" />. Contact:{' '}
      <Field name="email" label="contact email" />.
    </p>
    <p className="mt-2">RehabVision does not replace advice from your physiotherapist or doctor.</p>
  </footer>
)

export default SiteFooter
