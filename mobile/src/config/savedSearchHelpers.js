// Helpers to convert between browse filters and saved-search payloads.

export const filtersToSavedSearchPayload = ({ name, notify = true, filters = {} }) => {
	const payload = {
		name: name?.trim() || '',
		query: filters.query?.trim() || '',
		notify,
	};

	const structured = {};
	if (filters.category) structured.category = filters.category;
	if (filters.condition) structured.condition = filters.condition;
	if (filters.brand?.trim()) structured.brand = filters.brand.trim();
	if (filters.model?.trim()) structured.model = filters.model.trim();
	if (filters.year) structured.year = Number(filters.year);
	if (filters.minPrice) structured.minPrice = Number(filters.minPrice);
	if (filters.maxPrice) structured.maxPrice = Number(filters.maxPrice);
	if (Object.keys(structured).length) payload.filters = structured;

	if (filters.latitude != null && filters.longitude != null) {
		payload.geo = {
			latitude: filters.latitude,
			longitude: filters.longitude,
			radiusKm: filters.radiusKm || 50,
		};
	}

	return payload;
};

export const savedSearchToFilters = (saved) => {
	const f = saved?.filters || {};
	const geo = saved?.geo || {};
	return {
		query: saved?.query || '',
		category: f.category || null,
		condition: f.condition || null,
		brand: f.brand || '',
		model: f.model || '',
		year: f.year != null ? String(f.year) : '',
		minPrice: f.minPrice != null ? String(f.minPrice) : '',
		maxPrice: f.maxPrice != null ? String(f.maxPrice) : '',
		radiusKm: geo.radiusKm ?? null,
		latitude: geo.latitude ?? null,
		longitude: geo.longitude ?? null,
		sort: geo.latitude != null && geo.longitude != null ? 'nearby' : 'recent',
	};
};

export const summarizeSavedSearch = (saved) => {
	const parts = [];
	if (saved?.query) parts.push(`"${saved.query}"`);
	const f = saved?.filters || {};
	if (f.category) parts.push(f.category);
	if (f.condition) parts.push(f.condition);
	if (f.brand) parts.push(f.brand);
	if (f.minPrice != null || f.maxPrice != null) {
		parts.push(`ETB ${f.minPrice ?? '0'}–${f.maxPrice ?? '∞'}`);
	}
	if (saved?.geo?.radiusKm) parts.push(`≤ ${saved.geo.radiusKm} km`);
	return parts.length ? parts.join(' · ') : 'All listings';
};
