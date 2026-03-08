import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../service/auth.service";
import { useAuthStore } from "../store/authStore";
import type { LoginData } from "../types/auth";

interface RegisterFormData extends LoginData {
	email: string;
	confirmPassword: string;
}

export default function RegisterPage() {
	const {
		register,
		handleSubmit,
		formState: { errors },
		watch,
	} = useForm<RegisterFormData>();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();
	const login = useAuthStore((state) => state.login);
	const password = watch("password");

	const onSubmit = async (data: RegisterFormData) => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await registerUser({
				username: data.username,
				password: data.password,
			});
			if (response) {
				login({
					token: response.accessToken,
					role: response.role,
				});
				navigate("/");
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Registration error");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="w-full max-w-lg space-y-8">
			<div>
				<h2 className="mt-6 text-center text-5xl font-black tracking-tight text-base-content">
					Create Account
				</h2>
			</div>

			<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
				{error && (
					<div className="rounded-xl bg-error/20 p-5 text-lg text-error font-medium">
						{error}
					</div>
				)}

				<div className="form-control w-full gap-2">
					<div className="label pb-0">
						<span className="label-text text-xl font-bold">Username</span>
					</div>
					<input
						type="text"
						placeholder="Choose a username"
						className={`input input-bordered input-lg w-full text-lg ${errors.username ? "input-error" : ""}`}
						{...register("username", {
							required: "Username is required",
							minLength: {
								value: 3,
								message: "Username must be at least 3 characters",
							},
						})}
					/>
					{errors.username && (
						<div className="label pt-0">
							<span className="label-text-alt text-error text-base font-medium">
								{errors.username.message}
							</span>
						</div>
					)}
				</div>

				<div className="form-control w-full gap-2">
					<div className="label pb-0">
						<span className="label-text text-xl font-bold">Password</span>
					</div>
					<input
						type="password"
						placeholder="Choose a password"
						className={`input input-bordered input-lg w-full text-lg ${errors.password ? "input-error" : ""}`}
						{...register("password", {
							required: "Password is required",
							minLength: {
								value: 6,
								message: "Password must be at least 6 characters",
							},
						})}
					/>
					{errors.password && (
						<div className="label pt-0">
							<span className="label-text-alt text-error text-base font-medium">
								{errors.password.message}
							</span>
						</div>
					)}
				</div>

				<div className="form-control w-full gap-2">
					<div className="label pb-0">
						<span className="label-text text-xl font-bold">
							Confirm Password
						</span>
					</div>
					<input
						type="password"
						placeholder="Repeat your password"
						className={`input input-bordered input-lg w-full text-lg ${errors.confirmPassword ? "input-error" : ""}`}
						{...register("confirmPassword", {
							required: "You must confirm the password",
							validate: (value) =>
								value === password || "Passwords do not match",
						})}
					/>
					{errors.confirmPassword && (
						<div className="label pt-0">
							<span className="label-text-alt text-error text-base font-medium">
								{errors.confirmPassword.message}
							</span>
						</div>
					)}
				</div>

				<button
					type="submit"
					disabled={isLoading}
					className="btn btn-primary btn-lg w-full text-2xl mt-4"
				>
					{isLoading ? (
						<>
							<span className="loading loading-spinner loading-md"></span>
							Registering...
						</>
					) : (
						"Create Account"
					)}
				</button>

				<div className="text-center text-lg mt-6">
					<p className="text-base-content/70 font-medium">
						Already have an account?{" "}
						<a
							href="/login"
							className="font-bold text-primary hover:text-primary-focus underline decoration-2 underline-offset-4"
						>
							Sign in here
						</a>
					</p>
				</div>
			</form>
		</div>
	);
}
