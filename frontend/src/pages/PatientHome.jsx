// =============================================================================
// PatientHome.jsx — the patient's home page.
//   1. Link to a physiotherapist: type their public ID, check the name that
//      comes back, then confirm.
//   2. See the (up to 3) exercises the physio assigned, and start one.
//   3. When an exercise is finished, save the results (or keep them on the
//      device if offline, and send them next time).
// =============================================================================

import { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Check, Dumbbell, LoaderCircle, Play, Search, ShieldCheck, Stethoscope, TriangleAlert, X } from 'lucide-react'
import useConfirm from '../components/useConfirm'
import { useAuth } from '../auth/authContext'
import { api, saveSession, flushPendingSessions } from '../api'
import ExerciseCoach from '../pose/ExerciseCoach'
import { getStrings } from '../i18n/messages'

const PatientHome = ({ lang }) => {
  const { user, setUser, refresh, logout } = useAuth()
  const [catalog, setCatalog] = useState(null) // exercise instructions
  const [active, setActive] = useState(null)   // the exercise being done now
  const [lookupId, setLookupId] = useState('')
  const [found, setFound] = useState(null)     // physio found by public ID, not yet linked
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirm, confirmDialog] = useConfirm()
  const t = getStrings(lang)
  const tRef = useRef(t) // the load effect below runs once; this keeps its toast in the current language
  tRef.current = t

  // Expired login -> back to the login page; anything else -> show the message
  const handleError = (e) => (e.status === 401 ? logout() : setError(e.message))

  // When the page opens: reload the plan (the physio may have changed it),
  // load exercise instructions, and send any sessions saved while offline.
  useEffect(() => {
    refresh().catch((e) => { if (e.status === 401) logout() })
    api('/exercises').then(setCatalog).catch(() => {})
    flushPendingSessions(user._id).then((n) => {
      if (n) toast.success(tRef.current.ui.sentLater(n))
    })
  }, [user._id, refresh, logout])

  // Opening or closing an exercise swaps the whole page, so start at the top
  useEffect(() => { window.scrollTo(0, 0) }, [active])

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
      toast.success(t.ui.linked(data.user.physio.name))
    } catch (err) {
      handleError(err)
    } finally {
      setBusy(false)
    }
  }

  const unlinkPhysio = async () => {
    const ok = await confirm({
      title: user.physio.name,
      message: t.ui.confirmRemovePhysio,
      confirmLabel: t.ui.remove,
      cancelLabel: t.ui.no,
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
      else toast(t.ui.keptOffline)
    } catch (err) {
      toast.error(t.ui.saveFailed + err.message)
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

  const firstName = user.name?.trim().split(/\s+/)[0] ?? ''

  return (
    <div className="stagger flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold">{t.ui.hello(firstName)}</h2>
        <p className="mt-1 text-muted">{user.physio && exercises.length ? t.ui.introReady : t.ui.introSetup}</p>
      </div>

      {error && <p role="alert" className="alert-error">{error}</p>}

      {/* --- Step 1: physiotherapist --- */}
      <section>
        <h2 className="section-title">
          <span className="step-num" data-done={Boolean(user.physio)} aria-hidden>{user.physio ? <Check className="h-4 w-4" /> : 1}</span>
          {t.ui.myPhysio}
        </h2>
        {user.physio ? (
          <div className="card flex flex-wrap items-center gap-3 p-4 sm:p-5">
            <span className="icon-chip" aria-hidden><Stethoscope /></span>
            <span className="me-auto flex flex-col leading-tight">
              <span className="font-semibold text-ink">{user.physio.name}</span>
              <code className="text-sm text-muted">{user.physio.publicId}</code>
            </span>
            <button className="btn-danger" onClick={unlinkPhysio}><X aria-hidden /> {t.ui.remove}</button>
          </div>
        ) : (
          <div className="card p-5 sm:p-6">
            <label htmlFor="physio-id" className="mb-3 block text-ink">{t.ui.askForId}</label>
            <form onSubmit={findPhysio} onInvalidCapture={(e) => { e.preventDefault(); e.currentTarget.querySelector(':invalid')?.focus() }} className="flex flex-wrap gap-2">
              {/* invalid fields show the styled hints below instead of the browser's popup */}
              <input id="physio-id" className="field min-w-0 flex-1 font-mono text-lg uppercase tracking-wider placeholder:normal-case placeholder:tracking-normal sm:max-w-xs" placeholder="PT-XXXXXX" value={lookupId}
                onChange={(e) => setLookupId(e.target.value)} required autoComplete="off" spellCheck={false} />
              <p className="field-hint hint-empty order-last basis-full [--gap:0.5rem]">{t.ui.idHint}</p>
              <button className="btn-primary btn-lg" disabled={busy}>
                {busy && !found ? <LoaderCircle aria-hidden className="animate-spin" /> : <Search aria-hidden />} {t.ui.find}
              </button>
            </form>
            {found && (
              <div role="status" className="mt-4 flex animate-alert-in flex-wrap items-center gap-3 rounded-xl border border-accent/30 bg-accent-tint px-4 py-3">
                <span className="icon-chip bg-white" aria-hidden><Stethoscope /></span>
                <span className="me-auto text-ink">{t.ui.isThisYourPhysio} <b>{found.name}</b> <span className="text-muted">({found.publicId})</span></span>
                <button className="btn-primary" onClick={linkPhysio} disabled={busy}>
                  <Check aria-hidden /> {t.ui.yesAdd}
                </button>
                <button className="btn-secondary" onClick={() => setFound(null)}>{t.ui.no}</button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* --- Step 2: exercises --- */}
      <section>
        <h2 className="section-title">
          <span className="step-num" aria-hidden>2</span>
          {t.ui.myExercises}
        </h2>
        {!user.physio ? (
          <p className="empty-state"><Stethoscope aria-hidden />{t.ui.addPhysioFirst}</p>
        ) : exercises.length === 0 ? (
          <p className="empty-state"><Dumbbell aria-hidden />{t.ui.noExercisesYet}</p>
        ) : (
          <ul className="stagger flex flex-col gap-4">
            {exercises.map((a) => {
              const info = catalogById[a.exerciseId]
              // translated instructions if we have them, else the catalog's English
              const how = t.howTo[a.exerciseId] ?? (info && { setup: info.setup, form: info.ideal_form, camera: info.measurement.preferred_camera_view })
              return (
                <li key={a._id} className="card flex flex-col gap-4 p-5 sm:p-6">
                  <div className="flex items-start gap-3">
                    <span className="icon-chip h-11 w-11" aria-hidden><Dumbbell /></span>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-lg font-bold leading-snug">{t.exercises[a.exerciseId] ?? a.exerciseId}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className="chip bg-accent-tint text-accent">{t.ui[a.side]}</span>
                        <span className="chip">{t.ui.plan(a.reps, a.startAngle, a.targetAngle)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="flex items-start gap-2.5 rounded-xl bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
                    <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{t.ui.stopIf} <bdi>{a.stopCriteria}</bdi></span>
                  </p>
                  {how && (
                    <details className="rounded-xl bg-paper px-4 py-3 text-sm text-ink [&[open]>summary]:mb-2 [&>p]:leading-relaxed">
                      <summary>{t.ui.howTo}</summary>
                      <p>{how.setup}</p>
                      <ul className="my-2 list-disc space-y-1 ps-5 marker:text-accent">
                        {how.form.map((line) => <li key={line}>{line}</li>)}
                      </ul>
                      <p className="text-xs font-medium text-muted">{t.ui.camera} {how.camera}</p>
                    </details>
                  )}
                  <button className="btn-primary btn-lg w-full sm:w-auto sm:self-start" onClick={() => setActive(a)}>
                    <Play aria-hidden className="rtl:-scale-x-100" /> {t.ui.start}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted">
        <p className="flex items-start gap-2.5"><ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-success" />{t.ui.privacyNote}</p>
        {(t.safetyNote ?? catalog?.safety_note) && <p>{t.safetyNote ?? catalog.safety_note}</p>}
      </div>

      {confirmDialog}
    </div>
  )
}

export default PatientHome
