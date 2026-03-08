import { type ChangeEvent, useState } from "react";
import { analyzeProject } from "../service/project.service";
import type { ProjectMetrics } from "../types/project";

function AnalysisResult({ sessionId }: { sessionId: number }) {
	const [projectFile, setProjectFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics | null>(
		null,
	);

	const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		setProjectFile(input.files[0]);
	};

	const handleAnalyze = async () => {
		if (projectFile) {
			setIsLoading(true);
			setError(null);
			try {
				const result = await analyzeProject(projectFile, sessionId);

				setProjectMetrics((prev) => ({
					...prev,
					projectLevel: result.projectLevel,
					duplicateScripts: result.duplicateScripts,
					duplicationRatio: result.duplicationRatio,
					blocks: result.blocks,
				}));
			} catch (_error) {
				setError("Error analyzing project");
			} finally {
				setIsLoading(false);
			}
		}
	};

	return (
		<div>
			<div className="flex flex-col items-center gap-8 w-full max-w-5xl">
				<div className="flex flex-row gap-4 w-full justify-center m-8">
					<input
						type="file"
						onChange={handleFile}
						className="file-input file-input-bordered file-input-lg w-full max-w-md bg-base-100 text-xl shadow-md"
					/>
					<button
						type="button"
						onClick={handleAnalyze}
						className="btn btn-primary btn-lg px-10 text-xl shadow-md"
						disabled={!projectFile || isLoading}
					>
						{isLoading ? (
							<span className="loading loading-spinner loading-lg"></span>
						) : (
							"Analyze"
						)}
					</button>
					{error && <h3>{error}</h3>}
				</div>
			</div>

			{projectMetrics !== null && (
				<div className="flex flex-col items-center w-full gap-12 animate-fade-in max-w-400">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
						<div className="flex flex-col items-center justify-center bg-base-100 p-8 rounded-2xl shadow-xl border-2 border-base-300">
							<span className="text-7xl font-black text-primary mb-2">
								{projectMetrics.projectLevel}
							</span>
							<span className="text-xl font-bold text-base-content/70 uppercase tracking-widest">
								Project Level
							</span>
						</div>

						<div className="flex flex-col items-center justify-center bg-base-100 p-8 rounded-2xl shadow-xl border-2 border-base-300">
							<span className="text-7xl font-black text-base-content mb-2">
								{projectMetrics.duplicateScripts}
							</span>
							<span className="text-xl font-bold text-base-content/70 uppercase tracking-widest text-center">
								Duplicate Scripts
							</span>
						</div>

						<div className="flex flex-col items-center justify-center bg-base-100 p-8 rounded-2xl shadow-xl border-2 border-base-300">
							<span className="text-7xl font-black text-accent mb-2">
								{(projectMetrics.duplicationRatio ?? 0).toFixed(1)}%
							</span>
							<span className="text-xl font-bold text-base-content/70 uppercase tracking-widest">
								Duplication Ratio
							</span>
						</div>
					</div>

					<div className="w-full border-t-2 border-base-300/50 my-4"></div>

					<div className="w-full bg-base-100 rounded-xl shadow-2xl border-2 border-base-300 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="table table-lg w-full">
								<thead className="bg-base-300 text-base-content text-lg uppercase tracking-wider">
									<tr>
										<th className="pl-8 py-6 font-bold">Block / Owner</th>
										<th className="text-center font-bold">Level</th>
										<th className="text-center font-bold">
											Structural
											<br />
											Changes
										</th>
										<th className="text-center font-bold">
											Definition
											<br />
											Changes
										</th>
										<th className="text-center font-bold">
											Definition
											<br />
											Level
										</th>
										<th className="text-center font-bold">
											Feature
											<br />
											Guarded
										</th>
										<th className="pr-8 text-center font-bold">
											AST
											<br />
											Pipeline
										</th>
									</tr>
								</thead>

								<tbody className="bg-base-100">
									{projectMetrics.blocks.map((block) => (
										<tr
											key={block.id}
											className="hover:bg-base-200 transition-colors border-b border-base-200"
										>
											<td className="pl-8 py-6">
												<div className="flex flex-col gap-1">
													<span className="font-bold text-2xl text-base-content">
														{block.name}
													</span>
													<span className="text-lg text-base-content/50 font-medium">
														{block.owner}
													</span>
												</div>
											</td>

											<td className="text-center">
												<div className="badge badge-neutral badge-lg h-8 px-4 font-mono text-lg font-bold">
													{block.level}
												</div>
											</td>

											<td className="text-center">
												<span className="font-mono text-2xl font-bold text-base-content/80">
													{block.structuralChanges}
												</span>
											</td>

											<td className="text-center">
												<span className="font-mono text-2xl font-bold text-base-content/80">
													{block.definitionChanges}
												</span>
											</td>

											<td className="text-center">
												<span className="font-mono text-2xl font-bold text-base-content/80">
													{block.definitionLevel}
												</span>
											</td>

											<td className="text-center">
												<span className="font-mono text-2xl font-bold text-base-content/80">
													{block.featureGuardedDefinitionChanges}
												</span>
											</td>

											<td className="pr-8 text-center">
												<span className="font-mono text-2xl font-bold text-base-content/80">
													{block.astPipelineDefinitionChanges}
												</span>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default AnalysisResult;
