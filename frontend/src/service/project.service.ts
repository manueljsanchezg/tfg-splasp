import type { ProjectMetrics } from '../types/project'
import { api } from './api'

export const analyzeProject = async (project: File): Promise<ProjectMetrics> => {
  try {
    const formData = new FormData()
    formData.append('file', project)
    const response = await api.post('/projects/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  } catch (error) {
    console.error('Error analyzing project', error)
    throw error
  }
}
