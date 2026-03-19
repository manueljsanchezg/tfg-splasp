import { create } from "zustand";
import type { AnonymousAuthData, AuthData, AuthStore } from "../types/auth";

export const useAuthStore = create<AuthStore>((set) => ({
	token: null,
	isAnonymous: false,
	deviceId: null,
	projectId: null,

	login: (data: AuthData) => {
		set({
			token: data.token,
			isAnonymous: false,
			deviceId: null,
			projectId: null,
		});
	},

	loginAnonymous: (data: AnonymousAuthData, deviceId: string) => {
		set({
			token: data.accessToken,
			isAnonymous: true,
			deviceId,
			projectId: data.projectId,
		});
	},

	logout: () => {
		set({
			token: null,
			isAnonymous: false,
			deviceId: null,
			projectId: null,
		});
	},
}));
