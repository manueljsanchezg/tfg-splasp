import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function NavBar() {
	const navigate = useNavigate();
	const { isUserAuthenticated, hasSessionAccess, isAnonymous, logout } =
		useAuth();

	const handleLogout = async () => {
		logout();
		navigate("/login");
	};

	const linkClass = ({ isActive }: { isActive: boolean }) =>
		`btn btn-ghost text-lg font-bold ${
			isActive ? "text-[#009BA6] bg-[#009BA6]/10" : "text-base-content/70"
		}`;

	let publicRoutes = <></>;
	let anonymousRoutes = <></>;
	let privateRoutes = <></>;
	let adminRoutes = <></>;
	const alwaysRoutes = (
		<>
			<NavLink className={linkClass} to="/">
				Home
			</NavLink>
			<NavLink className={linkClass} to="/analysis">
				Analyze
			</NavLink>
		</>
	);

	if (!hasSessionAccess) {
		publicRoutes = (
			<NavLink className={linkClass} to="/sessions/join">
				Join Session
			</NavLink>
		);
	} else if (isUserAuthenticated) {
		adminRoutes = (
			<>
				<NavLink className={linkClass} to="/projects">
					Projects
				</NavLink>
				<NavLink className={linkClass} to="/sessions">
					Sessions
				</NavLink>
			</>
		);

		privateRoutes = (
			<button
				type="button"
				onClick={handleLogout}
				className="btn btn-error text-lg"
			>
				Logout
			</button>
		);
	} else if (isAnonymous) {
		anonymousRoutes = (
			<NavLink className={linkClass} to="/">
				Home
			</NavLink>
		);

		privateRoutes = (
			<button
				type="button"
				onClick={handleLogout}
				className="btn btn-error text-lg"
			>
				Leave Session
			</button>
		);
	}

	return (
		<nav className="w-full sticky top-0 z-50 bg-base-100 shadow-sm border-b border-base-200">
			<div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center h-24">
				<NavLink
					to="/"
					className="flex items-center gap-2 transition-transform hover:scale-105"
				>
					<span className="text-4xl font-black">
						SPLASP<span className="text-primary">!</span>
					</span>
				</NavLink>

				<div className="flex gap-4 items-center">
					{alwaysRoutes}
					{adminRoutes}
					{anonymousRoutes}
					{privateRoutes}
					{publicRoutes}
				</div>
			</div>
		</nav>
	);
}

export default NavBar;
