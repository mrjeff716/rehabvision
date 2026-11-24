// =============================================================================
// PhysioHome.jsx — the physiotherapist's home page.
//   - Shows their public ID to give to patients
//   - Lists linked patients; for each: choose up to 3 exercises (with side,
//     angles, reps, stop criteria, clinical clearance), see sessions, remove
//   - Lists patients who need attention this week ("flags")
// =============================================================================

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuth } from '../auth/authContext'
import { api } from '../api'

const MAX_EXERCISES = 3

const PhysioHome = () => {
  const { user, logout } = useAuth()
  const [catalog, setCatalog] = useState(null)
  const [patients, setPatients] = useState([])
  const [flags, setFlags] = useState([])
  const [error, setError] = useState('')

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
    }
  }, [handleError])

  useEffect(() => { load() }, [load])

  return (
    <div className="stagger flex flex-col gap-8">
      <section className="card overflow-hidden border-brand-400/25 bg-gradient-to-br from-brand-500/20 via-void-800/70 to-pulse/10 p-6 text-slate-300 shadow-lift">
        <p className="flex flex-wrap items-center gap-3 text-sm font-medium">
          Your public ID: <code className="animate-glow-pulse rounded-xl bg-void-950/70 px-4 py-2 text-xl font-semibold tracking-[0.25em] text-brand-200">{user.publicId}</code>
        </p>
        <p className="mt-3 text-sm text-slate-400">Give this ID to your patients so they can add you.</p>
      </section>

      {error && <p className="alert-error">{error}</p>}

      <section>
        <div className="mb-4 flex items-center justify-between gap-3 px-1">
          <h2 className="section-title mb-0">My patients</h2>
          <button className="btn-secondary" onClick={load}>Refresh</button>
        </div>
        {patients.length === 0 ? (
          <p className="card border-dashed px-5 py-8 text-center text-sm text-slate-400 shadow-none">No patients yet. They will appear here after they add your ID.</p>
        ) : (
          <ul className="stagger flex flex-col gap-4">
            {patients.map((p) => (
              <PatientCard key={p._id} patient={p} catalog={catalog} onChanged={load} onError={handleError} />
            ))}
          </ul>
        )}
      </section>

      <section className="card border-amber-400/20 p-5 sm:p-6">
        <h2 className="section-title">Needs attention (last 7 days)</h2>
        {flags.length === 0 ? (
          <p className="text-sm text-slate-400">No patients flagged.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {flags.map((f) => (
              <li key={f.patientId} className="rounded-xl border-s-4 border-amber-300 bg-amber-400/10 px-4 py-2.5 text-sm text-amber-100">
                <b>{f.name}</b>: {f.reasons.join('; ')}
                {f.lastSeen && ` (last session ${new Date(f.lastSeen).toLocaleDateString()})`}
              </li>
            ))}
          </ul>
        )}
      </section>

      {catalog && (
        <section className="px-1 text-xs leading-relaxed text-slate-400">
          <p><b>Safety:</b> {catalog.safety_note}</p>
          <p className="mt-1"><b>Measurement:</b> {catalog.measurement_note}</p>
        </section>
      )}
    </div>
  )
}

// One patient: their current exercises, plus buttons to edit / see sessions / remove
function PatientCard({ patient, catalog, onChanged, onError }) {
  const [editing, setEditing] = useState(false)
  const [sessions, setSessions] = useState(null) // null = not loaded/hidden

  const nameOf = (id) => catalog?.exercises.find((ex) => ex.id === id)?.name ?? id

  const toggleSessions = async () => {
    if (sessions) return setSessions(null)
    try {
      const data = await api(`/physio/patients/${patient._id}/sessions`)
      setSessions(data.sessions)
    } catch (e) {
      onError(e)
    }
  }

  const remove = async () => {
    if (!window.confirm(`Remove ${patient.name} from your patients? Their exercises will be cleared.`)) return
    try {
      await api(`/physio/patients/${patient._id}`, { method: 'DELETE' })
      onChanged()
    } catch (e) {
      onError(e)
    }
  }

  const exercises = patient.exercises ?? []

  return (
    <li className="card card-hover p-5 sm:p-6">
      <div className="text-lg font-bold text-white">{patient.name} <span className="text-sm font-medium text-slate-400">({patient.email})</span></div>
      {exercises.length === 0 ? (
        <p className="mt-2 text-sm text-slate-400">No exercises assigned.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5 text-sm text-slate-200">
          {exercises.map((a) => (
            <li key={a._id} className="rounded-lg bg-white/[0.03] px-3 py-2">
              {nameOf(a.exerciseId)} ({a.side}): {a.reps} reps, {a.startAngle}° → {a.targetAngle}°,
              safe range {a.permittedMin}°–{a.permittedMax}°
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-white/5 pt-4">
        <button className="btn-secondary" onClick={() => setEditing(!editing)} disabled={!catalog}>
          {editing ? 'Close editor' : 'Edit exercises'}
        </button>
        <button className="btn-secondary" onClick={toggleSessions}>
          {sessions ? 'Hide sessions' : 'Sessions'}
        </button>
        <button className="btn-danger ms-auto" onClick={remove}>Remove patient</button>
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
        sessions.length === 0 ? <p className="mt-4 text-sm text-slate-400">No sessions yet.</p> : (
          <table className="data-table mt-4 block overflow-x-auto rounded-xl border border-white/10 sm:table">
            <thead>
              <tr><th>Date</th><th>Exercise</th><th>Side</th><th>Good / total reps</th><th>Target</th></tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id}>
                  <td>{new Date(s.performedAt).toLocaleString()}</td>
                  <td>{nameOf(s.exerciseId)}</td>
                  <td>{s.side}</td>
                  <td>{s.goodReps} / {s.totalReps}</td>
                  <td>{s.plan?.targetAngle}°</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      )}
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
    <div className="mt-4 animate-fade-up rounded-2xl border border-white/10 bg-void-950/40 p-4 sm:p-5">
      <p className="mb-4 text-xs leading-relaxed text-slate-400">
        Angles in degrees, 0° = neutral (e.g. straight knee). Defaults are healthy reference values,
        not a prescription — set them for this patient. Max {MAX_EXERCISES} exercises.
      </p>
      {rows.map((r, i) => (
        <div key={i} className="mb-4 flex flex-col gap-3 rounded-xl border border-white/10 bg-void-800/70 p-4 shadow-card">
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
              onClick={() => setRows(rows.filter((_, j) => j !== i))}>Remove</button>
          </div>
          <label className="field-label">
            Stop if (pain / symptoms)
            <input className="field-sm normal-case tracking-normal" maxLength={500} value={r.stopCriteria}
              placeholder="e.g. sharp pain, swelling, pain above 5/10" {...invalidProps(i, 'stopCriteria')}
              onChange={(e) => updateRow(i, { stopCriteria: e.target.value })} />
            {fieldError(i, 'stopCriteria')}
          </label>
          <label className={`flex cursor-pointer items-start gap-2.5 rounded-lg bg-amber-400/10 px-3 py-2.5 text-sm font-medium text-amber-100 ${shown[i].clinicalClearance ? 'ring-2 ring-rose-400/60' : ''}`}>
            <input type="checkbox" checked={r.clinicalClearance} {...invalidProps(i, 'clinicalClearance')}
              onChange={(e) => updateRow(i, { clinicalClearance: e.target.checked })} />
            I confirm this patient is clinically cleared for this exercise and range
          </label>
          {fieldError(i, 'clinicalClearance')}
        </div>
      ))}
      {error && <p className="alert-error mb-3">{error}</p>}
      <div className="flex gap-2">
        <button className="btn-secondary" onClick={addRow} disabled={rows.length >= MAX_EXERCISES}>
          Add exercise
        </button>
        <button className="btn-primary" onClick={save} disabled={busy}>
          Save
        </button>
      </div>
    </div>
  )
}

export default PhysioHome
