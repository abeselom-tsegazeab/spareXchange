import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/technician-requests" : "/api/technician-requests";

axios.defaults.withCredentials = true;

export const useTechnicianRequestStore = create((set, get) => ({
	// State
	technicianRequests: [],
	myRequests: [],
	currentRequest: null,
	isLoading: false,
	error: null,
	message: null,

	// Create a new technician request
	createTechnicianRequest: async (requestData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(API_URL, requestData);
			set({ 
				isLoading: false, 
				message: response.data.message,
				currentRequest: response.data.request
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error creating technician request", isLoading: false });
			throw error;
		}
	},

	// Get all technician requests (for technicians to discover)
	getAllTechnicianRequests: async (filters = {}) => {
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
				technicianRequests: response.data.requests 
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching technician requests", isLoading: false });
			throw error;
		}
	},

	// Get user's own requests
	getMyRequests: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/my-requests`);
			set({ 
				isLoading: false, 
				myRequests: response.data.requests 
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching your requests", isLoading: false });
			throw error;
		}
	},

	// Get single request details
	getTechnicianRequest: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/${id}`);
			set({ 
				isLoading: false, 
				currentRequest: response.data.request 
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching request details", isLoading: false });
			throw error;
		}
	},

	// Submit a quote (technician only)
	submitQuote: async (requestId, quoteData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/${requestId}/quote`, quoteData);
			set({ 
				isLoading: false, 
				message: response.data.message
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error submitting quote", isLoading: false });
			throw error;
		}
	},

	// Accept a quote (user only)
	acceptQuote: async (requestId, techId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/${requestId}/accept-quote/${techId}`);
			set({ 
				isLoading: false, 
				message: response.data.message
			});
			// Refresh the current request
			await get().getTechnicianRequest(requestId);
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error accepting quote", isLoading: false });
			throw error;
		}
	},

	// Generate handshake token (technician only)
	generateHandshakeToken: async (requestId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/${requestId}/handshake-token`);
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

	// Complete request with token (user only)
	completeHandshake: async (requestId, token) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/${requestId}/complete-handshake`, { token });
			set({ 
				isLoading: false, 
				message: response.data.message
			});
			// Refresh the current request
			await get().getTechnicianRequest(requestId);
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error completing handshake", isLoading: false });
			throw error;
		}
	},

	// Cancel a request (user only)
	cancelRequest: async (requestId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${requestId}/cancel`);
			set({ 
				isLoading: false, 
				message: response.data.message
			});
			// Refresh my requests
			await get().getMyRequests();
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error cancelling request", isLoading: false });
			throw error;
		}
	},

	// Clear error
	clearError: () => set({ error: null }),

	// Clear message
	clearMessage: () => set({ message: null }),

	// Clear current request
	clearCurrentRequest: () => set({ currentRequest: null })
}));
