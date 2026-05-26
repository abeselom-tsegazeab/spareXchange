// Eco-related enums + helpers. Mirrors backend/models/recyclingSubmission.model.js
// and the tier virtual on backend/models/user.model.js.

export const ITEM_TYPES = [
	{ key: 'electronics', label: 'Electronics', icon: '🔌', basePoints: 20 },
	{ key: 'vehicle-parts', label: 'Vehicle parts', icon: '🚗', basePoints: 25 },
	{ key: 'mobile-devices', label: 'Mobile devices', icon: '📱', basePoints: 15 },
	{ key: 'computers', label: 'Computers', icon: '💻', basePoints: 30 },
	{ key: 'batteries', label: 'Batteries', icon: '🔋', basePoints: 10 },
	{ key: 'appliances', label: 'Appliances', icon: '🧊', basePoints: 20 },
	{ key: 'plastic', label: 'Plastic', icon: '🥤', basePoints: 5 },
	{ key: 'metal', label: 'Metal', icon: '⚙️', basePoints: 8 },
	{ key: 'other', label: 'Other', icon: '♻️', basePoints: 10 },
];

export const itemLabel = (k) => ITEM_TYPES.find((i) => i.key === k)?.label || k;
export const itemIcon = (k) => ITEM_TYPES.find((i) => i.key === k)?.icon || '♻️';

// Mirror calculateEcoPoints() in backend/controllers/recyclingSubmission.controller.js.
export const estimatePoints = ({ itemType, estimatedWeight, estimatedValue }) => {
	const base = ITEM_TYPES.find((i) => i.key === itemType)?.basePoints || 10;
	let points = base;
	if (estimatedWeight) points = Math.round(base * Number(estimatedWeight));
	else if (estimatedValue) points = Math.round(base * (Number(estimatedValue) / 100));
	return Math.max(5, Math.min(500, points));
};

// Tiers (mirrors user.model.js virtual `ecoTier`)
export const TIERS = [
	{ key: 'Seed', max: 100, color: '#22C55E', next: 'Sprout' },
	{ key: 'Sprout', max: 500, color: '#16A34A', next: 'Sapling' },
	{ key: 'Sapling', max: 1500, color: '#0EA5E9', next: 'Oak' },
	{ key: 'Oak', max: 5000, color: '#A16207', next: 'Gaia' },
	{ key: 'Gaia', max: Infinity, color: '#9333EA', next: null },
];

export const tierFor = (points = 0) => {
	for (const t of TIERS) if (points <= t.max) return t;
	return TIERS[TIERS.length - 1];
};

export const tierProgress = (points = 0) => {
	const t = tierFor(points);
	const idx = TIERS.indexOf(t);
	const prevMax = idx === 0 ? 0 : TIERS[idx - 1].max;
	if (t.max === Infinity) return { tier: t, pct: 1, toNext: 0, max: prevMax };
	const span = t.max - prevMax;
	const into = points - prevMax;
	return { tier: t, pct: Math.max(0, Math.min(1, into / span)), toNext: t.max - points + 1, max: t.max };
};

// Built-in reward shortcuts (UI affordance — user can also enter custom amounts).
export const REWARDS = [
	{ key: 'r1', points: 100, label: '10% off your next technician fee' },
	{ key: 'r2', points: 250, label: '25% off your next listing boost' },
	{ key: 'r3', points: 500, label: 'Featured seller for 7 days' },
	{ key: 'r4', points: 1000, label: 'Free verified-seller badge for 30 days' },
];
