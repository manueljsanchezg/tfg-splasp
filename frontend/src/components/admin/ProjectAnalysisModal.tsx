import { useEffect, useState } from "react";
import AnalysisMetricsPanel from "../analysis/AnalysisMetricsPanel";
import type { SavedAnalysisResult } from "../../types/analysis";

interface ProjectAnalysisModalProps {
	activeVersionName: string;
	selectedAnalysis: SavedAnalysisResult | null;
	isLoadingAnalysis: boolean;
	isOpen: boolean;
	onClose: () => void;
}
import FeedbackPanel from "../analysis/FeedbackPanel";

function ProjectAnalysisModal({
	activeVersionName,
	selectedAnalysis,
	isLoadingAnalysis,
	isOpen,
	onClose,
}: ProjectAnalysisModalProps) {
	const [activeView, setActiveView] = useState<"metrics" | "feedback">(
		"metrics",
	);

	useEffect(() => {
		if (isOpen) {
			setActiveView("metrics");
		}
	}, [isOpen]);

	const hasFeedback = Boolean(selectedAnalysis?.feedback);

	return (
		<dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
			<div className="modal-box flex h-[85vh] w-11/12 max-w-6xl flex-col p-0">
				<div className="flex items-center justify-between border-b border-base-300 bg-base-200 p-4">
					<h3 className="text-3xl font-bold">{activeVersionName}</h3>
					<button
						type="button"
						className="btn btn-ghost btn-lg"
						onClick={onClose}
					>
						X
					</button>
				</div>

				<div className="flex-1 overflow-y-auto bg-base-100 p-4">
					{isLoadingAnalysis ? (
						<div className="flex flex-col items-center justify-center h-full gap-4">
							<span className="loading loading-spinner loading-lg text-primary"></span>
							<span className="text-xl font-medium text-base-content/70">
								Loading analysis...
							</span>
						</div>
					) : selectedAnalysis ? (
						<div className="flex flex-col gap-6">
							<div className="join w-fit">
								<button
									type="button"
									className={`btn join-item ${activeView === "metrics" ? "btn-primary" : "btn-outline"}`}
									onClick={() => setActiveView("metrics")}
								>
									Metrics
								</button>
								<button
									type="button"
									className={`btn join-item ${activeView === "feedback" ? "btn-primary" : "btn-outline"}`}
									onClick={() => setActiveView("feedback")}
									disabled={!hasFeedback}
								>
									Feedback
								</button>
							</div>

							{activeView === "metrics" ? (
								<AnalysisMetricsPanel
									analysis={selectedAnalysis}
									showDetectedFeatures
								/>
							) : selectedAnalysis.feedback ? (
								<FeedbackPanel feedback={selectedAnalysis.feedback} />
							) : (
								<div className="alert alert-info shadow-md">
									<span>No feedback generated for this analysis.</span>
								</div>
							)}
						</div>
					) : null}
				</div>
			</div>

			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={onClose}>
					close
				</button>
			</form>
		</dialog>
	);
}

export default ProjectAnalysisModal;
