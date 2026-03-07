import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getMyProjectForSession } from '../../service/project.service'
import type { ProjectResponse } from '../../types/project'
import AnalysisResult from '../../components/AnalysisResult'

function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [project, setProject] = useState<ProjectResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const numericSessionId = Number(sessionId)

  useEffect(() => {
    if (!sessionId || isNaN(numericSessionId)) {
      navigate('/sessions/join')
      return
    }

    const verifyAccess = async () => {
      try {
        const myProject = await getMyProjectForSession(numericSessionId)
        setProject(myProject)
      } catch (err: any) {
        if (err.response?.status === 404) {
          setError('You have not joined this session. Please join first.')
        } else {
          setError('Failed to load session data.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    verifyAccess()
  }, [sessionId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="alert alert-error max-w-md">
          <span>{error ?? 'Access denied.'}</span>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/sessions/join')}>
          Join a Session
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full py-8">
      <div className="flex flex-col items-center gap-2">
        <div className="badge badge-success badge-lg gap-2 py-4 px-6 text-base font-bold">
          Active in Session
        </div>
        <p className="text-base-content/60 text-lg">
          Project:{' '}
          <span className="font-semibold text-base-content">
            {project.title === 'dump' ? 'Not yet uploaded' : project.title}
          </span>
        </p>
      </div>
      <AnalysisResult sessionId={numericSessionId} />
    </div>
  )
}

export default SessionPage
