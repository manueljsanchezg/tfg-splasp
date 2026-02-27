import { useForm } from 'react-hook-form'
import type { SessionData } from '../types/session'
import { useState, useRef } from 'react'
import { createSession } from '../service/session.service'

function CreateSessionModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const modalRef = useRef<HTMLDialogElement>(null)
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
    reset,
  } = useForm<SessionData>()

  const onSubmit = async (data: SessionData) => {
    setIsLoading(true)
    setError(null)
    try {
      const formattedData = {
        ...data,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
      }
      console.log(data)
      await createSession(formattedData)
      reset()
      modalRef.current?.close()
      onSuccess()
    } catch (error) {
      setError('Error creating session')
    } finally {
      setIsLoading(false)
    }
  }

  if (isOpen) {
    modalRef.current?.showModal()
  } else {
    modalRef.current?.close()
  }

  return (
    <dialog ref={modalRef} className="modal" onClose={onClose}>
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-2xl mb-6 text-base-content">Create New Session</h3>

        {error && (
          <div className="alert alert-error shadow-lg mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-lg">Session Name</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Advanced Programming"
              className={`input input-bordered input-lg w-full text-lg ${
                errors.name ? 'input-error' : ''
              }`}
              {...register('name', {
                required: 'Name is required',
              })}
            />
            {errors.name && (
              <label className="label">
                <span className="label-text-alt text-error text-base">{errors.name.message}</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-lg">Start Date</span>
              </label>
              <input
                type="datetime-local"
                className={`input input-bordered input-lg w-full text-lg ${
                  errors.startDate ? 'input-error' : ''
                }`}
                {...register('startDate', {
                  required: 'Start date is required',
                })}
              />
              {errors.startDate && (
                <label className="label">
                  <span className="label-text-alt text-error text-base">
                    {errors.startDate.message}
                  </span>
                </label>
              )}
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-bold text-lg">End Date</span>
              </label>
              <input
                type="datetime-local"
                className={`input input-bordered input-lg w-full text-lg ${
                  errors.startDate ? 'input-error' : ''
                }`}
                {...register('endDate', {
                  required: 'End date is required',
                  validate: (value) => {
                    const start = new Date(getValues('startDate'))
                    const end = new Date(value)
                    return end > start || 'End date must be after start date'
                  },
                })}
              />
              {errors.endDate && (
                <label className="label">
                  <span className="label-text-alt text-error text-base">
                    {errors.endDate.message}
                  </span>
                </label>
              )}
            </div>
          </div>

          <div className="modal-action gap-4 mt-8">
            <button type="button" onClick={onClose} className="btn btn-ghost btn-lg text-lg">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg text-lg">
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                'Create Session'
              )}
            </button>
          </div>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={onClose}>
          close
        </button>
      </form>
    </dialog>
  )
}

export default CreateSessionModal
