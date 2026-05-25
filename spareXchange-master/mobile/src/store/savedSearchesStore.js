// Saved searches state — wired to /api/users/saved-searches/* (Module 6).

import { create } from 'zustand';
import savedSearchesApi from '../api/savedSearches.api';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

export const useSavedSearchesStore = create((set, get) => ({
	savedSearches: [],

	loading: false,
	submitting: false,
	error: null,

	fetchSavedSearches: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await savedSearchesApi.list();
			set({ loading: false, savedSearches: data?.searches || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	createSavedSearch: async (payload) => {
		set({ submitting: true, error: null });
		try {
			const { data } = await savedSearchesApi.create(payload);
			const created = data?.savedSearch;
			if (created) {
				set((s) => ({ savedSearches: [created, ...s.savedSearches] }));
			}
			set({ submitting: false });
			return { success: true, savedSearch: created };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	updateSavedSearch: async (id, payload) => {
		set({ submitting: true, error: null });
		try {
			const { data } = await savedSearchesApi.update(id, payload);
			const updated = data?.savedSearch;
			if (updated) {
				set((s) => ({
					savedSearches: s.savedSearches.map((x) => (x._id === id ? updated : x)),
				}));
			}
			set({ submitting: false });
			return { success: true, savedSearch: updated };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	deleteSavedSearch: async (id) => {
		set({ submitting: true, error: null });
		try {
			await savedSearchesApi.delete(id);
			set((s) => ({
				submitting: false,
				savedSearches: s.savedSearches.filter((x) => x._id !== id),
			}));
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	toggleNotification: async (id) => {
		const current = get().savedSearches.find((x) => x._id === id);
		if (!current) return { success: false, message: 'Saved search not found' };
		return get().updateSavedSearch(id, { notify: !current.notify });
	},

	clearSavedSearches: () => set({ savedSearches: [], error: null }),
}));

export default useSavedSearchesStore;
