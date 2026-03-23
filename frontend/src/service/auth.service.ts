import type { AuthResponse, LoginData } from "../types/auth";
import type { ApiResponse } from "../types/request";
import { api } from "./api";

export const loginUser = async (
	loginData: LoginData,
): Promise<AuthResponse> => {
	const response = await api.post<ApiResponse<AuthResponse>>(
		"/auth/login",
		loginData,
	);

	if (!response.data.data) {
		throw new Error("Invalid login response");
	}

	return response.data.data;
};
