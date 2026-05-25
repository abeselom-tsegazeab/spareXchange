// Enums for Module 7 — messaging, reviews, platform disputes.

export const DISPUTE_REASONS = [
	{ key: 'not_as_described', label: 'Not as described' },
	{ key: 'no_show', label: 'No show' },
	{ key: 'harassment', label: 'Harassment' },
	{ key: 'scam', label: 'Scam / fraud' },
	{ key: 'other', label: 'Other' },
];

export const NOTIFICATION_ICONS = {
	listing: '📦',
	'technician-request': '🔧',
	recycling: '♻️',
	system: 'ℹ️',
	message: '💬',
	'eco-points': '🌱',
	verification: '✓',
	match: '🔔',
	exchange_proposed: '🤝',
	exchange_status_updated: '🔄',
	exchange_counter_offered: '↔️',
	exchange_completed: '✅',
	exchange_expired: '⏱',
	exchange_disputed: '⚑',
	exchange_dispute_resolved: '✓',
};

export const notificationIcon = (type) => NOTIFICATION_ICONS[type] || '🔔';

export const disputeLabel = (k) => DISPUTE_REASONS.find((r) => r.key === k)?.label || k;
