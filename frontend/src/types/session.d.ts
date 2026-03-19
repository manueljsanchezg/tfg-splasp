export interface SessionResponse {
	id: number;
	name: string;
	code: string;
	startDate: string;
	endDate: string;
	isActive: boolean;
}

export interface SessionData {
	name: string;
	startDate: string;
	endDate: string;
}



export interface JoinAnonymousSessionRequest {
	code: string;
	deviceId: string;
}

export interface JoinAnonymousSessionResponse {
	accessToken: string;
	projectId: number;
	sessionId: number;
}

export interface CloseSessionResponse {
	message: string;
}
