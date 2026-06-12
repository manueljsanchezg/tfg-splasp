import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AnalysisResult from "../../components/user/AnalysisResult";
import { getMyAnonymousProject } from "../../service/project.service";
import { getSessionById } from "../../service/session.service";
import type { ProjectResponse } from "../../types/project";
import type { SessionResponse } from "../../types/session";

function SessionPage() {
	const { sessionId } = useParams<{ sessionId: string }>();
	const navigate = useNavigate();
	const [project, setProject] = useState<ProjectResponse | null>(null);
	const [session, setSession] = useState<SessionResponse | null>(null);
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
				const [myProject, mySession] = await Promise.all([
					getMyAnonymousProject(),
					getSessionById(numericSessionId),
				]);
				setProject(myProject);
				setSession(mySession);
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

	const sessionName = session?.name ?? `Sesión ${numericSessionId}`;
	const isNotUploaded = project.title === "dump";

	return (
		<div className="flex flex-col items-center gap-2 w-full py-8">
			<div className="flex flex-col items-center gap-1">
				<p className="text-base-content/60 text-lg">
					{isNotUploaded ? (
						<span className="font-semibold text-base-content">
							Upload your project to session {sessionName}
						</span>
					) : (
						<>
							Project:{" "}
							<span className="font-semibold text-base-content">
								{project.title}
							</span>
						</>
					)}
				</p>
			</div>
			<AnalysisResult />
		</div>
	);
}

export default SessionPage;
