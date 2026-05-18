export interface BlockAnalysis {
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

export interface AnalysisFeedback {
	label: string;
	summary: string;
	strengths: string[];
	improvements: string[];
	hints: string[];
	alerts: string[];
	metrics: AnalysisFeedbackMetrics;
}

export interface AnalysisFeedbackMetrics {
	avgTangling: number;
	avgScattering: number;
}

interface AnalysisResultBase {
	feedback: AnalysisFeedback;
	projectLevel: number;
	totalScripts: number;
	duplicateScripts: number;
	duplicationRatio: number;
	totalCombinations: number;
	blocksAnalysis: BlockAnalysis[];
	maxTangling: number;
	detectedFeatures: DetectedFeature[];
}

export interface AnalysisResult extends AnalysisResultBase {
	isSaved: false;
	tanglingDict: Record<string, number>;
	scatteringDict: Record<string, number[]>;
	deadFeatures: string[];
}

export interface SavedAnalysisResult extends AnalysisResultBase {
	id: number;
	isSaved: true;
}

export type AnalysisMetricsSource = AnalysisResult | SavedAnalysisResult;

export interface SavedBatchProjects {
	message: string;
	totalSaved: number;
}

export interface ProjectResponse {
	id: number;
	title: string;
	createdAt: string;
	userId: number;
	sessionId?: number | null;
	projectVersions?: ProjectVersionResponse[];
}

export interface ProjectVersionResponse {
	id: number;
	versionNumber: number;
	uploadedAt: string;
	projectId: number;
}

export interface DetectedFeature {
	id?: number;
	name: string;
	isDead: boolean;
	scatteringCount: number;
}
