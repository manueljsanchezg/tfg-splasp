import type { AnalysisMetricsSource } from "../../types/analysis";
import MetricCard from "./MetricCard";

interface AnalysisMetricsPanelProps {
	analysis: AnalysisMetricsSource;
	showDetectedFeatures?: boolean;
}

function AnalysisMetricsPanel({
	analysis,
	showDetectedFeatures = true,
}: AnalysisMetricsPanelProps) {
	const projectLevel = analysis.projectLevel;
	const duplicationRatio = analysis.duplicationRatio;
	const totalCombinations = analysis.totalCombinations;
	const blocks = analysis.blocksAnalysis;
	const detectedFeatures = analysis.detectedFeatures;

	const maxTangling = analysis.maxTangling;
	const avgTangling = analysis.avgTangling;
	const avgScattering = analysis.avgScattering;
	const totalModifiedBlocks = analysis.totalModifiedBlocks;
	const totalDefinitionChanges = analysis.totalDefinitionChanges;
	const totalFeatureGuardedChanges = analysis.totalFeatureGuardedChanges;
	const totalAstPipelineChanges = analysis.totalAstPipelineChanges;
	const featuresUsedCount = detectedFeatures.filter((f) => !f.isDead).length;
	const maxScattering = analysis.maxScattering;

	return (
		<div className="flex w-full flex-col gap-8">
			<div className="grid w-full grid-cols-4 gap-4">
				<MetricCard
					value={projectLevel}
					label="Project level"
					tooltip="Level of complexity based on the use of metaprogramming."
				/>
				<MetricCard
					value={`${duplicationRatio.toFixed(1)}%`}
					label="Duplication ratio"
					tooltip="Percentage of duplicate blocks found in the project."
				/>
				{typeof totalCombinations === "number" && (
					<MetricCard
						value={totalCombinations}
						label="Total combinations"
						tooltip="Number of possible combinations based on features."
					/>
				)}
				{typeof maxTangling === "number" && (
					<MetricCard
						value={maxTangling}
						label="Max tangling"
						tooltip="Maximum number of features that are in a block."
					/>
				)}
				<MetricCard
					value={maxScattering}
					label="Max scattering"
					tooltip="Maximum number of blocks in which a feature is found."
				/>
				{typeof avgTangling === "number" && (
					<MetricCard
						value={avgTangling.toFixed(2)}
						label="Average tangling"
						tooltip="Average tangling across all modified blocks."
					/>
				)}
				{typeof avgScattering === "number" && (
					<MetricCard
						value={avgScattering.toFixed(2)}
						label="Average scattering"
						tooltip="Average scattering across all features."
					/>
				)}

				<MetricCard
					value={totalModifiedBlocks}
					label="Modified blocks"
					tooltip="Number of blocks that have been modified due to variability."
				/>
				<MetricCard
					value={totalDefinitionChanges}
					label="Definition changes"
					tooltip="Number of times the behavior of a block has changed."
				/>
				<MetricCard
					value={totalFeatureGuardedChanges}
					label="Conditional changes"
					tooltip="Number of definition changes that depend on a feature."
				/>
				<MetricCard
					value={totalAstPipelineChanges}
					label="AST pipeline changes"
					tooltip="Number of times the behavior of a block has changed through AST manipulation"
				/>
				<MetricCard
					value={featuresUsedCount}
					label="Used features"
					tooltip="Number of active features modifying the project."
				/>
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
									<th className="text-center">Structural changes</th>
									<th className="text-center">Deinition changes</th>
									<th className="text-center">Definition level</th>
									<th className="text-center">Feature guarded</th>
									<th className="text-center">AST pipeline</th>
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

			{showDetectedFeatures && detectedFeatures.length > 0 && (
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
												<div className="badge badge-success badge-lg">
													Active
												</div>
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
