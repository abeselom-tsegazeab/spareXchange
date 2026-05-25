// Services state — wired to /api/technician-requests/* and /api/users/technicians/*.

import { create } from 'zustand';
import { technicianRequestsApi, techniciansApi } from '../api/services.api';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

const mergeRequestInLists = (lists, updated) => {
	if (!updated?._id) return lists;
	const apply = (r) => (r._id === updated._id ? { ...r, ...updated } : r);
	return {
		myRequests: lists.myRequests.map(apply),
		nearbyJobs: lists.nearbyJobs.map(apply),
	};
};

export const useServicesStore = create((set, get) => ({
	myRequests: [],
	nearbyJobs: [],
	request: null,
	technicians: [],
	technician: null,

	loading: false,
	loadingDetail: false,
	submitting: false,
	error: null,

	fetchMyRequests: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await technicianRequestsApi.myRequests();
			set({ loading: false, myRequests: data?.requests || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchNearbyJobs: async (filters = {}) => {
		set({ loading: true, error: null });
		try {
			const params = {};
			if (filters.serviceType) params.serviceType = filters.serviceType;
			if (filters.priority) params.priority = filters.priority;
			if (filters.status) params.status = filters.status;

			const { data } = await technicianRequestsApi.list(params);
			set({ loading: false, nearbyJobs: data?.requests || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchRequest: async (id) => {
		set({ loadingDetail: true, error: null, request: null });
		try {
			const { data } = await technicianRequestsApi.get(id);
			const request = data?.request || null;
			set({ loadingDetail: false, request });
			return request;
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingDetail: false, error: message });
			return null;
		}
	},

	createRequest: async (payload) => {
		set({ submitting: true, error: null });
		try {
			const { data } = await technicianRequestsApi.create(payload);
			const created = data?.request;
			if (created) {
				set((s) => ({ myRequests: [created, ...s.myRequests] }));
			}
			set({ submitting: false });
			return { success: true, request: created };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	cancelRequest: async (id) => {
		set({ submitting: true, error: null });
		try {
			await technicianRequestsApi.cancel(id);
			const apply = (r) => (r._id === id ? { ...r, status: 'cancelled' } : r);
			set((s) => ({
				submitting: false,
				myRequests: s.myRequests.map(apply),
				nearbyJobs: s.nearbyJobs.map(apply),
				request: s.request && s.request._id === id ? apply(s.request) : s.request,
			}));
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	submitQuote: async (id, { estimatedCost, additionalNotes }) => {
		set({ submitting: true, error: null });
		try {
			await technicianRequestsApi.submitQuote(id, { estimatedCost, additionalNotes });
			await get().fetchRequest(id);
			const updated = get().request;
			if (updated) {
				set((s) => ({
					submitting: false,
					...mergeRequestInLists(s, updated),
					request: updated,
				}));
			} else {
				set({ submitting: false });
			}
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	acceptQuote: async (id, techId) => {
		set({ submitting: true, error: null });
		try {
			await technicianRequestsApi.acceptQuote(id, techId);
			await get().fetchRequest(id);
			const updated = get().request;
			if (updated) {
				set((s) => ({
					submitting: false,
					...mergeRequestInLists(s, updated),
					request: updated,
				}));
			} else {
				set({ submitting: false });
			}
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	generateHandshakeToken: async (id) => {
		set({ submitting: true, error: null });
		try {
			const { data } = await technicianRequestsApi.generateHandshakeToken(id);
			const token = data?.token;
			const apply = (r) =>
				r._id === id ? { ...r, status: 'started', verificationToken: token } : r;
			set((s) => ({
				submitting: false,
				myRequests: s.myRequests.map(apply),
				nearbyJobs: s.nearbyJobs.map(apply),
				request: s.request && s.request._id === id ? apply(s.request) : s.request,
			}));
			return { success: true, token };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	completeWithToken: async (id, { token }) => {
		set({ submitting: true, error: null });
		try {
			await technicianRequestsApi.completeWithToken(id, { token });
			await get().fetchRequest(id);
			const updated = get().request;
			if (updated) {
				set((s) => ({
					submitting: false,
					...mergeRequestInLists(s, updated),
					request: updated,
				}));
			} else {
				set({ submitting: false });
			}
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	// ── Directory ─────────────────────────────────────────────────────────
	fetchTechnicians: async (search) => {
		set({ loading: true, error: null });
		try {
			const { data } = await techniciansApi.list(
				search?.trim() ? { search: search.trim() } : {}
			);
			set({ loading: false, technicians: data?.technicians || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchTechnician: async (id) => {
		set({ loadingDetail: true, error: null, technician: null });
		try {
			const { data } = await techniciansApi.get(id);
			const technician = data?.technician || null;
			set({ loadingDetail: false, technician });
			return technician;
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingDetail: false, error: message });
			return null;
		}
	},
}));

export default useServicesStore;
