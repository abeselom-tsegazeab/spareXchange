import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/disputes" : "/api/disputes";

axios.defaults.withCredentials = true;

export const useDisputeStore = create((set) => ({
	isLoading: false,
	error: null,
	message: null,

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

	getDisputes: async (status) => {
		set({ isLoading: true, error: null });
		try {
			const url = status ? `${API_URL}?status=${status}` : API_URL;
			const response = await axios.get(url);
			return response.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Error fetching disputes", isLoading: false });
			throw error;
		}
	},
}));
