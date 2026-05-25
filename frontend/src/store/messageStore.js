import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/messages" : "/api/messages";

axios.defaults.withCredentials = true;

export const useMessageStore = create((set) => ({
	conversations: [],
	currentConversation: [],
	loading: false,
	error: null,
	unreadCount: 0,

	getConversations: async () => {
		set({ loading: true, error: null });
		try {
			const res = await axios.get(`${API_URL}/conversations`);
			set({ conversations: res.data.conversations, loading: false });
			return res.data.conversations;
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to fetch conversations", loading: false });
			throw error;
		}
	},

	getConversation: async (userId) => {
		set({ loading: true, error: null });
		try {
			const res = await axios.get(`${API_URL}/${userId}`);
			set({ currentConversation: res.data.messages, loading: false });
			return res.data.messages;
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to fetch conversation", loading: false });
			throw error;
		}
	},

	sendMessage: async (receiverId, content, listingId) => {
		try {
			const res = await axios.post(`${API_URL}`, { receiverId, content, listingId });
			
			// Append to current conversation
			set(state => ({
				currentConversation: [...state.currentConversation, res.data.data]
			}));
			
			return res.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to send message" });
			throw error;
		}
	},

	markAsRead: async (senderId) => {
		try {
			await axios.put(`${API_URL}/read/${senderId}`);
			
			// Update local state to mark messages as read
			set(state => ({
				conversations: state.conversations.map(conv => 
					conv.user._id === senderId ? { ...conv, isRead: true } : conv
				),
				unreadCount: Math.max(0, state.unreadCount - 1)
			}));
		} catch (error) {
			console.error("Failed to mark as read:", error);
			throw error;
		}
	},

	getUnreadMessagesCount: async () => {
		try {
			const res = await axios.get(`${API_URL}/unread-count`);
			set({ unreadCount: res.data.count });
			return res.data.count;
		} catch (error) {
			console.error("Failed to get unread messages count:", error);
			throw error;
		}
	},

	clearError: () => {
		set({ error: null });
	}
}));
