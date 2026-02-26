import { Navigate } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { token, role } = useAuth()
  return token && role === 'ADMIN' ? <>{children}</> : <Navigate to="/login" replace />
}

export default AdminRoute