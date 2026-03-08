import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AnalysisMetricsView from "../../components/AnalysisMetricsView";
import ProjectRow from "../../components/ProjectRow";
import { getVersionAnalysis } from "../../service/project.service";
import { getProjectsBySession } from "../../service/session.service";
import type {
	ProjectResponse,
	ProjectVersionResponse,
	SavedAnalysisResult,
} from "../../types/project";

function SessionInfoPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();

	const [projects, setProjects] = useState<ProjectResponse[]>([]);
	const [isLoadingProjects, setIsLoadingProjects] = useState(true);

	const [isModalOpen, setIsModalOpen] = useState(false);
	const [activeVersionName, setActiveVersionName] = useState("");
	const [selectedAnalysis, setSelectedAnalysis] =
		useState<SavedAnalysisResult | null>(null);
	const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

	useEffect(() => {
		if (!sessionId) return;

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

		fetchProjects();
	}, [sessionId]);

	const handleOpenModal = async (
		version: ProjectVersionResponse,
		projectTitle: string,
	) => {
		setActiveVersionName(`${projectTitle} - v${version.versionNumber}`);
		setIsModalOpen(true);
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
									onViewAnalysis={handleOpenModal}
								/>
							))
						)}
					</tbody>
				</table>
			</div>

			<dialog className={`modal ${isModalOpen ? "modal-open" : ""}`}>
				<div className="modal-box w-11/12 max-w-7xl h-[90vh] flex flex-col p-0">
					<div className="p-8 bg-base-200 flex justify-between items-center border-b border-base-300">
						<h3 className="font-bold text-4xl">{activeVersionName}</h3>
						<button
							type="button"
							className="btn btn-ghost btn-lg text-2xl"
							onClick={() => setIsModalOpen(false)}
						>
							✕
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
					<button type="button" onClick={() => setIsModalOpen(false)}>
						close
					</button>
				</form>
			</dialog>
		</div>
	);
}

export default SessionInfoPage;
