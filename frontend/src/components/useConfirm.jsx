// =============================================================================
// useConfirm.jsx — an in-app replacement for window.confirm().
//   const [confirm, confirmDialog] = useConfirm()
//   if (!(await confirm({ title, message, confirmLabel, cancelLabel }))) return
//   (cancelLabel is optional and defaults to "Cancel")
//   ...and render {confirmDialog} somewhere in the component.
// Uses the native <dialog>, so focus is trapped, Esc cancels, and the page
// behind is inert. "Cancel" gets focus first: destructive actions need a
// deliberate second step.
// =============================================================================

import { useEffect, useRef, useState } from 'react'

export default function useConfirm() {
  const [request, setRequest] = useState(null) // { title, message, confirmLabel, resolve }
  const dialogRef = useRef(null)

  useEffect(() => {
    if (request) dialogRef.current?.showModal()
  }, [request])

  const confirm = (options) => new Promise((resolve) => setRequest({ ...options, resolve }))

  const close = (answer) => {
    dialogRef.current?.close()
    request?.resolve(answer)
    setRequest(null)
  }

  const confirmDialog = request && (
    <dialog ref={dialogRef} className="dialog" aria-labelledby="confirm-title"
      onCancel={(e) => { e.preventDefault(); close(false) }}>
      <div className="border-t-4 border-danger p-6">
        <h2 id="confirm-title" className="text-xl font-semibold">{request.title}</h2>
        <p className="mt-2 text-muted">{request.message}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button className="btn-secondary" autoFocus onClick={() => close(false)}>{request.cancelLabel ?? 'Cancel'}</button>
          <button className="btn border-danger bg-danger text-white hover:bg-white hover:text-danger"
            onClick={() => close(true)}>{request.confirmLabel}</button>
        </div>
      </div>
    </dialog>
  )

  return [confirm, confirmDialog]
}
