// =============================================================================
// ResetPasswordPage.jsx — opened from the link in the reset email
// (/reset-password?token=...). Choose a new password; on success the user is
// logged in and App.jsx sends them to "/".
// =============================================================================

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useAuth } from '../auth/authContext'

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

  if (!token) {
    return (
      <main className="auth-card">
        <h1 className="mb-4 text-3xl font-semibold">Link not valid</h1>
        <p className="text-sm text-slate-300">This reset link is missing its code. Open the link from your email again, or request a new one.</p>
        <p className="mt-6 text-center text-sm text-slate-400"><Link className="link" to="/forgot-password">Request a new link</Link></p>
      </main>
    )
  }

  return (
    <main className="auth-card">
      <h1 className="mb-7 text-3xl font-semibold">Choose a new password</h1>
      <form onSubmit={submit} onInvalidCapture={(e) => { e.preventDefault(); e.currentTarget.querySelector(':invalid')?.focus() }} className="stagger flex flex-col gap-3.5">
        <input className="field" type="password" placeholder="New password (8+ characters)" autoComplete="new-password" autoFocus
          value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72} />
        <p className="field-hint hint-empty">Choose a new password.</p>
        <p className="field-hint hint-format">Almost there. Your password needs at least 8 characters.</p>
        <input className="field" type="password" placeholder="Repeat new password" autoComplete="new-password"
          value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <p className="field-hint hint-empty">Type the new password again.</p>
        {error && <p className="alert-error">{error}</p>}
        <button className="btn-primary btn-lg mt-2 w-full" disabled={busy}>
          {busy ? 'Saving…' : 'Save and log in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-400">Link expired? <Link className="link" to="/forgot-password">Request a new one</Link></p>
    </main>
  )
}

export default ResetPasswordPage
