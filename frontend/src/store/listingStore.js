import { create } from "zustand";
import axios from "axios";
import { useCommunityStore } from "./communityStore";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/listings" : "/api/listings";

axios.defaults.withCredentials = true;

export const useListingStore = create((set) => ({
	listings: [],
	currentListing: null,
	isLoading: false,
	error: null,
	message: null,

	// Create a new listing
	createListing: async (listingData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(API_URL, listingData);
			set({ 
				isLoading: false, 
				message: response.data.message,
				currentListing: response.data.listing
			});
			
			// Trigger achievement check after creating listing
			useCommunityStore.getState().triggerAchievementCheck();
			
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error creating listing", isLoading: false });
			throw error;
		}
	},

	// Get all listings with filters
	getListings: async (filters = {}) => {
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
				listings: response.data.listings 
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching listings", isLoading: false });
			throw error;
		}
	},

	// Get single listing by ID
	getListing: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/${id}`);
			set({ 
				isLoading: false, 
				currentListing: response.data.listing 
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching listing", isLoading: false });
			throw error;
		}
	},

	// Update a listing
	updateListing: async (id, listingData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${id}`, listingData);
			set({ 
				isLoading: false, 
				message: response.data.message,
				currentListing: response.data.listing
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error updating listing", isLoading: false });
			throw error;
		}
	},

	// Delete a listing
	deleteListing: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.delete(`${API_URL}/${id}`);
			set({ isLoading: false, message: response.data.message });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error deleting listing", isLoading: false });
			throw error;
		}
	},

	// Get current user's listings
	getUserListings: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/my-listings`);
			set({ 
				isLoading: false, 
				listings: response.data.listings 
			});
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || error.message || "Error fetching your listings";
			console.error("getUserListings error:", error.response?.data || error.message);
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Toggle listing availability
	toggleAvailability: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${id}/toggle-availability`);
			set({ isLoading: false, message: response.data.message });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error toggling availability", isLoading: false });
			throw error;
		}
	},

	// Renew a listing (extend 30 days)
	renewListing: async (id) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${id}/renew`);
			set({ isLoading: false, message: response.data.message });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error renewing listing", isLoading: false });
			throw error;
		}
	},

	// Bulk create listings
	bulkCreateListings: async (listingsArray) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/bulk`, { listings: listingsArray });
			set({ isLoading: false, message: response.data.message });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error creating bulk listings", isLoading: false });
			throw error;
		}
	},

	// Report a listing
	reportListing: async (id, reportData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/${id}/report`, reportData);
			set({ isLoading: false, message: response.data.message });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error reporting listing", isLoading: false });
			throw error;
		}
	},

	// Vote on compatibility
	voteCompatibility: async (listingId, vehicleId, voteType) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.put(`${API_URL}/${listingId}/compatibility/${vehicleId}/vote`, { voteType });
			set({ isLoading: false, message: response.data.message });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error voting", isLoading: false });
			throw error;
		}
	},

	// Get high demand analytics
	getHighDemandAnalytics: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/analytics/high-demand`);
			set({ isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching analytics", isLoading: false });
			throw error;
		}
	},

	// Get personalized recommendations
	getRecommendations: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/recommendations`);
			set({ isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching recommendations", isLoading: false });
			throw error;
		}
	},

	// Clear current listing
	clearCurrentListing: () => {
		set({ currentListing: null });
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
