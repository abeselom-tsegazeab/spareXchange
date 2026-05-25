// Notifications state — wired to /api/notifications/* (Modules 7 & 9).

import { create } from 'zustand';
import notificationsApi from '../api/notifications.api';
import { DEFAULT_PREFERENCES } from '../config/notificationCatalog';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

export const useNotificationsStore = create((set, get) => ({
	notifications: [],
	history: [],
	historyPagination: null,
	preferences: { ...DEFAULT_PREFERENCES },
	devices: [],

	unreadCount: 0,
	loading: false,
	loadingHistory: false,
	submitting: false,
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

	fetchHistory: async (params = {}) => {
		set({ loadingHistory: true, error: null });
		try {
			const { data } = await notificationsApi.history({ page: 1, limit: 30, ...params });
			set({
				loadingHistory: false,
				history: data?.notifications || [],
				historyPagination: {
					total: data?.total,
					page: data?.page,
					totalPages: data?.totalPages,
				},
			});
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingHistory: false, error: message });
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
			const mark = (n) => (n._id === id ? { ...n, isRead: true } : n);
			set((s) => ({
				notifications: s.notifications.map(mark),
				history: s.history.map(mark),
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
				history: s.history.map((n) => ({ ...n, isRead: true })),
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
				const removed = [...s.notifications, ...s.history].find((n) => n._id === id);
				return {
					notifications: s.notifications.filter((n) => n._id !== id),
					history: s.history.filter((n) => n._id !== id),
					unreadCount:
						removed && !removed.isRead ? Math.max(0, s.unreadCount - 1) : s.unreadCount,
				};
			});
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	fetchPreferences: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await notificationsApi.getPreferences();
			set({ loading: false, preferences: data?.preferences || { ...DEFAULT_PREFERENCES } });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	updatePreferences: async (patch) => {
		set({ submitting: true, error: null });
		try {
			const { data } = await notificationsApi.updatePreferences(patch);
			set({ submitting: false, preferences: data?.preferences || patch });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	resetPreferences: async () => {
		set({ submitting: true, error: null });
		try {
			const { data } = await notificationsApi.resetPreferences();
			set({ submitting: false, preferences: data?.preferences || { ...DEFAULT_PREFERENCES } });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	fetchDevices: async () => {
		try {
			const { data } = await notificationsApi.pushDevices();
			set({ devices: data?.devices || [] });
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	toggleDevice: async (token) => {
		set({ submitting: true });
		try {
			await notificationsApi.pushToggle({ token });
			await get().fetchDevices();
			set({ submitting: false });
			return { success: true };
		} catch (e) {
			set({ submitting: false });
			return { success: false, message: errToMsg(e) };
		}
	},

	clearNotifications: () =>
		set({
			notifications: [],
			history: [],
			unreadCount: 0,
			devices: [],
			error: null,
		}),
}));

export default useNotificationsStore;
