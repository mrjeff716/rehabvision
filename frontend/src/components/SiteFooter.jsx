// =============================================================================
// SiteFooter.jsx — business details and links to every policy page.
// =============================================================================

import { Link } from 'react-router'
import { BUSINESS, mailto } from '../legal/business'
import { useLang } from '../i18n/AppLanguage'

const SiteFooter = () => {
  const { t } = useLang()
  return (
    <footer className="site-footer">
      <nav aria-label={t.legalNav} className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
        <Link to="/privacy">{t.linkPrivacy}</Link>
        <Link to="/terms">{t.linkTerms}</Link>
        <Link to="/pricing">{t.linkPricing}</Link>
        <Link to="/cookies">{t.linkCookies}</Link>
        <Link to="/accessibility">{t.linkAccessibility}</Link>
      </nav>
      <p>
        {BUSINESS.name}, {t.country}. {t.contact} <bdi dir="ltr">{mailto(BUSINESS.email)}</bdi>
      </p>
      <p className="mt-2">{t.footerNote}</p>
    </footer>
  )
}

export default SiteFooter
