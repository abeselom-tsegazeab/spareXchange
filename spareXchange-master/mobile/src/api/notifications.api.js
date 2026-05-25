// Module 7 — In-app notifications API (user endpoints).

import api from './client';

export const notificationsApi = {
	list: () => api.get('/notifications'),

	unreadCount: () => api.get('/notifications/unread-count'),

	markRead: (id) => api.put(`/notifications/${id}/read`),

	markAllRead: () => api.put('/notifications/mark-all-read'),

	delete: (id) => api.delete(`/notifications/${id}`),
};

export default notificationsApi;
