// =============================================================================
// HomePage.jsx — shows the right home page for the logged-in user's role,
// with a header (name, role, language, log out) that slides away while
// scrolling down and comes back on scroll up.
// =============================================================================

import { LogOut } from 'lucide-react'
import { useAuth } from '../auth/authContext'
import PatientHome from './PatientHome'
import PhysioHome from './PhysioHome'
import SiteFooter from '../components/SiteFooter'
import useHideOnScroll from '../components/useHideOnScroll'
import { LanguagePicker, useLang } from '../i18n/AppLanguage'

const HomePage = () => {
  const { user, logout } = useAuth()
  const { t } = useLang()
  const headerHidden = useHideOnScroll()
  const isPhysio = user.role === 'physio'

  return (
    <>
      <a href="#content" className="skip-link">{t.skip}</a>
      <header className="app-header" data-hidden={headerHidden}>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 sm:px-6">
          <p className="flex items-center gap-3 text-lg font-semibold tracking-tight" dir="ltr">
            <img src="/logo-mark.png" alt="" className="h-9 w-9" />
            RehabVision
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted">
              <span className="font-semibold text-ink">{user.name}</span> · {isPhysio ? t.physio : t.patient}
            </span>
            <LanguagePicker />
            <button className="btn-secondary" onClick={logout}>
              <LogOut aria-hidden className="rtl:-scale-x-100" /> {t.logout}
            </button>
          </div>
        </div>
      </header>
      <main id="content" className="mx-auto max-w-3xl animate-fade-in px-4 pb-8 pt-8 sm:px-6 sm:pt-12">
        <h1 className="sr-only">{isPhysio ? t.physioHome : t.patientHome}</h1>
        {isPhysio ? <PhysioHome /> : <PatientHome />}
      </main>
      <SiteFooter />
    </>
  )
}

export default HomePage
