import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const BACKEND_URL = 'http://localhost:8000'

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})
