import { useAuthStore } from '../store/authStore'

export const useAuth = () => {
  const token = useAuthStore((state) => state.token)
  const role = useAuthStore((state) => state.role)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  return {
    isAuthenticated: !!token,
    token,
    role,
    login,
    logout,
  }
}
