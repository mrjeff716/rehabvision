// =============================================================================
// AppLanguage.jsx — the app's display language (English, French or Arabic),
// shared by every screen and the policy pages.
//   const { t, lang, setLang, locale, tr } = useLang()
// The choice is remembered on this device ("appLanguage" in browser storage).
// First visit: the browser's language if it's French or Arabic, else English.
// Arabic switches the whole page to right-to-left.
// =============================================================================

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { uiStrings } from './ui'
import { translateError } from './errors'

export const APP_LANGS = [
  { code: 'en', label: 'English', locale: 'en-GB', dir: 'ltr' },
  { code: 'fr', label: 'Français', locale: 'fr-FR', dir: 'ltr' },
  // Western digits, as commonly used in Lebanon
  { code: 'ar', label: 'العربية', locale: 'ar-LB-u-nu-latn', dir: 'rtl' },
]

const KEY = 'appLanguage'
const isSupported = (code) => APP_LANGS.some((l) => l.code === code)

function initialLang() {
  try {
    const saved = localStorage.getItem(KEY)
    if (isSupported(saved)) return saved
  } catch { /* storage blocked: fall through */ }
  const browser = (navigator.language || 'en').slice(0, 2)
  return isSupported(browser) ? browser : 'en'
}

const LangContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)
  const { locale, dir } = APP_LANGS.find((l) => l.code === lang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
  }, [lang, dir])

  const value = useMemo(() => {
    const t = uiStrings(lang)
    const setLang = (code) => {
      if (!isSupported(code)) return
      try { localStorage.setItem(KEY, code) } catch { /* ignore */ }
      setLangState(code)
    }
    return { lang, setLang, locale, dir, t, tr: (message) => translateError(message, t) }
  }, [lang, locale, dir])

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export const useLang = () => useContext(LangContext)

// The language picker shown in headers
export function LanguagePicker() {
  const { lang, setLang, t } = useLang()
  return (
    <label className="flex items-center gap-2 text-sm font-medium">
      <span className="sr-only">{t.language}</span>
      <select className="field-sm w-auto cursor-pointer" value={lang} onChange={(e) => setLang(e.target.value)}>
        {APP_LANGS.map((l) => <option key={l.code} value={l.code} lang={l.code}>{l.label}</option>)}
      </select>
    </label>
  )
}
