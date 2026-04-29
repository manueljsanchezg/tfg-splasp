import { useEffect, useState } from "react";
import type {
	ProjectResponse,
	ProjectVersionResponse,
	SavedAnalysisResult,
} from "../../types/project";
import {
	getAnalysisByVersionsIds,
	getProjects,
	getVersionAnalysis,
} from "../../service/project.service";
import ProjectRow from "../../components/admin/ProjectRow";
import ProjectAnalysisModal from "../../components/admin/ProjectAnalysisModal";
import ComparisonModal from "../../components/admin/ComparisonModal";

function ProjectsPage() {
	const [projects, setProjects] = useState<ProjectResponse[]>([]);
	const [isLoadingProjects, setIsLoadingProjects] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
	const [activeVersionName, setActiveVersionName] = useState("");
	const [selectedAnalysis, setSelectedAnalysis] =
		useState<SavedAnalysisResult | null>(null);
	const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
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
			const data = await getProjects();
			console.log(data);
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
		fetchProjects();
	}, []);

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
		<div className="flex flex-col gap-6 w-full px-8 py-6 max-w-7xl">
			{error && (
				<div className="alert alert-error shadow-lg">
					<span>{error}</span>
				</div>
			)}
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<button
						type="button"
						className="btn btn-lg btn-primary"
						onClick={handleOpenComparisonModal}
						disabled={selectedVersionIds.length === 0}
					>
						Compare selected
					</button>
					<span className="text-base text-base-content/70">
						{selectedVersionIds.length} selected
					</span>
				</div>
			</div>

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

			<ProjectAnalysisModal
				isOpen={isAnalysisModalOpen}
				activeVersionName={activeVersionName}
				selectedAnalysis={selectedAnalysis}
				isLoadingAnalysis={isLoadingAnalysis}
				onClose={() => setIsAnalysisModalOpen(false)}
			/>

			<ComparisonModal
				isOpen={isComparisonModalOpen}
				analyses={selectedAnalyses}
				isLoading={isLoadingComparison}
				onClose={() => setIsComparisonModalOpen(false)}
			/>
		</div>
	);
}

export default ProjectsPage;
