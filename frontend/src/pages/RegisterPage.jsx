// =============================================================================
// RegisterPage.jsx — create an account as a patient or a physiotherapist.
// Physiotherapists automatically get a public ID to share with patients.
// Both must accept the Terms and Privacy policy; patients also give explicit
// consent to their exercise plans and results (health data) being stored and
// shared with the physiotherapist they link to.
// =============================================================================

import { useState } from 'react'
import { Link } from 'react-router'
import { HeartPulse, LoaderCircle, Stethoscope } from 'lucide-react'
import { useAuth } from '../auth/authContext'
import PasswordField from '../components/PasswordField'
import SiteFooter from '../components/SiteFooter'

const RegisterPage = () => {
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'patient' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await register(form) // App.jsx then sends the user to "/"
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <>
      <main className="auth-card">
        <h1 className="mb-7 text-3xl font-bold">Create an account</h1>
        <p className="auth-lead">It takes less than a minute.</p>
        <form onSubmit={submit} onInvalidCapture={(e) => { e.preventDefault(); e.currentTarget.querySelector(':invalid')?.focus() }} className="stagger flex flex-col gap-3.5">
          {/* invalid fields show the styled hints below instead of the browser's popup */}
          <fieldset className="mb-1">
            <legend className="form-label mb-2">I am a</legend>
            <div className="segmented">
              <span className="segmented-indicator" aria-hidden />
              <label>
                <input className="sr-only" type="radio" name="role" value="patient" checked={form.role === 'patient'} onChange={update('role')} />
                <HeartPulse aria-hidden /> Patient
              </label>
              <label>
                <input className="sr-only" type="radio" name="role" value="physio" checked={form.role === 'physio'} onChange={update('role')} />
                <Stethoscope aria-hidden /> Physiotherapist
              </label>
            </div>
            <p className="mt-2 text-sm text-muted">
              {form.role === 'patient'
                ? 'Do the exercises your physiotherapist assigns, with live camera feedback.'
                : 'Assign exercises to your patients and follow their progress.'}
            </p>
          </fieldset>

          <label className="form-label" htmlFor="reg-name">Full name</label>
          <input id="reg-name" className="field" placeholder="e.g. Maria Haddad" autoComplete="name"
            value={form.name} onChange={update('name')} required maxLength={100} />
          <p className="field-hint hint-empty">Please tell us your full name.</p>

          <label className="form-label" htmlFor="reg-email">Email</label>
          <input id="reg-email" className="field" type="email" placeholder="name@example.com" autoComplete="email"
            value={form.email} onChange={update('email')} required />
          <p className="field-hint hint-empty">We need your email to create your account.</p>
          <p className="field-hint hint-format">That email looks incomplete. Try something like name@example.com.</p>

          <label className="form-label" htmlFor="reg-password">Password (at least 8 characters)</label>
          <PasswordField id="reg-password" placeholder="Choose a password"
            autoComplete="new-password" value={form.password} onChange={update('password')}
            required minLength={8} maxLength={72} />
          <p className="field-hint hint-empty">Choose a password to protect your account.</p>
          <p className="field-hint hint-format">Almost there. Your password needs at least 8 characters.</p>

          <label className="consent">
            <input type="checkbox" required />
            <span>I agree to the <Link className="link" to="/terms" target="_blank">Terms of use<span className="sr-only"> (opens in a new tab)</span></Link> and have read the <Link className="link" to="/privacy" target="_blank">Privacy policy<span className="sr-only"> (opens in a new tab)</span></Link>.</span>
          </label>
          {form.role === 'patient' && (
            <label className="consent">
              <input type="checkbox" required />
              <span>
                I consent to RehabVision storing my exercise plans and results, which are health data,
                and sharing them with the physiotherapist I choose to link to. I can withdraw this at any time.
              </span>
            </label>
          )}

          {error && <p role="alert" className="alert-error">{error}</p>}
          <button className="btn-primary btn-lg mt-2 w-full" disabled={busy}>
            {busy ? <><LoaderCircle aria-hidden className="animate-spin" /> Creating…</> : 'Create account'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">Already have an account? <Link className="link" to="/login">Log in</Link></p>
      </main>
      <SiteFooter />
    </>
  )
}

export default RegisterPage
