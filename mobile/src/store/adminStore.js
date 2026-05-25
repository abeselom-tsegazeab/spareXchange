// Admin operations state — wired to /api/admin/* (Module 8).

import { create } from 'zustand';
import adminApi from '../api/admin.api';
import listingsApi from '../api/listings.api';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

export const useAdminStore = create((set, get) => ({
	comprehensiveStats: null,
	trends: null,
	engagement: null,
	exchangePerformance: null,
	categoryPerformance: null,
	sustainability: null,
	searchAnalytics: null,
	reviewAnalytics: null,
	highDemand: [],

	reports: [],
	report: null,
	reportStats: null,
	reportsPagination: null,

	loading: false,
	loadingDetail: false,
	submitting: false,
	error: null,

	fetchComprehensiveStats: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await adminApi.comprehensiveStats();
			set({ loading: false, comprehensiveStats: data?.stats || null });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchTrends: async (params) => {
		try {
			const { data } = await adminApi.trends(params);
			set({ trends: data?.trends || null });
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	fetchEngagement: async () => {
		try {
			const { data } = await adminApi.engagement();
			set({ engagement: data?.engagement || null });
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	fetchExchangePerformance: async () => {
		try {
			const { data } = await adminApi.exchangePerformance();
			set({ exchangePerformance: data?.performance || null });
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	fetchCategoryPerformance: async () => {
		try {
			const { data } = await adminApi.categoryPerformance();
			set({ categoryPerformance: data?.categoryPerformance || null });
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	fetchSustainability: async () => {
		try {
			const { data } = await adminApi.sustainability();
			set({ sustainability: data?.sustainability || null });
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	fetchSearchAnalytics: async (days = 30) => {
		try {
			const { data } = await adminApi.searchAnalytics({ days });
			set({ searchAnalytics: data?.searchAnalytics || null });
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	fetchReviewAnalytics: async () => {
		try {
			const { data } = await adminApi.reviewAnalytics();
			set({ reviewAnalytics: data?.reviewAnalytics || null });
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	fetchAllAnalytics: async () => {
		set({ loading: true, error: null });
		await Promise.all([
			get().fetchTrends({ period: 'daily', days: 30 }),
			get().fetchEngagement(),
			get().fetchExchangePerformance(),
			get().fetchCategoryPerformance(),
			get().fetchSustainability(),
			get().fetchSearchAnalytics(30),
			get().fetchReviewAnalytics(),
		]);
		set({ loading: false });
		return { success: true };
	},

	fetchHighDemand: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await listingsApi.highDemandAnalytics();
			set({ loading: false, highDemand: data?.analytics || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchReports: async (filters = {}) => {
		set({ loading: true, error: null });
		try {
			const { data } = await adminApi.reports(filters);
			set({
				loading: false,
				reports: data?.reports || [],
				reportsPagination: {
					count: data?.count,
					totalReports: data?.totalReports,
					page: data?.page,
					totalPages: data?.totalPages,
				},
			});
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchReportStats: async () => {
		try {
			const { data } = await adminApi.reportStats();
			set({ reportStats: data?.stats || null });
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	fetchReport: async (id) => {
		set({ loadingDetail: true, error: null, report: null });
		try {
			const { data } = await adminApi.report(id);
			set({ loadingDetail: false, report: data?.report || null });
			return data?.report || null;
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingDetail: false, error: message });
			return null;
		}
	},

	updateReport: async (id, payload) => {
		set({ submitting: true, error: null });
		try {
			const { data } = await adminApi.updateReport(id, payload);
			const updated = data?.report;
			if (updated) {
				set((s) => ({
					report: updated,
					reports: s.reports.map((r) => (r._id === id ? updated : r)),
				}));
			}
			set({ submitting: false });
			return { success: true, report: updated };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	deleteReport: async (id) => {
		set({ submitting: true, error: null });
		try {
			await adminApi.deleteReport(id);
			set((s) => ({
				submitting: false,
				reports: s.reports.filter((r) => r._id !== id),
				report: s.report?._id === id ? null : s.report,
			}));
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	runSavedSearchAlertsJob: async (payload) => {
		set({ submitting: true, error: null });
		try {
			const { data } = await adminApi.runSavedSearchAlertsJob(payload);
			set({ submitting: false });
			return { success: true, result: data?.result, message: data?.message };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},
}));

export default useAdminStore;
