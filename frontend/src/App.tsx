import { useEffect } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminRoute from "./components/AdminRoute";
import PageLayout from "./components/PageLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import SessionInfoPage from "./pages/admin/SessionInfoPage";
import SessionPage from "./pages/admin/SessionsPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import JoinSessionPage from "./pages/user/JoinSessionPage";
import UserSessionPage from "./pages/user/SessionPage";
import ScrollToTop from "./components/ScrollToTop";
import AnalysisPage from "./pages/user/AnalysisPage";
import ProjectsPage from "./pages/admin/ProjectsPage";
import { isTokenExpired } from "./utils/auth";

export default function App() {
	const { isUserAuthenticated, token, logout } = useAuth();

	useEffect(() => {
		if (token && isTokenExpired(token)) {
			logout();
		}
	}, [token, logout]);

	let publicRoutes = <></>;
	let privateRoutes = <></>;
	let adminRoutes = <></>;
	const alwaysRoutes = (
		<>
			<Route path="/analysis" element={<AnalysisPage />} />
			<Route path="/sessions/join" element={<JoinSessionPage />} />
			<Route
				path="/sessions/:sessionId"
				element={
					<ProtectedRoute>
						<UserSessionPage />
					</ProtectedRoute>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</>
	);

	if (!isUserAuthenticated) {
		publicRoutes = (
			<>
				<Route path="/" element={<HomePage />} />
				<Route path="/login" element={<LoginPage />} />
			</>
		);
	} else {
		privateRoutes = <Route path="/" element={<HomePage />} />;
		adminRoutes = (
			<>
				<Route
					path="/projects"
					element={
						<AdminRoute>
							<ProjectsPage />
						</AdminRoute>
					}
				/>

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
			</>
		);
	}

	return (
		<PageLayout>
			<ScrollToTop />
			<Routes>
				{publicRoutes}
				{privateRoutes}
				{adminRoutes}
				{alwaysRoutes}
			</Routes>
		</PageLayout>
	);
}
