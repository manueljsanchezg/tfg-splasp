interface AuthData {
  token: string
  role: string
}

export interface AuthResponse {
  accessToken: string,
  role: string
}

export interface AuthStore {
  token: string | null
  role: string | null
  login: (data: AuthData) => void
  logout: () => void
}

export interface LoginData {
  username: string
  password: string
}
