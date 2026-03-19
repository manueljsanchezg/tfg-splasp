import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function AdminRoute({ children }: { children: React.ReactNode }) {
	const { isUserAuthenticated } = useAuth();
	return isUserAuthenticated ? (
		children
	) : (
		<Navigate to="/login" replace />
	);
}

export default AdminRoute;
