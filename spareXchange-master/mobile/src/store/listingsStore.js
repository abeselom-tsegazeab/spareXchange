// Marketplace state — wired to /api/listings/* (Module 2).

import { create } from 'zustand';
import listingsApi from '../api/listings.api';

const errToMsg = (e) =>
	e?.message || e?.response?.data?.message || 'Something went wrong';

const DEFAULT_FILTERS = {
	query: '',
	category: null,
	condition: null,
	brand: '',
	model: '',
	year: '',
	minPrice: '',
	maxPrice: '',
	radiusKm: null,
	sort: 'recent',
	// proximity is only sent when coords are present
	latitude: null,
	longitude: null,
};

export const useListingsStore = create((set, get) => ({
	listings: [],
	myListings: [],
	recommendations: [],
	listing: null,

	loading: false,
	loadingDetail: false,
	creating: false,
	updating: false,
	error: null,

	filters: { ...DEFAULT_FILTERS },

	resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),
	patchFilters: (patch) => set((s) => ({ filters: { ...s.filters, ...patch } })),

	// ── Browse ───────────────────────────────────────────────────────────
	fetchListings: async (overrideParams) => {
		set({ loading: true, error: null });
		try {
			const params = overrideParams ?? get().filters;
			const { data } = await listingsApi.list(params);
			let listings = data?.listings || [];
			// "nearby" sort is client-side after the proximity query
			if (params.sort === 'nearby') {
				// Server already returns near-first when lat/lng provided.
			}
			set({ loading: false, listings });
			return { success: true, listings };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchMyListings: async () => {
		set({ loading: true, error: null });
		try {
			const { data } = await listingsApi.myListings();
			set({ loading: false, myListings: data?.listings || [] });
			return { success: true };
		} catch (e) {
			const message = errToMsg(e);
			set({ loading: false, error: message });
			return { success: false, message };
		}
	},

	fetchRecommendations: async () => {
		try {
			const { data } = await listingsApi.recommendations();
			set({ recommendations: data?.listings || [] });
			return { success: true };
		} catch (e) {
			// Non-fatal: just leave recommendations empty.
			set({ recommendations: [] });
			return { success: false, message: errToMsg(e) };
		}
	},

	fetchHighDemand: async () => {
		try {
			const { data } = await listingsApi.highDemandAnalytics();
			return { success: true, analytics: data?.analytics || [] };
		} catch (e) {
			return { success: false, message: errToMsg(e), analytics: [] };
		}
	},

	// ── Detail ───────────────────────────────────────────────────────────
	fetchListing: async (id) => {
		set({ loadingDetail: true, error: null, listing: null });
		try {
			const { data } = await listingsApi.get(id);
			set({ loadingDetail: false, listing: data?.listing || null });
			return data?.listing || null;
		} catch (e) {
			const message = errToMsg(e);
			set({ loadingDetail: false, error: message });
			return null;
		}
	},

	// ── Mutations ────────────────────────────────────────────────────────
	createListing: async (payload) => {
		set({ creating: true, error: null });
		try {
			const { data } = await listingsApi.create(payload);
			const created = data?.listing;
			set((s) => ({
				creating: false,
				myListings: created ? [created, ...s.myListings] : s.myListings,
			}));
			return { success: true, listing: created };
		} catch (e) {
			const message = errToMsg(e);
			set({ creating: false, error: message });
			return { success: false, message };
		}
	},

	updateListing: async (id, payload) => {
		set({ updating: true, error: null });
		try {
			const { data } = await listingsApi.update(id, payload);
			const updated = data?.listing;
			const merge = (l) => (l._id === id ? { ...l, ...(updated || payload) } : l);
			set((s) => ({
				updating: false,
				listings: s.listings.map(merge),
				myListings: s.myListings.map(merge),
				listing:
					s.listing && s.listing._id === id ? { ...s.listing, ...(updated || payload) } : s.listing,
			}));
			return { success: true, listing: updated };
		} catch (e) {
			const message = errToMsg(e);
			set({ updating: false, error: message });
			return { success: false, message };
		}
	},

	toggleAvailability: async (id) => {
		try {
			const { data } = await listingsApi.toggleAvailability(id);
			const available = data?.available;
			const merge = (l) => (l._id === id ? { ...l, available } : l);
			set((s) => ({
				listings: s.listings.map(merge),
				myListings: s.myListings.map(merge),
				listing: s.listing && s.listing._id === id ? { ...s.listing, available } : s.listing,
			}));
			return { success: true, available };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	renewListing: async (id) => {
		try {
			const { data } = await listingsApi.renew(id);
			const expiresAt = data?.expiresAt;
			const merge = (l) => (l._id === id ? { ...l, expiresAt } : l);
			set((s) => ({
				listings: s.listings.map(merge),
				myListings: s.myListings.map(merge),
				listing: s.listing && s.listing._id === id ? { ...s.listing, expiresAt } : s.listing,
			}));
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	deleteListing: async (id) => {
		try {
			await listingsApi.remove(id);
			set((s) => ({
				listings: s.listings.filter((l) => l._id !== id),
				myListings: s.myListings.filter((l) => l._id !== id),
			}));
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	voteCompatibility: async (listingId, vehicleId, voteType) => {
		try {
			const { data } = await listingsApi.voteCompatibility(listingId, vehicleId, voteType);
			const updatedVehicle = data?.vehicle;
			const patch = (l) => {
				if (l._id !== listingId) return l;
				return {
					...l,
					compatibleVehicles: (l.compatibleVehicles || []).map((v) =>
						v._id === vehicleId && updatedVehicle ? { ...v, ...updatedVehicle } : v
					),
				};
			};
			set((s) => ({
				listings: s.listings.map(patch),
				myListings: s.myListings.map(patch),
				listing: s.listing && s.listing._id === listingId ? patch(s.listing) : s.listing,
			}));
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	reportListing: async (id, { reason, details }) => {
		try {
			await listingsApi.report(id, { reason, details });
			return { success: true };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},

	bulkCreate: async (items) => {
		try {
			const { data } = await listingsApi.bulkCreate(items);
			return { success: true, count: data?.count || 0 };
		} catch (e) {
			return { success: false, message: errToMsg(e) };
		}
	},
}));

export default useListingsStore;
