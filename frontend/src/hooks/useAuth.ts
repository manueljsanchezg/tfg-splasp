import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
	const token = useAuthStore((state) => state.token);
	const isAnonymous = useAuthStore((state) => state.isAnonymous);
	const deviceId = useAuthStore((state) => state.deviceId);
	const projectId = useAuthStore((state) => state.projectId);
	const login = useAuthStore((state) => state.login);
	const loginAnonymous = useAuthStore((state) => state.loginAnonymous);
	const logout = useAuthStore((state) => state.logout);

	const hasToken = !!token;
	const isUserAuthenticated = hasToken && !isAnonymous;

	return {
		isAuthenticated: isUserAuthenticated,
		hasSessionAccess: hasToken,
		isUserAuthenticated,
		token,
		isAnonymous,
		deviceId,
		projectId,
		login,
		loginAnonymous,
		logout,
	};
};
