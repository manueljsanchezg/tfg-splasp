import type { SavedAnalysisResult } from "../../types/project";

interface AnalysisMetricsViewProps {
	metrics: SavedAnalysisResult;
}

function AnalysisMetricsView({ metrics }: AnalysisMetricsViewProps) {
	const ratio =
		metrics.totalScripts > 0
			? (metrics.duplicateScripts / metrics.totalScripts) * 100
			: 0;

	return (
		<div className="flex flex-col items-center w-full gap-12 animate-fade-in mx-auto">
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full max-w-7xl">
				<div className="flex flex-col items-center justify-center bg-base-100 p-6 rounded-2xl shadow-xl border-2 border-base-300">
					<span className="text-6xl font-black text-primary mb-2">
						{metrics.projectLevel}
					</span>
					<span className="text-sm font-bold text-base-content/70 uppercase tracking-widest text-center">
						Project Level
					</span>
				</div>
				<div className="flex flex-col items-center justify-center bg-base-100 p-6 rounded-2xl shadow-xl border-2 border-base-300">
					<span className="text-6xl font-black text-base-content mb-2">
						{metrics.duplicateScripts}{" "}
						<span className="text-2xl text-base-content/50">
							/ {metrics.totalScripts}
						</span>
					</span>
					<span className="text-sm font-bold text-base-content/70 uppercase tracking-widest text-center">
						Duplicate Scripts
					</span>
				</div>
				<div className="flex flex-col items-center justify-center bg-base-100 p-6 rounded-2xl shadow-xl border-2 border-base-300">
					<span className="text-6xl font-black text-accent mb-2">
						{ratio.toFixed(1)}%
					</span>
					<span className="text-sm font-bold text-base-content/70 uppercase tracking-widest text-center">
						Duplication Ratio
					</span>
				</div>
				<div className="flex flex-col items-center justify-center bg-base-100 p-6 rounded-2xl shadow-xl border-2 border-base-300">
					<span className="text-6xl font-black text-secondary mb-2">
						{metrics.maxTangling}
					</span>
					<span className="text-sm font-bold text-base-content/70 uppercase tracking-widest text-center">
						Max Tangling
					</span>
				</div>
			</div>

			<div className="w-full max-w-7xl border-t-2 border-base-300/50 my-2"></div>

			<div className="w-full max-w-7xl">
				<h3 className="text-3xl font-bold mb-6">Blocks Analysis</h3>
				<div className="bg-base-100 rounded-xl shadow-2xl border-2 border-base-300 overflow-hidden">
					<div className="overflow-x-auto">
						<table className="table table-lg w-full">
							<thead className="bg-base-300 text-base-content text-lg uppercase tracking-wider">
								<tr>
									<th className="pl-8 py-6 font-bold">Block / Owner</th>
									<th className="text-center font-bold">Level</th>
									<th className="text-center font-bold">Struct. Changes</th>
									<th className="text-center font-bold">Def. Changes</th>
									<th className="text-center font-bold">Def. Level</th>
									<th className="text-center font-bold">Feature Guarded</th>
									<th className="pr-8 text-center font-bold">AST Pipeline</th>
								</tr>
							</thead>
							<tbody className="bg-base-100">
								{metrics.blocksAnalysis.map((block) => (
									<tr
										key={block.id}
										className="hover:bg-base-200 transition-colors border-b border-base-200"
									>
										<td className="pl-8 py-6">
											<div className="flex flex-col gap-1">
												<span className="font-bold text-2xl">{block.name}</span>
												<span className="text-lg text-base-content/50">
													{block.owner}
												</span>
											</div>
										</td>
										<td className="text-center">
											<div className="badge badge-neutral badge-lg font-mono text-lg font-bold">
												{block.level}
											</div>
										</td>
										<td className="text-center font-mono text-xl font-bold">
											{block.structuralChanges}
										</td>
										<td className="text-center font-mono text-xl font-bold">
											{block.definitionChanges}
										</td>
										<td className="text-center font-mono text-xl font-bold">
											{block.definitionLevel}
										</td>
										<td className="text-center font-mono text-xl font-bold">
											{block.featureGuardedDefinitionChanges}
										</td>
										<td className="pr-8 text-center font-mono text-xl font-bold">
											{block.astPipelineDefinitionChanges}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>

			{metrics.detectedFeatures && metrics.detectedFeatures.length > 0 && (
				<div className="w-full max-w-7xl mb-8">
					<h3 className="text-3xl font-bold mb-6">Detected Features</h3>
					<div className="bg-base-100 rounded-xl shadow-xl border-2 border-base-300 overflow-hidden">
						<table className="table table-lg w-full">
							<thead className="bg-base-300 text-base-content text-lg uppercase tracking-wider">
								<tr>
									<th className="pl-8 py-6 font-bold">Feature Name</th>
									<th className="text-center font-bold">Status</th>
									<th className="pr-8 text-center font-bold">
										Scattering Count
									</th>
								</tr>
							</thead>
							<tbody className="bg-base-100">
								{metrics.detectedFeatures.map((feature) => (
									<tr
										key={feature.id}
										className="hover:bg-base-200 border-b border-base-200"
									>
										<td className="pl-8 py-6 font-bold text-xl">
											{feature.name}
										</td>
										<td className="text-center">
											{feature.isDead ? (
												<div className="badge badge-error badge-lg font-bold">
													Dead
												</div>
											) : (
												<div className="badge badge-success badge-lg font-bold">
													Active
												</div>
											)}
										</td>
										<td className="pr-8 text-center font-mono text-2xl font-bold text-base-content/80">
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

export default AnalysisMetricsView;
