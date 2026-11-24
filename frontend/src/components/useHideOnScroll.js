// =============================================================================
// useHideOnScroll.js — true while the person scrolls DOWN (past the top of the
// page), false as soon as they scroll back up a little. Used to slide the
// header away and bring it back.
// =============================================================================

import { useEffect, useState } from 'react'

const TOP_ZONE = 80  // always show the header this close to the top (px)
const NUDGE = 6      // ignore scroll jitter smaller than this (px)

export default function useHideOnScroll() {
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    let lastY = window.scrollY
    // Cheap enough to run on every scroll event; React skips re-rendering
    // when the value doesn't change.
    const onScroll = () => {
      const y = window.scrollY
      const delta = y - lastY
      if (y < TOP_ZONE) setHidden(false)
      else if (delta > NUDGE) setHidden(true)
      else if (delta < -NUDGE) setHidden(false)
      if (y < TOP_ZONE || Math.abs(delta) > NUDGE) lastY = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return hidden
}
