// Status helpers mirror backend/models/exchange.model.js.

export const STATUS = {
	pending: { label: 'Pending', tone: 'warning' },
	counter_offered: { label: 'Counter-offered', tone: 'info' },
	accepted: { label: 'Accepted', tone: 'success' },
	rejected: { label: 'Rejected', tone: 'muted' },
	cancelled: { label: 'Cancelled', tone: 'muted' },
	completed_by_buyer: { label: 'Buyer confirmed', tone: 'info' },
	completed_by_seller: { label: 'Seller confirmed', tone: 'info' },
	fully_completed: { label: 'Completed', tone: 'success' },
	disputed: { label: 'Disputed', tone: 'danger' },
	expired: { label: 'Expired', tone: 'muted' },
};

export const STATUS_TONE_COLORS = {
	warning: { bg: '#FEF3C7', fg: '#92400E' },
	info: { bg: '#E0E7FF', fg: '#3730A3' },
	success: { bg: '#D1FAE5', fg: '#065F46' },
	muted: { bg: '#F3F4F6', fg: '#374151' },
	danger: { bg: '#FEE2E2', fg: '#991B1B' },
};

export const statusLabel = (k) => STATUS[k]?.label || k;
export const statusTone = (k) => STATUS[k]?.tone || 'muted';

// Tabs used in the exchanges list (combines related backend statuses).
export const STATUS_TABS = [
	{ key: 'all', label: 'All' },
	{ key: 'pending', label: 'Pending' },
	{ key: 'counter_offered', label: 'Negotiating' },
	{ key: 'accepted', label: 'Accepted' },
	{ key: 'fully_completed', label: 'Done' },
	{ key: 'disputed', label: 'Disputed' },
];

export const DISPUTE_REASONS = [
	'Item not as described',
	'Item missing or incomplete',
	'Seller did not show up',
	'Buyer did not show up',
	'Counterfeit or fake item',
	'Other',
];
