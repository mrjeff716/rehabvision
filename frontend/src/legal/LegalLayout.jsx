// =============================================================================
// LegalLayout.jsx — shared frame for the policy pages: header with language
// picker, title, "last updated" date, footer. Uses the app's language setting.
// =============================================================================

import { Link } from 'react-router'
import SiteFooter from '../components/SiteFooter'
import { BUSINESS } from './business'
import { LanguagePicker, useLang } from '../i18n/AppLanguage'

const LegalLayout = ({ title, children }) => {
  const { t, locale } = useLang()
  const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'UTC' })
    .format(new Date(`${BUSINESS.lastUpdated}T00:00:00Z`))

  return (
    <>
      <a href="#content" className="skip-link">{t.skip}</a>
      <header className="border-b border-ink">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight" dir="ltr">
            <img src="/logo-mark.png" alt="" className="h-9 w-9" />
            RehabVision
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <LanguagePicker />
            <Link to="/" className="btn-secondary">{t.backToApp}</Link>
          </div>
        </div>
      </header>
      <main id="content" className="mx-auto max-w-3xl animate-fade-up px-4 pt-10 sm:px-6 sm:pt-14">
        <h1 className="mb-2 text-4xl font-semibold sm:text-5xl">{title}</h1>
        <p className="mb-8 text-sm text-muted">{t.lastUpdated} {date}</p>
        <div className="prose-legal">{children}</div>
      </main>
      <SiteFooter />
    </>
  )
}

export default LegalLayout
