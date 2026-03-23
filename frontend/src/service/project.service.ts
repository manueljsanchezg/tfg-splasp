import type {
	ProjectMetrics,
	ProjectResponse,
	ProjectVersionResponse,
	SavedAnalysisResult,
	SavedBatchProjects,
} from "../types/project";
import type { ApiResponse } from "../types/request";
import { api } from "./api";

export const analyzeProjectAnonymous = async (
	project: File,
): Promise<ProjectMetrics> => {
	const formData = new FormData();
	formData.append("file", project);
	const response = await api.post<ApiResponse<ProjectMetrics>>(
		"/projects/analyze/anonymous",
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);

	if (!response.data.data) {
		throw new Error("Invalid project analysis response");
	}

	return response.data.data;
};

export const analyzeBatchProjects = async (
	zip: File,
	sessionId: number,
): Promise<SavedBatchProjects> => {
	const formData = new FormData();
	formData.append("file", zip);
	formData.append("sessionId", sessionId.toString());
	const response = await api.post<ApiResponse<SavedBatchProjects>>(
		"/projects/analyze-batch",
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);

	if (!response.data.data) {
		throw new Error("Invalid batch analysis response");
	}

	return response.data.data;
};

export const getMyAnonymousProject = async (): Promise<ProjectResponse> => {
	const response = await api.get<ApiResponse<ProjectResponse>>(
		"/projects/mine/anonymous",
	);

	if (!response.data.data) {
		throw new Error("Invalid project response");
	}

	return response.data.data;
};

export const getProjectVersions = async (
	projectId: number,
): Promise<ProjectVersionResponse[]> => {
	const response = await api.get<ApiResponse<ProjectVersionResponse[]>>(
		`/projects/${projectId}/versions`,
	);

	if (!response.data.data) {
		throw new Error("Invalid project versions response");
	}

	return response.data.data;
};

export const getVersionAnalysis = async (
	versionId: number,
): Promise<SavedAnalysisResult> => {
	const response = await api.get<ApiResponse<SavedAnalysisResult>>(
		`/projects/versions/${versionId}/analysis`,
	);

	if (!response.data.data) {
		throw new Error("Invalid version analysis response");
	}

	return response.data.data;
};
