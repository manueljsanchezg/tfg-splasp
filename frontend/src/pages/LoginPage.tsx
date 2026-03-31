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
		<div className="w-full max-w-lg space-y-8">
			<div>
				<h2 className="mt-6 text-center text-5xl font-black tracking-tight text-base-content">
					Sign In
				</h2>
			</div>

			<form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
				<div className="form-control w-full gap-2">
					<div className="label pb-0">
						<span className="label-text text-xl font-bold">Username</span>
					</div>
					<input
						type="text"
						placeholder="Your username"
						className={`input input-lg w-full text-lg ${errors.username ? "input-error" : ""}`}
						{...register("username", {
							required: "Username is required",
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
						placeholder="Your password"
						className={`input input-bordered input-lg w-full text-lg ${errors.password ? "input-error" : ""}`}
						{...register("password", {
							required: "Password is required",
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

				{error && (
					<div className="rounded-xl bg-error/20 p-5 text-lg text-error text-center font-medium">
						{error}
					</div>
				)}

				<button
					type="submit"
					disabled={isLoading}
					className="btn btn-primary btn-lg w-full text-2xl mt-4"
				>
					{isLoading ? (
						<>
							<span className="loading loading-spinner loading-md"></span>
							Signing in...
						</>
					) : (
						"Sign In"
					)}
				</button>

				<div className="text-center text-lg mt-6">
					<p className="text-base-content/70 font-medium">
						Use your teacher credentials to sign in.
					</p>
				</div>
			</form>
		</div>
	);
}
