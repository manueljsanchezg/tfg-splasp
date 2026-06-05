import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createSession } from "../../service/session.service";
import type { SessionData } from "../../types/session";

function CreateSessionModal({
	isOpen,
	onClose,
	onSuccess,
}: {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const modalRef = useRef<HTMLDialogElement>(null);
	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors },
		reset,
	} = useForm<SessionData>();

	const onSubmit = async (data: SessionData) => {
		setIsLoading(true);
		setError(null);
		try {
			const formattedData = {
				...data,
				startDate: new Date(data.startDate).toISOString(),
				endDate: new Date(data.endDate).toISOString(),
			};
			await createSession(formattedData);
			reset();
			modalRef.current?.close();
			onSuccess();
		} catch (error) {
			setError(
				error instanceof Error ? error.message : "Error creating session",
			);
		} finally {
			setIsLoading(false);
		}
	};

	if (isOpen) {
		modalRef.current?.showModal();
	} else {
		modalRef.current?.close();
	}

	return (
		<dialog ref={modalRef} className="modal" onClose={onClose}>
			<div className="modal-box w-11/12 max-w-2xl">
				<h3 className="font-bold text-xl mb-6 text-base-content">
					Create New Session
				</h3>

				{error && (
					<div className="alert alert-error shadow-lg mb-4">
						<span>{error}</span>
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="form-control w-full">
						<div className="label">
							<span className="label-text font-bold">Session Name</span>
						</div>
						<input
							type="text"
							placeholder="e.g., Advanced Programming"
							className={`input input-bordered w-full ${
								errors.name ? "input-error" : ""
							}`}
							{...register("name", {
								required: "Name is required",
							})}
						/>
						{errors.name && (
							<div className="label">
								<span className="label-text-alt text-error">
									{errors.name.message}
								</span>
							</div>
						)}
					</div>

					<div className="grid grid-cols-2 gap-6">
						<div className="form-control w-full">
							<div className="label">
								<span className="label-text font-bold">Start Date</span>
							</div>
							<input
								type="datetime-local"
								className={`input input-bordered w-full ${
									errors.startDate ? "input-error" : ""
								}`}
								{...register("startDate", {
									required: "Start date is required",
								})}
							/>
							{errors.startDate && (
								<div className="label">
									<span className="label-text-alt text-error">
										{errors.startDate.message}
									</span>
								</div>
							)}
						</div>

						<div className="form-control w-full">
							<div className="label">
								<span className="label-text font-bold">End Date</span>
							</div>
							<input
								type="datetime-local"
								className={`input input-bordered w-full ${
									errors.startDate ? "input-error" : ""
								}`}
								{...register("endDate", {
									required: "End date is required",
									validate: (value) => {
										const start = new Date(getValues("startDate"));
										const end = new Date(value);
										return end > start || "End date must be after start date";
									},
								})}
							/>
							{errors.endDate && (
								<div className="label">
									<span className="label-text-alt text-error">
										{errors.endDate.message}
									</span>
								</div>
							)}
						</div>
					</div>

					<div className="modal-action gap-4 mt-8">
						<button
							type="button"
							onClick={onClose}
							className="btn btn-ghost"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className="btn btn-primary"
						>
							{isLoading ? (
								<>
									<span className="loading loading-spinner loading-sm"></span>
									Creating...
								</>
							) : (
								"Create Session"
							)}
						</button>
					</div>
				</form>
			</div>

			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={onClose}>
					close
				</button>
			</form>
		</dialog>
	);
}

export default CreateSessionModal;
