import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function NavBar() {
  const navigate = useNavigate()
  const { token, role, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    logout()
    navigate('/login')
    setIsOpen(false)
  }

  const toggleMenu = () => setIsOpen(!isOpen)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-4 py-2 rounded transition ${
      isActive ? 'bg-[#009BA6] text-white' : 'hover:bg-[#009BA6] hover:text-white text-[#009BA6]'
    }`

  let publicRoutes = <></>
  let privateRoutes = <></>
  let userRoutes = <></>
  let adminRoutes = <></>

  switch (role) {
    case 'ADMIN':
      adminRoutes = (
        <>
          <NavLink className={linkClass} to="/" onClick={() => setIsOpen(false)}>
            Inicio
          </NavLink>
          <NavLink className={linkClass} to="/sessions" onClick={() => setIsOpen(false)}>
            Sesiones
          </NavLink>
        </>
      )
      break

    case 'USER':
      userRoutes = (
        <>
          <NavLink className={linkClass} to="/" onClick={() => setIsOpen(false)}>
            Inicio
          </NavLink>
          <NavLink className={linkClass} to="/projects" onClick={() => setIsOpen(false)}>
            Mis proyectos
          </NavLink>
        </>
      )
      break

    default:
      break
  }

  if (!token) {
    publicRoutes = (
      <>
        <NavLink className={linkClass} to="/" onClick={() => setIsOpen(false)}>
          Inicio
        </NavLink>
        <NavLink className={linkClass} to="/login" onClick={() => setIsOpen(false)}>
          Login
        </NavLink>
        <NavLink className={linkClass} to="/register" onClick={() => setIsOpen(false)}>
          Registro
        </NavLink>
      </>
    )
  } else {
    privateRoutes = (
      <>
        <NavLink className={linkClass} to="/profile" onClick={() => setIsOpen(false)}>
          Perfil
        </NavLink>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-300 text-white rounded hover:bg-red-400 transition"
        >
          Logout
        </button>
      </>
    )
  }

  return (
    <nav className="w-full sticky top-0 z-50 shadow-xl">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center h-16">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[#009BA6]">SPLASP</span>
        </NavLink>

        <div className="hidden md:flex gap-2 items-center">
          {adminRoutes}
          {userRoutes}
          {privateRoutes}
          {publicRoutes}
        </div>

        <div className="md:hidden">
          <button onClick={toggleMenu} className="p-2 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white px-6 pb-4">
          <div className="flex flex-col gap-2">
            {adminRoutes}
            {userRoutes}
            {privateRoutes}
            {publicRoutes}
          </div>
        </div>
      )}
    </nav>
  )
}
