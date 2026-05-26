// Messaging state — wired to /api/messages/* (Module 7).

import { create } from 'zustand';
import messagesApi from '../api/messages.api';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

export const useMessagesStore = create((set, get) => ({
	conversations: [],
	messages: [],

	loading: false,
	loadingThread: false,
	sending: false,
	error: null,

	unreadCount: 0,

	fetchConversations: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await messagesApi.conversations();
			const conversations = data?.conversations || [];
			const unreadCount = conversations.filter(
				(c) => !c.isRead && !c.sentByMe
			).length;
			set({ loading: false, conversations, unreadCount });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchThread: async (userId) => {
		set({ loadingThread: true, error: null, messages: [] });
		try {
			const { data } = await messagesApi.thread(userId);
			set({ loadingThread: false, messages: data?.messages || [] });
			return data?.messages || [];
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingThread: false, error: message });
			return [];
		}
	},

	sendMessage: async ({ receiverId, content, listingId }) => {
		set({ sending: true, error: null });
		try {
			const { data } = await messagesApi.send({ receiverId, content, listingId });
			const msg = data?.data;
			if (msg) {
				set((s) => ({ messages: [...s.messages, msg] }));
			}
			set({ sending: false });
			get().fetchConversations();
			return { success: true, message: msg };
		} catch (e) {
			const message = errToMsg(e);
			set({ sending: false, error: message });
			return { success: false, message };
		}
	},

	markThreadRead: async (senderId) => {
		try {
			await messagesApi.markRead(senderId);
			set((s) => ({
				conversations: s.conversations.map((c) =>
					idOf(c.user) === String(senderId) ? { ...c, isRead: true } : c
				),
				unreadCount: Math.max(
					0,
					s.conversations.filter((c) => !c.isRead && !c.sentByMe).length - 1
				),
			}));
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	clearThread: () => set({ messages: [] }),
}));

export default useMessagesStore;
