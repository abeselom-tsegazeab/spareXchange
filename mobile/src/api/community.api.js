// Module 10 — Community Engagement API.
// Mirrors backend/routes/user.route.js community routes.

import api from './client';

export const feedApi = {
	mine: (params) => api.get('/users/feed', { params }),
	community: () => api.get('/users/feed/community'),
	forUser: (userId, params) => api.get(`/users/feed/${userId}`, { params }),
};

export const publicProfileApi = {
	get: (userId) => api.get(`/users/profile/${userId}/public`),
	listings: (userId, params) => api.get(`/users/profile/${userId}/listings`, { params }),
	reviews: (userId, params) => api.get(`/users/profile/${userId}/reviews`, { params }),
	stats: (userId) => api.get(`/users/profile/${userId}/stats`),
};

export const achievementsApi = {
	definitions: () => api.get('/users/achievements/definitions'),
	mine: () => api.get('/users/achievements'),
	check: () => api.post('/users/achievements/check', {}),
	leaderboard: (params) => api.get('/users/achievements/leaderboard', { params }),
};

export default { feedApi, publicProfileApi, achievementsApi };
