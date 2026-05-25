// Backend-aligned enums for listings/filters (see backend/models/listing.model.js).

export const CATEGORIES = [
	{ key: 'vehicle', label: 'Vehicle parts' },
	{ key: 'electronics', label: 'Electronics' },
	{ key: 'appliances', label: 'Appliances' },
	{ key: 'machinery', label: 'Machinery' },
	{ key: 'mobile', label: 'Mobile' },
	{ key: 'computer', label: 'Computer' },
	{ key: 'other', label: 'Other' },
];

export const CONDITIONS = [
	{ key: 'new', label: 'New' },
	{ key: 'like-new', label: 'Like new' },
	{ key: 'used-good', label: 'Used — good' },
	{ key: 'used-fair', label: 'Used — fair' },
	{ key: 'refurbished', label: 'Refurbished' },
];

export const SORTS = [
	{ key: 'recent', label: 'Most recent' },
	{ key: 'price-asc', label: 'Price: low → high' },
	{ key: 'price-desc', label: 'Price: high → low' },
	{ key: 'nearby', label: 'Nearest first' },
];

export const REPORT_REASONS = [
	{ key: 'inaccurate', label: 'Inaccurate information' },
	{ key: 'counterfeit', label: 'Counterfeit / fake' },
	{ key: 'prohibited', label: 'Prohibited item' },
	{ key: 'spam', label: 'Spam / scam' },
	{ key: 'offensive', label: 'Offensive content' },
	{ key: 'other', label: 'Other' },
];

export const categoryLabel = (k) => CATEGORIES.find((c) => c.key === k)?.label || k;
export const conditionLabel = (k) => CONDITIONS.find((c) => c.key === k)?.label || k;
