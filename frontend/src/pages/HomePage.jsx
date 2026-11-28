// =============================================================================
// HomePage.jsx — shows the right home page for the logged-in user's role,
// under a frosted header (name, role, language, log out) that slides away
// while scrolling down and comes back on scroll up.
// =============================================================================

import { Link } from 'react-router'
import { BadgeCheck, LogOut } from 'lucide-react'
import { useAuth } from '../auth/authContext'
import PatientHome from './PatientHome'
import PhysioDashboard from './PhysioDashboard'
import SiteFooter from '../components/SiteFooter'
import useHideOnScroll from '../components/useHideOnScroll'
import { LanguagePicker, useLang } from '../i18n/AppLanguage'

const HomePage = () => {
  const { user, logout } = useAuth()
  const { t } = useLang()
  const headerHidden = useHideOnScroll()
  const isPhysio = user.role === 'physio'
  const initials = user.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <>
      <a href="#content" className="skip-link">{t.skip}</a>
      <header className="app-header" data-hidden={headerHidden}>
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight" dir="ltr">
            <img src="/logo-mark.png" alt="" className="h-9 w-9" />
            <span className="sr-only sm:not-sr-only">RehabVision</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-2.5">
              <span title={user.name} aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-semibold text-white">{initials}</span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="text-sm font-semibold">{user.name}</span>
                <span className="flex items-center gap-1 text-xs text-muted">
                  {isPhysio ? t.physio : t.patient}
                  {isPhysio && user.verification?.status === 'approved' && <BadgeCheck aria-label={t.vStatus.approved} className="h-3.5 w-3.5 text-accent" />}
                </span>
              </span>
            </span>
            <LanguagePicker />
            <button className="btn-ghost" onClick={logout}>
              <LogOut aria-hidden className="rtl:-scale-x-100" /> <span className="sr-only sm:not-sr-only">{t.logout}</span>
            </button>
          </div>
        </div>
      </header>
      <main id="content" className="mx-auto max-w-5xl animate-fade-in px-4 pb-8 pt-8 sm:px-6 sm:pt-10">
        <h1 className="sr-only">{isPhysio ? t.physioHome : t.patientHome}</h1>
        {isPhysio ? <PhysioDashboard /> : <PatientHome />}
      </main>
      <SiteFooter />
    </>
  )
}

export default HomePage
