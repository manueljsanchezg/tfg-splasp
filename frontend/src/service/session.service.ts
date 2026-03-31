import type { ProjectResponse } from "../types/project";
import type { ApiResponse } from "../types/request";
import type {
	CloseSessionResponse,
	JoinAnonymousSessionRequest,
	JoinAnonymousSessionResponse,
	SessionData,
	SessionResponse,
} from "../types/session";
import { api } from "./api";

export const getAllSessions = async (): Promise<SessionResponse[]> => {
	const response = await api.get<ApiResponse<SessionResponse[]>>("/sessions");
	if (!response.data.data) {
		throw new Error("Invalid sessions response");
	}
	return response.data.data;
};

export const createSession = async (
	data: SessionData,
): Promise<SessionResponse> => {
	const response = await api.post<ApiResponse<SessionResponse>>(
		"/sessions",
		data,
	);
	if (!response.data.data) {
		throw new Error("Invalid session response");
	}
	return response.data.data;
};

export const joinSessionAnonymous = async (
	data: JoinAnonymousSessionRequest,
): Promise<JoinAnonymousSessionResponse> => {
	const response = await api.post<ApiResponse<JoinAnonymousSessionResponse>>(
		"/sessions/join-anonymous",
		data,
	);
	if (!response.data.data) {
		throw new Error("Invalid anonymous session response");
	}
	return response.data.data;
};

export const closeSession = async (
	sessionId: number,
): Promise<CloseSessionResponse> => {
	const response = await api.patch<ApiResponse<CloseSessionResponse>>(
		`/sessions/${sessionId}`,
	);
	if (!response.data.data) {
		throw new Error("Invalid close session response");
	}
	return response.data.data;
};

export const getProjectsBySession = async (
	sessionId: number,
): Promise<ProjectResponse[]> => {
	const response = await api.get<ApiResponse<ProjectResponse[]>>(
		`/sessions/${sessionId}/projects`,
	);
	if (!response.data.data) {
		throw new Error("Invalid projects response");
	}
	return response.data.data;
};

export const downloadProjectsCSVBySession = async (
	sessionId: number,
): Promise<void> => {
	const response = await api.get(`/sessions/${sessionId}/projects-csv`, {
		responseType: "blob",
	});
	const url = URL.createObjectURL(response.data);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", "projects.csv");
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};
