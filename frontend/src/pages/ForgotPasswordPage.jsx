// =============================================================================
// ForgotPasswordPage.jsx — enter your email to get a password reset link.
// The server answers the same way whether or not the email has an account.
// =============================================================================

import { useState } from 'react'
import { Link } from 'react-router'
import { api } from '../api'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await api('/auth/forgot-password', { method: 'POST', body: { email } })
      setSentTo(email.trim())
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (sentTo) {
    return (
      <main className="auth-card">
        <h1 className="mb-4 text-3xl font-semibold">Check your email</h1>
        <div className="stagger flex flex-col gap-3.5 text-sm leading-relaxed text-slate-300">
          <p>If an account exists for <span className="font-semibold text-slate-100">{sentTo}</span>, we've sent a link to reset your password. It expires in 30 minutes.</p>
          <p className="text-slate-400">Can't find it? Check your spam folder, or <button type="button" className="link" onClick={() => setSentTo('')}>try again</button>.</p>
        </div>
        <p className="mt-6 text-center text-sm text-slate-400"><Link className="link" to="/login">Back to log in</Link></p>
      </main>
    )
  }

  return (
    <main className="auth-card">
      <h1 className="mb-3 text-3xl font-semibold">Forgot password</h1>
      <p className="mb-6 text-sm text-slate-400">Enter the email you signed up with and we'll send you a link to choose a new password.</p>
      <form onSubmit={submit} onInvalidCapture={(e) => { e.preventDefault(); e.currentTarget.querySelector(':invalid')?.focus() }} className="stagger flex flex-col gap-3.5">
        <input className="field" type="email" placeholder="Email" autoComplete="email" autoFocus
          value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} />
        <p className="field-hint hint-empty">Enter the email you signed up with.</p>
        <p className="field-hint hint-format">That email looks incomplete. Try something like name@example.com.</p>
        {error && <p className="alert-error">{error}</p>}
        <button className="btn-primary btn-lg mt-2 w-full" disabled={busy}>
          {busy ? 'Sending…' : 'Send reset link'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">Remembered it? <Link className="link" to="/login">Log in</Link></p>
    </main>
  )
}

export default ForgotPasswordPage
