// =============================================================================
// PhysioHome.jsx — the physiotherapist's home page.
//   - Shows their public ID to give to patients
//   - Lists linked patients; for each: choose up to 3 exercises (with side,
//     angles, reps, stop criteria, clinical clearance), see sessions, remove
//   - Lists patients who need attention this week ("flags")
// =============================================================================

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Check, Copy, LoaderCircle, Plus, RefreshCw } from 'lucide-react'
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

  return (
    <div className="stagger flex flex-col gap-8">
      <section className="rule-top pb-2 pt-6 text-ink">
        <p className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          Your public ID
          <code className="text-4xl normal-case tracking-[0.04em] text-ink sm:text-6xl">{user.publicId}</code>
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button className="btn-secondary" onClick={copyId}>
            {copied ? <Check key="done" aria-hidden className="animate-icon-in text-success" /> : <Copy key="copy" aria-hidden className="animate-icon-in" />}
            {copied ? 'Copied' : 'Copy ID'}
          </button>
          <p className="text-sm text-muted">Give this ID to your patients so they can add you.</p>
        </div>
        <p className="sr-only" role="status">{copied ? 'ID copied to clipboard' : ''}</p>
      </section>

      {error && <p role="alert" className="alert-error">{error}</p>}

      <section>
        <div className="rule-top mb-4 flex items-center justify-between gap-3 pt-1">
          <h2 className="section-title mb-0 pt-0 after:hidden">My patients</h2>
          <button className="btn-secondary" onClick={refresh} disabled={refreshing}>
            <RefreshCw aria-hidden className={refreshing ? 'animate-spin' : ''} /> Refresh list
          </button>
        </div>
        {patients === null ? (
          <div className="flex flex-col gap-4" aria-busy="true" aria-label="Loading patients">
            <div className="skeleton h-40 border border-rule" />
            <div className="skeleton h-40 border border-rule" />
          </div>
        ) : patients.length === 0 ? (
          <p className="card border-dashed px-5 py-8 text-center text-sm text-muted">No patients yet. They will appear here after they add your ID.</p>
        ) : (
          <ul className="stagger flex flex-col gap-4">
            {patients.map((p) => (
              <PatientCard key={p._id} patient={p} catalog={catalog} onChanged={load} onError={handleError} />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="section-title">Needs attention (last 7 days)</h2>
        {flags === null ? (
          <div className="skeleton h-12" aria-busy="true" aria-label="Loading" />
        ) : flags.length === 0 ? (
          <p className="text-sm text-muted">No patients flagged.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {flags.map((f) => (
              <li key={f.patientId} className="animate-alert-in border-s-4 border-caution bg-caution-tint px-4 py-2.5 text-sm text-caution">
                <b>{f.name}</b>: {f.reasons.join('; ')}
                {f.lastSeen && ` (last session ${new Date(f.lastSeen).toLocaleDateString()})`}
              </li>
            ))}
          </ul>
        )}
      </section>

      {catalog && (
        <section className="text-sm leading-relaxed text-muted">
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

  return (
    <li className="card card-hover p-5 sm:p-6">
      <div className="text-lg font-bold text-ink">{patient.name} <span className="text-sm font-medium text-muted">({patient.email})</span></div>
      {exercises.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No exercises assigned.</p>
      ) : (
        <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ink">
          {exercises.map((a) => (
            <li key={a._id} className="rounded-lg bg-paper px-3 py-2">
              {nameOf(a.exerciseId)} ({a.side}): {a.reps} reps, {a.startAngle}° → {a.targetAngle}°,
              safe range {a.permittedMin}°–{a.permittedMax}°
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-rule pt-4">
        <button className="btn-secondary" onClick={() => setEditing(!editing)} disabled={!catalog} aria-expanded={editing}>
          {editing ? 'Close editor' : 'Edit exercises'}
        </button>
        <button className="btn-secondary" onClick={toggleSessions} aria-expanded={Boolean(sessions)} disabled={loadingSessions}>
          {loadingSessions && <LoaderCircle aria-hidden className="animate-spin" />}
          {sessions ? 'Hide sessions' : 'Show sessions'}
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
        sessions.length === 0 ? <p className="mt-4 animate-fade-up text-sm text-muted">No sessions yet.</p> : (
          <table className="data-table mt-4 block animate-fade-up overflow-x-auto border border-rule sm:table">
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

  const updateRow = (i, changes) => setRows(rows.map((r, j) => (j === i ? { ...r, ...changes } : r)))

  const addRow = () => setRows([
    ...rows,
    { ...defaultsFor(catalog, catalog.exercises[0].id), side: 'right', reps: '10', stopCriteria: '', clinicalClearance: false },
  ])

  const save = async () => {
    setError('')
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

  const numberField = (i, field, label) => (
    <label className="field-label">
      {label}
      <input className="field-sm w-24" type="number" min="0" max="180"
        value={rows[i][field]} onChange={(e) => updateRow(i, { [field]: e.target.value })} />
    </label>
  )

  return (
    <div className="mt-4 animate-fade-up border-t border-ink bg-paper p-4 sm:p-5">
      <p className="mb-4 text-xs leading-relaxed text-muted">
        Angles in degrees, 0° = neutral (e.g. straight knee). Defaults are healthy reference values,
        not a prescription — set them for this patient. Max {MAX_EXERCISES} exercises.
      </p>
      {rows.map((r, i) => (
        <div key={i} className="mb-4 flex animate-fade-up flex-col gap-3 border border-rule bg-white p-4">
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
            <label className="field-label">
              Reps
              <input className="field-sm w-20" type="number" min="1" max="100"
                value={r.reps} onChange={(e) => updateRow(i, { reps: e.target.value })} />
            </label>
            <button className="btn-danger ms-auto"
              onClick={() => setRows(rows.filter((_, j) => j !== i))}>Remove exercise</button>
          </div>
          <label className="field-label">
            Stop if (pain / symptoms)
            <input className="field-sm normal-case tracking-normal" maxLength={500} value={r.stopCriteria}
              placeholder="e.g. sharp pain, swelling, pain above 5/10"
              onChange={(e) => updateRow(i, { stopCriteria: e.target.value })} />
          </label>
          <label className="flex cursor-pointer items-start gap-2.5 rounded-lg bg-caution-tint px-3 py-2.5 text-sm font-medium text-caution">
            <input type="checkbox" checked={r.clinicalClearance}
              onChange={(e) => updateRow(i, { clinicalClearance: e.target.checked })} />
            I confirm this patient is clinically cleared for this exercise and range
          </label>
        </div>
      ))}
      {error && <p role="alert" className="alert-error mb-3">{error}</p>}
      <div className="flex gap-2">
        <button className="btn-secondary" onClick={addRow} disabled={rows.length >= MAX_EXERCISES}>
          <Plus aria-hidden /> Add exercise
        </button>
        <button className="btn-primary" onClick={save} disabled={busy}>
          {busy && <LoaderCircle aria-hidden className="animate-spin" />} Save exercises
        </button>
      </div>
    </div>
  )
}

export default PhysioHome
