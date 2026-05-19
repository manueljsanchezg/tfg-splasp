import type {
	AnalysisResult,
	SavedAnalysisResult,
	SavedBatchProjects,
} from "../types/analysis";
import type { ApiResponse } from "../types/request";
import { api } from "./api";

export const getAnalysisByVersionsIds = async (
	versionsIds: number[],
): Promise<SavedAnalysisResult[]> => {
	const params = new URLSearchParams();
	versionsIds.forEach((id) => {
		params.append("versions_ids", id.toString());
	});
	const response = await api.get<ApiResponse<SavedAnalysisResult[]>>(
		"/analysis/selected-versions",
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
	isAnonymous: boolean = false,
): Promise<AnalysisResult> => {
	let url = isAnonymous ? "/analysis/analyze/anonymous" : "/analysis/analyze";
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
		"/analysis/analyze-batch",
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

export const getVersionAnalysis = async (
	versionId: number,
): Promise<SavedAnalysisResult> => {
	const response = await api.get<ApiResponse<SavedAnalysisResult>>(
		`/analysis/versions/${versionId}`,
	);

	if (!response.data.data) {
		throw new Error("Invalid version analysis response");
	}

	return response.data.data;
};
