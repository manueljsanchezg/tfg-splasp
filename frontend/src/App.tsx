import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import PageLayout from "./components/PageLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import SessionInfoPage from "./pages/admin/SessionInfoPage";
import SessionPage from "./pages/admin/SessionsPage";
import UsersPage from "./pages/admin/UsersPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import JoinSessionPage from "./pages/user/JoinSessionPage";
import MyProjectsPage from "./pages/user/MyProjectsPage";
import UserSessionPage from "./pages/user/SessionPage";

export default function App() {
	const { token, role } = useAuth();

	let publicRoutes = <></>;
	let privateRoutes = <></>;
	let userRoutes = <></>;
	let adminRoutes = <></>;

	switch (role) {
		case "ADMIN":
			adminRoutes = (
				<>
					<Route
						path="/sessions"
						element={
							<AdminRoute>
								<SessionPage />
							</AdminRoute>
						}
					/>
					<Route
						path="/sessions/:sessionId"
						element={
							<AdminRoute>
								<SessionInfoPage />
							</AdminRoute>
						}
					/>
					<Route
						path="/users"
						element={
							<AdminRoute>
								<UsersPage />
							</AdminRoute>
						}
					/>
				</>
			);
			break;

		case "USER":
			userRoutes = (
				<>
					<Route
						path="/projects"
						element={
							<ProtectedRoute>
								<MyProjectsPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/sessions/join"
						element={
							<ProtectedRoute>
								<JoinSessionPage />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/sessions/:sessionId"
						element={
							<ProtectedRoute>
								<UserSessionPage />
							</ProtectedRoute>
						}
					/>
				</>
			);
			break;

		default:
			break;
	}

	if (!token) {
		publicRoutes = (
			<>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/register" element={<RegisterPage />} />
			</>
		);
	} else {
		privateRoutes = <Route path="/" element={<HomePage />} />;
	}

	return (
		<PageLayout>
			<Routes>
				{publicRoutes}
				{privateRoutes}
				{userRoutes}
				{adminRoutes}
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</PageLayout>
	);
}
