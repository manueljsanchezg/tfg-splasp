import { useEffect, useState } from 'react'
import type { SessionResponse } from '../../types/session'
import { getAllSessions, closeSession } from '../../service/session.service'
import CreateSessionModal from '../../components/CreateSessionModal'
import ConfirmModal from '../../components/ConfirmModal'
import { useNavigate } from 'react-router-dom'

function SessionPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<SessionResponse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [sessionToDeactivate, setSessionToDeactivate] = useState<number | null>(null)

  const getSessions = async () => {
    try {
      const sessions = await getAllSessions()
      setSessions(sessions)
    } catch (error) {
      console.error(error)
      setError('Error retrieving sessions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeactivate = (sessionId: number) => {
    setSessionToDeactivate(sessionId)
  }

  const confirmDeactivate = async () => {
    if (sessionToDeactivate === null) return

    try {
      await closeSession(sessionToDeactivate)
      await getSessions()
    } catch (err) {
      console.error(err)
      setError('Failed to deactivate session')
    } finally {
      setSessionToDeactivate(null)
    }
  }

  const cancelDeactivate = () => {
    setSessionToDeactivate(null)
  }

  useEffect(() => {
    getSessions()
  }, [])

  return (
    <div className="flex flex-col gap-4 w-full px-4 py-4">
      <div className="flex flex-col justify-between items-center gap-4">
        <h1 className="text-5xl font-black text-base-content">Sessions Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary btn-lg text-2xl px-8 m-10"
        >
          Create Session
        </button>
      </div>

      <CreateSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setIsModalOpen(false)
          getSessions()
        }}
      />

      {error && (
        <div className="alert alert-error shadow-lg">
          <span>{error}</span>
        </div>
      )}

      <ConfirmModal
        isOpen={sessionToDeactivate !== null}
        title="Deactivate session"
        message="Are you sure you want to deactivate this session?"
        onConfirm={confirmDeactivate}
        onCancel={cancelDeactivate}
      />

      {isLoading && (
        <div className="flex justify-center items-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      )}

      {!isLoading && sessions && sessions?.length > 0 && (
        <div className="w-4/5 bg-base-100 rounded-xl shadow-lg border border-base-300 overflow-hidden mx-auto">
          <div className="overflow-x-auto">
            <table className="table table-lg w-full">
              <thead className="bg-base-300 text-2xl uppercase">
                <tr>
                  <th className="px-4 py-4 font-bold text-center">
                    Session Name
                  </th>
                  <th className="px-4 py-4 font-bold text-center">Code</th>
                  <th className="px-4 py-4 font-bold text-center">Start Date</th>
                  <th className="px-4 py-4 font-bold text-center">End Date</th>
                  <th className="px-4 py-4 font-bold text-center">Status</th>
                  <th className="px-4 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>

              <tbody className="bg-base-100">
                {sessions.map((session, key) => (
                  <tr
                    key={key}
                    className="hover:bg-base-200 border-b border-base-200 last:border-b-0"
                  >
                    <td className="px-4 py-4 text-center">
                      <span className="font-bold text-2xl text-base-content">{session.name}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <code className="bg-base-300/50 px-3 py-1 rounded-lg text-xl font-semibold text-base-content">
                        {session.code}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-center text-base-content font-medium text-xl">
                      {new Date(session.startDate).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-4 text-center text-base-content font-medium text-xl">
                      {new Date(session.endDate).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {session.isActive ? (
                        <span className="badge badge-success badge-xl text-xl font-bold w-30 justify-center">
                          Active
                        </span>
                      ) : (
                        <span className="badge badge-neutral badge-xl text-xl font-bold w-30 justify-center">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center text-xl">
                      <div className="flex flex-col gap-2 items-center justify-center">
                        <button
                          className="btn btn-info text-xl w-full"
                          onClick={() => navigate(`/sessions/${session.id}`)}
                        >
                          View
                        </button>
                        {session.isActive && (
                          <button
                            className="btn btn-warning text-xl w-full"
                            onClick={() => handleDeactivate(session.id)}
                          >
                            Deactivate
                          </button>
                        )}
                        {!session.isActive && <span className="text-base-content/50">—</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && sessions && sessions.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-xl font-semibold text-base-content/60">No sessions found</p>
          <p className="text-base text-base-content/50">Create a new session to get started</p>
        </div>
      )}
    </div>
  )
}

export default SessionPage
