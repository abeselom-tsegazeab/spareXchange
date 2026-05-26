// Reviews state — wired to /api/reviews/* (Module 7).

import { create } from 'zustand';
import reviewsApi from '../api/reviews.api';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

export const useReviewsStore = create((set) => ({
	reviews: [],
	reviewable: [],

	loading: false,
	submitting: false,
	error: null,

	fetchUserReviews: async (userId) => {
		set({ loading: true, error: null, reviews: [] });
		try {
			const { data } = await reviewsApi.forUser(userId);
			set({ loading: false, reviews: data?.data || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchReviewable: async (revieweeId) => {
		set({ loading: true, error: null });
		try {
			const { data } = await reviewsApi.reviewable(revieweeId ? { revieweeId } : {});
			set({ loading: false, reviewable: data?.data || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	createReview: async (payload) => {
		set({ submitting: true, error: null });
		try {
			await reviewsApi.create(payload);
			set({ submitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},
}));

export default useReviewsStore;
