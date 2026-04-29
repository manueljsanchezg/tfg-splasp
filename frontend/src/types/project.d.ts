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
	projectLevel: number;
	totalScripts: number;
	duplicateScripts: number;
	duplicationRatio: number;
	totalCombinations: number;
	totalModifiedBlocks: number;
	totalStructuralChanges: number;
	totalDefinitionChanges: number;
	featureGuardedDefinitionChanges: number;
	astPipelineDefinitionChanges: number;
	featuresUsedCount: number;
	deadFeaturesCount: number;
	unknownEventsCount: number;
	maxTangling: number;
	avgTangling: number;
	maxScattering: number;
	avgScattering: number;
}

interface AnalysisBase {
	id?: number;
	feedback?: AnalysisFeedback;
	projectLevel: number;
	totalScripts?: number;
	duplicateScripts: number;
	duplicationRatio?: number;
	totalCombinations?: number;
	tanglingDict?: Record<string, number>;
	maxTangling?: number;
	blocksAnalysis: BlockAnalysis[];
	detectedFeatures?: DetectedFeature[];
}

export interface AnalysisResult extends AnalysisBase {
	isSaved: false;
}

export interface SavedBatchProjects {
	message: string;
	totalSaved: number;
}

export interface ProjectResponse {
	id: number;
	title: string;
	createdAt: string;
	userId: number;
	sessionId: number;
	projectVersions?: ProjectVersionResponse[];
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

export interface SavedAnalysisResult extends AnalysisBase {
	id: number;
	isSaved: true;
}

export type AnalysisMetricsSource = AnalysisResult | SavedAnalysisResult;
