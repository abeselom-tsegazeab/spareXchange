import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/users" : "/api/users";

axios.defaults.withCredentials = true;

export const useSavedSearchStore = create((set) => ({
	savedSearches: [],
	isLoading: false,
	error: null,

	// Get all saved searches for the current user
	getSavedSearches: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/saved-searches`);
			set({ 
				isLoading: false, 
				savedSearches: response.data.searches || [] 
			});
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Error fetching saved searches";
			console.error("getSavedSearches error:", error.response?.data || error.message);
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Create a new saved search
	createSavedSearch: async (searchData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/saved-searches`, searchData);
			set((state) => ({
				isLoading: false,
				savedSearches: [response.data.savedSearch, ...state.savedSearches]
			}));
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Error creating saved search";
			console.error("createSavedSearch error:", error.response?.data || error.message);
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Update an existing saved search
	updateSavedSearch: async (id, searchData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.patch(`${API_URL}/saved-searches/${id}`, searchData);
			set((state) => ({
				isLoading: false,
				savedSearches: state.savedSearches.map(search => 
					search._id === id ? response.data.savedSearch : search
				)
			}));
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Error updating saved search";
			console.error("updateSavedSearch error:", error.response?.data || error.message);
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Delete a saved search
	deleteSavedSearch: async (id) => {
		set({ isLoading: true, error: null });
		try {
			await axios.delete(`${API_URL}/saved-searches/${id}`);
			set((state) => ({
				isLoading: false,
				savedSearches: state.savedSearches.filter(search => search._id !== id)
			}));
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Error deleting saved search";
			console.error("deleteSavedSearch error:", error.response?.data || error.message);
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Toggle notification for a saved search
	toggleNotification: async (id, currentNotifyState) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.patch(`${API_URL}/saved-searches/${id}`, {
				notify: !currentNotifyState
			});
			set((state) => ({
				isLoading: false,
				savedSearches: state.savedSearches.map(search => 
					search._id === id ? response.data.savedSearch : search
				)
			}));
			return response.data;
		} catch (error) {
			const errorMessage = error.response?.data?.message || "Error toggling notification";
			console.error("toggleNotification error:", error.response?.data || error.message);
			set({ error: errorMessage, isLoading: false });
			throw error;
		}
	},

	// Clear error
	clearError: () => set({ error: null }),

	// Clear all saved searches (e.g., on logout)
	clearSavedSearches: () => set({ savedSearches: [], error: null })
}));
