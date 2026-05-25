import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/notifications" : "/api/notifications";

axios.defaults.withCredentials = true;

export const useNotificationStore = create((set, get) => ({
	// Basic Notifications
	notifications: [],
	unreadCount: 0,
	loading: false,
	error: null,

	// Push Notifications
	devices: [],
	notificationStats: null,

	// Preferences
	preferences: null,

	// Webhooks
	webhooks: [],
	webhookStats: null,

	// Templates
	templates: [],

	// Notification History
	history: [],
	historyPagination: { page: 1, totalPages: 1, total: 0 },

	getNotifications: async () => {
		set({ loading: true, error: null });
		try {
			const res = await axios.get(`${API_URL}`);
			set({ notifications: res.data.notifications, loading: false });
			return res.data.notifications;
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to fetch notifications", loading: false });
			throw error;
		}
	},

	getUnreadCount: async () => {
		try {
			const res = await axios.get(`${API_URL}/unread-count`);
			set({ unreadCount: res.data.count });
			return res.data.count;
		} catch (error) {
			console.error("Failed to get unread count:", error);
			throw error;
		}
	},

	markAsRead: async (notificationId) => {
		try {
			await axios.put(`${API_URL}/${notificationId}/read`);
			
			// Update local state
			set(state => ({
				notifications: state.notifications.map(n => 
					n._id === notificationId ? { ...n, isRead: true } : n
				),
				unreadCount: Math.max(0, state.unreadCount - 1)
			}));
		} catch (error) {
			console.error("Failed to mark notification as read:", error);
			throw error;
		}
	},

	markAllAsRead: async () => {
		try {
			await axios.put(`${API_URL}/mark-all-read`);
			
			set(state => ({
				notifications: state.notifications.map(n => ({ ...n, isRead: true })),
				unreadCount: 0
			}));
		} catch (error) {
			console.error("Failed to mark all as read:", error);
			throw error;
		}
	},

	deleteNotification: async (notificationId) => {
		try {
			const currentState = get();
			const notification = currentState.notifications.find(n => n._id === notificationId);
			
			await axios.delete(`${API_URL}/${notificationId}`);
			
			set(state => ({
				notifications: state.notifications.filter(n => n._id !== notificationId),
				unreadCount: notification && !notification.isRead ? state.unreadCount - 1 : state.unreadCount
			}));
		} catch (error) {
			console.error("Failed to delete notification:", error);
			throw error;
		}
	},

	clearError: () => {
		set({ error: null });
	},

	// ────────────────────────────────────────────────────────────────────────
	// Push Notification Methods
	// ────────────────────────────────────────────────────────────────────────
	registerDeviceToken: async (token, deviceType, deviceName) => {
		try {
			const res = await axios.post(`${API_URL}/push/register`, {
				token,
				deviceType,
				deviceName
			});
			await get().getRegisteredDevices();
			return res.data;
		} catch (error) {
			console.error("Failed to register device token:", error);
			throw error;
		}
	},

	getRegisteredDevices: async () => {
		try {
			const res = await axios.get(`${API_URL}/push/devices`);
			set({ devices: res.data.devices });
			return res.data.devices;
		} catch (error) {
			console.error("Failed to get registered devices:", error);
			throw error;
		}
	},

	toggleDeviceToken: async (token) => {
		try {
			const res = await axios.put(`${API_URL}/push/toggle`, { token });
			await get().getRegisteredDevices();
			return res.data;
		} catch (error) {
			console.error("Failed to toggle device token:", error);
			throw error;
		}
	},

	removeDeviceToken: async (token) => {
		try {
			await axios.post(`${API_URL}/push/remove`, { token });
			await get().getRegisteredDevices();
		} catch (error) {
			console.error("Failed to remove device token:", error);
			throw error;
		}
	},

	getNotificationStats: async () => {
		try {
			const res = await axios.get(`${API_URL}/push/stats`);
			set({ notificationStats: res.data.stats });
			return res.data.stats;
		} catch (error) {
			console.error("Failed to get notification stats:", error);
			throw error;
		}
	},

	// ────────────────────────────────────────────────────────────────────────
	// Notification Preferences Methods
	// ────────────────────────────────────────────────────────────────────────
	getPreferences: async () => {
		try {
			const res = await axios.get(`${API_URL}/preferences`);
			set({ preferences: res.data.preferences });
			return res.data.preferences;
		} catch (error) {
			console.error("Failed to get preferences:", error);
			throw error;
		}
	},

	updatePreferences: async (preferences) => {
		try {
			const res = await axios.put(`${API_URL}/preferences`, preferences);
			set({ preferences: res.data.preferences });
			return res.data;
		} catch (error) {
			console.error("Failed to update preferences:", error);
			throw error;
		}
	},

	resetPreferences: async () => {
		try {
			const res = await axios.post(`${API_URL}/preferences/reset`);
			set({ preferences: res.data.preferences });
			return res.data;
		} catch (error) {
			console.error("Failed to reset preferences:", error);
			throw error;
		}
	},

	// ────────────────────────────────────────────────────────────────────────
	// Notification History Methods
	// ────────────────────────────────────────────────────────────────────────
	getNotificationHistory: async (filters = {}) => {
		const { type, isRead, startDate, endDate, page = 1, limit = 20 } = filters;
		try {
			const params = new URLSearchParams({ page, limit });
			if (type) params.append('type', type);
			if (isRead !== undefined) params.append('isRead', isRead);
			if (startDate) params.append('startDate', startDate);
			if (endDate) params.append('endDate', endDate);

			const res = await axios.get(`${API_URL}/history?${params.toString()}`);
			set({
				history: res.data.notifications,
				historyPagination: {
					page: res.data.page,
					totalPages: res.data.totalPages,
					total: res.data.total
				}
			});
			return res.data;
		} catch (error) {
			console.error("Failed to get notification history:", error);
			throw error;
		}
	},

	// ────────────────────────────────────────────────────────────────────────
	// Webhook Management Methods
	// ────────────────────────────────────────────────────────────────────────
	getWebhooks: async () => {
		try {
			const res = await axios.get(`${API_URL}/webhooks`);
			set({ webhooks: res.data.webhooks });
			return res.data.webhooks;
		} catch (error) {
			console.error("Failed to get webhooks:", error);
			throw error;
		}
	},

	createWebhook: async (webhookData) => {
		try {
			const res = await axios.post(`${API_URL}/webhooks`, webhookData);
			await get().getWebhooks();
			await get().getWebhookStats(); // Refresh stats immediately
			return res.data;
		} catch (error) {
			console.error("Failed to create webhook:", error);
			throw error;
		}
	},

	updateWebhook: async (id, webhookData) => {
		try {
			const res = await axios.put(`${API_URL}/webhooks/${id}`, webhookData);
			await get().getWebhooks();
			await get().getWebhookStats(); // Refresh stats immediately
			return res.data;
		} catch (error) {
			console.error("Failed to update webhook:", error);
			throw error;
		}
	},

	deleteWebhook: async (id) => {
		try {
			await axios.delete(`${API_URL}/webhooks/${id}`);
			await get().getWebhooks();
			await get().getWebhookStats(); // Refresh stats immediately
		} catch (error) {
			console.error("Failed to delete webhook:", error);
			throw error;
		}
	},

	regenerateWebhookSecret: async (id) => {
		try {
			const res = await axios.post(`${API_URL}/webhooks/${id}/regenerate-secret`);
			return res.data;
		} catch (error) {
			console.error("Failed to regenerate webhook secret:", error);
			throw error;
		}
	},

	getWebhookStats: async () => {
		try {
			const res = await axios.get(`${API_URL}/webhooks/stats`);
			set({ webhookStats: res.data.stats });
			return res.data.stats;
		} catch (error) {
			console.error("Failed to get webhook stats:", error);
			throw error;
		}
	},

	// ────────────────────────────────────────────────────────────────────────
	// Notification Templates Methods
	// ────────────────────────────────────────────────────────────────────────
	getTemplates: async () => {
		try {
			const res = await axios.get(`${API_URL}/templates`);
			set({ templates: res.data.templates });
			return res.data.templates;
		} catch (error) {
			console.error("Failed to get templates:", error);
			throw error;
		}
	}
}));
