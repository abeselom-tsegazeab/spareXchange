// Module 5 — Advanced Professional Services API.
// Mirrors backend/routes/technicianRequest.route.js and user.route.js (technicians).

import api from './client';

export const technicianRequestsApi = {
	list: (params = {}) => api.get('/technician-requests', { params }),

	myRequests: () => api.get('/technician-requests/my-requests'),

	get: (id) => api.get(`/technician-requests/${id}`),

	create: (payload) => api.post('/technician-requests', payload),

	cancel: (id) => api.put(`/technician-requests/${id}/cancel`),

	submitQuote: (id, { estimatedCost, additionalNotes }) =>
		api.post(`/technician-requests/${id}/quote`, { estimatedCost, additionalNotes }),

	acceptQuote: (id, techId) =>
		api.post(`/technician-requests/${id}/accept-quote/${techId}`),

	generateHandshakeToken: (id) =>
		api.post(`/technician-requests/${id}/handshake-token`),

	completeWithToken: (id, { token }) =>
		api.post(`/technician-requests/${id}/complete-handshake`, { token }),
};

export const techniciansApi = {
	list: ({ search, expertise } = {}) =>
		api.get('/users/technicians', { params: { search, expertise } }),

	get: (id) => api.get(`/users/technicians/${id}`),
};

export default { technicianRequestsApi, techniciansApi };
