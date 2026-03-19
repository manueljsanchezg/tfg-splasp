interface AuthData {
	token: string;
}

export interface AuthResponse {
	accessToken: string;
}

export interface AnonymousAuthData {
	accessToken: string;
	projectId: number;
	sessionId: number;
}

export interface AuthStore {
	token: string | null;
	isAnonymous: boolean;
	deviceId: string | null;
	projectId: number | null;
	login: (data: AuthData) => void;
	loginAnonymous: (data: AnonymousAuthData, deviceId: string) => void;
	logout: () => void;
}

export interface LoginData {
	username: string;
	password: string;
}
