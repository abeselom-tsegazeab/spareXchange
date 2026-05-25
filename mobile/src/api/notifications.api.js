// Module 9 — Notifications & mobile integration API.

import api from './client';

export const notificationsApi = {
	list: () => api.get('/notifications'),

	history: (params = {}) => api.get('/notifications/history', { params }),

	unreadCount: () => api.get('/notifications/unread-count'),

	markRead: (id) => api.put(`/notifications/${id}/read`),

	markAllRead: () => api.put('/notifications/mark-all-read'),

	delete: (id) => api.delete(`/notifications/${id}`),

	// Push device tokens
	pushRegister: ({ token, deviceType, deviceName }) =>
		api.post('/notifications/push/register', { token, deviceType, deviceName }),

	pushRemove: ({ token }) => api.post('/notifications/push/remove', { token }),

	pushToggle: ({ token }) => api.put('/notifications/push/toggle', { token }),

	pushDevices: () => api.get('/notifications/push/devices'),

	// Preferences
	getPreferences: () => api.get('/notifications/preferences'),

	updatePreferences: (payload) => api.put('/notifications/preferences', payload),

	resetPreferences: () => api.post('/notifications/preferences/reset'),
};

export default notificationsApi;
