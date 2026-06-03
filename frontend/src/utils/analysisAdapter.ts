import type { SavedAnalysisResult } from "../types/analysis";
import type { SessionAnalysisStats } from "../types/session";
import type { ChartEntry } from "../types/chart";

export const savedAnalysisToChartEntry = (
	analysis: SavedAnalysisResult,
	index: number,
): ChartEntry => ({
	name: `Analysis ${analysis.id ?? index + 1}`,
	projectLevel: analysis.projectLevel,
	duplicationRatio: analysis.duplicationRatio,
	totalCombinations: analysis.totalCombinations,
	maxTangling: analysis.maxTangling,
	avgTangling: analysis.avgTangling,
	avgScattering: analysis.avgScattering,
	totalModifiedBlocks: analysis.totalModifiedBlocks,
	totalDefinitionChanges: analysis.totalDefinitionChanges,
	totalFeatureGuardedChanges: analysis.totalFeatureGuardedChanges,
	totalAstPipelineChanges: analysis.totalAstPipelineChanges,
	isAveraged: false,
});

export const sessionStatsToChartEntry = (
	session: SessionAnalysisStats,
): ChartEntry => ({
	name: session.sessionName,
	projectLevel: session.avgProjectLevel,
	duplicationRatio: session.avgDuplicateScripts / session.avgTotalScripts,
	totalCombinations: session.avgTotalCombinations,
	maxTangling: session.avgMaxTangling,
	avgTangling: session.avgAvgTangling,
	avgScattering: session.avgAvgScattering,
	totalModifiedBlocks: session.avgTotalModifiedBlocks,
	totalDefinitionChanges: session.avgTotalDefinitionChanges,
	totalFeatureGuardedChanges: session.avgTotalFeatureGuardedChanges,
	totalAstPipelineChanges: session.avgTotalAstPipelineChanges,
	isAveraged: true,
});
