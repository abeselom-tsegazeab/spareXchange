import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/reviews" : "/api/reviews";

axios.defaults.withCredentials = true;

export const useReviewStore = create((set) => ({
	reviews: [],
	loading: false,
	error: null,
	reviewableExchanges: [],

	getUserReviews: async (userId) => {
		set({ loading: true, error: null });
		try {
			const res = await axios.get(`${API_URL}/user/${userId}`);
			set({ reviews: res.data.data, loading: false });
			return res.data.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to fetch reviews", loading: false });
			throw error;
		}
	},

	getReviewableExchanges: async (revieweeId = null) => {
		set({ loading: true, error: null });
		try {
			const token = localStorage.getItem("token");
			const params = revieweeId ? `?revieweeId=${revieweeId}` : '';
			const res = await axios.get(
				`${API_URL}/reviewable${params}`,
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
			set({ reviewableExchanges: res.data.data, loading: false });
			return res.data.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to fetch reviewable exchanges", loading: false });
			throw error;
		}
	},

	createReview: async (revieweeId, exchangeId, rating, comment) => {
		set({ loading: true, error: null });
		try {
			const token = localStorage.getItem("token");
			const res = await axios.post(
				`${API_URL}`, 
				{ revieweeId, exchangeId, rating, comment },
				{
					headers: {
						Authorization: `Bearer ${token}`
					}
				}
			);
			set({ loading: false });
			return res.data;
		} catch (error) {
			set({ error: error.response?.data?.message || "Failed to create review", loading: false });
			throw error;
		}
	},

	clearError: () => {
		set({ error: null });
	}
}));
