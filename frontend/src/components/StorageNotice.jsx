// =============================================================================
// StorageNotice.jsx — tells people, once, what the app keeps in their browser.
// It is a notice, not a consent banner: RehabVision sets no cookies and has no
// analytics or trackers, and everything it stores is strictly necessary (see
// /cookies). If optional cookies or analytics are ever added, this must become
// a real consent banner (Accept / Reject, equally easy) and those scripts must
// not load before "Accept".
// =============================================================================

import { useState } from 'react'
import { Link } from 'react-router'

const KEY = 'storageNoticeSeen'
const seen = () => { try { return localStorage.getItem(KEY) === '1' } catch { return true } }

const StorageNotice = () => {
  const [open, setOpen] = useState(() => !seen())
  if (!open) return null

  const dismiss = () => {
    try { localStorage.setItem(KEY, '1') } catch { /* storage blocked: just hide */ }
    setOpen(false)
  }

  return (
    <section className="storage-notice" aria-label="Storage notice">
      <p className="me-auto">
        No cookies or tracking here. We only save what keeps you logged in and remembers your
        settings. <Link className="link" to="/cookies">Details</Link>
      </p>
      <button className="btn-primary" onClick={dismiss}>OK, got it</button>
    </section>
  )
}

export default StorageNotice
