import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProjectRow from "../../components/admin/ProjectRow";
import {
	getAnalysisByVersionsIds,
	getVersionAnalysis,
} from "../../service/analysis.service";
import {
	downloadProjectsCSVBySession,
	getProjectsBySession,
} from "../../service/session.service";
import type {
	ProjectResponse,
	ProjectVersionResponse,
} from "../../types/project";
import type { SavedAnalysisResult } from "../../types/analysis";
import UploadZipModal from "../../components/admin/UploadZipUrlsModal";
import ProjectAnalysisModal from "../../components/admin/ProjectAnalysisModal";
import ComparisonModal from "../../components/admin/ComparisonModal";
import { savedAnalysisToChartEntry } from "../../utils/analysisAdapter";

function SessionInfoPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [projects, setProjects] = useState<ProjectResponse[]>([]);
	const [isLoadingProjects, setIsLoadingProjects] = useState(true);
	const [isZipModalOpen, setIsZipModalOpen] = useState(false);
	const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
	const [activeVersionName, setActiveVersionName] = useState("");
	const [selectedAnalysis, setSelectedAnalysis] =
		useState<SavedAnalysisResult | null>(null);
	const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [selectedVersionIds, setSelectedVersionIds] = useState<number[]>([]);
	const [selectedAnalyses, setSelectedAnalyses] = useState<
		SavedAnalysisResult[]
	>([]);
	const [isLoadingComparison, setIsLoadingComparison] = useState(false);
	const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

	const addVersionId = (versionId: number) => {
		setSelectedVersionIds((prev) =>
			prev.includes(versionId)
				? prev.filter((v) => v !== versionId)
				: [...prev, versionId],
		);
	};

	const fetchProjects = async () => {
		setIsLoadingProjects(true);
		setError(null);
		try {
			const data = await getProjectsBySession(Number(sessionId));
			setProjects(data);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Error loading projects",
			);
		} finally {
			setIsLoadingProjects(false);
		}
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: pass
	useEffect(() => {
		if (!sessionId) return;
		fetchProjects();
	}, [sessionId]);

	const handleOpenAnaylisisModal = async (
		version: ProjectVersionResponse,
		projectTitle: string,
	) => {
		setActiveVersionName(`${projectTitle} - v${version.versionNumber}`);
		setIsAnalysisModalOpen(true);
		setIsLoadingAnalysis(true);
		setSelectedAnalysis(null);
		setError(null);

		try {
			const data = await getVersionAnalysis(version.id);
			setSelectedAnalysis(data);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Error loading analysis",
			);
		} finally {
			setIsLoadingAnalysis(false);
		}
	};

	const handleLoadSelectedAnalyses = async () => {
		if (selectedVersionIds.length === 0) return;
		setIsLoadingComparison(true);
		try {
			const data = await getAnalysisByVersionsIds(selectedVersionIds);
			setSelectedAnalyses(data);
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Error loading comparison",
			);
		} finally {
			setIsLoadingComparison(false);
		}
	};

	const handleOpenComparisonModal = async () => {
		if (selectedVersionIds.length === 0) return;
		setError(null);
		setIsComparisonModalOpen(true);
		await handleLoadSelectedAnalyses();
	};

	return (
		<div className="flex flex-col gap-6 w-full px-8 py-6 max-w-7xl ">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-5xl font-black">Session: {sessionId}</h1>

				<div className="flex items-center gap-3">
					<button
						type="button"
						className="btn btn-lg text-xl btn-primary"
						onClick={handleOpenComparisonModal}
						disabled={selectedVersionIds.length === 0}
					>
						Compare
						{selectedVersionIds.length > 0 && (
							<div className="badge badge-neutral badge-lg ml-1 font-bold">
								{selectedVersionIds.length}
							</div>
						)}
					</button>
				</div>

				<button
					type="button"
					className="btn btn-lg text-xl btn-primary"
					onClick={() => setIsZipModalOpen(true)}
				>
					Upload projects
				</button>

				<button
					type="button"
					className="btn btn-lg text-xl btn-primary"
					onClick={async () => {
						if (!sessionId) return;
						await downloadProjectsCSVBySession(Number(sessionId));
					}}
				>
					Download csv
				</button>

				<button
					type="button"
					className="btn btn-outline btn-lg text-xl"
					onClick={() => navigate("/sessions")}
				>
					Back to Sessions
				</button>
			</div>

			{error && (
				<div className="alert alert-error shadow-lg">
					<span>{error}</span>
				</div>
			)}

			<div className="bg-base-100 rounded-xl shadow-lg border border-base-300 overflow-hidden">
				<table className="table table-lg w-full">
					<thead className="bg-base-300 text-2xl uppercase">
						<tr>
							<th className="pl-8 py-6">Project Name</th>
							<th className="text-center pr-8 w-64 py-6">Created At</th>
						</tr>
					</thead>
					<tbody>
						{isLoadingProjects ? (
							<tr>
								<td colSpan={2} className="text-center py-12 text-2xl">
									Loading...
								</td>
							</tr>
						) : projects.length === 0 ? (
							<tr>
								<td colSpan={2} className="text-center py-12 text-2xl">
									No projects found.
								</td>
							</tr>
						) : (
							projects.map((project) => (
								<ProjectRow
									key={project.id}
									project={project}
									onViewAnalysis={handleOpenAnaylisisModal}
									onAddVersionId={addVersionId}
									selectedVersionIds={selectedVersionIds}
								/>
							))
						)}
					</tbody>
				</table>
			</div>

			<UploadZipModal
				sessionId={Number(sessionId)}
				isOpen={isZipModalOpen}
				onClose={() => setIsZipModalOpen(false)}
				onSuccess={fetchProjects}
			/>

			<ProjectAnalysisModal
				isOpen={isAnalysisModalOpen}
				activeVersionName={activeVersionName}
				selectedAnalysis={selectedAnalysis}
				isLoadingAnalysis={isLoadingAnalysis}
				onClose={() => setIsAnalysisModalOpen(false)}
			/>

			<ComparisonModal
				isOpen={isComparisonModalOpen}
				metrics={selectedAnalyses.map(savedAnalysisToChartEntry)}
				isLoading={isLoadingComparison}
				onClose={() => setIsComparisonModalOpen(false)}
			/>
		</div>
	);
}

export default SessionInfoPage;
