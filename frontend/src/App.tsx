import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './hooks/useAuth'
import AdminRoute from './components/AdminRoute'
import SessionPage from './pages/admin/SessionPages'
import MyProjectsPage from './pages/user/MyProjectsPage'
import PageLayout from './components/PageLayout'

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
        </>
      )
      break

    default:
      break
  }

  if (token) {
    privateRoutes = (
      <>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
      </>
    )
  }

  if (!token) {
    publicRoutes = (
      <>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
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
