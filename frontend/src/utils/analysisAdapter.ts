import type { SavedAnalysisResult } from "../types/project";
import type { SessionAnalysisStats } from "../types/session";
import type { ChartEntry } from "../types/chart";

export const savedAnalysisToChartEntry = (
	analysis: SavedAnalysisResult,
	index: number,
): ChartEntry => ({
	name: `Analysis ${analysis.id ?? index + 1}`,
	projectLevel: analysis.projectLevel,
	duplicationRatio: analysis.duplicationRatio ?? 0,
	totalCombinations: analysis.totalCombinations ?? 0,
	maxTangling: analysis.maxTangling ?? 0,
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
	isAveraged: true,
});
