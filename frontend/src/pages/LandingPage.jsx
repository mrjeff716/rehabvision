// =============================================================================
// LandingPage.jsx — the public website at "/" for visitors who aren't logged in.
// Product (business plan slide 3), how it works, plans with a live price
// calculator (slides 4–6), physio verification (slide 9), financial aid
// (slide 7) and privacy. All text in en/fr/ar (i18n/pro.js).
// =============================================================================

import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  Activity, BadgeCheck, ClipboardList, Globe2, HandHeart, Languages, Link2, LockKeyhole,
  ShieldCheck, Stethoscope, UsersRound,
} from 'lucide-react'
import RangeArc from '../components/RangeArc'
import SiteFooter from '../components/SiteFooter'
import { LanguagePicker, useLang } from '../i18n/AppLanguage'
import { PLANS, REGIONS, quote } from '../billing/pricing'

const FEATURE_ICONS = [UsersRound, ClipboardList, Activity, Stethoscope, Link2, Languages]
const AID_OPTIONS = [0, 10, 20, 25, 30, 40]

// Sections fade up as they scroll into view (visible straight away without JS
// or with reduced motion; see [data-reveal] in index.css)
function useReveal() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const els = [...document.querySelectorAll('[data-reveal]')]
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.dataset.reveal = 'shown'
          io.unobserve(e.target)
        }
      }
    }, { rootMargin: '0px 0px -10% 0px' })
    for (const el of els) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.dataset.reveal = 'hidden'
        io.observe(el)
      }
    }
    return () => io.disconnect()
  }, [])
}

const money = (n) => (Number.isInteger(n) ? `$${n}` : `$${n.toFixed(2)}`)

function PriceCalculator() {
  const { t } = useLang()
  const [plan, setPlan] = useState('starter')
  const [region, setRegion] = useState('mount_lebanon')
  const [aidPct, setAidPct] = useState(0)
  const q = quote({ plan, region, aidPct })

  return (
    <div className="panel flex flex-col gap-4 bg-ink text-white ring-0">
      <h3 className="text-xl font-semibold text-white">{t.calcTitle}</h3>
      <div className="segmented grid-cols-3 bg-white/10" role="radiogroup" aria-label={t.navPricing}>
        {Object.keys(PLANS).map((p) => (
          <button key={p} type="button" role="radio" aria-checked={plan === p} onClick={() => setPlan(p)}
            className={`relative z-10 min-h-[2.5rem] rounded-full text-sm font-semibold transition duration-300 ${plan === p ? 'bg-white text-ink shadow-soft' : 'text-white/75 hover:text-white'}`}>
            {t.plans[p]}
          </button>
        ))}
      </div>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-white/80">
        {t.calcRegion}
        <select className="field-sm cursor-pointer" value={region} onChange={(e) => setRegion(e.target.value)}>
          {Object.keys(REGIONS).map((r) => <option key={r} value={r}>{t.regions[r]}</option>)}
        </select>
      </label>
      <label className="flex flex-col gap-1.5 text-sm font-semibold text-white/80">
        {t.calcAid}
        <select className="field-sm cursor-pointer" value={aidPct} onChange={(e) => setAidPct(Number(e.target.value))}>
          {AID_OPTIONS.map((a) => <option key={a} value={a}>{a ? `+${a}%` : t.calcNoAid}</option>)}
        </select>
      </label>
      <div className="mt-1 flex items-end justify-between gap-3 rounded-2xl bg-white/10 px-4 py-3">
        <span className="text-sm text-white/80">
          {t.youPay}
          <span className="block text-xs text-white/60">−{q.discountPct}%</span>
        </span>
        <span key={q.monthly} className="animate-tick text-4xl font-semibold tabular-nums">
          {money(q.monthly)}<span className="text-base font-medium text-white/70">{t.perMonth}</span>
        </span>
      </div>
      <p className="text-xs leading-relaxed text-white/70">{t.discountRules} {t.annualNote}</p>
    </div>
  )
}

export default function LandingPage() {
  const { t } = useLang()
  useReveal()

  return (
    <>
      <a href="#content" className="skip-link">{t.skip}</a>
      <header className="app-header">
        <nav aria-label="RehabVision" className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight" dir="ltr">
            <img src="/logo-mark.png" alt="" className="h-9 w-9" /> RehabVision
          </Link>
          <div className="hidden items-center gap-1 xl:flex">
            <a className="btn-ghost" href="#features">{t.navFeatures}</a>
            <a className="btn-ghost" href="#how">{t.navHow}</a>
            <a className="btn-ghost" href="#pricing">{t.navPricing}</a>
            <a className="btn-ghost" href="#trust">{t.navTrust}</a>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <LanguagePicker />
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">{t.logIn}</Link>
            <Link to="/register" className="btn-primary">{t.getStarted}</Link>
          </div>
        </nav>
      </header>

      <main id="content">
        {/* Hero: the moving dial is the one showpiece */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div className="stagger flex flex-col items-start gap-6">
            <p className="pill-ok">{t.heroEyebrow}</p>
            <h1 className="text-[2.6rem] font-semibold leading-[1.05] sm:text-6xl lg:text-[4.25rem]">{t.heroTitle}</h1>
            <p className="max-w-[52ch] text-lg text-muted">{t.heroText}</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register?role=physio" className="btn-primary btn-lg">{t.ctaPhysio}</Link>
              <Link to="/register?role=patient" className="btn-secondary btn-lg">{t.ctaPatient}</Link>
            </div>
          </div>
          <div className="relative animate-fade-in [animation-delay:200ms]">
            <div aria-hidden className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-accent-tint via-white to-amber-tint" />
            <div className="panel animate-float px-6 pb-8 pt-10 shadow-lift sm:px-10">
              <RangeArc angleLabel={t.demoAngle} repsLabel={t.demoReps} safeLabel={t.demoSafe} className="pb-2" />
            </div>
          </div>
        </section>

        {/* Facts from the business plan */}
        <section data-reveal className="mx-auto max-w-6xl px-4 sm:px-6">
          <dl className="grid gap-3 sm:grid-cols-4">
            {[
              ['8', t.statLangs],
              [t.statFreeValue, t.statFree],
              ['1,334', t.statPhysios],
              [<LockKeyhole key="l" aria-hidden className="h-8 w-8" />, t.statPrivate],
            ].map(([value, label], i) => (
              <div key={i} className="flex flex-col rounded-3xl bg-white px-5 py-4 shadow-soft">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="order-first text-3xl font-semibold text-accent">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section id="features" data-reveal className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24 sm:px-6">
          <h2 className="max-w-2xl text-3xl font-semibold sm:text-5xl">{t.featuresTitle}</h2>
          <p className="mt-3 max-w-xl text-lg text-muted">{t.featuresSub}</p>
          {/* Uneven grid: the tracking feature, the product's core, gets the wide tile */}
          <ul className="mt-10 grid gap-4 md:grid-cols-6">
            {t.features.map(([title, text], i) => {
              const Icon = FEATURE_ICONS[i]
              const wide = i === 3
              return (
                <li key={title} className={`card card-hover flex flex-col gap-3 p-6 ${wide ? 'bg-ink text-white md:col-span-4 md:row-span-2 md:p-9' : 'md:col-span-2'}`}>
                  <span className={`grid h-11 w-11 place-items-center rounded-2xl ${wide ? 'bg-white/10 text-amber' : 'bg-accent-tint text-accent'}`}>
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className={`text-lg font-semibold ${wide ? 'text-2xl text-white sm:text-3xl' : ''}`}>{title}</h3>
                  <p className={wide ? 'max-w-md text-white/75' : 'text-sm text-muted'}>{text}</p>
                  {wide && (
                    <div className="mt-auto max-w-sm pt-6">
                      <RangeArc start={20} target={120} min={10} max={130} dark angleLabel={t.demoAngle} repsLabel={t.demoReps} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        <section id="how" data-reveal className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24 sm:px-6">
          <h2 className="text-3xl font-semibold sm:text-5xl">{t.howTitle}</h2>
          {/* A real sequence, so the steps are numbered */}
          <ol className="mt-10 grid gap-4 md:grid-cols-3">
            {t.howSteps.map(([title, text], i) => (
              <li key={title} className="relative overflow-hidden rounded-3xl bg-white p-7 shadow-soft">
                <span aria-hidden className="absolute -end-2 -top-6 text-[7rem] font-semibold leading-none text-accent-tint">{i + 1}</span>
                <h3 className="relative text-xl font-semibold">{title}</h3>
                <p className="relative mt-2 text-muted">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="pricing" data-reveal className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24 sm:px-6">
          <h2 className="text-3xl font-semibold sm:text-5xl">{t.pricingTitle}</h2>
          <p className="mt-3 max-w-2xl text-lg text-muted">{t.pricingSub}</p>
          <div className="mt-10 grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
            <ul className="grid gap-4 sm:grid-cols-3">
              {Object.entries(PLANS).map(([key, p]) => (
                <li key={key} className={`card flex flex-col gap-2 p-6 ${key === 'growth' ? 'ring-2 ring-accent' : ''}`}>
                  {key === 'growth' && <span className="pill-ok absolute -top-3 start-5 text-xs shadow-soft">{t.popular}</span>}
                  <h3 className="text-lg font-semibold">{t.plans[key]}</h3>
                  <p className="text-4xl font-semibold tabular-nums">${p.price}<span className="text-base font-medium text-muted">{t.perMonth}</span></p>
                  <p className="text-sm text-muted">{t.upToPatients(p.maxPatients)}</p>
                  <p className="text-sm font-semibold text-accent">{t.perPatient((p.price / p.maxPatients).toFixed(2))}</p>
                </li>
              ))}
              <li className="sm:col-span-3 rounded-3xl bg-amber-tint px-5 py-4 text-sm text-amber-ink">
                {t.annualNote}
              </li>
            </ul>
            <PriceCalculator />
          </div>
        </section>

        <section id="trust" data-reveal className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-24 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-white shadow-soft"><BadgeCheck aria-hidden className="h-7 w-7" /></span>
              <h2 className="mt-5 text-3xl font-semibold sm:text-5xl">{t.trustTitle}</h2>
              <p className="mt-3 text-lg text-muted">{t.trustSub}</p>
            </div>
            <ol className="relative flex flex-col gap-3 before:absolute before:inset-y-6 before:start-[1.45rem] before:w-0.5 before:rounded-full before:bg-accent/25">
              {t.trustSteps.map(([title, text], i) => (
                <li key={title} className="relative flex items-start gap-4 rounded-3xl bg-white p-4 shadow-soft">
                  <span className="z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-white">{i + 1}</span>
                  <span>
                    <span className="block font-semibold">{title}</span>
                    <span className="text-sm text-muted">{text}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section data-reveal className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
          <div className="flex items-center gap-3">
            <HandHeart aria-hidden className="h-8 w-8 text-accent" />
            <h2 className="text-3xl font-semibold sm:text-4xl">{t.aidTitle}</h2>
          </div>
          <p className="mt-3 max-w-2xl text-lg text-muted">{t.aidSub}</p>
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Object.entries(t.trackTitles).map(([k, [title, text]]) => (
              <li key={k} className="rounded-3xl bg-white p-5 shadow-soft">
                <span className="text-sm font-semibold text-accent">{k}</span>
                <h3 className="mt-1 font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted">{text}</p>
              </li>
            ))}
          </ul>
        </section>

        <section data-reveal className="mx-auto max-w-6xl px-4 pt-24 sm:px-6">
          <div className="grid items-center gap-8 overflow-hidden rounded-[2.5rem] bg-ink p-8 text-white sm:p-12 lg:grid-cols-[auto_1fr]">
            <ShieldCheck aria-hidden className="h-16 w-16 text-accent-soft" />
            <div>
              <h2 className="text-3xl font-semibold text-white">{t.privacyTitle}</h2>
              <p className="mt-3 max-w-2xl text-lg text-white/80">{t.privacyText}</p>
            </div>
          </div>
        </section>

        <section data-reveal className="mx-auto max-w-3xl px-4 pt-24 text-center sm:px-6">
          <Globe2 aria-hidden className="mx-auto h-10 w-10 text-accent" />
          <h2 className="mt-4 text-3xl font-semibold sm:text-5xl">{t.finalTitle}</h2>
          <p className="mt-3 text-lg text-muted">{t.finalText}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register?role=physio" className="btn-primary btn-lg">{t.ctaPhysio}</Link>
            <Link to="/register?role=patient" className="btn-secondary btn-lg">{t.ctaPatient}</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}
