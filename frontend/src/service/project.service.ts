import { data } from "react-router-dom";
import type {
	ProjectMetrics,
	ProjectResponse,
	ProjectVersionResponse,
	SavedAnalysisResult,
	SavedBatchProjects,
} from "../types/project";
import { api } from "./api";

export const analyzeProjectAnonymous = async (
	project: File,
): Promise<ProjectMetrics> => {
	try {
		const formData = new FormData();
		formData.append("file", project);
		const response = await api.post("/projects/analyze/anonymous", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		return response.data;
	} catch (error) {
		console.error("Error analyzing project", error);
		throw error;
	}
};

export const analyzeBatchProjects = async (
	zip: File,
	sessionId: number,
): Promise<SavedBatchProjects> => {
	try {
		const formData = new FormData();
		formData.append("file", zip);
		formData.append("sessionId", sessionId.toString());
		const response = await api.post("/projects/analyze-batch", formData, {
			headers: {
				"Content-Type": "multipart/form-data",
			},
		});
		console.log(data);
		return response.data;
	} catch (error) {
		console.error("Error analyzing project", error);
		throw error;
	}
};

export const getMyAnonymousProject = async (): Promise<ProjectResponse> => {
	try {
		const response = await api.get<ProjectResponse>("/projects/mine/anonymous");
		return response.data;
	} catch (error) {
		console.error("Error getting my project:", error);
		throw error;
	}
};

export const getProjectVersions = async (
	projectId: number,
): Promise<ProjectVersionResponse[]> => {
	try {
		const response = await api.get<ProjectVersionResponse[]>(
			`/projects/${projectId}/versions`,
		);
		return response.data;
	} catch (error) {
		console.error(`Error getting versions for project ${projectId}:`, error);
		throw error;
	}
};

export const getVersionAnalysis = async (
	versionId: number,
): Promise<SavedAnalysisResult> => {
	try {
		const response = await api.get<SavedAnalysisResult>(
			`/projects/versions/${versionId}/analysis`,
		);
		return response.data;
	} catch (error) {
		console.error(`Error getting analysis for version ${versionId}:`, error);
		throw error;
	}
};
