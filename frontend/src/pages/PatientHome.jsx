// =============================================================================
// PatientHome.jsx — the patient's home page.
//   1. Link to a physiotherapist: type their public ID, check the name that
//      comes back, then confirm.
//   2. See the (up to 3) exercises the physio assigned, and start one.
//   3. When an exercise is finished, save the results (or keep them on the
//      device if offline, and send them next time).
// =============================================================================

import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { LoaderCircle, Play } from 'lucide-react'
import useConfirm from '../components/useConfirm'
import { useAuth } from '../auth/authContext'
import { api, saveSession, flushPendingSessions } from '../api'
import ExerciseCoach from '../pose/ExerciseCoach'
import { LANGUAGES, getStrings, loadLang, saveLang } from '../i18n/messages'

const PatientHome = () => {
  const { user, setUser, refresh, logout } = useAuth()
  const [lang, setLang] = useState(loadLang)
  const [catalog, setCatalog] = useState(null) // exercise instructions
  const [active, setActive] = useState(null)   // the exercise being done now
  const [lookupId, setLookupId] = useState('')
  const [found, setFound] = useState(null)     // physio found by public ID, not yet linked
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirm, confirmDialog] = useConfirm()
  const t = getStrings(lang)

  // Expired login -> back to the login page; anything else -> show the message
  const handleError = (e) => (e.status === 401 ? logout() : setError(e.message))

  // When the page opens: reload the plan (the physio may have changed it),
  // load exercise instructions, and send any sessions saved while offline.
  useEffect(() => {
    refresh().catch((e) => { if (e.status === 401) logout() })
    api('/exercises').then(setCatalog).catch(() => {})
    flushPendingSessions(user._id).then((n) => {
      if (n) toast.success(`${n} session(s) saved earlier were sent to your physiotherapist`)
    })
  }, [user._id, refresh, logout])

  const changeLang = (e) => {
    setLang(e.target.value)
    saveLang(e.target.value)
  }

  // Step 1 of linking: find the physio and show their name
  const findPhysio = async (e) => {
    e.preventDefault()
    setError('')
    setFound(null)
    setBusy(true)
    try {
      const data = await api(`/patient/lookup/${encodeURIComponent(lookupId.trim())}`)
      setFound(data.physio)
    } catch (err) {
      handleError(err)
    } finally {
      setBusy(false)
    }
  }

  // Step 2 of linking: the patient confirmed it's the right person
  const linkPhysio = async () => {
    setError('')
    setBusy(true)
    try {
      const data = await api('/patient/physio', { method: 'PUT', body: { publicId: found.publicId } })
      setUser(data.user)
      setFound(null)
      setLookupId('')
      toast.success(`${data.user.physio.name} is now your physiotherapist`)
    } catch (err) {
      handleError(err)
    } finally {
      setBusy(false)
    }
  }

  const unlinkPhysio = async () => {
    const ok = await confirm({
      title: `Remove ${user.physio.name}?`,
      message: 'They will no longer see your results, and the exercises they assigned you will be cleared.',
      confirmLabel: 'Remove physiotherapist',
    })
    if (!ok) return
    setError('')
    try {
      const data = await api('/patient/physio', { method: 'DELETE' })
      setUser(data.user)
    } catch (err) {
      handleError(err)
    }
  }

  // Called by ExerciseCoach when the patient presses "Finish session"
  const handleFinish = async (summary) => {
    setActive(null)
    const good = summary.reps.filter((r) => r.reachedTarget).length
    try {
      const savedNow = await saveSession(user._id, summary)
      if (savedNow) toast.success(t.ui.saved(good, summary.reps.length))
      else toast('No connection: the session is kept on this device and will be sent later.')
    } catch (err) {
      toast.error(`Could not save the session: ${err.message}`)
    }
  }

  // Doing an exercise: show only the coach
  if (active) {
    return (
      <ExerciseCoach
        key={active._id}
        assignment={active}
        lang={lang}
        onFinish={handleFinish}
        onCancel={() => setActive(null)}
      />
    )
  }

  const exercises = user.exercises ?? []
  const catalogById = Object.fromEntries((catalog?.exercises ?? []).map((ex) => [ex.id, ex]))

  return (
    <div className="stagger flex flex-col gap-6">
      {/* Language for the exercise coach (spoken + on-screen feedback) */}
      <label className="flex items-center gap-3 self-end text-sm font-medium text-ink">
        <span>Coach language</span>
        <select value={lang} onChange={changeLang} className="field-sm w-auto cursor-pointer">
          {Object.entries(LANGUAGES).map(([code, l]) => (
            <option key={code} value={code}>{l.name}</option>
          ))}
        </select>
      </label>

      {error && <p role="alert" className="alert-error">{error}</p>}

      {/* --- Physiotherapist --- */}
      <section>
        <h2 className="section-title">My physiotherapist</h2>
        {user.physio ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-accent-tint px-4 py-3">
            <span className="font-semibold text-ink">{user.physio.name} <code className="ms-1 text-sm font-medium text-accent">({user.physio.publicId})</code></span>
            <button className="btn-danger" onClick={unlinkPhysio}>Remove physiotherapist</button>
          </div>
        ) : (
          <>
            <label htmlFor="physio-id" className="mb-1 block font-semibold">Physiotherapist ID</label>
            <p className="mb-3 text-sm text-muted">Ask your physiotherapist for their ID. It looks like PT-ABC234.</p>
            <form onSubmit={findPhysio} onInvalidCapture={(e) => { e.preventDefault(); e.currentTarget.querySelector(':invalid')?.focus() }} className="flex flex-wrap gap-2">
              {/* invalid fields show the styled hints below instead of the browser's popup */}
              <input id="physio-id" className="field min-w-0 max-w-xs flex-1 font-mono uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal" placeholder="PT-XXXXXX" value={lookupId}
                onChange={(e) => setLookupId(e.target.value)} required />
              <p className="field-hint hint-empty order-last basis-full [--gap:0.5rem]">Type your physiotherapist's ID first. It looks like PT-ABC234.</p>
              <button className="btn-primary" disabled={busy}>
                {busy && !found ? <LoaderCircle aria-hidden className="animate-spin" /> : null} Find physiotherapist
              </button>
            </form>
            {found && (
              <div role="status" className="mt-4 flex animate-alert-in flex-wrap items-center gap-3 rounded-xl border border-accent bg-accent-tint px-4 py-3 text-sm">
                <span className="me-auto text-ink">Is this your physiotherapist? <b>{found.name}</b> ({found.publicId})</span>
                <button className="btn-primary" onClick={linkPhysio} disabled={busy}>
                  Yes, that's them
                </button>
                <button className="btn-secondary" onClick={() => setFound(null)}>No, search again</button>
              </div>
            )}
          </>
        )}
      </section>

      {/* --- Exercises --- */}
      <section>
        <h2 className="section-title">My exercises</h2>
        {!user.physio ? (
          <p className="card border-dashed px-5 py-8 text-center text-sm text-muted">Add your physiotherapist first. They will choose your exercises.</p>
        ) : exercises.length === 0 ? (
          <p className="card border-dashed px-5 py-8 text-center text-sm text-muted">Your physiotherapist hasn't assigned exercises yet.</p>
        ) : (
          <>
          <p className="mb-4 text-sm text-muted">The camera image stays on your device. Only angles and repetition counts are saved.</p>
          <ul className="stagger flex flex-col gap-4">
            {exercises.map((a) => {
              const info = catalogById[a.exerciseId]
              return (
                <li key={a._id} className="card card-hover flex flex-col gap-2 p-5 sm:p-6">
                  <div className="text-lg font-bold text-ink">
                    {t.exercises[a.exerciseId] ?? a.exerciseId} · {t.ui[a.side]}
                  </div>
                  <div className="text-sm font-medium text-ink">{a.reps} reps · from {a.startAngle}° to {a.targetAngle}°</div>
                  <div className="rounded-lg border-s-4 border-danger bg-danger-tint px-3 py-2 text-sm font-medium text-danger">Stop if: {a.stopCriteria}</div>
                  {info && (
                    <details className="mt-1 rounded-xl bg-paper px-4 py-3 text-sm text-ink [&[open]>summary]:mb-2 [&>p]:leading-relaxed">
                      <summary>How to do it</summary>
                      <p>{info.setup}</p>
                      <ul className="my-2 list-disc space-y-1 ps-5 marker:text-accent">
                        {info.ideal_form.map((line) => <li key={line}>{line}</li>)}
                      </ul>
                      <p className="text-xs font-medium text-muted">Camera: {info.measurement.preferred_camera_view}</p>
                    </details>
                  )}
                  <button className="btn-primary btn-lg mt-2 self-start" onClick={() => setActive(a)}>
                    <Play aria-hidden /> Start exercise
                  </button>
                </li>
              )
            })}
          </ul>
          </>
        )}
      </section>

      {confirmDialog}
      {catalog?.safety_note && <p className="text-sm leading-relaxed text-muted">{catalog.safety_note}</p>}
    </div>
  )
}

export default PatientHome
