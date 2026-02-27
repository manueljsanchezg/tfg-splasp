import type { AuthResponse, LoginData } from '../types/auth'
import { api } from './api'


export const registerUser = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/register', loginData)
    return { accessToken: response.data.accessToken, role: response.data.role }
  } catch (error) {
    console.error('Error registering:', error)
    throw error
  }
}

export const loginUser = async (loginData: LoginData): Promise<AuthResponse> => {
  try {
    const response = await api.post<AuthResponse>('/auth/login', loginData)
    return { accessToken: response.data.accessToken, role: response.data.role }
  } catch (error) {
    console.error('Error logging in:', error)
    throw error
  }
}
