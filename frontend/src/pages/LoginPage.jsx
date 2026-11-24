// =============================================================================
// LoginPage.jsx — log in with email and password.
// =============================================================================

import { useState } from 'react'
import { Link } from 'react-router'
import { useAuth } from '../auth/authContext'

const LoginPage = () => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault() // don't reload the page
    setError('')
    setBusy(true)
    try {
      await login(email, password) // App.jsx then sends the user to "/"
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <main className="auth-card">
      <h1 className="mb-7 text-3xl font-semibold">Log in</h1>
      <form onSubmit={submit} onInvalidCapture={(e) => { e.preventDefault(); e.currentTarget.querySelector(':invalid')?.focus() }} className="stagger flex flex-col gap-3.5">
        {/* invalid fields show the styled hints below instead of the browser's popup */}
        <input className="field" type="email" placeholder="Email" autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} required />
        <p className="field-hint hint-empty">Enter the email you signed up with.</p>
        <p className="field-hint hint-format">That email looks incomplete. Try something like name@example.com.</p>
        <input className="field" type="password" placeholder="Password" autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} required />
        <p className="field-hint hint-empty">Enter your password to continue.</p>
        <Link className="link self-end text-sm" to="/forgot-password">Forgot password?</Link>
        {error && <p className="alert-error">{error}</p>}
        <button className="btn-primary btn-lg mt-2 w-full" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">No account? <Link className="link" to="/register">Create one</Link></p>
    </main>
  )
}

export default LoginPage
