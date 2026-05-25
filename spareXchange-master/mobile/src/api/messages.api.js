// Module 7 — Messaging API.

import api from './client';

export const messagesApi = {
	conversations: () => api.get('/messages/conversations'),

	thread: (userId) => api.get(`/messages/${userId}`),

	send: ({ receiverId, content, listingId }) =>
		api.post('/messages', { receiverId, content, listingId }),

	markRead: (senderId) => api.put(`/messages/read/${senderId}`),
};

export default messagesApi;
