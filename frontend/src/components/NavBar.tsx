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
    `px-5 py-3 rounded-xl font-bold text-lg transition-all duration-200 ${
      isActive
        ? 'bg-[#009BA6] text-white shadow-md'
        : 'text-base-content/70 hover:bg-[#009BA6]/10 hover:text-[#009BA6]'
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
            Home
          </NavLink>
          <NavLink className={linkClass} to="/sessions" onClick={() => setIsOpen(false)}>
            Sessions
          </NavLink>
          <NavLink className={linkClass} to="/users" onClick={() => setIsOpen(false)}>
            Users
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
          Home
        </NavLink>
        <NavLink className={linkClass} to="/login" onClick={() => setIsOpen(false)}>
          Login
        </NavLink>
        <NavLink className={linkClass} to="/register" onClick={() => setIsOpen(false)}>
          Register
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
          className="px-6 py-3 bg-red-500 text-white font-bold text-lg rounded-xl hover:bg-red-600 hover:shadow-lg transition-all duration-200 ml-4"
        >
          Logout
        </button>
      </>
    )
  }

  return (
    <nav className="w-full sticky top-0 z-50 bg-base-100 shadow-sm border-b border-base-200">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center h-24">
        <NavLink to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <span className="text-4xl font-black text-[#009BA6] tracking-tight">
            SPLASP<span className="text-base-content">.</span>
          </span>
        </NavLink>

        <div className="hidden md:flex gap-4 items-center">
          {adminRoutes}
          {userRoutes}
          {privateRoutes}
          {publicRoutes}
        </div>

        <div className="md:hidden">
          <button 
            onClick={toggleMenu} 
            className="p-3 rounded-xl text-base-content hover:bg-base-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-base-100 shadow-2xl border-t border-base-200 absolute w-full left-0">
          <div className="flex flex-col gap-3 px-6 py-8">
            <div className="flex flex-col gap-3">
              {adminRoutes}
              {userRoutes}
              {privateRoutes}
              {publicRoutes}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}