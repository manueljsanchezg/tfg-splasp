import { AxiosError } from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AnalysisResult from "../../components/AnalysisResult";
import { getMyProjectForSession } from "../../service/project.service";
import type { ProjectResponse } from "../../types/project";

function SessionPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [project, setProject] = useState<ProjectResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const numericSessionId = Number(sessionId);

	useEffect(() => {
		if (!sessionId || Number.isNaN(numericSessionId)) {
			navigate("/sessions/join");
			return;
		}

		const verifyAccess = async () => {
			try {
				const myProject = await getMyProjectForSession(numericSessionId);
				setProject(myProject);
			} catch (error) {
				if (error instanceof AxiosError && error.response?.status === 404) {
					setError("You have not joined this session. Please join first.");
				} else {
					setError("Failed to load session data.");
				}
			} finally {
				setIsLoading(false);
			}
		};

		verifyAccess();
	}, [sessionId, numericSessionId, navigate]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-[60vh]">
				<span className="loading loading-spinner loading-lg"></span>
			</div>
		);
	}

	if (error || !project) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
				<div className="alert alert-error max-w-md">
					<span>{error ?? "Access denied."}</span>
				</div>
				<button
					type="button"
					className="btn btn-primary"
					onClick={() => navigate("/sessions/join")}
				>
					Join a Session
				</button>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center gap-8 w-full py-8">
			<div className="flex flex-col items-center gap-2">
				<div className="badge badge-success badge-lg gap-2 py-4 px-6 text-base font-bold">
					Active in Session
				</div>
				<p className="text-base-content/60 text-lg">
					Project:{" "}
					<span className="font-semibold text-base-content">
						{project.title === "dump" ? "Not yet uploaded" : project.title}
					</span>
				</p>
			</div>
			<AnalysisResult sessionId={numericSessionId} />
		</div>
	);
}

export default SessionPage;
