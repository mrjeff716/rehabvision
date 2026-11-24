// =============================================================================
// ForgotPasswordPage.jsx — enter your email to get a password reset link.
// The server answers the same way whether or not the email has an account.
// =============================================================================

import { useState } from 'react'
import { Link } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { api } from '../api'
import SiteFooter from '../components/SiteFooter'

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

  return (
    <>
    <main className="auth-card">
      {sentTo ? (
        <>
          <h1 className="mb-4 text-3xl font-semibold">Check your email</h1>
          <div role="status" className="flex flex-col gap-3.5 leading-relaxed text-ink">
            <p>If an account exists for <span className="font-semibold">{sentTo}</span>, we've sent a link to reset your password. It expires in 30 minutes.</p>
            <p className="text-sm text-muted">Can't find it? Check your spam folder, or <button type="button" className="link" onClick={() => setSentTo('')}>try again</button>.</p>
          </div>
          <p className="mt-6 text-center text-sm text-muted"><Link className="link" to="/login">Back to log in</Link></p>
        </>
      ) : (
        <>
          <h1 className="mb-3 text-3xl font-semibold">Forgot password</h1>
          <p className="mb-6 text-muted">Enter the email you signed up with and we'll send you a link to choose a new password.</p>
          <form onSubmit={submit} onInvalidCapture={(e) => { e.preventDefault(); e.currentTarget.querySelector(':invalid')?.focus() }} className="stagger flex flex-col gap-3.5">
            <label className="form-label" htmlFor="forgot-email">Email</label>
            <input id="forgot-email" className="field" type="email" placeholder="name@example.com" autoComplete="email" autoFocus
              value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} />
            <p className="field-hint hint-empty">Enter the email you signed up with.</p>
            <p className="field-hint hint-format">That email looks incomplete. Try something like name@example.com.</p>
            {error && <p role="alert" className="alert-error">{error}</p>}
            <button className="btn-primary btn-lg mt-2 w-full" disabled={busy}>
              {busy ? <><LoaderCircle aria-hidden className="animate-spin" /> Sending…</> : 'Send reset link'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">Remembered it? <Link className="link" to="/login">Log in</Link></p>
        </>
      )}
    </main>
    <SiteFooter />
    </>
  )
}

export default ForgotPasswordPage
