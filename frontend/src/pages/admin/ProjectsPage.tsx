import { useEffect, useState } from "react";
import type {
	ProjectResponse,
	ProjectVersionResponse,
} from "../../types/project";
import type { SavedAnalysisResult } from "../../types/analysis";
import { getProjects } from "../../service/project.service";
import {
	getAnalysisByVersionsIds,
	getVersionAnalysis,
} from "../../service/analysis.service";
import ProjectRow from "../../components/admin/ProjectRow";
import ProjectAnalysisModal from "../../components/admin/ProjectAnalysisModal";
import ComparisonModal from "../../components/admin/ComparisonModal";
import { savedAnalysisToChartEntry } from "../../utils/analysisAdapter";
import InfiniteScroll from "react-infinite-scroll-component";

function ProjectsPage() {
	const [projects, setProjects] = useState<ProjectResponse[]>([]);
	const [isLoadingProjects, setIsLoadingProjects] = useState(true);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
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

	const fetchProjects = async (currentPage = 0, reset = false) => {
		if (reset) setIsLoadingProjects(true);
		setError(null);
		try {
			const limit = 10;
			const offset = currentPage * limit;
			const newProjects = await getProjects(limit, offset);
			
			if (reset) {
				setProjects(newProjects);
			} else {
				setProjects((prev) => [...prev, ...newProjects]);
			}
			setHasMore(newProjects.length === limit);
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
		fetchProjects(0, true);
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

			<InfiniteScroll
				dataLength={projects.length}
				next={() => {
					const nextPg = page + 1;
					setPage(nextPg);
					fetchProjects(nextPg);
				}}
				hasMore={hasMore}
				loader={<div className="text-center py-4 text-xl">Loading more...</div>}
			>
				<div className="bg-base-100 rounded-xl shadow-lg border border-base-300 overflow-hidden mb-4">
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
			</InfiniteScroll>

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

export default ProjectsPage;
