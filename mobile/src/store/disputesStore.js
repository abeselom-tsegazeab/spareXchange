// Platform dispute reports — wired to /api/disputes (Module 7).

import { create } from 'zustand';
import disputesApi from '../api/disputes.api';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

export const useDisputesStore = create((set) => ({
	submitting: false,
	error: null,

	reportUser: async (payload) => {
		set({ submitting: true, error: null });
		try {
			await disputesApi.create(payload);
			set({ submitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},
}));

export default useDisputesStore;
