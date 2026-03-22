import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProjectRow from "../../components/admin/ProjectRow";
import { getVersionAnalysis } from "../../service/project.service";
import { getProjectsBySession } from "../../service/session.service";
import type {
	ProjectResponse,
	ProjectVersionResponse,
	SavedAnalysisResult,
} from "../../types/project";
import UploadZipModal from "../../components/admin/UploadZipModal";
import ProjectAnalysisModal from "../../components/admin/ProjectAnalysisModal";

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

	const fetchProjects = async () => {
		setIsLoadingProjects(true);
		try {
			const data = await getProjectsBySession(Number(sessionId));
			setProjects(data);
		} catch (error) {
			console.error("Error loading projects:", error);
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

		try {
			const data = await getVersionAnalysis(version.id);
			setSelectedAnalysis(data);
		} catch (error) {
			console.error("Error loading analysis:", error);
		} finally {
			setIsLoadingAnalysis(false);
		}
	};

	return (
		<div className="flex flex-col gap-6 w-full px-8 py-6 max-w-7xl mx-auto">
			<div className="flex items-center justify-between mb-4">
				<h1 className="text-5xl font-black">Session {sessionId}</h1>

				<button
					type="button"
					className="btn btn-lg btn-primary"
					onClick={() => setIsZipModalOpen(true)}
				>
					Upload a zip
				</button>

				<button
					type="button"
					className="btn btn-outline btn-lg text-xl"
					onClick={() => navigate("/sessions")}
				>
					Back to Sessions
				</button>
			</div>

			<div className="bg-base-100 rounded-xl shadow-lg border border-base-300 overflow-hidden">
				<table className="table table-lg w-full">
					<thead className="bg-base-300 text-2xl uppercase tracking-wider">
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
		</div>
	);
}

export default SessionInfoPage;
