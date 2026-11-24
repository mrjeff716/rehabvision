// =============================================================================
// HomePage.jsx — shows the right home page for the logged-in user's role,
// with a small header (name, role, log out).
// Patients pick a language; the whole page (and its direction, e.g. Arabic
// right-to-left) follows it. The physio side is English only for now.
// =============================================================================

import { useEffect, useState } from 'react'
import { useAuth } from '../auth/authContext'
import PatientHome from './PatientHome'
import PhysioHome from './PhysioHome'
import { getStrings, loadLang, saveLang } from '../i18n/messages'

const HomePage = () => {
  const { user, logout } = useAuth()
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
    <main className="mx-auto max-w-3xl px-4 pb-16 pt-4 sm:px-6 sm:pt-6">
      <header className="app-header mb-8 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
        <h1 dir="ltr" className="flex items-center gap-3 text-lg font-bold tracking-tight sm:text-xl">
          <img src="/logo-mark.png" alt="" className="h-9 w-9 drop-shadow-[0_0_10px_rgb(46_230_166/0.45)] sm:h-10 sm:w-10" />
          <span><span className="text-white">Rehab</span><span className="bg-gradient-to-r from-brand-300 to-brand-500 bg-clip-text text-transparent">Vision</span></span>
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-400">{user.name} ({isPhysio ? t.ui.physio : t.ui.patient})</span>
          <button className="btn-secondary" onClick={logout}>{t.ui.logout}</button>
        </div>
      </header>
      {isPhysio ? <PhysioHome /> : <PatientHome lang={lang} onLangChange={changeLang} />}
    </main>
  )
}

export default HomePage
