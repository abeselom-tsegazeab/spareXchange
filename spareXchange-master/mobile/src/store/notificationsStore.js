// Notifications state — wired to /api/notifications/* (Module 7).

import { create } from 'zustand';
import notificationsApi from '../api/notifications.api';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

export const useNotificationsStore = create((set, get) => ({
	notifications: [],
	unreadCount: 0,

	loading: false,
	error: null,

	fetchNotifications: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await notificationsApi.list();
			const notifications = data?.notifications || [];
			const unreadCount = notifications.filter((n) => !n.isRead).length;
			set({ loading: false, notifications, unreadCount });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchUnreadCount: async () => {
		try {
			const { data } = await notificationsApi.unreadCount();
			set({ unreadCount: data?.count ?? 0 });
			return data?.count ?? 0;
		} catch (_) {
			return get().unreadCount;
		}
	},

	markRead: async (id) => {
		try {
			await notificationsApi.markRead(id);
			set((s) => ({
				notifications: s.notifications.map((n) =>
					n._id === id ? { ...n, isRead: true } : n
				),
				unreadCount: Math.max(0, s.unreadCount - 1),
			}));
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	markAllRead: async () => {
		try {
			await notificationsApi.markAllRead();
			set((s) => ({
				notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
				unreadCount: 0,
			}));
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	deleteNotification: async (id) => {
		try {
			await notificationsApi.delete(id);
			set((s) => {
				const removed = s.notifications.find((n) => n._id === id);
				return {
					notifications: s.notifications.filter((n) => n._id !== id),
					unreadCount: removed && !removed.isRead ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
				};
			});
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	clearNotifications: () => set({ notifications: [], unreadCount: 0, error: null }),
}));

export default useNotificationsStore;
