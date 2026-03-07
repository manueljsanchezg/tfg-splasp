import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { joinSession } from '../../service/session.service'

function JoinSessionPage() {
  const [code, setCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await joinSession(code.trim())
      navigate(`/sessions/${response.sessionId}`)
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Session not found. Check the code and try again.')
      } else {
        setError('An error occurred. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-4xl font-bold">Join a Session</h1>
        <p className="text-base-content/60">Enter the session code provided by your instructor</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="SESSION CODE"
          className="input input-bordered input-lg w-full text-center tracking-widest font-mono"
          maxLength={8}
          autoFocus
        />

        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-lg"
          disabled={!code.trim() || isLoading}
        >
          {isLoading ? <span className="loading loading-spinner"></span> : 'Join Session'}
        </button>
      </form>
    </div>
  )
}

export default JoinSessionPage