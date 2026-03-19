import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function HomePage() {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuth();

	return (
		<div className="flex flex-col items-center gap-20 w-full py-20 px-6">
			<div className="flex flex-col items-center gap-4 text-center">
				<h1 className="text-8xl font-black tracking-tight text-base-content drop-shadow-sm">
					Splasp<span className="text-primary">!</span>
				</h1>
				<h2 className="text-3xl text-base-content/60 font-medium">
					Variability Analyzer for Snap!
				</h2>
				{!isAuthenticated && (
					<div className="flex gap-4 mt-6">
						<button
							type="button"
							className="btn btn-primary btn-lg text-xl px-10"
							onClick={() => navigate("/login")}
						>
							Login
						</button>
					</div>
				)}
				{isAuthenticated && (
					<div className="flex gap-4 mt-6">
						<button
							type="button"
							className="btn btn-primary btn-lg text-xl px-10"
							onClick={() => navigate("/sessions")}
						>
							Sessions
						</button>
						<button
							type="button"
							className="btn btn-outline btn-lg text-xl px-10"
							onClick={() => navigate("/users")}
						>
							Users
						</button>
					</div>
				)}
			</div>
		</div>
	);
}

export default HomePage;
