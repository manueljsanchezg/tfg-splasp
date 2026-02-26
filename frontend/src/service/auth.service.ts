import type { LoginData } from '../types/auth'
import { api } from './api'

interface BackendAuthResponse {
  access_token: string
  role: string
}

interface AuthResponse {
  token: string
  role: string
}

export const registerUser = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<BackendAuthResponse>('/auth/register', loginData)
    return { token: response.data.access_token, role: response.data.role }
  } catch (error) {
    console.error('Error registering:', error)
    throw error
  }
}

export const loginUser = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<BackendAuthResponse>('/auth/login', loginData)
    return { token: response.data.access_token, role: response.data.role }
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}
