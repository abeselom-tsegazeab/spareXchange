import { create } from "zustand";
import axios from "axios";
import { disconnectSocket } from "../utils/socket.js";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/auth" : "/api/auth";

axios.defaults.withCredentials = true;

let isRefreshing = false;
let refreshQueue = [];
let isLogoutInProgress = false;

// Abort controller for canceling requests on logout
const requestAbortController = new AbortController();

const processRefreshQueue = (error, originalRequest = null) => {
	refreshQueue.forEach(({ resolve, reject, request }) => {
		if (error) {
			reject(error);
		} else {
			resolve(axios(request));
		}
	});
	refreshQueue = [];
};

const queueRefreshRequest = (originalRequest) =>
	new Promise((resolve, reject) => {
		refreshQueue.push({ resolve, reject, request: originalRequest });
	});

// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		const authRoutePatterns = ["/api/auth/refresh-token", "/api/auth/logout", "/api/auth/login", "/api/auth/signup", "/api/auth/oauth/google"];

		// Skip retry for auth routes and when logout is in progress
		if (
			originalRequest?.url &&
			authRoutePatterns.some((route) => originalRequest.url.includes(route))
		) {
			// If refresh token endpoint fails, clear auth state
			if (originalRequest?.url?.includes("/api/auth/refresh-token")) {
				useAuthStore.getState().logout().catch(() => {
					// Clear state even if logout fails
					useAuthStore.setState({
						user: null,
						isAuthenticated: false,
						isLoading: false,
					});
				});
			}
			return Promise.reject(error);
		}

		// Reject all requests if logout is in progress
		if (isLogoutInProgress) {
			return Promise.reject(error);
		}

		// Auto-refresh on 401 for protected routes
		if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
			originalRequest._retry = true;

			if (isRefreshing) {
				return queueRefreshRequest(originalRequest);
			}

			isRefreshing = true;
			try {
				await useAuthStore.getState().refreshToken();
				processRefreshQueue(null, originalRequest);
				return axios(originalRequest);
			} catch (refreshError) {
				processRefreshQueue(refreshError);
				// If refresh failed, clear auth state
				useAuthStore.getState().logout().catch(() => {
					// Clear state even if logout fails
					useAuthStore.setState({
						user: null,
						isAuthenticated: false,
						isLoading: false,
					});
				});
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		return Promise.reject(error);
	}
);

export const useAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,
	message: null,
	mfaRequired: false,
	mfaEmail: null,
	isVerified: false,
	rememberMe: localStorage.getItem("rememberMe") === "true",

	signup: async (email, password, name, accountType = "user") => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/signup`, { email, password, name, userType: accountType });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
		} catch (error) {
			set({ error: error.response?.data?.message || "Error signing up", isLoading: false });
			throw error;
		}
	},
	login: async (email, password, rememberMe = false) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/login`, { email, password, rememberMe });
			if (response.data.mfaRequired) {
				localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
				set({
					mfaRequired: true,
					mfaEmail: response.data.email,
					rememberMe: !!rememberMe,
					isLoading: false,
				});
			} else {
				localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
				set({
					isAuthenticated: true,
					user: response.data.user,
					rememberMe: !!rememberMe,
					error: null,
					isLoading: false,
				});
			}
		} catch (error) {
			set({ error: error.response?.data?.message || "Error logging in", isLoading: false });
			throw error;
		}
	},

	logout: async () => {
		// Set flag IMMEDIATELY to block any 401 retry attempts
		isLogoutInProgress = true;
		isRefreshing = false;
		refreshQueue = [];

		set({ isLoading: true, error: null });
		try {
			// Disconnect WebSocket if initialized
			try {
				disconnectSocket();
			} catch (err) {
				console.log("Socket disconnect error:", err);
			}

			// Call logout endpoint
			await axios.post(`${API_URL}/logout`);
			localStorage.removeItem("rememberMe");

			// Clear all auth state
			set({
				user: null,
				isAuthenticated: false,
				rememberMe: false,
				error: null,
				message: null,
				isLoading: false,
				mfaRequired: false,
				mfaEmail: null,
				isVerified: false,
			});
		} catch (error) {
			console.error("Logout error:", error);
			set({ error: "Error logging out", isLoading: false });
			throw error;
		} finally {
			// Reset flag after logout completes
			isLogoutInProgress = false;
		}
	},
	verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/verify-email`, { code });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response.data.message || "Error verifying email", isLoading: false });
			throw error;
		}
	},
	checkAuth: async () => {
		set({ isCheckingAuth: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/check-auth`);
			set({ user: response.data.user, isAuthenticated: true, isCheckingAuth: false });
		} catch (error) {
			set({ error: null, isCheckingAuth: false, isAuthenticated: false });
		}
	},
	forgotPassword: async (email) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/forgot-password`, { email });
			set({ message: response.data.message, isLoading: false });
		} catch (error) {
			set({
				isLoading: false,
				error: error.response.data.message || "Error sending reset password email",
			});
			throw error;
		}
	},
	resetPassword: async (token, password) => {
		set({ isLoading: true, error: null });
		try {
			console.log("Resetting password with token:", token);
			console.log("New password length:", password?.length);
			
			const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
			
			console.log("Password reset response:", response.data);
			set({ message: response.data.message, isLoading: false });
			return response.data;
		} catch (error) {
			console.error("Password reset error:", error);
			console.error("Error response:", error.response?.data);
			set({
				isLoading: false,
				error: error.response?.data?.message || "Error resetting password",
			});
			throw error;
		}
	},
	requestVerification: async (userType, expertise, documents) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/request-verification`, { userType, expertise, documents });
			set({ user: response.data.user, isLoading: false, message: response.data.message });
		} catch (error) {
			set({ error: error.response?.data?.message || "Error requesting verification", isLoading: false });
			throw error;
		}
	},

	resendVerificationEmail: async () => {
		set({ isLoading: true, error: null });
		try {
			await axios.post(`${API_URL}/resend-verification`);
			set({ isLoading: false });
		} catch (error) {
			set({ error: error.response?.data?.message || "Error resending verification email", isLoading: false });
			throw error;
		}
	},
	redeemPoints: async (points, rewardDescription) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${import.meta.env.MODE === "development" ? "http://localhost:5000/api/users" : "/api/users"}/redeem-points`, { points, rewardDescription });
			set({
				user: { ...useAuthStore.getState().user, ecoPoints: response.data.currentPoints },
				isLoading: false,
				message: response.data.message
			});
		} catch (error) {
			set({ error: error.response?.data?.message || "Error redeeming points", isLoading: false });
			throw error;
		}
	},

	setupMFA: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/mfa/setup`);
			set({ isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error setting up MFA", isLoading: false });
			throw error;
		}
	},

	verifyMFA: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/mfa/verify`, { code });
			set({ user: { ...useAuthStore.getState().user, isMfaEnabled: true }, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error verifying MFA", isLoading: false });
			throw error;
		}
	},

	validateMFALogin: async (email, code) => {
		set({ isLoading: true, error: null });
		try {
			const rememberMe = localStorage.getItem("rememberMe") === "true";
			const response = await axios.post(`${API_URL}/mfa/validate`, { email, code, rememberMe });
			set({
				isAuthenticated: true,
				user: response.data.user,
				mfaRequired: false,
				mfaEmail: null,
				rememberMe,
				isLoading: false,
			});
		} catch (error) {
			set({ error: error.response?.data?.message || "Error validating MFA", isLoading: false });
			throw error;
		}
	},

	refreshToken: async () => {
		try {
			const response = await axios.get(`${API_URL}/refresh-token`);
			set({ user: response.data.user, isAuthenticated: true, error: null });
			return response.data;
		} catch (error) {
			set({ isAuthenticated: false, user: null });
			throw error;
		}
	},

	googleLogin: async (credential, rememberMe = true) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/oauth/google`, { credential, rememberMe });
			localStorage.setItem("rememberMe", rememberMe ? "true" : "false");
			set({
				isAuthenticated: true,
				user: response.data.user,
				rememberMe: !!rememberMe,
				isLoading: false,
			});
		} catch (error) {
			set({ error: error.response?.data?.message || "Error logging in with Google", isLoading: false });
			throw error;
		}
	},

	updateProfile: async (profileData) => {
		set({ isLoading: true, error: null });
		try {
			const API_URL_USERS = import.meta.env.MODE === "development" ? "http://localhost:5000/api/users" : "/api/users";

			// Check if profileData is FormData (for file uploads) or regular object
			const isFormData = profileData instanceof FormData;

			const response = await axios.put(
				`${API_URL_USERS}/profile`,
				profileData,
				{
					headers: isFormData ? {
						'Content-Type': 'multipart/form-data',
					} : {
						'Content-Type': 'application/json',
					}
				}
			);
			set({
				user: response.data.user,
				isLoading: false,
				message: response.data.message
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error updating profile", isLoading: false });
			throw error;
		}
	},

	requestVerificationWithFiles: async (userType, files) => {
		set({ isLoading: true, error: null });
		try {
			const API_URL_USERS = import.meta.env.MODE === "development" ? "http://localhost:5000/api/users" : "/api/users";
			const formData = new FormData();
			formData.append('requestedType', userType);

			// Append all files
			if (files && files.length > 0) {
				Array.from(files).forEach(file => {
					formData.append('documents', file);
				});
			}

			const response = await axios.post(`${API_URL_USERS}/verify-role`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			});

			set({
				user: {
					...useAuthStore.getState().user,
					userType: userType,
					roleStatus: 'pending'
				},
				isLoading: false,
				message: response.data.message
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error requesting verification", isLoading: false });
			throw error;
		}
	},

	// Module 4: Recycling Submission Functions
	createRecyclingSubmission: async (submissionData) => {
		set({ isLoading: true, error: null });
		try {
			const API_URL_RECYCLING = import.meta.env.MODE === "development"
				? "http://localhost:5000/api/recycling-submissions"
				: "/api/recycling-submissions";

			const response = await axios.post(API_URL_RECYCLING, submissionData);
			set({ isLoading: false, message: response.data.message });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error creating recycling submission", isLoading: false });
			throw error;
		}
	},

	getUserRecyclingSubmissions: async () => {
		set({ isLoading: true, error: null });
		try {
			const API_URL_RECYCLING = import.meta.env.MODE === "development"
				? "http://localhost:5000/api/recycling-submissions"
				: "/api/recycling-submissions";

			const response = await axios.get(`${API_URL_RECYCLING}/user`);
			set({ isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching submissions", isLoading: false });
			throw error;
		}
	},

	verifyRecyclingByToken: async (token) => {
		set({ isLoading: true, error: null });
		try {
			const API_URL_RECYCLING = import.meta.env.MODE === "development"
				? "http://localhost:5000/api/recycling-submissions"
				: "/api/recycling-submissions";

			const response = await axios.post(`${API_URL_RECYCLING}/verify-token`, { token });
			set({ isLoading: false, message: response.data.message });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error verifying recycling", isLoading: false });
			throw error;
		}
	},

	getNearbyRecyclers: async (latitude, longitude, radius = 50) => {
		set({ isLoading: true, error: null });
		try {
			const API_URL_RECYCLING = import.meta.env.MODE === "development"
				? "http://localhost:5000/api/recycling-submissions"
				: "/api/recycling-submissions";

			const response = await axios.get(`${API_URL_RECYCLING}/discovery`, {
				params: { latitude, longitude, radius }
			});
			set({ isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching nearby recyclers", isLoading: false });
			throw error;
		}
	},
}));
