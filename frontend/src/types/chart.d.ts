export interface ChartEntry {
	name: string;
	projectLevel: number;
	duplicationRatio: number;
	totalCombinations: number;
	maxTangling: number;
	avgTangling: number;
	avgScattering: number;
	totalModifiedBlocks: number;
	totalDefinitionChanges: number;
	totalFeatureGuardedChanges: number;
	totalAstPipelineChanges: number;
	isAveraged: boolean;
}
