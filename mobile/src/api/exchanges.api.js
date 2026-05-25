// Module 3 — Exchange & Transaction Management API.
// Mirrors backend/routes/exchange.route.js and exchange.controller.js.

import api from './client';

export const exchangesApi = {
	// Collection
	list: ({ status, page = 1, limit = 10 } = {}) => {
		const params = { page, limit };
		if (status) params.status = status;
		return api.get('/exchanges', { params });
	},
	get: (id) => api.get(`/exchanges/${id}`),

	// Lifecycle
	propose: ({ listingId, offeredItems, offeredListingId, meetingLocation, meetingTime }) =>
		api.post('/exchanges', {
			listingId,
			offeredItems,
			offeredListingId: offeredListingId || undefined,
			meetingLocation,
			meetingTime,
		}),

	// Controller reads `cancelReason` (the Postman example wrongly used `reason`).
	updateStatus: (id, { status, cancelReason }) =>
		api.put(`/exchanges/${id}/status`, { status, cancelReason }),

	counterOffer: (id, { offeredItems, offeredListingId, note }) =>
		api.put(`/exchanges/${id}/counter-offer`, {
			offeredItems,
			offeredListingId: offeredListingId || undefined,
			note,
		}),

	negotiate: (id, { meetingLocation, meetingTime, negotiationNotes, isLocked }) =>
		api.put(`/exchanges/${id}/negotiate`, {
			meetingLocation,
			meetingTime,
			negotiationNotes,
			isLocked,
		}),

	complete: (id) => api.put(`/exchanges/${id}/complete`),

	dispute: (id, { reason }) => api.post(`/exchanges/${id}/dispute`, { reason }),

	// Modernization
	safeZones: () => api.get('/exchanges/info/safe-zones'),

	handshakeGenerate: (id) => api.put(`/exchanges/${id}/handshake/generate`),
	handshakeRegenerate: (id) => api.put(`/exchanges/${id}/handshake/regenerate`),
	handshakeVerify: (id, { token }) =>
		api.put(`/exchanges/${id}/handshake/verify`, { token }),

	handoverPhoto: (id, { photoUrl }) =>
		api.put(`/exchanges/${id}/handover-photo`, { photoUrl }),
};

export default exchangesApi;
