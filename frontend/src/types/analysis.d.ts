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


interface AnalysisResultBase {
	feedback: AnalysisFeedback;
	projectLevel: number;
	totalScripts: number;
	duplicateScripts: number;
	duplicationRatio: number;
	totalCombinations: number;
	blocksAnalysis: BlockAnalysis[];
	maxTangling: number;
	avgTangling: number;
	avgScattering: number;
	totalModifiedBlocks: number;
	totalDefinitionChanges: number;
	totalFeatureGuardedChanges: number;
	totalAstPipelineChanges: number;
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

export interface DetectedFeature {
	id?: number;
	name: string;
	isDead: boolean;
	scatteringCount: number;
}
