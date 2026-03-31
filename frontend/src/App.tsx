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
import JoinSessionPage from "./pages/user/JoinSessionPage";
import UserSessionPage from "./pages/user/SessionPage";
import ScrollToTop from "./components/ScrollToTop";
import AnalysisPage from "./pages/user/AnalysisPage";

export default function App() {
	const { isUserAuthenticated } = useAuth();

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
