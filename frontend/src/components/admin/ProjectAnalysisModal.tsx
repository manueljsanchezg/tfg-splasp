import AnalysisMetricsView from "./AnalysisMetricsView";
import type { SavedAnalysisResult } from "../../types/project";

interface ProjectAnalysisModalProps {
	activeVersionName: string;
	selectedAnalysis: SavedAnalysisResult | null;
	isLoadingAnalysis: boolean;
	isOpen: boolean;
	onClose: () => void;
}

function ProjectAnalysisModal({
	activeVersionName,
	selectedAnalysis,
	isLoadingAnalysis,
	isOpen,
	onClose,
}: ProjectAnalysisModalProps) {
	return (
		<dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
			<div className="modal-box w-11/12 max-w-7xl h-[90vh] flex flex-col p-0">
				<div className="p-8 bg-base-200 flex justify-between items-center border-b border-base-300">
					<h3 className="font-bold text-4xl">{activeVersionName}</h3>
					<button
						type="button"
						className="btn btn-ghost btn-lg text-2xl"
						onClick={onClose}
					>
						X
					</button>
				</div>

				<div className="p-8 overflow-y-auto flex-1 bg-base-100">
					{isLoadingAnalysis ? (
						<div className="flex flex-col items-center justify-center h-full gap-4">
							<span className="loading loading-spinner loading-lg text-primary"></span>
							<span className="text-2xl font-medium text-base-content/70">
								Loading analysis...
							</span>
						</div>
					) : selectedAnalysis ? (
						<AnalysisMetricsView metrics={selectedAnalysis} />
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
