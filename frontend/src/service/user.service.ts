import { api } from './api'
import type { CreateUserData, UserResponse } from '../types/user'

export const getAllUsers = async (): Promise<UserResponse[]> => {
  try {
    const response = await api.get<UserResponse[]>('/users')
    return response.data
  } catch (error) {
    console.error('Error getting users:', error)
    throw error
  }
}

export const createUser = async (data: CreateUserData): Promise<UserResponse> => {
  try {
    const response = await api.post<UserResponse>('/users', data)
    return response.data
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export const deleteUser = async (userId: number): Promise<{ message: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/users/${userId}`)
    return response.data
  } catch (error) {
    console.error(`Error deleting user ${userId}:`, error)
    throw error
  }
}
