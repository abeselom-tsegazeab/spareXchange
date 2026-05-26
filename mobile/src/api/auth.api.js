// Module 1 — Identity & Security API.
// Routes mirror backend/routes/auth.route.js and backend/routes/user.route.js
// (subset relevant to identity).

import api from './client';

export const authApi = {
	// ── Core auth ─────────────────────────────────────────────────────────
	signup: ({ name, email, password, userType }) =>
		api.post('/auth/signup', { name, email, password, userType }),

	login: ({ email, password, rememberMe = true }) =>
		api.post('/auth/login', { email, password, rememberMe }),

	logout: () => api.post('/auth/logout'),

	checkAuth: () => api.get('/auth/check-auth'),

	// ── Email verification ────────────────────────────────────────────────
	verifyEmail: ({ code }) => api.post('/auth/verify-email', { code }),

	resendVerification: () => api.post('/auth/resend-verification'),

	// ── Password reset ────────────────────────────────────────────────────
	forgotPassword: ({ email }) => api.post('/auth/forgot-password', { email }),

	resetPassword: ({ token, password }) =>
		api.post(`/auth/reset-password/${encodeURIComponent(token)}`, { password }),

	verifyPassword: ({ password }) => api.post('/auth/verify-password', { password }),

	// ── MFA ───────────────────────────────────────────────────────────────
	setupMFA: () => api.post('/auth/mfa/setup'),

	verifyMFA: ({ code }) => api.post('/auth/mfa/verify', { code }),

	validateMfaLogin: ({ email, code, rememberMe = true }) =>
		api.post('/auth/mfa/validate', { email, code, rememberMe }),

	// ── OAuth (Google) ────────────────────────────────────────────────────
	googleLogin: ({ credential, rememberMe = true }) =>
		api.post('/auth/oauth/google', { credential, rememberMe }),

	// ── Profile / role verification (in /api/users) ───────────────────────
	updateProfile: ({ name, phone, location, interests, profilePictureAsset }) => {
		// If a fresh image asset was picked, send multipart. Otherwise JSON works too.
		if (profilePictureAsset?.uri) {
			const form = new FormData();
			if (name != null) form.append('name', name);
			if (phone != null) form.append('phone', phone);
			if (location != null) form.append('location', location);
			if (Array.isArray(interests)) {
				interests.forEach((tag) => form.append('interests[]', tag));
			}
			form.append('profilePicture', {
				uri: profilePictureAsset.uri,
				name: profilePictureAsset.fileName || `profile.${guessExt(profilePictureAsset)}`,
				type: profilePictureAsset.mimeType || `image/${guessExt(profilePictureAsset)}`,
			});
			return api.put('/users/profile', form, {
				headers: { 'Content-Type': 'multipart/form-data' },
				transformRequest: (d) => d, // prevent axios from JSON-stringifying FormData
			});
		}
		return api.put('/users/profile', { name, phone, location, interests });
	},

	// POST /api/users/verify-role — multipart upload of `documents`
	requestRoleVerification: ({ requestedType, documents = [] }) => {
		const form = new FormData();
		form.append('requestedType', requestedType);
		documents.forEach((asset, idx) => {
			form.append('documents', {
				uri: asset.uri,
				name: asset.fileName || `doc_${idx}.${guessExt(asset)}`,
				type: asset.mimeType || `image/${guessExt(asset)}`,
			});
		});
		return api.post('/users/verify-role', form, {
			headers: { 'Content-Type': 'multipart/form-data' },
			transformRequest: (d) => d,
		});
	},

	// POST /api/auth/request-verification — used to attach `expertise`
	// after documents have been uploaded by /users/verify-role.
	patchRoleMeta: ({ userType, expertise }) =>
		api.post('/auth/request-verification', { userType, expertise }),
};

const guessExt = (asset) => {
	if (asset?.fileName && asset.fileName.includes('.')) {
		return asset.fileName.split('.').pop().toLowerCase();
	}
	const uri = asset?.uri || '';
	const match = uri.match(/\.(jpg|jpeg|png|webp|gif|pdf)(\?|$)/i);
	return (match?.[1] || 'jpg').toLowerCase();
};

export default authApi;
