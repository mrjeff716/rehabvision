// =============================================================================
// PhysioDashboard.jsx — the physio's home: tabs for Patients (PhysioHome),
// Verification, Plan and billing, Financial aid, and Review for the review
// team. The chosen tab is in the URL (?tab=...), so links and Back work.
// =============================================================================

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { BadgeCheck, ClipboardCheck, CreditCard, HandHeart, ShieldAlert, UsersRound } from 'lucide-react'
import PhysioHome from './PhysioHome'
import VerificationPanel from './physio/VerificationPanel'
import BillingPanel from './physio/BillingPanel'
import AidPanel from './physio/AidPanel'
import ReviewPanel from './physio/ReviewPanel'
import { useAuth } from '../auth/authContext'
import { api } from '../api'
import { useLang } from '../i18n/AppLanguage'

export default function PhysioDashboard() {
  const { user, logout } = useAuth()
  const { t, tr } = useLang()
  const [params, setParams] = useSearchParams()
  const [account, setAccount] = useState(null)
  const [error, setError] = useState('')
  const listRef = useRef(null)
  const [indicator, setIndicator] = useState(null)

  const reload = useCallback(async () => {
    try {
      setAccount(await api('/physio/account'))
      setError('')
    } catch (e) {
      if (e.status === 401) logout()
      else setError(e.message)
    }
  }, [logout])
  useEffect(() => { reload() }, [reload])

  const tabs = [
    ['patients', t.tabPatients, UsersRound],
    ['verification', t.tabVerification, BadgeCheck],
    ['billing', t.tabBilling, CreditCard],
    ['aid', t.tabAid, HandHeart],
    ...(user.isAdmin ? [['review', t.tabReview, ClipboardCheck]] : []),
  ]
  const tab = tabs.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'patients'
  const go = (key) => setParams(key === 'patients' ? {} : { tab: key })

  // The dark pill slides to the selected tab. Measured, so it fits any language,
  // and measured again whenever a tab changes size (web font loading, resizing).
  useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return
    const measure = () => {
      const el = list.querySelector('[aria-selected="true"]')
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
    }
    measure()
    const ro = new ResizeObserver(measure)
    list.querySelectorAll('[role="tab"]').forEach((el) => ro.observe(el))
    return () => ro.disconnect()
  }, [tab, t, user.isAdmin])

  // Arrow keys move between tabs (ARIA tabs pattern)
  const onKey = (e) => {
    const i = tabs.findIndex(([k]) => k === tab)
    const rtl = document.documentElement.dir === 'rtl'
    const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1 }[e.key]
    if (!step) return
    const next = tabs[(i + step + tabs.length) % tabs.length][0]
    go(next)
    requestAnimationFrame(() => listRef.current?.querySelector(`#tab-${next}`)?.focus())
  }

  const notVerified = account && !account.verification.verified

  return (
    <div className="flex flex-col gap-8">
      <div ref={listRef} role="tablist" aria-label={t.dashboardNav} className="tabs" onKeyDown={onKey}>
        {indicator && <span aria-hidden className="tab-indicator" style={{ left: indicator.left, width: indicator.width }} />}
        {tabs.map(([key, label, Icon]) => (
          <button key={key} id={`tab-${key}`} role="tab" type="button" className="tab" aria-selected={tab === key}
            aria-controls="tab-panel" tabIndex={tab === key ? 0 : -1} onClick={() => go(key)}>
            <Icon aria-hidden /> {label}
            {key === 'verification' && notVerified && <span className="tab-badge" aria-hidden>!</span>}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="alert-error">{tr(error)}</p>}

      <div id="tab-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} key={tab} className="animate-fade-up">
        {tab === 'patients' && (
          <>
            {notVerified && (
              <div className="notice mb-6 flex-wrap items-center bg-amber-tint text-amber-ink">
                <ShieldAlert aria-hidden />
                <span className="flex-1">{t.notVerifiedBanner}</span>
                <button className="btn-dark" onClick={() => go('verification')}>{t.goVerify}</button>
              </div>
            )}
            <PhysioHome />
          </>
        )}
        {tab === 'review' && <ReviewPanel />}
        {['verification', 'billing', 'aid'].includes(tab) && (account
          ? tab === 'verification' ? <VerificationPanel account={account} reload={reload} />
            : tab === 'billing' ? <BillingPanel account={account} reload={reload} />
              : <AidPanel account={account} reload={reload} />
          : <div className="skeleton h-64" aria-busy="true" aria-label={t.loading} />)}
      </div>
    </div>
  )
}
