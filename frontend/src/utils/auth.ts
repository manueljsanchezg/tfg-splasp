export const isTokenExpired = (token: string | null): boolean => {
	if (!token) return true;
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = atob(base64);
		const payload = JSON.parse(jsonPayload);
		if (payload.exp) {
			return payload.exp * 1000 < Date.now();
		}
		return false;
	} catch (_e) {
		return true;
	}
};
