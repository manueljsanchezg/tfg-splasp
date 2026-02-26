import { create } from 'zustand'
import type { AuthStore } from '../types/auth'

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  role: null,

  login: (data) => {
    set({
      token: data.token,
      role: data.role,
    })
  },

  logout: () => {
    set({
      token: null,
      role: null,
    })
  },
}))
