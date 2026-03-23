import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AnalysisResult from "../../components/user/AnalysisResult";
import { useAuth } from "../../hooks/useAuth";
import { getMyAnonymousProject } from "../../service/project.service";
import type { ProjectResponse } from "../../types/project";

function SessionPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const { isAnonymous, deviceId } = useAuth();
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
				const myProject = await getMyAnonymousProject();
				setProject(myProject);
			} catch (error) {
				setError(
					error instanceof Error
						? error.message
						: "Failed to load session data.",
				);
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
					{isAnonymous && (
						<>
							Device{" "}
							<span className="font-semibold text-base-content">
								{deviceId}
							</span>
						</>
					)}
				</p>
				<p className="text-base-content/60 text-lg">
					Project:{" "}
					<span className="font-semibold text-base-content">
						{project.title === "dump" ? "Not yet uploaded" : project.title}
					</span>
				</p>
			</div>
			<AnalysisResult />
		</div>
	);
}

export default SessionPage;
