import { useState, type ChangeEvent } from "react";
import { analyzeBatchProjects } from "../../service/project.service";

interface UploadZipModalProps {
	sessionId: number;
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

function UploadZipModal({
	sessionId,
	isOpen,
	onClose,
	onSuccess,
}: UploadZipModalProps) {
	const [zipFile, setZipFile] = useState<File | null>(null);
	const [isLoadingZip, setIsLoadingZip] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;
		setZipFile(input.files[0]);
	};

	const handleUpload = async () => {
		if (zipFile) {
			setIsLoadingZip(true);
			try {
				await analyzeBatchProjects(zipFile, sessionId);
				onSuccess();
				onClose();
			} catch (_error) {
				setError("Error analyzing project");
			} finally {
				setIsLoadingZip(false);
			}
		}
	};

	return (
		<dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
			<div className="modal-box w-2/3 flex flex-col p-0">
				<div className="flex flex-col gap-4 justify-center p-6">
					{error && <p className="text-error">{error}</p>}
					<input
						type="file"
						onChange={handleFile}
						className="file-input file-input-bordered file-input-lg w-full"
					/>
					<button
						type="button"
						onClick={handleUpload}
						className="btn btn-primary btn-lg px-10 text-xl shadow-md w-full"
					>
						{isLoadingZip ? (
							<span className="loading loading-spinner loading-lg"></span>
						) : (
							"Upload"
						)}
					</button>
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

export default UploadZipModal;
