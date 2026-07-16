import { create } from "zustand";
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/disputes`;

axios.defaults.withCredentials = true;

export const useDisputeStore = create((set) => ({
	isLoading: false,
	error: null,
	message: null,
	disputes: [],
	selectedDispute: null,
	disputeStats: null,
	disputesPagination: null,

	createDispute: async (disputeData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(API_URL, disputeData);
			set({ isLoading: false, message: response.data.message });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error reporting dispute", isLoading: false });
			throw error;
		}
	},

	getDisputes: async (filters = {}) => {
		set({ isLoading: true, error: null });
		try {
			const params = new URLSearchParams();
			if (filters.status) params.append('status', filters.status);
			if (filters.targetModel) params.append('targetModel', filters.targetModel);
			if (filters.page) params.append('page', filters.page);
			if (filters.limit) params.append('limit', filters.limit);

			const response = await axios.get(`${API_URL}?${params.toString()}`);
			set({ 
				disputes: response.data.data,
				disputesPagination: response.data.pagination,
				isLoading: false 
			});
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching disputes", isLoading: false });
			throw error;
		}
	},

	getDisputeById: async (disputeId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/${disputeId}`);
			set({ selectedDispute: response.data.data, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching dispute", isLoading: false });
			throw error;
		}
	},

	updateDisputeStatus: async (disputeId, updateData) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.patch(`${API_URL}/${disputeId}`, updateData);
			set({ isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error updating dispute", isLoading: false });
			throw error;
		}
	},

	getDisputeStats: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.get(`${API_URL}/stats`);
			set({ disputeStats: response.data.data, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching dispute stats", isLoading: false });
			throw error;
		}
	},

	deleteDispute: async (disputeId) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.delete(`${API_URL}/${disputeId}`);
			set({ isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error deleting dispute", isLoading: false });
			throw error;
		}
	},

	clearSelectedDispute: () => {
		set({ selectedDispute: null });
	},
}));
