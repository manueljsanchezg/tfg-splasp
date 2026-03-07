import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import AdminRoute from './components/AdminRoute'
import SessionPage from './pages/admin/SessionsPage'
import MyProjectsPage from './pages/user/MyProjectsPage'
import PageLayout from './components/PageLayout'
import SessionInfoPage from './pages/admin/SessionInfoPage'
import UsersPage from './pages/admin/UsersPage'
import JoinSessionPage from './pages/user/JoinSessionPage'
import UserSessionPage from './pages/user/SessionPage'

export default function App() {
  const { token, role } = useAuth()

  let publicRoutes = <></>
  let privateRoutes = <></>
  let userRoutes = <></>
  let adminRoutes = <></>

  switch (role) {
    case 'ADMIN':
      adminRoutes = (
        <>
          <Route
            path="/sessions"
            element={
              <AdminRoute>
                <SessionPage />
              </AdminRoute>
            }
          />
          <Route
            path="/sessions/:sessionId"
            element={
              <AdminRoute>
                <SessionInfoPage />
              </AdminRoute>
            }
          />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
        </>
      )
      break

    case 'USER':
      userRoutes = (
        <>
          <Route
            path="/projects"
            element={
              <ProtectedRoute>
                <MyProjectsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/join"
            element={
              <ProtectedRoute>
                <JoinSessionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions/:sessionId"
            element={
              <ProtectedRoute>
                <UserSessionPage />
              </ProtectedRoute>
            }
          />
        </>
      )
      break

    default:
      break
  }

  if (!token) {
    publicRoutes = (
      <>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </>
    )
  } else {
    privateRoutes = (
      <>
        <Route path="/" element={<HomePage />} />
      </>
    )
  }

  return (
    <PageLayout>
      <Routes>
        {publicRoutes}
        {privateRoutes}
        {userRoutes}
        {adminRoutes}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </PageLayout>
  )
}
