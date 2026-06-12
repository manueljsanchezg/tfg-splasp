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
	maxScattering: analysis.maxScattering,
	avgTangling: analysis.avgTangling,
	avgScattering: analysis.avgScattering,
	totalModifiedBlocks: analysis.totalModifiedBlocks,
	totalDefinitionChanges: analysis.totalDefinitionChanges,
	totalFeatureGuardedChanges: analysis.totalFeatureGuardedChanges,
	totalAstPipelineChanges: analysis.totalAstPipelineChanges,
	isAveraged: false,
});

const r2 = (n: number) => Number(n.toFixed(2));

export const sessionStatsToChartEntry = (
	session: SessionAnalysisStats,
): ChartEntry => ({
	name: session.sessionName,
	projectLevel: r2(session.avgProjectLevel),
	duplicationRatio:
		session.avgTotalScripts > 0
			? r2((session.avgDuplicateScripts / session.avgTotalScripts) * 100)
			: 0,
	totalCombinations: r2(session.avgTotalCombinations),
	maxTangling: r2(session.avgMaxTangling),
	maxScattering: r2(session.avgMaxScattering),
	avgTangling: r2(session.avgAvgTangling),
	avgScattering: r2(session.avgAvgScattering),
	totalModifiedBlocks: r2(session.avgTotalModifiedBlocks),
	totalDefinitionChanges: r2(session.avgTotalDefinitionChanges),
	totalFeatureGuardedChanges: r2(session.avgTotalFeatureGuardedChanges),
	totalAstPipelineChanges: r2(session.avgTotalAstPipelineChanges),
	isAveraged: true,
});
