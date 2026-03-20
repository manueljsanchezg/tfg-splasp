import type { ProjectResponse } from "../types/project";
import type {
	CloseSessionResponse,
	JoinAnonymousSessionRequest,
	JoinAnonymousSessionResponse,
	SessionData,
	SessionResponse,
} from "../types/session";
import { api } from "./api";

export const getAllSessions = async (): Promise<SessionResponse[]> => {
	try {
		const response = await api.get<SessionResponse[]>("/sessions");
		return response.data;
	} catch (error) {
		console.error("Error getting sessions:", error);
		throw error;
	}
};

export const createSession = async (
	data: SessionData,
): Promise<SessionResponse> => {
	try {
		const response = await api.post<SessionResponse>("/sessions", data);
		return response.data;
	} catch (error) {
		console.error("Error getting sessions:", error);
		throw error;
	}
};

export const joinSessionAnonymous = async (
	data: JoinAnonymousSessionRequest,
): Promise<JoinAnonymousSessionResponse> => {
	try {
		console.log(data);
		const response = await api.post<JoinAnonymousSessionResponse>(
			"/sessions/join-anonymous",
			data,
		);
		console.log(response);
		return response.data;
	} catch (error) {
		console.error("Error joining session:", error);
		throw error;
	}
};

export const closeSession = async (
	sessionId: number,
): Promise<CloseSessionResponse> => {
	try {
		const response = await api.patch<CloseSessionResponse>(
			`/sessions/${sessionId}`,
		);
		return response.data;
	} catch (error) {
		console.error("Error closing session:", error);
		throw error;
	}
};

export const getProjectsBySession = async (
	sessionId: number,
): Promise<ProjectResponse[]> => {
	try {
		const response = await api.get<ProjectResponse[]>(
			`/sessions/${sessionId}/projects`,
		);
		return response.data;
	} catch (error) {
		console.error(`Error getting projects for session ${sessionId}:`, error);
		throw error;
	}
};
