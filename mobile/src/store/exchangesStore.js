// Exchange state — wired to /api/exchanges/* (Module 3).

import { create } from 'zustand';
import exchangesApi from '../api/exchanges.api';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

export const useExchangesStore = create((set, get) => ({
	exchanges: [],
	exchange: null,
	safeZones: [],

	loading: false,
	loadingDetail: false,
	submitting: false,
	error: null,

	// Role resolution works on either populated or raw ID references.
	getRoleFor: (ex, currentUserId) => {
		if (!ex || !currentUserId) {
			return { isBuyer: false, isSeller: false, isParticipant: false };
		}
		const uid = String(currentUserId);
		const isBuyer = String(idOf(ex.buyerId)) === uid;
		const isSeller = String(idOf(ex.sellerId)) === uid;
		return { isBuyer, isSeller, isParticipant: isBuyer || isSeller };
	},

	fetchExchanges: async (status) => {
		set({ loading: true, error: null });
		try {
			const { data } = await exchangesApi.list({
				status: status && status !== 'all' ? status : undefined,
			});
			set({ loading: false, exchanges: data?.data || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchExchange: async (id) => {
		set({ loadingDetail: true, error: null, exchange: null });
		try {
			const { data } = await exchangesApi.get(id);
			set({ loadingDetail: false, exchange: data?.data || null });
			return data?.data || null;
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingDetail: false, error: message });
			return null;
		}
	},

	fetchSafeZones: async () => {
		try {
			const { data } = await exchangesApi.safeZones();
			set({ safeZones: data?.data || [] });
			return { success: true };
		} catch (e) {
			set({ safeZones: [] });
			return { success: false, message: errToMsg(e) };
		}
	},

	// Helper: merge updated exchange into all three local caches.
	_applyUpdate: (updated) => {
		if (!updated) return;
		set((s) => ({
			exchanges: s.exchanges.map((e) => (e._id === updated._id ? { ...e, ...updated } : e)),
			exchange:
				s.exchange && s.exchange._id === updated._id ? { ...s.exchange, ...updated } : s.exchange,
		}));
	},

	propose: async ({ listingId, offeredItems, offeredListingId, meetingLocation, meetingTime }) => {
		set({ submitting: true, error: null });
		try {
			const { data } = await exchangesApi.propose({
				listingId,
				offeredItems,
				offeredListingId,
				meetingLocation,
				meetingTime,
			});
			const created = data?.data;
			if (created) {
				set((s) => ({
					exchanges: [created, ...s.exchanges],
				}));
			}
			set({ submitting: false });
			return { success: true, exchange: created };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false, error: message });
			return { success: false, message };
		}
	},

	updateStatus: async (id, { status, reason }) => {
		set({ submitting: true });
		try {
			const { data } = await exchangesApi.updateStatus(id, {
				status,
				cancelReason: reason || (status === 'cancelled' ? 'Cancelled by user' : undefined),
			});
			get()._applyUpdate(data?.data);
			set({ submitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false });
			return { success: false, message };
		}
	},

	makeCounterOffer: async (id, { offeredItems, offeredListingId, note }) => {
		set({ submitting: true });
		try {
			const { data } = await exchangesApi.counterOffer(id, { offeredItems, offeredListingId, note });
			get()._applyUpdate(data?.data);
			set({ submitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false });
			return { success: false, message };
		}
	},

	negotiate: async (id, patch) => {
		set({ submitting: true });
		try {
			const { data } = await exchangesApi.negotiate(id, patch);
			get()._applyUpdate(data?.data);
			set({ submitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false });
			return { success: false, message };
		}
	},

	complete: async (id) => {
		set({ submitting: true });
		try {
			const { data } = await exchangesApi.complete(id);
			get()._applyUpdate(data?.data);
			set({ submitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false });
			return { success: false, message };
		}
	},

	generateHandshake: async (id) => {
		set({ submitting: true });
		try {
			const { data } = await exchangesApi.handshakeGenerate(id);
			// Refresh just the in-memory exchange so the token shows on the detail
			set((s) => ({
				submitting: false,
				exchange:
					s.exchange && s.exchange._id === id
						? {
								...s.exchange,
								handshakeToken: data?.token,
								handshakeExpiresAt: data?.expiresAt,
								handshakeRegenerated: data?.regenerationCount,
							}
						: s.exchange,
			}));
			return {
				success: true,
				token: data?.token,
				expiresAt: data?.expiresAt,
				regenerationCount: data?.regenerationCount,
			};
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false });
			return { success: false, message };
		}
	},

	regenerateHandshake: async (id) => {
		set({ submitting: true });
		try {
			const { data } = await exchangesApi.handshakeRegenerate(id);
			set((s) => ({
				submitting: false,
				exchange:
					s.exchange && s.exchange._id === id
						? {
								...s.exchange,
								handshakeToken: data?.token,
								handshakeExpiresAt: data?.expiresAt,
								handshakeRegenerated: data?.regenerationCount,
							}
						: s.exchange,
			}));
			return {
				success: true,
				token: data?.token,
				expiresAt: data?.expiresAt,
				regenerationCount: data?.regenerationCount,
				remainingAttempts: data?.remainingAttempts,
			};
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false });
			return { success: false, message };
		}
	},

	verifyHandshake: async (id, { token }) => {
		set({ submitting: true });
		try {
			const { data } = await exchangesApi.handshakeVerify(id, { token });
			get()._applyUpdate(data?.data);
			set({ submitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false });
			return { success: false, message };
		}
	},

	uploadHandoverPhoto: async (id, { photoUrl }) => {
		set({ submitting: true });
		try {
			const { data } = await exchangesApi.handoverPhoto(id, { photoUrl });
			set((s) => ({
				submitting: false,
				exchange:
					s.exchange && s.exchange._id === id
						? { ...s.exchange, handoverPhotos: data?.photos || s.exchange.handoverPhotos }
						: s.exchange,
				exchanges: s.exchanges.map((e) =>
					e._id === id ? { ...e, handoverPhotos: data?.photos || e.handoverPhotos } : e
				),
			}));
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false });
			return { success: false, message };
		}
	},

	openDispute: async (id, { reason }) => {
		set({ submitting: true });
		try {
			const { data } = await exchangesApi.dispute(id, { reason });
			get()._applyUpdate(data?.data);
			set({ submitting: false });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ submitting: false });
			return { success: false, message };
		}
	},
}));

export default useExchangesStore;
