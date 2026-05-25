// Module 6 — Saved Search Alerts API.
// Mirrors backend/routes/user.route.js (saved-searches endpoints).

import api from './client';

export const savedSearchesApi = {
	list: () => api.get('/users/saved-searches'),

	create: (payload) => api.post('/users/saved-searches', payload),

	update: (id, payload) => api.patch(`/users/saved-searches/${id}`, payload),

	delete: (id) => api.delete(`/users/saved-searches/${id}`),
};

export default savedSearchesApi;
