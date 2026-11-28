// =============================================================================
// ReviewPanel.jsx — the review team's queue (accounts in ADMIN_EMAILS):
// verify physios, decide financial aid (a second reviewer above 50% total),
// confirm Whish/OMT payments, apply free months and manage the pilot.
// =============================================================================

import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Ban, Check, Gift, LoaderCircle, RefreshCw, X } from 'lucide-react'
import { DocThumb } from '../../components/DocCapture'
import { StatusPill } from './VerificationPanel'
import { api } from '../../api'
import { useLang } from '../../i18n/AppLanguage'

function Decision({ title, children }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-paper p-4">
      <h4 className="font-semibold">{title}</h4>
      {children}
    </section>
  )
}

function QueueItem({ p, onDone }) {
  const { t, tr, locale } = useLang()
  const [note, setNote] = useState('')
  const [specialist, setSpecialist] = useState(false)
  const [pct, setPct] = useState(p.aid?.suggestedPct ?? 0)
  const [sponsor, setSponsor] = useState(0)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const date = (d) => new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(d))

  const send = (key, path, body) => async () => {
    setError('')
    setBusy(key)
    try {
      const res = await api(path, { method: 'POST', body })
      toast.success(res.needsSecondReviewer ? t.needsSecond : t.decisionSaved)
      await onDone()
    } catch (err) {
      setError(err.message)
      setBusy('')
    }
  }

  const btn = (key, cls, Icon, label, path, body) => (
    <button className={cls} disabled={!!busy} onClick={send(key, path, body)}>
      {busy === key ? <LoaderCircle aria-hidden className="animate-spin" /> : <Icon aria-hidden />} {label}
    </button>
  )
  const tracks = p.aid?.tracks ?? {}

  return (
    <li className="panel flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">{p.name} <bdi dir="ltr" className="text-sm font-medium text-muted">{p.publicId}</bdi></h3>
          <p className="text-sm text-muted">
            <bdi dir="ltr">{p.email}</bdi>{p.phone && <>, <bdi dir="ltr">{p.phone}</bdi></>}
            {p.region && <>, {t.regions[p.region]}</>}{p.clinic && <>, {p.clinic}</>}
          </p>
        </div>
        <StatusPill status={p.verification?.status}>{t.vStatus[p.verification?.status ?? 'none']?.split(':')[0]}</StatusPill>
      </div>

      {p.docs.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {p.docs.map((d) => (
            <li key={d._id} className="flex flex-col gap-1">
              <DocThumb doc={d} />
              <span className="text-xs text-muted">{t.docKinds[d.kind]?.[0] ?? d.kind}</span>
            </li>
          ))}
        </ul>
      )}

      <label className="field-label">{t.noteToPhysio}
        <input className="field-sm" maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} />
      </label>

      {p.verification?.status === 'pending' && (
        <Decision title={`${t.reviewVerification}, ${t.submitted(date(p.verification.submittedAt))}`}>
          <label className="consent"><input type="checkbox" checked={specialist} onChange={(e) => setSpecialist(e.target.checked)} /><span>{t.markSpecialist}</span></label>
          <div className="flex flex-wrap gap-2">
            {btn('vok', 'btn-primary', Check, t.approve, `/admin/verification/${p._id}`, { decision: 'approve', note, specialist })}
            {btn('vno', 'btn-danger', X, t.reject, `/admin/verification/${p._id}`, { decision: 'reject', note })}
          </div>
        </Decision>
      )}

      {p.aid?.status === 'pending' && (
        <Decision title={t.reviewAid}>
          <p className="text-sm">
            <b>{t.tracksChosen}</b>{' '}
            {Object.entries(tracks).map(([k, v]) => `${k} ${t.trackTitles[k][0]}${typeof v === 'string' ? ` (${t.bandOptions[v] ?? t.warOptions[v] ?? v})` : ''}`).join(', ')}
          </p>
          <p className="text-sm text-muted">{t.regionalIs(p.regionalPct)}. {t.suggested(p.aid.suggestedPct)}</p>
          <div className="flex flex-wrap gap-3">
            <label className="field-label">{t.aidPct}
              <input className="field-sm w-24" type="number" min="0" max="75" value={pct} onChange={(e) => setPct(e.target.value)} />
            </label>
            {tracks.E && (
              <label className="field-label">{t.sponsorPct}
                <input className="field-sm w-24" type="number" min="0" max="100" value={sponsor} onChange={(e) => setSponsor(e.target.value)} />
              </label>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {btn('aok', 'btn-primary', Check, t.approve, `/admin/aid/${p._id}`, { decision: 'approve', pct: Number(pct), sponsorPct: Number(sponsor), note })}
            {btn('ano', 'btn-secondary', X, t.reject, `/admin/aid/${p._id}`, { decision: 'reject', note })}
            {btn('afr', 'btn-danger', Ban, t.rejectFraud, `/admin/aid/${p._id}`, { decision: 'fraud', note })}
          </div>
        </Decision>
      )}

      {p.billing?.pending?.reference && (
        <Decision title={t.reviewPayment}>
          <p className="text-sm">
            {t.paymentPending(p.billing.pending.amount, p.billing.pending.reference)} ({p.billing.pending.method.toUpperCase()}, {t.forMonths(p.billing.pending.months)})
          </p>
          <div className="flex flex-wrap gap-2">
            {btn('pok', 'btn-primary', Check, t.confirmPayment, `/admin/payment/${p._id}`, { decision: 'confirm' })}
            {btn('pno', 'btn-danger', X, t.rejectPayment, `/admin/payment/${p._id}`, { decision: 'reject' })}
          </div>
        </Decision>
      )}

      {p.billing?.freeMonths > 0 && (
        <Decision title={t.reviewCredits}>
          <p className="text-sm">{t.freeMonthsLeft(p.billing.freeMonths)}</p>
          {btn('free', 'btn-secondary self-start', Gift, t.useFreeMonth, `/admin/physio/${p._id}/free-month`, {})}
        </Decision>
      )}
      {error && <p role="alert" className="alert-error">{tr(error)}</p>}
    </li>
  )
}

export default function ReviewPanel() {
  const { t, tr } = useLang()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [busyPilot, setBusyPilot] = useState('')

  const load = useCallback(async () => {
    setError('')
    try {
      setData(await api('/admin/queue'))
    } catch (err) {
      setError(err.message)
      setData((d) => d ?? { queue: [], physios: [] })
    }
  }, [])
  useEffect(() => { load() }, [load])

  const pilot = async (p) => {
    setBusyPilot(p._id)
    try {
      await api(`/admin/physio/${p._id}/pilot`, { method: 'POST', body: { on: !p.billing?.pilotUntil } })
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyPilot('')
    }
  }

  if (!data) return <div className="skeleton h-48" aria-busy="true" aria-label={t.loading} />

  return (
    <div className="stagger flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted">{t.reviewIntro}</p>
        <button className="btn-secondary" onClick={load}><RefreshCw aria-hidden /> {t.refreshList}</button>
      </div>
      {error && <p role="alert" className="alert-error">{tr(error)}</p>}
      {data.queue.length === 0
        ? <p className="panel text-center text-muted">{t.queueEmpty}</p>
        : <ul className="flex flex-col gap-5">{data.queue.map((p) => <QueueItem key={p._id} p={p} onDone={load} />)}</ul>}

      <section className="panel">
        <h2 className="section-title">{t.allPhysios}</h2>
        <ul className="divide-y divide-rule">
          {data.physios.map((p) => (
            <li key={p._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <span>
                <span className="font-semibold">{p.name}</span> <bdi dir="ltr" className="text-sm text-muted">{p.publicId}</bdi>
              </span>
              <span className="flex flex-wrap items-center gap-2">
                <StatusPill status={p.verified ? 'approved' : p.verification?.status}>{t.vStatus[p.verified ? 'approved' : p.verification?.status ?? 'none']?.split(':')[0]}</StatusPill>
                <button className="btn-ghost" disabled={busyPilot === p._id} onClick={() => pilot(p)}>
                  {busyPilot === p._id && <LoaderCircle aria-hidden className="animate-spin" />} {p.billing?.pilotUntil ? t.pilotOff : t.pilotOn}
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
