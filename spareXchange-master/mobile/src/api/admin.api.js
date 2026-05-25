// Module 8 — Operations & Intelligence admin API.

import api from './client';

export const adminApi = {
	platformStats: () => api.get('/admin/stats'),

	comprehensiveStats: () => api.get('/admin/analytics/comprehensive'),

	trends: ({ period = 'daily', days = 30 } = {}) =>
		api.get('/admin/analytics/trends', { params: { period, days } }),

	engagement: () => api.get('/admin/analytics/engagement'),

	exchangePerformance: () => api.get('/admin/analytics/exchanges'),

	categoryPerformance: () => api.get('/admin/analytics/categories'),

	sustainability: () => api.get('/admin/analytics/sustainability'),

	searchAnalytics: ({ days = 30 } = {}) =>
		api.get('/admin/analytics/searches', { params: { days } }),

	reviewAnalytics: () => api.get('/admin/analytics/reviews'),

	reports: (params = {}) => api.get('/admin/reports', { params }),

	reportStats: () => api.get('/admin/reports/stats'),

	report: (id) => api.get(`/admin/reports/${id}`),

	updateReport: (id, payload) => api.put(`/admin/reports/${id}`, payload),

	deleteReport: (id) => api.delete(`/admin/reports/${id}`),

	runSavedSearchAlertsJob: (payload = {}) =>
		api.post('/admin/jobs/saved-search-alerts', payload),
};

export default adminApi;
