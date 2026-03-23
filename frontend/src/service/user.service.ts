import type { CreateUserData, UserResponse } from "../types/user";
import type { ApiResponse } from "../types/request";
import { api } from "./api";

export const getAllUsers = async (): Promise<UserResponse[]> => {
	const response = await api.get<ApiResponse<UserResponse[]>>("/users");

	if (!response.data.data) {
		throw new Error("Invalid users response");
	}
	return response.data.data;
};

export const createUser = async (
	data: CreateUserData,
): Promise<UserResponse> => {
	const response = await api.post<ApiResponse<UserResponse>>("/users", data);

	if (!response.data.data) {
		throw new Error("Invalid user response");
	}
	return response.data.data;
};

export const deleteUser = async (
	userId: number,
): Promise<{ message: string }> => {
	const response = await api.delete<ApiResponse<{ message: string }>>(
		`/users/${userId}`,
	);

	if (!response.data.data) {
		throw new Error("Invalid delete user response");
	}
	return response.data.data;
};
