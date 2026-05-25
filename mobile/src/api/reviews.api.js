// Module 7 — Reviews & reputation API.

import api from './client';

export const reviewsApi = {
	create: ({ revieweeId, exchangeId, rating, comment }) =>
		api.post('/reviews', { revieweeId, exchangeId, rating, comment }),

	forUser: (userId) => api.get(`/reviews/user/${userId}`),

	reviewable: ({ revieweeId } = {}) =>
		api.get('/reviews/reviewable', { params: revieweeId ? { revieweeId } : {} }),
};

export default reviewsApi;
