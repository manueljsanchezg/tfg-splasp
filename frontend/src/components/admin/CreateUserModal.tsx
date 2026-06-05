import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { createUser } from "../../service/user.service";
import type { CreateUserData } from "../../types/user";

interface CreateUserModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSuccess: () => void;
}

function CreateUserModal({ isOpen, onClose, onSuccess }: CreateUserModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<CreateUserData>();
	const modalRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		if (isOpen) {
			modalRef.current?.showModal();
		} else {
			modalRef.current?.close();
		}
	}, [isOpen]);

	const handleClose = () => {
		reset();
		setError(null);
		onClose();
	};

	const onSubmit = async (data: CreateUserData) => {
		setIsLoading(true);
		setError(null);

		try {
			await createUser(data);
			reset();
			onSuccess();
		} catch (error) {
			setError(error instanceof Error ? error.message : "Error creating user");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<dialog ref={modalRef} className="modal" onClose={handleClose}>
			<div className="modal-box w-11/12 max-w-2xl">
				<h3 className="font-bold text-xl mb-6 text-base-content">
					Crear usuario
				</h3>

				{error && (
					<div className="alert alert-error shadow-lg mb-4">
						<span>{error}</span>
					</div>
				)}

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
					<div className="form-control w-full">
						<div className="label">
							<span className="label-text font-bold">
								Nombre de usuario
							</span>
						</div>
						<input
							type="text"
							placeholder="Nombre de usuario único"
							className={`input input-bordered w-full ${
								errors.username ? "input-error" : ""
							}`}
							{...register("username", { required: "Username is required" })}
						/>
						{errors.username && (
							<div className="label">
								<span className="label-text-alt text-error">
									{errors.username.message}
								</span>
							</div>
						)}
					</div>

					<div className="form-control w-full">
						<div className="label">
							<span className="label-text font-bold">Contraseña</span>
						</div>
						<input
							type="password"
							placeholder="Mínimo 6 caracteres"
							className={`input input-bordered w-full ${
								errors.password ? "input-error" : ""
							}`}
							{...register("password", {
								required: "Password is required",
								minLength: {
									value: 6,
									message: "Password must be at least 6 characters",
								},
							})}
						/>
						{errors.password && (
							<div className="label">
								<span className="label-text-alt text-error">
									{errors.password.message}
								</span>
							</div>
						)}
					</div>

					<div className="modal-action gap-4 mt-8">
						<button
							type="button"
							onClick={handleClose}
							className="btn btn-ghost"
						>
							Cancelar
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className="btn btn-primary"
						>
							{isLoading ? (
								<>
									<span className="loading loading-spinner loading-sm"></span>
									Creando...
								</>
							) : (
								"Crear usuario"
							)}
						</button>
					</div>
				</form>
			</div>

			<form method="dialog" className="modal-backdrop">
				<button type="button" onClick={handleClose}>
					close
				</button>
			</form>
		</dialog>
	);
}

export default CreateUserModal;
