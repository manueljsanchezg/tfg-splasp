import type {
	AnalysisResult,
	ProjectResponse,
	ProjectVersionResponse,
	SavedAnalysisResult,
	SavedBatchProjects,
} from "../types/project";
import type { ApiResponse } from "../types/request";
import { api } from "./api";

export const getProjects = async (): Promise<ProjectResponse[]> => {
	const response = await api.get<ApiResponse<ProjectResponse[]>>(
		"/projects/latest-versions",
	);
	console.log(response.data);
	if (!response.data.data) {
		throw new Error("Error fetching projects");
	}

	return response.data.data;
};

export const getAnalysisByVersionsIds = async (
	versionsIds: number[],
): Promise<SavedAnalysisResult[]> => {
	const params = new URLSearchParams();
	versionsIds.forEach((id) => {
		params.append("versions_ids", id.toString());
	});
	const response = await api.get<ApiResponse<SavedAnalysisResult[]>>(
		"/projects/selected-versions/analysis",
		{
			params: params,
		},
	);
	console.log(response.data.data);
	if (!response.data.data) {
		throw new Error("Error fetching analysis versions");
	}

	return response.data.data;
};

export const analyzeProject = async (
	project: File | null,
	projectUrl: string | null,
): Promise<AnalysisResult> => {
	let url = "/projects/analyze";
	const formData = new FormData();
	if (projectUrl) {
		url = url.concat(`?project_url=${projectUrl}`);
	} else if (project) {
		formData.append("file", project);
	}

	const response = await api.post<ApiResponse<AnalysisResult>>(url, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	if (!response.data.data) {
		throw new Error("Invalid project analysis response");
	}

	return response.data.data;
};

export const analyzeProjectAnonymous = async (
	project: File | null,
	projectUrl: string | null,
): Promise<AnalysisResult> => {
	let url = "/projects/analyze/anonymous";
	const formData = new FormData();
	if (projectUrl) {
		url = url.concat(`?project_url=${projectUrl}`);
	} else if (project) {
		formData.append("file", project);
	}
	const response = await api.post<ApiResponse<AnalysisResult>>(url, formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});

	if (!response.data.data) {
		throw new Error("Invalid project analysis response");
	}

	return response.data.data;
};

export const analyzeBatchProjects = async (
	sessionId: number,
	zip: File | null,
	projectsUrls: string | null,
): Promise<SavedBatchProjects> => {
	const formData = new FormData();
	formData.append("sessionId", sessionId.toString());
	if (zip) {
		formData.append("file", zip);
	}
	if (projectsUrls) {
		formData.append("projectsUrls", projectsUrls);
	}
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
