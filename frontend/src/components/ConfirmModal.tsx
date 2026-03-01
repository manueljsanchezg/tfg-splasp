import { useRef, useEffect } from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title?: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({
  isOpen,
  title = 'Confirm',
  message,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal()
    } else {
      modalRef.current?.close()
    }
  }, [isOpen])

  return (
    <dialog ref={modalRef} className="modal" onClose={onCancel}>
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-2xl mb-4">{title}</h3>
        <p className="mb-6 text-xl">{message}</p>
        <div className="modal-action justify-end gap-4">
          <button type="button" onClick={onCancel} className="btn btn-secondary px-6 py-4 text-lg">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn btn-primary px-8 py-4 text-lg">
            Yes
          </button>
        </div>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onCancel}>
          close
        </button>
      </form>
    </dialog>
  )
}

export default ConfirmModal
