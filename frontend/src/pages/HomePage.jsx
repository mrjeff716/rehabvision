// =============================================================================
// HomePage.jsx — shows the right home page for the logged-in user's role,
// with a header (name, role, log out) that slides away while scrolling down
// and comes back on scroll up.
// =============================================================================

import { LogOut } from 'lucide-react'
import { useAuth } from '../auth/authContext'
import PatientHome from './PatientHome'
import PhysioHome from './PhysioHome'
import SiteFooter from '../components/SiteFooter'
import useHideOnScroll from '../components/useHideOnScroll'

const HomePage = () => {
  const { user, logout } = useAuth()
  const headerHidden = useHideOnScroll()

  return (
    <>
      <a href="#content" className="skip-link">Skip to content</a>
      <header className="app-header" data-hidden={headerHidden}>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 sm:px-6">
          <p className="flex items-center gap-3 text-lg font-semibold tracking-tight">
            <img src="/logo-mark.png" alt="" className="h-9 w-9" />
            RehabVision
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">
              <span className="font-semibold text-ink">{user.name}</span> · {user.role === 'physio' ? 'Physiotherapist' : 'Patient'}
            </span>
            <button className="btn-secondary" onClick={logout}>
              <LogOut aria-hidden /> Log out
            </button>
          </div>
        </div>
      </header>
      <main id="content" className="mx-auto max-w-3xl animate-fade-in px-4 pb-8 pt-8 sm:px-6 sm:pt-12">
        <h1 className="sr-only">{user.role === 'physio' ? 'Physiotherapist home' : 'My exercises'}</h1>
        {user.role === 'physio' ? <PhysioHome /> : <PatientHome />}
      </main>
      <SiteFooter />
    </>
  )
}

export default HomePage
