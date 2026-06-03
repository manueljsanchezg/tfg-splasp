import type { ProjectResponse, ProjectVersionResponse } from "../types/project";
import type { ApiResponse } from "../types/request";
import { api } from "./api";

export const getProjects = async (
	limit = 10,
	offset = 0,
): Promise<ProjectResponse[]> => {
	const response = await api.get<ApiResponse<ProjectResponse[]>>("/projects", {
		params: { limit, offset },
	});
	console.log(response.data);
	if (!response.data.data) {
		throw new Error("Error fetching projects");
	}

	return response.data.data;
};

export const getMyAnonymousProject = async (): Promise<ProjectResponse> => {
	const response = await api.get<ApiResponse<ProjectResponse>>("/projects/me");

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
