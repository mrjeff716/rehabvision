// =============================================================================
// PasswordField.jsx — password input with a show/hide (eye) button and a
// Caps Lock warning. Accepts the same props as <input>.
// The validation hints (.field-hint) go right AFTER this component, as they
// do after a plain .field (index.css handles both).
// =============================================================================

import { useRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useLang } from '../i18n/AppLanguage'

const PasswordField = ({ id, ...inputProps }) => {
  const { t } = useLang()
  const [shown, setShown] = useState(false)
  const [capsLock, setCapsLock] = useState(false)
  const checkCaps = (e) => setCapsLock(e.getModifierState?.('CapsLock') ?? false)

  // Which hint to show after the field: '' | 'empty' | 'format'. Done here, not
  // with CSS :has(), because Chrome doesn't restyle :has()-plus-sibling rules
  // when validity changes. Like :user-invalid, it only starts after the person
  // leaves the field or tries to submit.
  const [touched, setTouched] = useState(false)
  const [problem, setProblem] = useState('')
  const check = (el) => setProblem(el.validity.valid ? '' : el.value === '' ? 'empty' : 'format')
  const touch = (e) => { setTouched(true); check(e.target) }
  const edited = useRef(false) // tabbing through an untouched field shows nothing

  return (
    // the wrapper keeps the hints that follow it as its direct next siblings
    <div className="pw-wrap" data-problem={touched ? problem : ''}>
      <div className="pw-box">
        <input id={id} className="field" type={shown ? 'text' : 'password'}
          onKeyUp={checkCaps} onKeyDown={checkCaps}
          onBlur={(e) => { setCapsLock(false); if (edited.current) touch(e) }} onInvalid={touch}
          onInput={(e) => { edited.current = true; if (touched) check(e.target) }}
          {...inputProps} />
        <button type="button" className="pw-toggle" aria-controls={id} aria-pressed={shown}
          aria-label={shown ? t.hidePassword : t.showPassword} onClick={() => setShown(!shown)}>
          {/* key makes React remount the icon, so it animates in on every switch */}
          {shown ? <EyeOff key="off" aria-hidden /> : <Eye key="on" aria-hidden />}
        </button>
      </div>
      {capsLock && <p className="caps-note" role="status">{t.capsLock}</p>}
    </div>
  )
}

export default PasswordField
