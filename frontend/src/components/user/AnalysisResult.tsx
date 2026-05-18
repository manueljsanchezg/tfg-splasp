import { type ChangeEvent, useEffect, useRef, useState } from "react";
import {
	analyzeProject,
	analyzeProjectAnonymous,
} from "../../service/project.service";
import AnalysisMetricsPanel from "../analysis/AnalysisMetricsPanel";
import FeedbackPanel from "../analysis/FeedbackPanel";
import type { AnalysisResult as AnalysisResultData } from "../../types/project";
import { useAuth } from "../../hooks/useAuth";

function AnalysisResult() {
	const { isAnonymous } = useAuth();
	const [projectUrl, setProjectUrl] = useState<string | null>(null);
	const [projectFile, setProjectFile] = useState<File | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [projectMetrics, setProjectMetrics] =
		useState<AnalysisResultData | null>(null);

	const [isMetricsVisible, setIsMetricsVisible] = useState<boolean>(false);
	const [isHintsModalOpen, setIsHintsModalOpen] = useState<boolean>(false);
	const hintsModalRef = useRef<HTMLDialogElement>(null);
	const feedback = projectMetrics?.feedback;

	useEffect(() => {
		if (isHintsModalOpen) {
			hintsModalRef.current?.showModal();
		} else {
			hintsModalRef.current?.close();
		}
	}, [isHintsModalOpen]);

	const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
		setProjectUrl("");
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		setProjectFile(input.files[0]);
	};

	const handleAnalyze = async () => {
		if (!projectFile && !projectUrl) return;
		setIsLoading(true);
		setError(null);
		setProjectMetrics(null);
		setIsMetricsVisible(false);
		setIsHintsModalOpen(false);
		try {
			const result = isAnonymous
				? await analyzeProjectAnonymous(projectFile, projectUrl)
				: await analyzeProject(projectFile, projectUrl);

			setProjectMetrics(result);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Error analyzing project",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full">
			<div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8">
				<div className="m-8 flex w-full flex-row justify-center gap-4">
					<div className="flex flex-col gap-4">
						<p className="text-center text-xl">
							Enter the XML file or the project URL
						</p>
						<input
							type="file"
							onChange={handleFile}
							className="file-input file-input-bordered w-full"
						/>
						<input
							type="text"
							className="input w-full"
							value={projectUrl ?? ""}
							onChange={(e) => {
								setProjectFile(null);
								setProjectUrl(e.target.value);
							}}
						/>
						<button
							type="button"
							onClick={handleAnalyze}
							className="btn btn-primary px-8"
							disabled={(!projectFile && !projectUrl) || isLoading}
						>
							{isLoading ? (
								<span className="loading loading-spinner loading-lg"></span>
							) : (
								"Analyze"
							)}
						</button>
						{error && (
							<h3 className="text-center text-xl text-error">{error}</h3>
						)}
					</div>
				</div>
			</div>

			{projectMetrics !== null && (
				<div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
					{feedback ? (
						<FeedbackPanel
							feedback={feedback}
							showHints={false}
							actions={
								<button
									type="button"
									className="btn btn-outline btn-secondary"
									onClick={() => setIsHintsModalOpen(true)}
								>
									Show hints
								</button>
							}
						/>
					) : (
						<div className="w-full rounded border border-base-300 bg-base-100 p-5">
							<div className="mb-4 flex flex-wrap items-center gap-3">
								<h2 className="text-2xl font-bold">Feedback</h2>
							</div>
							<p className="text-base leading-relaxed text-base-content/90">
								The analysis has finished. You can now review the metrics behind it.
							</p>
						</div>
					)}

					<div className="w-full flex justify-center">
						<button
							type="button"
							className="btn btn-outline btn-primary"
							onClick={() => setIsMetricsVisible((prev) => !prev)}
						>
							{isMetricsVisible ? "Hide metrics" : "View analysis metrics"}
						</button>
					</div>

					{isMetricsVisible && (
						<AnalysisMetricsPanel analysis={projectMetrics} />
					)}
				</div>
			)}

			<dialog
				ref={hintsModalRef}
				className="modal"
				onClose={() => setIsHintsModalOpen(false)}
			>
				<div className="modal-box max-w-3xl">
					<h3 className="font-bold text-2xl mb-4">Hints</h3>
					{feedback?.hints && feedback.hints.length > 0 ? (
						<ul className="list-disc list-inside space-y-3 text-base leading-relaxed">
							{feedback.hints.map((hint) => (
								<li key={hint}>{hint}</li>
							))}
						</ul>
					) : (
						<p className="text-base-content/70">
							No hints available for this analysis.
						</p>
					)}

					<div className="modal-action">
						<button
							type="button"
							className="btn btn-primary"
							onClick={() => setIsHintsModalOpen(false)}
						>
							Close
						</button>
					</div>
				</div>
				<form method="dialog" className="modal-backdrop">
					<button type="button" onClick={() => setIsHintsModalOpen(false)}>
						close
					</button>
				</form>
			</dialog>
		</div>
	);
}

export default AnalysisResult;
