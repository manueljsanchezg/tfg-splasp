export interface UserResponse {
  id: number
  username: string
  role: string
}

export interface CreateUserData {
  username: string
  password: string
}
