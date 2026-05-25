// Module 4 — Sustainability & Incentives API.
// Mirrors backend/routes/recyclingSubmission.v2.route.js and the leaderboard /
// redeem endpoints in user.route.js.

import api from './client';

export const recyclingApi = {
	create: ({ itemType, itemDescription, estimatedWeight, estimatedValue, location, latitude, longitude, notes, verificationImages }) =>
		api.post('/recycling-submissions', {
			itemType,
			itemDescription,
			estimatedWeight,
			estimatedValue,
			location,
			latitude,
			longitude,
			notes,
			verificationImages,
		}),

	mySubmissions: () => api.get('/recycling-submissions/user'),

	get: (id) => api.get(`/recycling-submissions/${id}`),

	// Recycler / admin
	verifyByToken: ({ token }) => api.post('/recycling-submissions/verify-token', { token }),
	approve: (id) => api.post(`/recycling-submissions/${id}/approve`),
	reject: (id, { notes }) => api.put(`/recycling-submissions/${id}/reject`, { notes }),

	// Nearby discovery (server expects lat/lng/radius in km)
	discovery: ({ latitude, longitude, radiusKm = 50 }) =>
		api.get('/recycling-submissions/discovery', {
			params: { latitude, longitude, radius: radiusKm },
		}),
};

export const incentivesApi = {
	leaderboard: () => api.get('/users/leaderboard'),
	leaderboardStats: () => api.get('/users/leaderboard/stats'),
	redeemPoints: ({ points, rewardDescription }) =>
		api.post('/users/redeem-points', { points, rewardDescription }),
};

export default { recyclingApi, incentivesApi };
