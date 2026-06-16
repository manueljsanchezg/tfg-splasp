export interface ProjectResponse {
	id: number;
	title: string;
	createdAt: string;
	userId: number;
	sessionId?: number | null;
	url?: string | null;
	projectVersions?: ProjectVersionResponse[];
}

export interface ProjectVersionResponse {
	id: number;
	versionNumber: number;
	uploadedAt: string;
	projectId: number;
}
