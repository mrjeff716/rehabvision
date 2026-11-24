// =============================================================================
// App.jsx — decides which page to show for each URL.
//   /          -> the patient or physio home page (must be logged in)
//   /login     -> log in
//   /register  -> create an account
//   /forgot-password -> ask for a password reset email
//   /reset-password?token=... -> choose a new password (link from that email)
// =============================================================================

import { Navigate, Route, Routes } from 'react-router'
import { useAuth } from './auth/authContext'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import HomePage from './pages/HomePage'

const App = () => {
  const { user, loading } = useAuth()

  // While checking a saved login, show nothing else (avoids a flash of the login page)
  if (loading) return <p className="grid min-h-screen animate-pulse place-items-center font-mono text-xs uppercase tracking-[0.3em] text-brand-300">Loading…</p>

  return (
    <Routes>
      <Route path="/" element={user ? <HomePage /> : <Navigate to="/login" replace />} />
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/forgot-password" element={user ? <Navigate to="/" replace /> : <ForgotPasswordPage />} />
      <Route path="/reset-password" element={user ? <Navigate to="/" replace /> : <ResetPasswordPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
