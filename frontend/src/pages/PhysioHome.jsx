// =============================================================================
// PhysioHome.jsx — the physiotherapist's home page.
//   - Shows their public ID to give to patients
//   - Lists linked patients; for each: choose up to 3 exercises (with side,
//     angles, reps, stop criteria, clinical clearance), see sessions, remove
//   - Lists patients who need attention this week ("flags")
// =============================================================================

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Check, Copy, Dumbbell, History, IdCard, LoaderCircle, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2, TriangleAlert, Users, X } from 'lucide-react'
import useConfirm from '../components/useConfirm'
import { useAuth } from '../auth/authContext'
import { api } from '../api'

const MAX_EXERCISES = 3

const PhysioHome = () => {
  const { user, logout } = useAuth()
  const [catalog, setCatalog] = useState(null)
  const [patients, setPatients] = useState(null) // null = still loading
  const [flags, setFlags] = useState(null)
  const [error, setError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [query, setQuery] = useState('')

  // Expired login -> back to the login page; anything else -> show the message
  const handleError = useCallback((e) => (e.status === 401 ? logout() : setError(e.message)), [logout])

  const load = useCallback(async () => {
    setError('')
    try {
      const [c, p, f] = await Promise.all([
        api('/exercises'),
        api('/physio/patients'),
        api('/physio/flags'),
      ])
      setCatalog(c)
      setPatients(p.patients)
      setFlags(f.flagged)
    } catch (e) {
      handleError(e)
      // stop showing the loading placeholders
      setPatients((p) => p ?? [])
      setFlags((f) => f ?? [])
    }
  }, [handleError])

  useEffect(() => { load() }, [load])

  const refresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const copyId = async () => {
    try {
      await navigator.clipboard.writeText(user.publicId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy. Select the ID and copy it by hand.')
    }
  }

  const firstName = user.name?.trim().split(/\s+/)[0] ?? ''
  const q = query.trim().toLowerCase()
  const shownPatients = (patients ?? []).filter((p) =>
    !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
  const assigned = (patients ?? []).reduce((n, p) => n + (p.exercises?.length ?? 0), 0)

  return (
    <div className="stagger flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold">Hello, {firstName}</h2>
        <p className="mt-1 text-muted">Here is how your patients are doing.</p>
      </div>

      {/* At-a-glance numbers */}
      <dl className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
        <div className="stat">
          <span className="icon-chip" aria-hidden><Users /></span>
          <div><dd>{patients?.length ?? '–'}</dd><dt>Patients</dt></div>
        </div>
        <div className="stat">
          <span className={`icon-chip ${flags?.length ? 'bg-caution-tint text-caution' : ''}`} aria-hidden><TriangleAlert /></span>
          <div><dd>{flags?.length ?? '–'}</dd><dt>Need attention</dt></div>
        </div>
        <div className="stat">
          <span className="icon-chip" aria-hidden><Dumbbell /></span>
          <div><dd>{patients ? assigned : '–'}</dd><dt>Exercises assigned</dt></div>
        </div>
      </dl>

      {/* Public ID to share with patients */}
      <section className="card flex flex-wrap items-center gap-4 p-5 sm:p-6">
        <span className="icon-chip h-12 w-12" aria-hidden><IdCard /></span>
        <p className="me-auto flex flex-col gap-0.5 text-sm text-muted">
          Your public ID
          <code className="text-3xl font-bold tracking-wider text-ink sm:text-4xl">{user.publicId}</code>
          <span>Give this ID to your patients so they can add you.</span>
        </p>
        <button className="btn-primary" onClick={copyId}>
          {copied ? <Check key="done" aria-hidden className="animate-icon-in" /> : <Copy key="copy" aria-hidden className="animate-icon-in" />}
          {copied ? 'Copied' : 'Copy ID'}
        </button>
        <p className="sr-only" role="status">{copied ? 'ID copied to clipboard' : ''}</p>
      </section>

      {error && <p role="alert" className="alert-error">{error}</p>}

      {/* Most actionable first: who needs a look this week */}
      <section>
        <h2 className="section-title"><TriangleAlert aria-hidden />Needs attention <span className="text-sm font-medium text-muted">(last 7 days)</span></h2>
        {flags === null ? (
          <div className="skeleton h-14" aria-busy="true" aria-label="Loading" />
        ) : flags.length === 0 ? (
          <p className="flex items-center gap-2.5 rounded-2xl bg-success-tint px-4 py-3 text-sm font-medium text-success">
            <Check aria-hidden className="h-4 w-4" /> All good: no patients flagged this week.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {flags.map((f) => (
              <li key={f.patientId} className="flex animate-alert-in items-start gap-3 rounded-2xl border border-caution/20 bg-caution-tint px-4 py-3 text-sm text-caution">
                <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  <b>{f.name}</b>: {f.reasons.join('; ')}
                  {f.lastSeen && <span className="opacity-80">{` (last session ${new Date(f.lastSeen).toLocaleDateString()})`}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="section-title mb-0"><Users aria-hidden />My patients</h2>
          <button className="btn-ghost" onClick={refresh} disabled={refreshing}>
            <RefreshCw aria-hidden className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>
        {patients?.length > 3 && (
          <label className="relative mb-4 block">
            <span className="sr-only">Search patients</span>
            <Search aria-hidden className="pointer-events-none absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="field ps-10" type="search" placeholder="Search by name or email"
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        )}
        {patients === null ? (
          <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading patients">
            <div className="skeleton h-40" />
            <div className="skeleton h-40" />
          </div>
        ) : patients.length === 0 ? (
          <div className="empty-state">
            <Users aria-hidden />
            <p className="font-semibold text-ink">No patients yet</p>
            <p>Share your public ID above. Patients appear here as soon as they add it.</p>
          </div>
        ) : shownPatients.length === 0 ? (
          <p className="empty-state"><Search aria-hidden />No patients match “{query}”.</p>
        ) : (
          <ul className="stagger flex flex-col gap-4">
            {shownPatients.map((p) => (
              <PatientCard key={p._id} patient={p} catalog={catalog} onChanged={load} onError={handleError} />
            ))}
          </ul>
        )}
      </section>

      {catalog && (
        <section className="flex gap-3 rounded-2xl bg-white/60 p-4 text-sm leading-relaxed text-muted ring-1 ring-inset ring-rule">
          <ShieldCheck aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <div>
            <p><b className="text-ink">Safety:</b> {catalog.safety_note}</p>
            <p className="mt-1"><b className="text-ink">Measurement:</b> {catalog.measurement_note}</p>
          </div>
        </section>
      )}
    </div>
  )
}

// One patient: their current exercises, plus buttons to edit / see sessions / remove
function PatientCard({ patient, catalog, onChanged, onError }) {
  const [editing, setEditing] = useState(false)
  const [sessions, setSessions] = useState(null) // null = not loaded/hidden
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [confirm, confirmDialog] = useConfirm()

  const nameOf = (id) => catalog?.exercises.find((ex) => ex.id === id)?.name ?? id

  const toggleSessions = async () => {
    if (sessions) return setSessions(null)
    setLoadingSessions(true)
    try {
      const data = await api(`/physio/patients/${patient._id}/sessions`)
      setSessions(data.sessions)
    } catch (e) {
      onError(e)
    } finally {
      setLoadingSessions(false)
    }
  }

  const remove = async () => {
    const ok = await confirm({
      title: `Remove ${patient.name}?`,
      message: 'They will be removed from your patients, their exercises will be cleared, and you will no longer see their results.',
      confirmLabel: 'Remove patient',
    })
    if (!ok) return
    try {
      await api(`/physio/patients/${patient._id}`, { method: 'DELETE' })
      onChanged()
    } catch (e) {
      onError(e)
    }
  }

  const exercises = patient.exercises ?? []

  const initials = patient.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')

  return (
    <li className="card p-5 sm:p-6">
      <div className="flex items-center gap-3">
        <span aria-hidden className="avatar h-11 w-11 text-base">{initials || '?'}</span>
        <div className="min-w-0 leading-tight">
          <h3 className="truncate text-lg font-bold">{patient.name}</h3>
          <p className="truncate text-sm text-muted">{patient.email}</p>
        </div>
      </div>
      {exercises.length === 0 ? (
        <p className="mt-4 rounded-xl bg-paper px-4 py-3 text-sm text-muted">No exercises assigned yet. Use “Edit exercises” to add up to {MAX_EXERCISES}.</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-2 text-sm text-ink">
          {exercises.map((a) => (
            <li key={a._id} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-paper px-4 py-2.5">
              <span className="me-auto font-semibold">{nameOf(a.exerciseId)} <span className="font-normal capitalize text-muted">· {a.side}</span></span>
              <span className="chip bg-white">{a.reps} reps</span>
              <span className="chip bg-white">{a.startAngle}° → {a.targetAngle}°</span>
              <span className="chip bg-success-tint text-success">safe {a.permittedMin}°–{a.permittedMax}°</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-rule pt-4">
        <button className={editing ? 'btn-secondary' : 'btn-primary'} onClick={() => setEditing(!editing)} disabled={!catalog} aria-expanded={editing}>
          {editing ? <X aria-hidden /> : <Pencil aria-hidden />} {editing ? 'Close editor' : 'Edit exercises'}
        </button>
        <button className="btn-secondary" onClick={toggleSessions} aria-expanded={Boolean(sessions)} disabled={loadingSessions}>
          {loadingSessions ? <LoaderCircle aria-hidden className="animate-spin" /> : <History aria-hidden />}
          {sessions ? 'Hide sessions' : 'Sessions'}
        </button>
        <button className="btn-danger ms-auto" onClick={remove}><Trash2 aria-hidden /> Remove</button>
      </div>

      {editing && catalog && (
        <AssignmentEditor
          patient={patient}
          catalog={catalog}
          onSaved={() => { setEditing(false); onChanged() }}
          onError={onError}
        />
      )}

      {sessions && (
        sessions.length === 0 ? <p className="mt-4 animate-fade-up rounded-xl bg-paper px-4 py-3 text-sm text-muted">No sessions yet.</p> : (
          <div className="mt-4 animate-fade-up overflow-x-auto rounded-xl border border-rule">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Exercise</th><th>Side</th><th>Good reps</th><th>Target</th></tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const ratio = s.totalReps ? s.goodReps / s.totalReps : 0
                  const tone = ratio >= 0.8 ? 'bg-success-tint text-success' : ratio >= 0.5 ? 'bg-caution-tint text-caution' : 'bg-danger-tint text-danger'
                  return (
                    <tr key={s._id}>
                      <td className="whitespace-nowrap">{new Date(s.performedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</td>
                      <td>{nameOf(s.exerciseId)}</td>
                      <td className="capitalize">{s.side}</td>
                      <td><span className={`chip ${tone}`}>{s.goodReps} / {s.totalReps}</span></td>
                      <td>{s.plan?.targetAngle}°</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}
      {confirmDialog}
    </li>
  )
}

// Default values for a newly chosen exercise, from the catalog's reference
// motion. These are anatomical references, NOT a prescription — the physio
// must adjust them for the patient.
function defaultsFor(catalog, exerciseId) {
  const ex = catalog.exercises.find((e) => e.id === exerciseId)
  const { start, end } = ex.illustrative_motion_deg
  return {
    exerciseId,
    startAngle: String(start),
    targetAngle: String(end),
    permittedMin: String(Math.min(start, end)),
    permittedMax: String(Math.max(start, end)),
  }
}

// Form fields are strings while editing; '' must not silently become 0
const toNumber = (v) => (String(v).trim() === '' ? NaN : Number(v))

// Same rules as backend/src/routes/physio.js (keep MIN_RANGE_DEG in sync),
// checked here so the exact field is flagged before saving.
const MIN_RANGE_DEG = 10
const ANGLES = ['startAngle', 'targetAngle', 'permittedMin', 'permittedMax']
function rowErrors(r) {
  const err = {}
  const n = Object.fromEntries(ANGLES.map((f) => [f, toNumber(r[f])]))
  for (const f of ANGLES) {
    if (!Number.isFinite(n[f]) || n[f] < 0 || n[f] > 180) err[f] = 'Enter 0–180'
  }
  if (!err.permittedMin && !err.permittedMax && n.permittedMin >= n.permittedMax) {
    err.permittedMax = 'Must be above safe min'
  }
  const rangeOk = !err.permittedMin && !err.permittedMax
  for (const f of ['startAngle', 'targetAngle']) {
    if (!err[f] && rangeOk && (n[f] < n.permittedMin || n[f] > n.permittedMax)) err[f] = 'Outside safe range'
  }
  if (!err.startAngle && !err.targetAngle && Math.abs(n.targetAngle - n.startAngle) < MIN_RANGE_DEG) {
    err.targetAngle = `At least ${MIN_RANGE_DEG}° from start`
  }
  const reps = toNumber(r.reps)
  if (!Number.isInteger(reps) || reps < 1 || reps > 100) err.reps = 'Enter 1–100'
  if (!r.stopCriteria.trim()) err.stopCriteria = 'Write when the patient should stop'
  if (!r.clinicalClearance) err.clinicalClearance = 'Confirm clearance to assign this exercise'
  return err
}

// Edit a patient's exercise list (max 3). The server checks every value again.
function AssignmentEditor({ patient, catalog, onSaved, onError }) {
  const [rows, setRows] = useState(() =>
    (patient.exercises ?? []).map((a) => ({
      exerciseId: a.exerciseId,
      side: a.side,
      startAngle: String(a.startAngle),
      targetAngle: String(a.targetAngle),
      permittedMin: String(a.permittedMin),
      permittedMax: String(a.permittedMax),
      reps: String(a.reps),
      stopCriteria: a.stopCriteria,
      clinicalClearance: a.clinicalClearance,
    })),
  )
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [tried, setTried] = useState(false) // "fill this in" errors wait for the first Save
  const errors = rows.map(rowErrors)
  const shown = errors.map((e) => (tried ? e : Object.fromEntries(Object.entries(e).filter(([f]) => ANGLES.includes(f) || f === 'reps'))))

  const updateRow = (i, changes) => setRows(rows.map((r, j) => (j === i ? { ...r, ...changes } : r)))

  const addRow = () => setRows([
    ...rows,
    { ...defaultsFor(catalog, catalog.exercises[0].id), side: 'right', reps: '10', stopCriteria: '', clinicalClearance: false },
  ])

  const save = async () => {
    setError('')
    setTried(true)
    if (errors.some((e) => Object.keys(e).length)) {
      setError('Fix the highlighted fields before saving.')
      return
    }
    setBusy(true)
    try {
      const exercises = rows.map((r) => ({
        exerciseId: r.exerciseId,
        side: r.side,
        startAngle: toNumber(r.startAngle),
        targetAngle: toNumber(r.targetAngle),
        permittedMin: toNumber(r.permittedMin),
        permittedMax: toNumber(r.permittedMax),
        reps: toNumber(r.reps),
        stopCriteria: r.stopCriteria,
        clinicalClearance: r.clinicalClearance,
      }))
      await api(`/physio/patients/${patient._id}/exercises`, { method: 'PUT', body: { exercises } })
      toast.success(`Exercises saved for ${patient.name}`)
      onSaved()
    } catch (e) {
      if (e.status === 401) onError(e)
      else setError(e.message)
    } finally {
      setBusy(false)
    }
  }

  // Error text sits under the field and is announced with it (aria-describedby)
  const fieldError = (i, field) => shown[i][field] && (
    <span id={`err-${i}-${field}`} className="field-error">{shown[i][field]}</span>
  )
  const invalidProps = (i, field) => ({
    'aria-invalid': Boolean(shown[i][field]),
    'aria-describedby': shown[i][field] ? `err-${i}-${field}` : undefined,
  })

  const numberField = (i, field, label, { min = 0, max = 180, width = 'w-24' } = {}) => (
    <label className="field-label">
      {label}
      <input className={`field-sm ${width}`} type="number" min={min} max={max} {...invalidProps(i, field)}
        value={rows[i][field]} onChange={(e) => updateRow(i, { [field]: e.target.value })} />
      {fieldError(i, field)}
    </label>
  )

  return (
    <div className="mt-4 animate-fade-up rounded-2xl bg-paper p-4 sm:p-5">
      <p className="mb-4 text-xs leading-relaxed text-muted">
        Angles in degrees, 0° = neutral (e.g. straight knee). Defaults are healthy reference values,
        not a prescription — set them for this patient. Max {MAX_EXERCISES} exercises.
      </p>
      {rows.map((r, i) => (
        <div key={i} className="mb-4 flex animate-fade-up flex-col gap-3 rounded-xl border border-rule bg-white p-4 shadow-card">
          <div className="flex flex-wrap items-end gap-3">
            <label className="field-label">
              Exercise
              <select className="field-sm" value={r.exerciseId}
                onChange={(e) => updateRow(i, defaultsFor(catalog, e.target.value))}>
                {catalog.exercises.map((ex) => <option key={ex.id} value={ex.id}>{ex.name}</option>)}
              </select>
            </label>
            <label className="field-label">
              Side
              <select className="field-sm" value={r.side} onChange={(e) => updateRow(i, { side: e.target.value })}>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </label>
            {numberField(i, 'startAngle', 'Start °')}
            {numberField(i, 'targetAngle', 'Target °')}
            {numberField(i, 'permittedMin', 'Safe min °')}
            {numberField(i, 'permittedMax', 'Safe max °')}
            {numberField(i, 'reps', 'Reps', { min: 1, max: 100, width: 'w-20' })}
            <button className="btn-danger ms-auto"
              onClick={() => setRows(rows.filter((_, j) => j !== i))}><Trash2 aria-hidden /> Remove</button>
          </div>
          <label className="field-label">
            Stop if (pain / symptoms)
            <input className="field-sm" maxLength={500} value={r.stopCriteria}
              placeholder="e.g. sharp pain, swelling, pain above 5/10" {...invalidProps(i, 'stopCriteria')}
              onChange={(e) => updateRow(i, { stopCriteria: e.target.value })} />
            {fieldError(i, 'stopCriteria')}
          </label>
          <label className={`flex cursor-pointer items-start gap-2.5 rounded-lg bg-caution-tint px-3 py-2.5 text-sm font-medium text-caution ${shown[i].clinicalClearance ? 'ring-2 ring-danger' : ''}`}>
            <input type="checkbox" checked={r.clinicalClearance} {...invalidProps(i, 'clinicalClearance')}
              onChange={(e) => updateRow(i, { clinicalClearance: e.target.checked })} />
            I confirm this patient is clinically cleared for this exercise and range
          </label>
          {fieldError(i, 'clinicalClearance')}
        </div>
      ))}
      {error && <p role="alert" className="alert-error mb-3">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <button className="btn-secondary" onClick={addRow} disabled={rows.length >= MAX_EXERCISES}>
          <Plus aria-hidden /> Add exercise
        </button>
        <button className="btn-primary" onClick={save} disabled={busy}>
          {busy ? <LoaderCircle aria-hidden className="animate-spin" /> : <Check aria-hidden />} Save exercises
        </button>
      </div>
    </div>
  )
}

export default PhysioHome
