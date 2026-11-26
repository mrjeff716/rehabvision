// =============================================================================
// RangeArc.jsx — the site's signature: a goniometer-style dial. A teal band
// shows the safe range, an amber tick the target, and a needle sweeps from
// the start angle to the target and back, counting a rep each time it gets
// there (like the coach does). Static when the person prefers reduced motion.
// =============================================================================

import { useEffect, useRef, useState } from 'react'

const CX = 160
const CY = 160
const R = 128

// Joint angle 0° on the left, 180° on the right, along the top half circle
const point = (deg, r = R) => {
  const a = Math.PI - (deg * Math.PI) / 180
  return [CX + r * Math.cos(a), CY - r * Math.sin(a)]
}
const arcPath = (from, to, r = R) => {
  const [x1, y1] = point(from, r)
  const [x2, y2] = point(to, r)
  return `M ${x1} ${y1} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2} ${y2}`
}

export default function RangeArc({
  start = 10, target = 95, min = 0, max = 110,
  angleLabel, repsLabel, safeLabel, dark = false, className = '',
}) {
  const [angle, setAngle] = useState(target)
  const [reps, setReps] = useState(7)
  const reached = useRef(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf
    const t0 = performance.now()
    const PERIOD = 3200 // one rep: out and back
    const loop = (now) => {
      const phase = ((now - t0) % PERIOD) / PERIOD
      const eased = (1 - Math.cos(phase * 2 * Math.PI)) / 2 // 0 → 1 → 0, smooth
      const a = start + (target - start) * eased
      setAngle(a)
      if (eased > 0.985 && !reached.current) {
        reached.current = true
        setReps((r) => (r >= 12 ? 1 : r + 1))
      }
      if (eased < 0.5) reached.current = false
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [start, target])

  const [nx, ny] = point(angle, R - 18)
  const [tx1, ty1] = point(target, R - 22)
  const [tx2, ty2] = point(target, R + 22)
  const atTarget = target - angle < 3
  const ink = dark ? '#FFFFFF' : '#14323A'

  return (
    <figure className={`relative ${className}`} dir="ltr" aria-hidden>
      <svg viewBox="0 0 320 190" className="w-full overflow-visible">
        {/* scale: faint track and ticks every 15° */}
        <path d={arcPath(0, 180)} fill="none" stroke={ink} strokeOpacity="0.12" strokeWidth="26" strokeLinecap="round" />
        {Array.from({ length: 13 }, (_, i) => i * 15).map((d) => {
          const [a1, b1] = point(d, R + 18)
          const [a2, b2] = point(d, R + (d % 45 === 0 ? 28 : 23))
          return <line key={d} x1={a1} y1={b1} x2={a2} y2={b2} stroke={ink} strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
        })}
        {/* safe range band */}
        <path d={arcPath(min, max)} fill="none" stroke="#0F7B6C" strokeWidth="26" strokeLinecap="round" strokeOpacity={dark ? 0.9 : 0.85} />
        {/* movement so far this rep */}
        <path d={arcPath(start, Math.max(start + 0.5, angle))} fill="none" stroke="#A8DCCF" strokeWidth="10" strokeLinecap="round" />
        {/* target tick */}
        <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} stroke="#F2B33D" strokeWidth="6" strokeLinecap="round" />
        {/* needle */}
        <line x1={CX} y1={CY} x2={nx} y2={ny} stroke={ink} strokeWidth="5" strokeLinecap="round" />
        <circle cx={CX} cy={CY} r="11" fill={atTarget ? '#F2B33D' : ink} style={{ transition: 'fill 0.3s' }} />
      </svg>
      <figcaption className="mt-3 flex items-end justify-between px-1">
        <span className="flex flex-col">
          <span className={`text-xs font-semibold ${dark ? 'text-white/70' : 'text-muted'}`}>{angleLabel}</span>
          <span className="text-4xl font-semibold tabular-nums leading-none sm:text-5xl">{Math.round(angle)}°</span>
        </span>
        <span className="flex flex-col items-end">
          <span className={`text-xs font-semibold ${dark ? 'text-white/70' : 'text-muted'}`}>{repsLabel}</span>
          <span key={reps} className="animate-tick text-4xl font-semibold tabular-nums leading-none sm:text-5xl">{reps}</span>
        </span>
      </figcaption>
      {safeLabel && (
        <span className="absolute -top-2 start-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white shadow-soft">
          {safeLabel}
        </span>
      )}
    </figure>
  )
}
