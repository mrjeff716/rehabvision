// =============================================================================
// App.jsx — decides which page to show for each URL.
//   /          -> the patient or physio home page (must be logged in)
//   /login     -> log in
//   /register  -> create an account
//   /privacy, /terms, /pricing, /cookies, /accessibility -> policy pages (open to everyone)
// =============================================================================

import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from './auth/authContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import StorageNotice from './components/StorageNotice'
import { useLang } from './i18n/AppLanguage'

// Policy pages (all three languages) load only when opened, keeping the app itself small
const legal = (name) => lazy(() => import('./legal/pages').then((m) => ({ default: m[name] })))
const PrivacyPage = legal('PrivacyPage')
const TermsPage = legal('TermsPage')
const PricingPage = legal('PricingPage')
const CookiesPage = legal('CookiesPage')
const AccessibilityPage = legal('AccessibilityPage')

const App = () => {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()
  const { t } = useLang()

  // Each page gets its own tab title, and a new page starts at the top
  useEffect(() => {
    document.title = t.titles[pathname] ? `${t.titles[pathname]} · RehabVision` : 'RehabVision'
  }, [pathname, t])

  useEffect(() => { window.scrollTo(0, 0) }, [pathname])

  // While checking a saved login, show a spinner (avoids a flash of the login page)
  if (loading) {
    return (
      <p role="status" className="grid min-h-screen place-items-center">
        <span className="flex items-center gap-3 text-sm font-semibold text-muted">
          <LoaderCircle aria-hidden className="h-5 w-5 animate-spin text-accent" /> {t.loading}
        </span>
      </p>
    )
  }

  return (
    <>
      <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
      <StorageNotice />
    </>
  )
}

export default App
