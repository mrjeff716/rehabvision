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
import { LanguagePicker, useLang } from '../i18n/AppLanguage'

const ResetPasswordPage = () => {
  const { resetPassword } = useAuth()
  const { t, tr } = useLang()
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
      setError(t.passwordsDontMatch)
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
      <div className="mx-auto flex max-w-md justify-end px-6 pt-4"><LanguagePicker /></div>
      <main className="auth-card">
        {!token ? (
          <>
            <h1 className="mb-4 text-3xl font-semibold">{t.linkNotValidTitle}</h1>
            <p className="text-ink">{t.linkNotValidBody}</p>
            <p className="mt-6 text-center text-sm text-muted"><Link className="link" to="/forgot-password">{t.requestNewLink}</Link></p>
          </>
        ) : (
          <>
            <h1 className="mb-7 text-3xl font-semibold">{t.titles['/reset-password']}</h1>
            <form onSubmit={submit} onInvalidCapture={(e) => { e.preventDefault(); e.currentTarget.querySelector(':invalid')?.focus() }} className="stagger flex flex-col gap-3.5">
              <label className="form-label" htmlFor="reset-password">{t.newPasswordRule}</label>
              <PasswordField id="reset-password" placeholder={t.chooseNewPassword} autoComplete="new-password" autoFocus
                value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} maxLength={72} />
              <p className="field-hint hint-empty">{t.hintNewPasswordEmpty}</p>
              <p className="field-hint hint-format">{t.hintPasswordShort}</p>
              <label className="form-label" htmlFor="reset-confirm">{t.repeatNewPassword}</label>
              <PasswordField id="reset-confirm" placeholder={t.typeItAgain} autoComplete="new-password"
                value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
              <p className="field-hint hint-empty">{t.hintRepeatEmpty}</p>
              {error && <p role="alert" className="alert-error">{tr(error)}</p>}
              <button className="btn-primary btn-lg mt-2 w-full" disabled={busy}>
                {busy ? <><LoaderCircle aria-hidden className="animate-spin" /> {t.saving}</> : t.saveAndLogIn}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-muted">{t.linkExpired} <Link className="link" to="/forgot-password">{t.requestNewOne}</Link></p>
          </>
        )}
      </main>
      <SiteFooter />
    </>
  )
}

export default ResetPasswordPage
