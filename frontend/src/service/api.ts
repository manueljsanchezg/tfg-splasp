import axios from "axios";
import { useAuthStore } from "../store/authStore";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

export const api = axios.create({
	baseURL: `${BACKEND_URL}/api`,
	withCredentials: true,
});

api.interceptors.request.use((config) => {
	const token = useAuthStore.getState().token;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (axios.isAxiosError(error)) {
			const message = error.response?.data?.error ?? "Unexpected request error";
			return Promise.reject(new Error(message));
		}

		if (error instanceof Error) return Promise.reject(error);

		return Promise.reject(new Error("Unexpected request error"));
	},
);
