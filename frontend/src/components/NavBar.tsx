import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function NavBar() {
	const navigate = useNavigate();
	const { token, role, logout } = useAuth();

	const handleLogout = async () => {
		logout();
		navigate("/login");
	};

	const linkClass = ({ isActive }: { isActive: boolean }) =>
		`btn btn-ghost text-lg font-bold ${
			isActive ? "text-[#009BA6] bg-[#009BA6]/10" : "text-base-content/70"
		}`;

	let publicRoutes = <></>;
	let privateRoutes = <></>;
	let userRoutes = <></>;
	let adminRoutes = <></>;

	switch (role) {
		case "ADMIN":
			adminRoutes = (
				<>
					<NavLink className={linkClass} to="/">
						Home
					</NavLink>
					<NavLink className={linkClass} to="/sessions">
						Sessions
					</NavLink>
					<NavLink className={linkClass} to="/users">
						Users
					</NavLink>
				</>
			);
			break;

		case "USER":
			userRoutes = (
				<>
					<NavLink className={linkClass} to="/">
						Home
					</NavLink>
					<NavLink className={linkClass} to="/projects">
						My Projects
					</NavLink>
					<NavLink className={linkClass} to="/sessions/join">
						Join Session
					</NavLink>
				</>
			);
			break;

		default:
			break;
	}

	if (!token) {
		publicRoutes = (
			<>
				<NavLink className={linkClass} to="/">
					Home
				</NavLink>
				<NavLink className={linkClass} to="/login">
					Login
				</NavLink>
				<NavLink className={linkClass} to="/register">
					Register
				</NavLink>
			</>
		);
	} else {
		privateRoutes = (
			<button
				type="button"
				onClick={handleLogout}
				className="btn btn-error text-lg"
			>
				Logout
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
					<span className="text-4xl font-black text-[#009BA6] tracking-tight">
						SPLASP<span className="text-base-content">.</span>
					</span>
				</NavLink>

				<div className="flex gap-4 items-center">
					{adminRoutes}
					{userRoutes}
					{privateRoutes}
					{publicRoutes}
				</div>
			</div>
		</nav>
	);
}

export default NavBar;
