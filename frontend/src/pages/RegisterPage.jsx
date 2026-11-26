// =============================================================================
// RegisterPage.jsx — create an account as a patient or a physiotherapist.
// Physiotherapists automatically get a public ID to share with patients.
// Both must accept the Terms and Privacy policy; patients also give explicit
// consent to their exercise plans and results (health data) being stored and
// shared with the physiotherapist they link to.
// =============================================================================

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from '../auth/authContext'
import PasswordField from '../components/PasswordField'
import AuthLayout from '../components/AuthLayout'
import { useLang } from '../i18n/AppLanguage'

const RegisterPage = () => {
  const { register } = useAuth()
  const { t, tr } = useLang()
  const [params] = useSearchParams() // the website's "I'm a physiotherapist" button opens ?role=physio
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') === 'physio' ? 'physio' : 'patient', referralId: '' })
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

  // Policy links open in a new tab, so the half-filled form isn't lost
  const policyLink = (to, label) => (
    <Link className="link" to={to} target="_blank">{label}<span className="sr-only"> {t.opensNewTab}</span></Link>
  )

  return (
    <AuthLayout>
      <main className="auth-card">
        <h1 className="mb-7 text-3xl font-semibold">{t.titles['/register']}</h1>
        <form onSubmit={submit} onInvalidCapture={(e) => { e.preventDefault(); e.currentTarget.querySelector(':invalid')?.focus() }} className="stagger flex flex-col gap-3.5">
          {/* invalid fields show the styled hints below instead of the browser's popup */}
          <fieldset className="mb-1">
            <legend className="form-label mb-2">{t.iAmA}</legend>
            <div className="segmented">
              <span className="segmented-indicator" aria-hidden />
              <label>
                <input className="sr-only" type="radio" name="role" value="patient" checked={form.role === 'patient'} onChange={update('role')} />
                {t.patient}
              </label>
              <label>
                <input className="sr-only" type="radio" name="role" value="physio" checked={form.role === 'physio'} onChange={update('role')} />
                {t.physio}
              </label>
            </div>
          </fieldset>

          <label className="form-label" htmlFor="reg-name">{t.fullName}</label>
          <input id="reg-name" className="field" placeholder={t.namePlaceholder} autoComplete="name"
            value={form.name} onChange={update('name')} required maxLength={100} />
          <p className="field-hint hint-empty">{t.hintNameEmpty}</p>

          <label className="form-label" htmlFor="reg-email">{t.email}</label>
          <input id="reg-email" className="field" type="email" placeholder="name@example.com" autoComplete="email"
            value={form.email} onChange={update('email')} required />
          <p className="field-hint hint-empty">{t.hintRegEmailEmpty}</p>
          <p className="field-hint hint-format">{t.hintEmailFormat}</p>

          <label className="form-label" htmlFor="reg-password">{t.passwordRule}</label>
          <PasswordField id="reg-password" placeholder={t.choosePassword}
            autoComplete="new-password" value={form.password} onChange={update('password')}
            required minLength={8} maxLength={72} />
          <p className="field-hint hint-empty">{t.hintRegPasswordEmpty}</p>
          <p className="field-hint hint-format">{t.hintPasswordShort}</p>

          {form.role === 'physio' && (
            <>
              <label className="form-label" htmlFor="reg-referral">{t.referralId}</label>
              <input id="reg-referral" className="field font-mono uppercase placeholder:normal-case" placeholder="PT-XXXXXX" dir="ltr"
                value={form.referralId} onChange={update('referralId')} pattern="s*[Pp][Tt]-[A-Za-z0-9]{6}s*" aria-describedby="reg-referral-help" />
              <p id="reg-referral-help" className="-mt-1 text-xs text-muted">{t.referralHelp}</p>
            </>
          )}

          <label className="consent">
            <input type="checkbox" required />
            <span>{t.agreePrefix} {policyLink('/terms', t.linkTerms)} {t.agreeMiddle} {policyLink('/privacy', t.linkPrivacy)}{t.agreeEnd}</span>
          </label>
          {form.role === 'patient' && (
            <label className="consent">
              <input type="checkbox" required />
              <span>{t.consentHealth}</span>
            </label>
          )}

          {error && <p role="alert" className="alert-error">{tr(error)}</p>}
          <button className="btn-primary btn-lg mt-2 w-full" disabled={busy}>
            {busy ? <><LoaderCircle aria-hidden className="animate-spin" /> {t.creating}</> : t.createAccount}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">{t.haveAccount} <Link className="link" to="/login">{t.logIn}</Link></p>
      </main>
    </AuthLayout>
  )
}

export default RegisterPage
