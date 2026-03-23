import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { joinSessionAnonymous } from "../../service/session.service";

const DEVICE_ID_STORAGE_KEY = "splasp.deviceId";

const generateDeviceId = (): string => {
	if (typeof crypto !== "undefined" && crypto.randomUUID) {
		return crypto.randomUUID();
	}

	return `device-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const getOrCreateDeviceId = (): string => {
	const storedDeviceId = localStorage.getItem(DEVICE_ID_STORAGE_KEY);

	if (storedDeviceId) {
		return storedDeviceId;
	}

	const newDeviceId = generateDeviceId();
	localStorage.setItem(DEVICE_ID_STORAGE_KEY, newDeviceId);
	return newDeviceId;
};

function JoinSessionPage() {
	const [code, setCode] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const { loginAnonymous } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!code.trim()) return;

		setIsLoading(true);
		setError(null);

		try {
			const deviceId = getOrCreateDeviceId();

			const response = await joinSessionAnonymous({
				code: code.trim(),
				deviceId,
			});

			loginAnonymous(
				{
					accessToken: response.accessToken,
					projectId: response.projectId,
					sessionId: response.sessionId,
				},
				deviceId,
			);

			navigate(`/sessions/${response.sessionId}`);
		} catch (error) {
			setError(
				error instanceof Error
					? error.message
					: "An error occurred. Please try again.",
			);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
			<div className="flex flex-col items-center gap-2">
				<h1 className="text-4xl font-bold">Join a Session</h1>
				<p className="text-base-content/60">Enter the session code</p>
			</div>

			<form
				onSubmit={handleSubmit}
				className="flex flex-col gap-4 w-full max-w-sm"
			>
				<input
					type="text"
					value={code}
					onChange={(e) => setCode(e.target.value)}
					placeholder="SESSION CODE"
					className="input input-bordered input-lg w-full text-center tracking-widest font-mono"
					maxLength={8}
				/>

				{error && (
					<div className="alert alert-error">
						<span>{error}</span>
					</div>
				)}

				<button
					type="submit"
					className="btn btn-primary btn-lg"
					disabled={!code.trim() || isLoading}
				>
					{isLoading ? (
						<span className="loading loading-spinner"></span>
					) : (
						"Join Session"
					)}
				</button>
			</form>
		</div>
	);
}

export default JoinSessionPage;
