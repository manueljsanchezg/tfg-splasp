import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../service/auth.service'
import { useAuthStore } from '../store/authStore'
import type { LoginData } from '../types/auth'

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await loginUser(data)
      console.log(response)
      if (response) {
        login({
          token: response.accessToken,
          role: response.role,
        })
        navigate('/')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-base-content">
            Sign In
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
              placeholder="Your username"
              className={`input input-bordered w-full ${errors.username ? 'input-error' : ''}`}
              {...register('username', {
                required: 'Username is required',
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
              placeholder="Your password"
              className={`input input-bordered w-full ${errors.password ? 'input-error' : ''}`}
              {...register('password', {
                required: 'Password is required',
              })}
            />
            {errors.password && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.password.message}</span>
              </label>
            )}
          </div>

          <button type="submit" disabled={isLoading} className="btn btn-primary w-full">
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="text-center text-sm">
            <p className="text-base-content/70">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                Create one here
              </Link>
            </p>
          </div>
        </form>
      </div>
  )
}
