// =============================================================================
// ResetPasswordPage.jsx — opened from the link in the reset email
// (/reset-password?token=...). Choose a new password; on success the user is
// logged in and App.jsx sends them to "/".
// =============================================================================

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from '../auth/authContext'
import PasswordField from '../components/PasswordField'
import SiteFooter from '../components/SiteFooter'

const ResetPasswordPage = () => {
  const { resetPassword } = useAuth()
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError("The two passwords don't match.")
      return
    }
    setBusy(true)
    try {
      await resetPassword(token, password) // logged in: App.jsx redirects to "/"
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <>
    <main className="auth-card">
      {!token ? (
        <>
          <h1 className="mb-4 text-3xl font-bold">Link not valid</h1>
          <p className="text-ink">This reset link is missing its code. Open the link from your email again, or request a new one.</p>
          <p className="mt-6 text-center text-sm text-muted"><Link className="link" to="/forgot-password">Request a new link</Link></p>
        </>
      ) : (
        <>
          <h1 className="mb-7 text-3xl font-bold">Choose a new password</h1>
          <form onSubmit={submit} onInvalidCapture={(e) => { e.preventDefault(); e.currentTarget.querySelector(':invalid')?.focus() }} className="stagger flex flex-col gap-3.5">
            <label className="form-label" htmlFor="reset-password">New password (at least 8 characters)</label>
            <PasswordField id="reset-password" placeholder="Choose a new password" autoComplete="new-password" autoFocus
              value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72} />
            <p className="field-hint hint-empty">Choose a new password.</p>
            <p className="field-hint hint-format">Almost there. Your password needs at least 8 characters.</p>
            <label className="form-label" htmlFor="reset-confirm">Repeat new password</label>
            <PasswordField id="reset-confirm" placeholder="Type it again" autoComplete="new-password"
              value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
            <p className="field-hint hint-empty">Type the new password again.</p>
            {error && <p role="alert" className="alert-error">{error}</p>}
            <button className="btn-primary btn-lg mt-2 w-full" disabled={busy}>
              {busy ? <><LoaderCircle aria-hidden className="animate-spin" /> Saving…</> : 'Save and log in'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-muted">Link expired? <Link className="link" to="/forgot-password">Request a new one</Link></p>
        </>
      )}
    </main>
    <SiteFooter />
    </>
  )
}

export default ResetPasswordPage
