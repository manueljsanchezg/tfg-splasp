import { api } from './api'
import type {
  CloseSessionResponse,
  JoinSessionResponse,
  SessionData,
  SessionResponse,
} from '../types/session'

export const getAllSessions = async (): Promise<SessionResponse[]> => {
  try {
    const response = await api.get<SessionResponse[]>('/sessions')
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error('Error getting sessions:', error)
    throw error
  }
}

export const createSession = async (data: SessionData): Promise<SessionResponse> => {
  try {
    const response = await api.post<SessionResponse>('/sessions', data)
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error('Error getting sessions:', error)
    throw error
  }
}

export const joinSession = async (code: string): Promise<JoinSessionResponse> => {
  try {
    const response = await api.post<JoinSessionResponse>('/sessions/join', { code })
    console.log(response.data)
    return response.data
  } catch (error) {
    console.error('Error getting sessions:', error)
    throw error
  }
}

export const closeSession = async (sessionId: number): Promise<void> => {
  try {
    const response = await api.patch<CloseSessionResponse>('/sessions/join', { sessionId })
    console.log(response.data)
  } catch (error) {
    console.error('Error getting sessions:', error)
    throw error
  }
}
