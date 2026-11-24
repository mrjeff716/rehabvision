// =============================================================================
// App.jsx — decides which page to show for each URL.
//   /          -> the patient or physio home page (must be logged in)
//   /login     -> log in
//   /register  -> create an account
//   /privacy, /terms, /cookies, /accessibility -> policy pages (open to everyone)
// =============================================================================

import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from './auth/authContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HomePage from './pages/HomePage'
import { AccessibilityPage, CookiesPage, PrivacyPage, TermsPage } from './legal/pages'
import StorageNotice from './components/StorageNotice'

const TITLES = {
  '/login': 'Log in',
  '/register': 'Create an account',
  '/privacy': 'Privacy policy',
  '/terms': 'Terms of use',
  '/cookies': 'Cookies and storage',
  '/accessibility': 'Accessibility',
}

const App = () => {
  const { user, loading } = useAuth()
  const { pathname } = useLocation()

  // Each page gets its own tab title, and a new page starts at the top
  useEffect(() => {
    document.title = TITLES[pathname] ? `${TITLES[pathname]} · RehabVision` : 'RehabVision'
    window.scrollTo(0, 0)
  }, [pathname])

  // While checking a saved login, show a spinner (avoids a flash of the login page)
  if (loading) {
    return (
      <p role="status" className="grid min-h-screen place-items-center">
        <span className="flex items-center gap-3 text-sm font-semibold text-muted">
          <LoaderCircle aria-hidden className="h-5 w-5 animate-spin text-accent" /> Loading…
        </span>
      </p>
    )
  }

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/cookies" element={<CookiesPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <StorageNotice />
    </>
  )
}

export default App
