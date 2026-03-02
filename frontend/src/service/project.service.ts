import type { ProjectMetrics, ProjectVersionResponse, SavedAnalysisResult } from '../types/project'
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

export const getProjectVersions = async (projectId: number): Promise<ProjectVersionResponse[]> => {
  try {
    const response = await api.get<ProjectVersionResponse[]>(`/projects/${projectId}/versions`)
    return response.data
  } catch (error) {
    console.error(`Error getting versions for project ${projectId}:`, error)
    throw error
  }
}

export const getVersionAnalysis = async (versionId: number): Promise<SavedAnalysisResult> => {
  try {
    const response = await api.get<SavedAnalysisResult>(`/projects/versions/${versionId}/analysis`)
    return response.data
  } catch (error) {
    console.error(`Error getting analysis for version ${versionId}:`, error)
    throw error
  }
}