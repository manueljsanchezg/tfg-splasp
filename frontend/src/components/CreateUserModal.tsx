import { useForm } from 'react-hook-form'
import { useEffect, useRef, useState } from 'react'
import { createUser } from '../service/user.service'
import type { CreateUserData } from '../types/user'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserData>()
  const modalRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal()
    } else {
      modalRef.current?.close()
    }
  }, [isOpen])

  const handleClose = () => {
    reset()
    setError(null)
    onClose()
  }

  const onSubmit = async (data: CreateUserData) => {
    setIsLoading(true)
    setError(null)

    try {
      await createUser(data)
      reset()
      onSuccess()
    } catch (err) {
      console.error(err)
      setError('Error creating user')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <dialog ref={modalRef} className="modal" onClose={handleClose}>
      <div className="modal-box w-11/12 max-w-2xl">
        <h3 className="font-bold text-2xl mb-6 text-base-content">Crear usuario</h3>

        {error && (
          <div className="alert alert-error shadow-lg mb-4">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-lg">Nombre de usuario</span>
            </label>
            <input
              type="text"
              placeholder="Nombre de usuario único"
              className={`input input-bordered input-lg w-full text-lg ${
                errors.username ? 'input-error' : ''
              }`}
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <label className="label">
                <span className="label-text-alt text-error text-base">
                  {errors.username.message}
                </span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-bold text-lg">Contraseña</span>
            </label>
            <input
              type="password"
              placeholder="Mínimo 6 caracteres"
              className={`input input-bordered input-lg w-full text-lg ${
                errors.password ? 'input-error' : ''
              }`}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
            />
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error text-base">
                  {errors.password.message}
                </span>
              </label>
            )}
          </div>

          <div className="modal-action gap-4 mt-8">
            <button type="button" onClick={handleClose} className="btn btn-ghost btn-lg text-lg">
              Cancelar
            </button>
            <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg text-lg">
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creando...
                </>
              ) : (
                'Crear usuario'
              )}
            </button>
          </div>
        </form>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button type="button" onClick={handleClose}>
          close
        </button>
      </form>
    </dialog>
  )
}

export default CreateUserModal
