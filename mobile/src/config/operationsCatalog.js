// Report moderation enums (backend/models/report.model.js).

export const REPORT_STATUSES = [
	{ key: 'pending', label: 'Pending', tone: 'warning' },
	{ key: 'reviewed', label: 'Reviewed', tone: 'info' },
	{ key: 'resolved', label: 'Resolved', tone: 'success' },
	{ key: 'dismissed', label: 'Dismissed', tone: 'muted' },
];

export const REPORT_REASONS = [
	{ key: 'inaccurate', label: 'Inaccurate' },
	{ key: 'fraud', label: 'Fraud' },
	{ key: 'repost', label: 'Repost / spam' },
	{ key: 'offensive', label: 'Offensive' },
	{ key: 'other', label: 'Other' },
];

export const MODERATOR_ACTIONS = [
	{ key: null, label: 'No extra action' },
	{ key: 'warn_user', label: 'Warn user' },
	{ key: 'remove_listing', label: 'Remove listing' },
	{ key: 'ban_user', label: 'Ban user' },
];

export const reportStatusLabel = (k) => REPORT_STATUSES.find((s) => s.key === k)?.label || k;
export const reportReasonLabel = (k) => REPORT_REASONS.find((r) => r.key === k)?.label || k;
