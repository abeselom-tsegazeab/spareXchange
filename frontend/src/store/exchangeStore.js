import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/exchanges" : "/api/exchanges";

axios.defaults.withCredentials = true;

export const useExchangeStore = create((set) => ({
	exchanges: [],
	currentExchange: null,
	isLoading: false,
	error: null,
	message: null,
	totalExchanges: 0,
	totalPages: 0,
	currentPage: 1,

	// Propose a new exchange
	proposeExchange: async (exchangeData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(API_URL, exchangeData);
			set({
				isLoading: false,
				message: response.data.message,
				currentExchange: response.data.data
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error proposing exchange", isLoading: false });
			throw error;
		}
	},

	// Get all user exchanges with pagination and filters
	getUserExchanges: async (filters = {}) => {
		set({ isLoading: true, error: null });
		try {
			const params = new URLSearchParams();
			Object.keys(filters).forEach(key => {
				if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
					params.append(key, filters[key]);
				}
			});

			const response = await axios.get(`${API_URL}?${params.toString()}`);
			set({
				isLoading: false,
				exchanges: response.data.data,
				totalExchanges: response.data.total,
				totalPages: response.data.totalPages,
				currentPage: response.data.page
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching exchanges", isLoading: false });
			throw error;
		}
	},

	// Get single exchange by ID
	getExchangeById: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/${id}`);
			set({
				isLoading: false,
				currentExchange: response.data.data
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching exchange", isLoading: false });
			throw error;
		}
	},

	// Update exchange status (accept/reject/cancel)
	updateExchangeStatus: async (id, statusData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${id}/status`, statusData);
			set({
				isLoading: false,
				message: response.data.message,
				currentExchange: response.data.data
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error updating exchange status", isLoading: false });
			throw error;
		}
	},

	// Make a counter-offer
	makeCounterOffer: async (id, offerData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${id}/counter-offer`, offerData);
			set({
				isLoading: false,
				message: response.data.message,
				currentExchange: response.data.data
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error making counter-offer", isLoading: false });
			throw error;
		}
	},

	// Negotiate meeting details
	negotiateExchange: async (id, negotiationData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${id}/negotiate`, negotiationData);
			set({
				isLoading: false,
				message: response.data.message,
				currentExchange: response.data.data
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error negotiating exchange", isLoading: false });
			throw error;
		}
	},

	// Complete exchange (dual confirmation)
	completeExchange: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${id}/complete`);
			set({
				isLoading: false,
				message: response.data.message,
				currentExchange: response.data.data
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error completing exchange", isLoading: false });
			throw error;
		}
	},

	// Open a dispute
	openDispute: async (id, reason) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/${id}/dispute`, { reason });
			set({
				isLoading: false,
				message: response.data.message,
				currentExchange: response.data.data
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error opening dispute", isLoading: false });
			throw error;
		}
	},

	// Generate QR handshake token (seller)
	generateHandshakeToken: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${id}/handshake/generate`);
			set({
				isLoading: false,
				message: response.data.message
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error generating handshake token", isLoading: false });
			throw error;
		}
	},

	// Regenerate QR handshake token (seller - if lost/expired)
	regenerateHandshakeToken: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${id}/handshake/regenerate`);
			set({
				isLoading: false,
				message: response.data.message
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error regenerating handshake token", isLoading: false });
			throw error;
		}
	},

	// Verify QR handshake token (buyer)
	verifyHandshake: async (id, token) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${id}/handshake/verify`, { token });
			set({
				isLoading: false,
				message: response.data.message,
				currentExchange: response.data.data
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error verifying handshake", isLoading: false });
			throw error;
		}
	},

	// Upload handover photo
	uploadHandoverPhoto: async (id, photoUrl) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${id}/handover-photo`, { photoUrl });
			set({
				isLoading: false,
				message: response.data.message,
				currentExchange: response.data.data
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error uploading photo", isLoading: false });
			throw error;
		}
	},

	// Get safe zones
	getSafeZones: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/info/safe-zones`);
			set({ isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching safe zones", isLoading: false });
			throw error;
		}
	},

	// Clear current exchange
	clearCurrentExchange: () => {
		set({ currentExchange: null });
	},

	// Clear error
	clearError: () => {
		set({ error: null });
	},

	// Clear message
	clearMessage: () => {
		set({ message: null });
	}
}));
