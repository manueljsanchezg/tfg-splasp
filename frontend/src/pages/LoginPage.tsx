import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../service/auth.service";
import { useAuthStore } from "../store/authStore";
import type { LoginData } from "../types/auth";

export default function LoginPage() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<LoginData>();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);

	const onSubmit = async (data: LoginData) => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await loginUser(data);
			login({
				token: response.accessToken,
			});
			navigate("/");
		} catch (error) {
			setError(error instanceof Error ? error.message : "Login error");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 w-full">
			<div className="flex flex-col items-center gap-2">
				<h1 className="text-3xl font-bold">Sign In</h1>
				<p className="text-base-content/60">
					Use your teacher credentials to sign in
				</p>
			</div>

			<form className="flex flex-col gap-4 w-full max-w-sm" onSubmit={handleSubmit(onSubmit)}>
				<div className="form-control w-full">
					<div className="label">
						<span className="label-text">Username</span>
					</div>
					<input
						type="text"
						placeholder="Your username"
						className={`input input-bordered w-full ${errors.username ? "input-error" : ""}`}
						{...register("username", {
							required: "Username is required",
						})}
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
						<span className="label-text">Password</span>
					</div>
					<input
						type="password"
						placeholder="Your password"
						className={`input input-bordered w-full ${errors.password ? "input-error" : ""}`}
						{...register("password", {
							required: "Password is required",
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

				{error && (
					<div className="alert alert-error">
						<span>{error}</span>
					</div>
				)}

				<button
					type="submit"
					disabled={isLoading}
					className="btn btn-primary mt-2"
				>
					{isLoading ? (
						<span className="loading loading-spinner"></span>
					) : (
						"Sign In"
					)}
				</button>
			</form>
		</div>
	);
}
