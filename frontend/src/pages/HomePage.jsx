// =============================================================================
// HomePage.jsx — shows the right home page for the logged-in user's role,
// with a header (name, role, log out) that slides away while scrolling down
// and comes back on scroll up.
// Patients pick a language; the whole page (and its direction, e.g. Arabic
// right-to-left) follows it. The physio side is English only for now.
// =============================================================================

import { useEffect, useState } from 'react'
import { LogOut } from 'lucide-react'
import { useAuth } from '../auth/authContext'
import PatientHome from './PatientHome'
import PhysioHome from './PhysioHome'
import SiteFooter from '../components/SiteFooter'
import useHideOnScroll from '../components/useHideOnScroll'
import { getStrings, loadLang, saveLang } from '../i18n/messages'

const HomePage = () => {
  const { user, logout } = useAuth()
  const headerHidden = useHideOnScroll()
  const isPhysio = user.role === 'physio'
  const [lang, setLang] = useState(loadLang)
  const t = getStrings(isPhysio ? 'en' : lang)

  const changeLang = (code) => {
    setLang(code)
    saveLang(code)
  }

  // Language + direction on <html>, so toasts and dialogs follow too
  useEffect(() => {
    const html = document.documentElement
    html.lang = t.lang
    html.dir = t.dir
    return () => { html.lang = 'en'; html.dir = 'ltr' }
  }, [t.lang, t.dir])

  return (
    <>
      <a href="#content" className="skip-link">Skip to content</a>
      <header className="app-header" data-hidden={headerHidden}>
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-3 sm:px-6">
          <p dir="ltr" className="flex items-center gap-3 text-lg font-semibold tracking-tight">
            <img src="/logo-mark.png" alt="" className="h-9 w-9" />
            RehabVision
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted">
              <span className="font-semibold text-ink">{user.name}</span> · {isPhysio ? t.ui.physio : t.ui.patient}
            </span>
            <button className="btn-secondary" onClick={logout}>
              <LogOut aria-hidden className="rtl:-scale-x-100" /> {t.ui.logout}
            </button>
          </div>
        </div>
      </header>
      <main id="content" className="mx-auto max-w-3xl animate-fade-in px-4 pb-8 pt-8 sm:px-6 sm:pt-12">
        <h1 className="sr-only">{isPhysio ? 'Physiotherapist home' : t.ui.myExercises}</h1>
        {isPhysio ? <PhysioHome /> : <PatientHome lang={lang} onLangChange={changeLang} />}
      </main>
      <SiteFooter />
    </>
  )
}

export default HomePage
