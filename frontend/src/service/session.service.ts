import { api } from "./api"
import type { SessionResponse } from "../types/session"

export const getAllSessions = async (): Promise<SessionResponse[]> => {
  try {
    const response = await api.get<SessionResponse[]>('/sessions')
    return response.data
  } catch (error) {
    console.error('Error getting sessions:', error)
    throw error
  }
}