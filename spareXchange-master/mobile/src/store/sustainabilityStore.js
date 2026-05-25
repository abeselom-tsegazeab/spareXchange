// Sustainability state — wired to /api/recycling-submissions/* and /api/users/*.

import { create } from 'zustand';
import { recyclingApi, incentivesApi } from '../api/sustainability.api';
import { useAuthStore } from './authStore';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

export const useSustainabilityStore = create((set, get) => ({
	submissions: [],
	submission: null,
	leaderboard: [],
	leaderboardStats: null,
	nearby: [],

	loading: false,
	loadingDetail: false,
	submitting: false,
	error: null,

	// ── Submissions ──────────────────────────────────────────────────────
	fetchMySubmissions: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await recyclingApi.mySubmissions();
			set({ loading: false, submissions: data?.submissions || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchSubmission: async (id) => {
		set({ loadingDetail: true, error: null, submission: null });
		try {
			const { data } = await recyclingApi.get(id);
			set({ loadingDetail: false, submission: data?.submission || null });
			return data?.submission || null;
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingDetail: false, error: message });
			return null;
		}
	},

	createSubmission: async (payload) => {
		set({ submitting: true, error: null });
		try {
			const { data } = await recyclingApi.create(payload);
			const created = data?.submission;
			if (created) {
				set((s) => ({ submissions: [created, ...s.submissions] }));
			}
			set({ submitting: false });
			return { success: true, submission: created, qrCodeData: data?.qrCodeData };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	// ── Recycler / admin ─────────────────────────────────────────────────
	verifyByToken: async ({ token }) => {
		set({ submitting: true, error: null });
		try {
			const { data } = await recyclingApi.verifyByToken({ token });
			const updated = data?.submission;
			if (updated) {
				const merge = (s) => (s._id === updated._id ? { ...s, ...updated } : s);
				set((s) => ({
					submissions: s.submissions.map(merge),
					submission: s.submission && s.submission._id === updated._id ? merge(s.submission) : s.submission,
				}));
			}
			set({ submitting: false });
			return { success: true, submission: updated };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false });
			return { success: false, message };
		}
	},

	approveSubmission: async (id) => {
		set({ submitting: true });
		try {
			const { data } = await recyclingApi.approve(id);
			const updated = data?.submission;
			if (updated) {
				set((s) => ({
					submissions: s.submissions.map((x) => (x._id === id ? { ...x, ...updated } : x)),
					submission: s.submission && s.submission._id === id ? { ...s.submission, ...updated } : s.submission,
				}));
			}
			set({ submitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false });
			return { success: false, message };
		}
	},

	// ── Discovery ─────────────────────────────────────────────────────────
	fetchNearbyRecyclers: async ({ latitude, longitude, radiusKm = 50 } = {}) => {
		if (latitude == null || longitude == null) {
			return { success: false, message: 'Location is required.' };
		}
		set({ loading: true, error: null });
		try {
			const { data } = await recyclingApi.discovery({ latitude, longitude, radiusKm });
			set({ loading: false, nearby: data?.data || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message, nearby: [] });
			return { success: false, message };
		}
	},

	// ── Leaderboard ───────────────────────────────────────────────────────
	fetchLeaderboard: async () => {
		try {
			const { data } = await incentivesApi.leaderboard();
			set({ leaderboard: data?.leaderboard || [] });
			return { success: true };
		} catch (e) {
			set({ leaderboard: [] });
			return { success: false, message: errToMsg(e) };
		}
	},

	fetchLeaderboardStats: async () => {
		try {
			const { data } = await incentivesApi.leaderboardStats();
			// Backend `getLeaderboardStats` returns a flat object; pluck whatever's there.
			set({
				leaderboardStats: {
					totalEcoPoints:
						data?.totalEcoPoints ??
						data?.stats?.totalEcoPoints ??
						data?.data?.totalEcoPoints,
					monthlyGrowthPct:
						data?.monthlyGrowthPct ??
						data?.stats?.monthlyGrowthPct ??
						data?.data?.monthlyGrowthPct,
					usersWithPoints:
						data?.usersWithPoints ??
						data?.stats?.usersWithPoints ??
						data?.data?.usersWithPoints,
					...(data || {}),
				},
			});
			return { success: true };
		} catch (e) {
			// Non-fatal — UI just hides the stats card.
			set({ leaderboardStats: null });
			return { success: false, message: errToMsg(e) };
		}
	},

	// ── Redeem ────────────────────────────────────────────────────────────
	redeemPoints: async ({ points, rewardDescription }) => {
		set({ submitting: true, error: null });
		try {
			const { data } = await incentivesApi.redeemPoints({ points, rewardDescription });
			set({ submitting: false });
			// Refresh the user so the new ecoPoints balance is reflected everywhere.
			try {
				await useAuthStore.getState().refreshMe();
			} catch (_) {}
			return { success: true, currentPoints: data?.currentPoints, transaction: data?.transaction };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},
}));

export default useSustainabilityStore;
