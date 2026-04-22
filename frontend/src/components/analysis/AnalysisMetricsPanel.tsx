import type { AnalysisMetricsSource } from "../../types/project";
import MetricCard from "./MetricCard";

interface AnalysisMetricsPanelProps {
	analysis: AnalysisMetricsSource;
	showDetectedFeatures?: boolean;
}

function AnalysisMetricsPanel({
	analysis,
	showDetectedFeatures = false,
}: AnalysisMetricsPanelProps) {
	const feedbackMetrics = analysis.feedback?.metrics;
	const projectLevel = feedbackMetrics?.projectLevel ?? analysis.projectLevel;
	const totalScripts = feedbackMetrics?.totalScripts ?? analysis.totalScripts;
	const duplicateScripts = feedbackMetrics?.duplicateScripts ?? analysis.duplicateScripts;
	const duplicationRatio =
		feedbackMetrics?.duplicationRatio ??
		analysis.duplicationRatio ??
		(typeof totalScripts === "number" && totalScripts > 0
			? (duplicateScripts / totalScripts) * 100
			: 0);
	const totalCombinations = feedbackMetrics?.totalCombinations ?? analysis.totalCombinations;
	const maxTangling = feedbackMetrics?.maxTangling ?? analysis.maxTangling;
	const blocks = analysis.blocks;
	const detectedFeatures = analysis.detectedFeatures;

	return (
		<div className="flex w-full flex-col gap-8">
			<div className="grid w-full grid-cols-4 gap-4">
				<MetricCard value={projectLevel} label="Project Level" />
				<MetricCard value={duplicateScripts} label="Duplicate Scripts" />
				<MetricCard value={`${duplicationRatio.toFixed(1)}%`} label="Duplication Ratio" />
				{typeof totalCombinations === "number" && (
					<MetricCard value={totalCombinations} label="Total Combinations" />
				)}
				{typeof maxTangling === "number" && (
					<MetricCard value={maxTangling} label="Max Tangling" />
				)}
				{feedbackMetrics && (
					<>
						<MetricCard value={feedbackMetrics.totalModifiedBlocks} label="Modified Blocks" />
						<MetricCard value={feedbackMetrics.featuresUsedCount} label="Used Features" />
						<MetricCard value={feedbackMetrics.deadFeaturesCount} label="Dead Features" />
						<MetricCard value={feedbackMetrics.maxScattering} label="Max Scattering" />
					</>
				)}
			</div>

			<div className="w-full">
				<h3 className="mb-4 text-3xl font-bold">Blocks Analysis</h3>
				<div className="overflow-hidden rounded border border-base-300 bg-base-100 shadow">
					<div className="overflow-x-auto">
						<table className="table w-full">
							<thead className="bg-base-300 text-base-content text-base">
								<tr>
									<th>Block / Owner</th>
									<th className="text-center">Level</th>
									<th className="text-center">Struct. Changes</th>
									<th className="text-center">Def. Changes</th>
									<th className="text-center">Def. Level</th>
									<th className="text-center">Feature Guarded</th>
									<th className="text-center">AST Pipeline</th>
								</tr>
							</thead>
							<tbody className="bg-base-100">
								{blocks.map((block) => (
									<tr
										key={block.id}
										className="border-b border-base-200 hover:bg-base-200"
									>
										<td>
											<div className="flex flex-col gap-1">
												<span className="text-lg font-bold">{block.name}</span>
												<span className="text-base text-base-content/60">
													{block.owner}
												</span>
											</div>
										</td>
										<td className="text-center">
											<div className="badge badge-neutral badge-lg font-mono">
												{block.level}
											</div>
										</td>
										<td className="text-center text-xl font-mono font-bold">
											{block.structuralChanges}
										</td>
										<td className="text-center text-xl font-mono font-bold">
											{block.definitionChanges}
										</td>
										<td className="text-center text-xl font-mono font-bold">
											{block.definitionLevel}
										</td>
										<td className="text-center text-xl font-mono font-bold">
											{block.featureGuardedDefinitionChanges}
										</td>
										<td className="text-center text-xl font-mono font-bold">
											{block.astPipelineDefinitionChanges}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{showDetectedFeatures &&
				detectedFeatures &&
				detectedFeatures.length > 0 && (
					<div className="mb-6 w-full">
						<h3 className="mb-4 text-3xl font-bold">Detected Features</h3>
						<div className="overflow-hidden rounded border border-base-300 bg-base-100 shadow">
							<table className="table w-full">
								<thead className="bg-base-300 text-base-content text-base">
									<tr>
										<th>Feature Name</th>
										<th className="text-center">Status</th>
										<th className="text-center">Scattering Count</th>
									</tr>
								</thead>
								<tbody className="bg-base-100">
									{detectedFeatures.map((feature) => (
										<tr
											key={feature.id}
											className="hover:bg-base-200 border-b border-base-200"
										>
											<td className="text-lg font-bold">{feature.name}</td>
											<td className="text-center">
												{feature.isDead ? (
													<div className="badge badge-error badge-lg">Dead</div>
												) : (
													<div className="badge badge-success badge-lg">Active</div>
												)}
											</td>
											<td className="text-center text-2xl font-mono font-bold text-base-content/80">
												{feature.scatteringCount}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				)}
		</div>
	);
}

export default AnalysisMetricsPanel;
