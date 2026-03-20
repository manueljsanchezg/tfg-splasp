import { useAuthStore } from "../store/authStore";

export const useAuth = () => {
	const {
		token,
		isAnonymous,
		deviceId,
		projectId,
		login,
		loginAnonymous,
		logout,
	} = useAuthStore((state) => ({
		token: state.token,
		isAnonymous: state.isAnonymous,
		deviceId: state.deviceId,
		projectId: state.projectId,
		login: state.login,
		loginAnonymous: state.loginAnonymous,
		logout: state.logout,
	}));
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
