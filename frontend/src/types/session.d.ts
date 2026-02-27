export interface SessionResponse {
  id: number
  name: string
  code: string
  startDate: string
  endDate: string
  isActive: boolean
}

export interface SessionData {
  name: string
  startDate: string
  endDate: string
}

export interface JoinSessionResponse {
  sessionId: number
}

export interface CloseSessionResponse {
  message: string
}
