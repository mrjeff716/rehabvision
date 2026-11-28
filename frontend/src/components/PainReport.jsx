// =============================================================================
// PainReport.jsx — after an exercise: pain 0–10 and an optional "something
// went wrong" note (the incident log, business plan slide 10). Both go to
// the physio with the session; 7+ or a note flags the patient for attention.
// =============================================================================

import { useState } from 'react'
import { LoaderCircle, Save } from 'lucide-react'
import { useLang } from '../i18n/AppLanguage'

// Calm teal at 0, amber in the middle, red at the top
const scaleColor = (n) => (n >= 7 ? '#C2333A' : n >= 4 ? '#F2B33D' : '#0F7B6C')

export default function PainReport({ onSave }) {
  const { t } = useLang()
  const [pain, setPain] = useState(0)
  const [incident, setIncident] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    await onSave({ painScore: pain, incident: incident.trim() || undefined })
  }

  return (
    <form onSubmit={submit} className="panel mx-auto flex max-w-xl animate-dialog-in flex-col gap-5">
      <h2 className="text-2xl font-semibold">{t.painTitle}</h2>
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-muted">{t.painQuestion}</legend>
        <div className="grid grid-cols-11 gap-1" dir="ltr">
          {Array.from({ length: 11 }, (_, n) => (
            <label key={n} className="cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-accent rounded-xl">
              <input type="radio" name="pain" className="sr-only" checked={pain === n} onChange={() => setPain(n)} />
              <span className={`grid h-11 place-items-center rounded-xl text-sm font-semibold transition duration-200 ${pain === n ? 'scale-110 text-white shadow-soft' : 'bg-paper text-ink hover:bg-accent-tint'}`}
                style={pain === n ? { background: scaleColor(n) } : undefined}>{n}</span>
            </label>
          ))}
        </div>
      </fieldset>
      {pain >= 7 && <p role="alert" className="alert-error">{t.painHigh}</p>}
      <label className="field-label">
        {t.incidentLabel}
        <textarea className="field min-h-[5rem]" maxLength={500} placeholder={t.incidentPlaceholder} value={incident} onChange={(e) => setIncident(e.target.value)} />
      </label>
      <button className="btn-primary btn-lg self-start" disabled={busy}>
        {busy ? <LoaderCircle aria-hidden className="animate-spin" /> : <Save aria-hidden />} {t.sendReport}
      </button>
    </form>
  )
}
