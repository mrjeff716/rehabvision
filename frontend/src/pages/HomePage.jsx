// =============================================================================
// HomePage.jsx — shows the right home page for the logged-in user's role,
// with a header (name, role, log out) that slides away while scrolling down
// and comes back on scroll up.
// Patients pick a language; the whole page (and its direction, e.g. Arabic
// right-to-left) follows it. The physio side is English only for now.
// =============================================================================

import { useEffect, useState } from 'react'
import { Languages, LogOut } from 'lucide-react'
import { useAuth } from '../auth/authContext'
import PatientHome from './PatientHome'
import PhysioHome from './PhysioHome'
import SiteFooter from '../components/SiteFooter'
import useHideOnScroll from '../components/useHideOnScroll'
import { LANGUAGES, getStrings, loadLang, saveLang } from '../i18n/messages'

// "Maria Haddad" -> "MH" (for the round avatar in the header)
const initials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('') || '?'

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
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
          <p dir="ltr" className="flex items-center gap-2.5 text-lg font-bold tracking-tight">
            <img src="/logo-mark.png" alt="" className="h-9 w-9" />
            <span className="hidden min-[400px]:inline">RehabVision</span>
          </p>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Patients choose the language of the whole page and the coach's voice */}
            {!isPhysio && (
              <label className="relative flex items-center">
                <span className="sr-only">{t.ui.language}</span>
                <Languages aria-hidden className="pointer-events-none absolute start-2.5 h-4 w-4 text-muted" />
                <select value={lang} onChange={(e) => changeLang(e.target.value)}
                  className="field-sm w-auto max-w-[9.5rem] cursor-pointer ps-8 font-semibold">
                  {Object.entries(LANGUAGES).map(([code, l]) => (
                    <option key={code} value={code}>{l.name}</option>
                  ))}
                </select>
              </label>
            )}
            <span className="flex items-center gap-2.5" title={user.name}>
              <span aria-hidden className="avatar">{initials(user.name)}</span>
              <span className="hidden flex-col leading-tight sm:flex">
                <span className="max-w-[10rem] truncate text-sm font-semibold text-ink">{user.name}</span>
                <span className="text-xs text-muted">{isPhysio ? t.ui.physio : t.ui.patient}</span>
              </span>
            </span>
            <button className="btn-ghost px-3" onClick={logout} aria-label={t.ui.logout}>
              <LogOut aria-hidden className="rtl:-scale-x-100" /> <span className="hidden sm:inline">{t.ui.logout}</span>
            </button>
          </div>
        </div>
      </header>
      <main id="content" className="mx-auto max-w-3xl animate-fade-in px-4 pb-8 pt-6 sm:px-6 sm:pt-10">
        <h1 className="sr-only">{isPhysio ? 'Physiotherapist home' : t.ui.myExercises}</h1>
        {isPhysio ? <PhysioHome /> : <PatientHome lang={lang} />}
      </main>
      <SiteFooter />
    </>
  )
}

export default HomePage
