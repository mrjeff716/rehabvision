// =============================================================================
// LoginPage.jsx — log in with email and password.
// =============================================================================

import { useState } from 'react'
import { Link } from 'react-router'
import { LoaderCircle } from 'lucide-react'
import { useAuth } from '../auth/authContext'
import PasswordField from '../components/PasswordField'
import SiteFooter from '../components/SiteFooter'
import { LanguagePicker, useLang } from '../i18n/AppLanguage'

const LoginPage = () => {
  const { login } = useAuth()
  const { t, tr } = useLang()
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
    <>
      <div className="mx-auto flex max-w-md justify-end px-6 pt-4"><LanguagePicker /></div>
      <main className="auth-card">
        <h1 className="mb-7 text-3xl font-semibold">{t.logIn}</h1>
        <form onSubmit={submit} onInvalidCapture={(e) => { e.preventDefault(); e.currentTarget.querySelector(':invalid')?.focus() }} className="stagger flex flex-col gap-3.5">
          {/* invalid fields show the styled hints below instead of the browser's popup */}
          <label className="form-label" htmlFor="login-email">{t.email}</label>
          <input id="login-email" className="field" type="email" placeholder="name@example.com" autoComplete="email"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <p className="field-hint hint-empty">{t.hintLoginEmailEmpty}</p>
          <p className="field-hint hint-format">{t.hintEmailFormat}</p>
          <label className="form-label" htmlFor="login-password">{t.password}</label>
          <PasswordField id="login-password" placeholder={t.passwordPlaceholder} autoComplete="current-password"
            value={password} onChange={(e) => setPassword(e.target.value)} required />
          <p className="field-hint hint-empty">{t.hintLoginPasswordEmpty}</p>
          {error && <p role="alert" className="alert-error">{tr(error)}</p>}
          <button className="btn-primary btn-lg mt-2 w-full" disabled={busy}>
            {busy ? <><LoaderCircle aria-hidden className="animate-spin" /> {t.loggingIn}</> : t.logIn}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted">{t.noAccount} <Link className="link" to="/register">{t.createOne}</Link></p>
      </main>
      <SiteFooter />
    </>
  )
}

export default LoginPage
