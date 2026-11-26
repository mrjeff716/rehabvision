// =============================================================================
// PhysioDirectory.jsx — patients find verified physiotherapists who chose to
// be listed, by region and language (roadmap phase 4). "Add" goes through the
// same confirm step as typing the physio's ID.
// =============================================================================

import { useEffect, useState } from 'react'
import { BadgeCheck, MapPin } from 'lucide-react'
import { api } from '../api'
import { useLang } from '../i18n/AppLanguage'
import { REGIONS } from '../billing/pricing'

const LANGS = ['ar', 'en', 'fr', 'hy', 'es', 'de', 'it', 'tr']

export default function PhysioDirectory({ onPick }) {
  const { t } = useLang()
  const [region, setRegion] = useState('')
  const [lang, setLang] = useState('')
  const [list, setList] = useState(null)

  useEffect(() => {
    let alive = true
    const q = new URLSearchParams({ ...(region && { region }), ...(lang && { lang }) })
    api(`/patient/physios?${q}`).then((d) => alive && setList(d.physios)).catch(() => alive && setList([]))
    return () => { alive = false }
  }, [region, lang])

  return (
    <section className="panel flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold">{t.directoryTitle}</h2>
        <p className="text-sm text-muted">{t.directorySub}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="field-sm" value={region} onChange={(e) => setRegion(e.target.value)} aria-label={t.region}>
          <option value="">{t.anyRegion}</option>
          {Object.keys(REGIONS).map((r) => <option key={r} value={r}>{t.regions[r]}</option>)}
        </select>
        <select className="field-sm" value={lang} onChange={(e) => setLang(e.target.value)} aria-label={t.languagesSpoken}>
          <option value="">{t.anyLanguage}</option>
          {LANGS.map((l) => <option key={l} value={l}>{t.langNames[l]}</option>)}
        </select>
      </div>
      {list === null ? <div className="skeleton h-20" aria-busy="true" aria-label={t.loading} />
        : list.length === 0 ? <p className="well text-sm text-muted">{t.noListed}</p>
          : (
            <ul className="grid gap-3 sm:grid-cols-2">
              {list.map((p) => (
                <li key={p.publicId} className="flex items-start justify-between gap-3 rounded-2xl bg-paper p-4">
                  <span className="flex flex-col gap-1">
                    <span className="flex items-center gap-1.5 font-semibold">
                      {p.name} <BadgeCheck aria-label={t.vStatus.approved} className="h-4 w-4 text-accent" />
                    </span>
                    {p.specialist && <span className="pill-ok self-start text-xs">{t.specialistBadge}</span>}
                    <span className="flex items-center gap-1 text-sm text-muted"><MapPin aria-hidden className="h-3.5 w-3.5" />{t.regions[p.region] ?? ''}{p.clinic ? `, ${p.clinic}` : ''}</span>
                    <span className="text-xs text-muted">{p.languages.map((l) => t.langNames[l]).join(', ')}</span>
                  </span>
                  <button className="btn-secondary" onClick={() => onPick(p)}>{t.addThisPhysio}</button>
                </li>
              ))}
            </ul>
          )}
    </section>
  )
}
