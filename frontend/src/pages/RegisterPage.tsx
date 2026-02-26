import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { registerUser } from '../service/auth.service'
import { useAuthStore } from '../store/authStore'
import type { LoginData } from '../types/auth'
import PageLayout from '../components/PageLayout'

interface RegisterFormData extends LoginData {
  email: string
  confirmPassword: string
}

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const password = watch('password')

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await registerUser({
        username: data.username,
        password: data.password,
      })  
      if (response) {
        login({
          token: response.token,
          role: response.role,
        })
        navigate('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-base-content">
            Create Account
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {error && <div className="rounded-lg bg-error/20 p-4 text-sm text-error">{error}</div>}

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Username</span>
            </label>
            <input
              type="text"
              placeholder="Choose a username"
              className={`input input-bordered w-full ${errors.username ? 'input-error' : ''}`}
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
              })}
            />
            {errors.username && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.username.message}</span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Password</span>
            </label>
            <input
              type="password"
              placeholder="Choose a password"
              className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
            />
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.password.message}</span>
              </label>
            )}
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text font-medium">Confirm Password</span>
            </label>
            <input
              type="password"
              placeholder="Repeat your password"
              className={`input input-bordered w-full ${errors.confirmPassword ? 'input-error' : ''}`}
              {...register('confirmPassword', {
                required: 'You must confirm the password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.confirmPassword.message}</span>
              </label>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Registering...
              </>
            ) : (
              'Create Account'
            )}
          </button>

          <div className="text-center text-sm">
            <p className="text-base-content/70">
              Already have an account?{' '}
              <a href="/login" className="font-medium text-primary hover:text-primary/80">
                Sign in here
              </a>
            </p>
          </div>
        </form>
      </div>
  )
}
