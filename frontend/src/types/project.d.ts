export interface Block {
	id?: number;
	owner: string;
	name: string;
	level: number;
	structuralChanges: number;
	definitionChanges: number;
	definitionLevel: number;
	featureGuardedDefinitionChanges: number;
	astPipelineDefinitionChanges: number;
}

export interface ProjectMetrics {
	projectLevel: number;
	duplicateScripts: number;
	duplicationRatio: number;
	blocks: Block[];
}

export interface ProjectResponse {
	id: number;
	title: string;
	createdAt: string;
	userId: number;
	sessionId: number;
}

export interface ProjectVersionResponse {
	id: number;
	versionNumber: number;
	uploadedAt: string;
	projectId: number;
}

export interface DetectedFeature {
	id: number;
	name: string;
	isDead: boolean;
	scatteringCount: number;
}

export interface SavedAnalysisResult {
	id: number;
	projectLevel: number;
	totalScripts: number;
	duplicateScripts: number;
	totalCombinations: number;
	maxTangling: number;
	blocksAnalysis: Block[];
	detectedFeatures: DetectedFeature[];
}
