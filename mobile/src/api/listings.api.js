// Module 2 — Marketplace & Inventory API.
// Mirrors backend/routes/listing.route.js and listing.controller.js.

import api from './client';

// Convert a picked-image asset (from expo-image-picker with `base64:true`)
// into the `data:image/...;base64,...` data URL the backend expects.
export const assetToDataUrl = (asset) => {
	if (!asset) return null;
	if (typeof asset === 'string' && asset.startsWith('http')) return asset; // already a URL
	if (asset.uri && asset.uri.startsWith('http')) return asset.uri;          // already remote
	if (!asset.base64) return null;
	const mime = asset.mimeType || guessMime(asset);
	return `data:${mime};base64,${asset.base64}`;
};

const guessMime = (asset) => {
	const name = (asset.fileName || asset.uri || '').toLowerCase();
	if (name.endsWith('.png')) return 'image/png';
	if (name.endsWith('.webp')) return 'image/webp';
	if (name.endsWith('.gif')) return 'image/gif';
	return 'image/jpeg';
};

// Build server-friendly images array from a mix of existing URLs and freshly-picked assets.
const buildImagesPayload = (images = []) =>
	images
		.map((img) => {
			if (typeof img === 'string') return img;
			if (img?._existing && img?.uri) return img.uri; // unchanged remote image
			if (img?.uri && img.uri.startsWith('http')) return img.uri;
			return assetToDataUrl(img);
		})
		.filter(Boolean);

const buildListingBody = (payload) => {
	const body = {
		title: payload.title,
		description: payload.description,
		price: Number(payload.price),
		category: payload.category,
		condition: payload.condition,
		location: payload.location,
	};
	if (payload.brand) body.brand = payload.brand;
	if (payload.model) body.model = payload.model;
	if (payload.year) body.year = Number(payload.year);
	if (payload.locationCoords) body.locationCoords = payload.locationCoords;
	if (payload.specifications) body.specifications = payload.specifications;
	if (payload.contactInfo) body.contactInfo = payload.contactInfo;
	if (payload.compatibleVehicles) body.compatibleVehicles = payload.compatibleVehicles;
	if (payload.available !== undefined) body.available = payload.available;
	if (payload.images) body.images = buildImagesPayload(payload.images);
	return body;
};

export const listingsApi = {
	// Public list with rich query support
	list: (params = {}) => {
		const q = {};
		if (params.query) q.search = params.query;
		if (params.category) q.category = params.category;
		if (params.condition) q.condition = params.condition;
		if (params.brand) q.brand = params.brand;
		if (params.model) q.model = params.model;
		if (params.year) q.year = params.year;
		if (params.minPrice) q.minPrice = params.minPrice;
		if (params.maxPrice) q.maxPrice = params.maxPrice;
		if (params.location) q.location = params.location;
		if (params.sort && params.sort !== 'recent' && params.sort !== 'nearby') q.sort = params.sort;
		if (params.latitude != null && params.longitude != null) {
			q.latitude = params.latitude;
			q.longitude = params.longitude;
			if (params.radiusKm) q.radius = params.radiusKm;
		}
		return api.get('/listings', { params: q });
	},

	myListings: () => api.get('/listings/my-listings'),

	recommendations: () => api.get('/listings/recommendations'),

	highDemandAnalytics: () => api.get('/listings/analytics/high-demand'),

	get: (id) => api.get(`/listings/${id}`),

	create: (payload) => api.post('/listings', buildListingBody(payload)),

	update: (id, payload) => api.put(`/listings/${id}`, buildListingBody(payload)),

	remove: (id) => api.delete(`/listings/${id}`),

	toggleAvailability: (id) => api.put(`/listings/${id}/toggle-availability`),

	renew: (id) => api.put(`/listings/${id}/renew`),

	report: (id, { reason, details }) =>
		api.post(`/listings/${id}/report`, { reason, details }),

	voteCompatibility: (id, vehicleId, voteType) =>
		api.put(`/listings/${id}/compatibility/${vehicleId}/vote`, { voteType }),

	bulkCreate: (items) =>
		api.post('/listings/bulk', { listings: items.map(buildListingBody) }),
};

export default listingsApi;
