// Real auth state — wired to /api/auth/* and /api/users/* (Module 1).
// Tokens persisted in SecureStore so the user stays signed in across launches.

import { create } from 'zustand';

import authApi from '../api/auth.api';
import { stopMobileIntegration } from '../services/realtimeService';
import { storage, StorageKeys } from '../utils/storage';
import { setAccessToken, setOnUnauthorized } from '../api/client';

const errToMsg = (e) =>
	e?.message ||
	e?.response?.data?.message ||
	(typeof e === 'string' ? e : 'Something went wrong');

export const useAuthStore = create((set, get) => ({
	user: null,
	accessToken: null,
	isAuthenticated: false,
	isHydrating: true,
	isSubmitting: false,
	error: null,
	pendingMfaEmail: null,

	clearError: () => set({ error: null }),

	setPendingMfa: (email) => set({ pendingMfaEmail: email }),

	// ── Boot: restore session from SecureStore + verify against backend ───
	hydrate: async () => {
		// Register the 401 handler exactly once.
		setOnUnauthorized(async () => {
			await get().logout({ silent: true });
		});

		try {
			const token = await storage.get(StorageKeys.accessToken);
			if (!token) {
				set({ isHydrating: false });
				return;
			}
			setAccessToken(token);

			try {
				const { data } = await authApi.checkAuth();
				set({
					user: data?.user || null,
					accessToken: token,
					isAuthenticated: !!data?.user,
					isHydrating: false,
				});
			} catch (e) {
				// Token invalid/expired or backend unreachable on cold start
				await storage.remove(StorageKeys.accessToken);
				await storage.remove(StorageKeys.user);
				setAccessToken(null);
				set({
					user: null,
					accessToken: null,
					isAuthenticated: false,
					isHydrating: false,
				});
			}
		} catch (_) {
			set({ isHydrating: false });
		}
	},

	// ── Sign up ───────────────────────────────────────────────────────────
	signup: async ({ name, email, password, userType }) => {
		set({ isSubmitting: true, error: null });
		try {
			const { data } = await authApi.signup({ name, email, password, userType });
			const token = data?.accessToken;
			const user = data?.user;
			if (token) {
				setAccessToken(token);
				await storage.set(StorageKeys.accessToken, token);
			}
			if (user) await storage.set(StorageKeys.user, JSON.stringify(user));
			set({
				isSubmitting: false,
				user: user || null,
				accessToken: token || null,
				// signup gives us a token, but user must verify email before we
				// flip isAuthenticated → goes through VerifyEmail screen
				isAuthenticated: false,
			});
			return { success: true, needsVerification: !user?.isVerified };
		} catch (e) {
			const message = errToMsg(e);
			set({ isSubmitting: false, error: message });
			return { success: false, message };
		}
	},

	// ── Login (with MFA branch) ───────────────────────────────────────────
	login: async ({ email, password, rememberMe = true }) => {
		set({ isSubmitting: true, error: null });
		try {
			const { data } = await authApi.login({ email, password, rememberMe });

			if (data?.mfaRequired) {
				set({
					isSubmitting: false,
					pendingMfaEmail: data?.email || email,
				});
				return { success: true, mfaRequired: true };
			}

			const token = data?.accessToken;
			const user = data?.user;
			if (token) {
				setAccessToken(token);
				await storage.set(StorageKeys.accessToken, token);
			}
			if (user) await storage.set(StorageKeys.user, JSON.stringify(user));

			set({
				isSubmitting: false,
				user: user || null,
				accessToken: token || null,
				isAuthenticated: !!user,
			});
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ isSubmitting: false, error: message });
			return { success: false, message };
		}
	},

	validateMfaLogin: async ({ email, code, rememberMe = true }) => {
		set({ isSubmitting: true, error: null });
		try {
			const { data } = await authApi.validateMfaLogin({ email, code, rememberMe });
			const token = data?.accessToken;
			const user = data?.user;
			if (token) {
				setAccessToken(token);
				await storage.set(StorageKeys.accessToken, token);
			}
			if (user) await storage.set(StorageKeys.user, JSON.stringify(user));
			set({
				isSubmitting: false,
				pendingMfaEmail: null,
				user: user || null,
				accessToken: token || null,
				isAuthenticated: !!user,
			});
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ isSubmitting: false, error: message });
			return { success: false, message };
		}
	},

	// ── Email verification ────────────────────────────────────────────────
	verifyEmail: async ({ code }) => {
		set({ isSubmitting: true, error: null });
		try {
			const { data } = await authApi.verifyEmail({ code });
			const updatedUser = data?.user;
			if (updatedUser) await storage.set(StorageKeys.user, JSON.stringify(updatedUser));
			set((s) => ({
				isSubmitting: false,
				user: updatedUser || s.user,
				isAuthenticated: !!(updatedUser || s.user),
			}));
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ isSubmitting: false, error: message });
			return { success: false, message };
		}
	},

	resendVerification: async () => {
		try {
			await authApi.resendVerification();
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	// ── Password reset ────────────────────────────────────────────────────
	forgotPassword: async ({ email }) => {
		set({ isSubmitting: true, error: null });
		try {
			await authApi.forgotPassword({ email });
			set({ isSubmitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ isSubmitting: false, error: message });
			return { success: false, message };
		}
	},

	resetPassword: async ({ token, password }) => {
		set({ isSubmitting: true, error: null });
		try {
			await authApi.resetPassword({ token, password });
			set({ isSubmitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ isSubmitting: false, error: message });
			return { success: false, message };
		}
	},

	// ── MFA enrolment ─────────────────────────────────────────────────────
	setupMFA: async () => {
		try {
			const { data } = await authApi.setupMFA();
			return {
				success: true,
				qrCodeUrl: data?.qrCodeUrl,
				secret: data?.secret,
				backupCodes: data?.backupCodes || [],
			};
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	verifyMFA: async ({ code }) => {
		try {
			await authApi.verifyMFA({ code });
			// Backend doesn't return updated user — re-fetch to reflect isMfaEnabled.
			try {
				const { data } = await authApi.checkAuth();
				if (data?.user) {
					await storage.set(StorageKeys.user, JSON.stringify(data.user));
					set({ user: data.user });
				}
			} catch (_) {}
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	// ── Role verification ─────────────────────────────────────────────────
	requestRoleVerification: async ({ requestedType, documents, expertise }) => {
		set({ isSubmitting: true, error: null });
		try {
			await authApi.requestRoleVerification({ requestedType, documents });
			if (expertise) {
				// Attach expertise via the JSON sibling endpoint (non-fatal).
				try {
					await authApi.patchRoleMeta({ userType: requestedType, expertise });
				} catch (_) {}
			}
			try {
				const { data } = await authApi.checkAuth();
				if (data?.user) {
					await storage.set(StorageKeys.user, JSON.stringify(data.user));
					set({ user: data.user });
				}
			} catch (_) {}
			set({ isSubmitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ isSubmitting: false, error: message });
			return { success: false, message };
		}
	},

	// ── Profile ───────────────────────────────────────────────────────────
	updateProfile: async (payload) => {
		set({ isSubmitting: true, error: null });
		try {
			const { data } = await authApi.updateProfile(payload);
			const user = data?.user;
			if (user) await storage.set(StorageKeys.user, JSON.stringify(user));
			set({ isSubmitting: false, user: user || get().user });
			return { success: true, user };
		} catch (e) {
			const message = errToMsg(e);
			set({ isSubmitting: false, error: message });
			return { success: false, message };
		}
	},

	refreshMe: async () => {
		try {
			const { data } = await authApi.checkAuth();
			if (data?.user) {
				await storage.set(StorageKeys.user, JSON.stringify(data.user));
				set({ user: data.user, isAuthenticated: true });
			}
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	// ── Logout ────────────────────────────────────────────────────────────
	logout: async ({ silent = false } = {}) => {
		try {
			if (!silent) {
				await authApi.logout().catch(() => {});
			}
		} finally {
			await stopMobileIntegration();
			setAccessToken(null);
			await storage.remove(StorageKeys.accessToken);
			await storage.remove(StorageKeys.user);
			set({
				user: null,
				accessToken: null,
				isAuthenticated: false,
				pendingMfaEmail: null,
				error: null,
			});
		}
	},
}));

export default useAuthStore;
