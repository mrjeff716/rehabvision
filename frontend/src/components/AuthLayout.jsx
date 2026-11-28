// =============================================================================
// AuthLayout.jsx — frame for log in, sign up and password pages: a top bar
// (home link, language), the form card, and a petrol panel with the dial.
// =============================================================================

import { Link } from 'react-router'
import RangeArc from './RangeArc'
import SiteFooter from './SiteFooter'
import { LanguagePicker, useLang } from '../i18n/AppLanguage'

export default function AuthLayout({ children }) {
  const { t } = useLang()
  return (
    <>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 font-semibold tracking-tight" dir="ltr">
          <img src="/logo-mark.png" alt="" className="h-8 w-8" /> RehabVision
        </Link>
        <LanguagePicker />
      </div>
      <div className="auth-shell">
        {children}
        <aside aria-hidden className="auth-art">
          <div aria-hidden className="absolute -end-24 -top-24 h-72 w-72 rounded-full bg-accent/40 blur-3xl" />
          <p className="relative max-w-sm text-3xl font-semibold leading-tight text-white">{t.heroTitle}</p>
          <div className="relative mt-12">
            <RangeArc dark angleLabel={t.demoAngle} repsLabel={t.demoReps} />
          </div>
          <p className="relative mt-10 flex items-center gap-2 text-sm text-white/70">{t.statPrivate}</p>
        </aside>
      </div>
      <SiteFooter />
    </>
  )
}
