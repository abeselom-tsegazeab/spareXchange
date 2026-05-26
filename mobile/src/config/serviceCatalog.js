// Enums + helpers for technician services. Mirrors
// backend/models/technicianRequest.model.js.

export const SERVICE_TYPES = [
	{ key: 'repair', label: 'Repair', icon: '🔧' },
	{ key: 'installation', label: 'Installation', icon: '🛠' },
	{ key: 'maintenance', label: 'Maintenance', icon: '🧰' },
	{ key: 'diagnosis', label: 'Diagnosis', icon: '🔍' },
	{ key: 'Engine Repair', label: 'Engine repair', icon: '🚗' },
	{ key: 'other', label: 'Other', icon: '🔩' },
];

export const PRIORITIES = [
	{ key: 'low', label: 'Low', color: '#9CA3AF' },
	{ key: 'medium', label: 'Medium', color: '#3B82F6' },
	{ key: 'high', label: 'High', color: '#F59E0B' },
	{ key: 'urgent', label: 'Urgent', color: '#EF4444' },
];

export const REQUEST_STATUSES = {
	pending: { label: 'Pending', tone: 'warning' },
	quoted: { label: 'Quoted', tone: 'info' },
	accepted: { label: 'Hired', tone: 'success' },
	'in-progress': { label: 'In progress', tone: 'info' },
	arrived: { label: 'Tech arrived', tone: 'info' },
	started: { label: 'Work in progress', tone: 'info' },
	completed: { label: 'Completed', tone: 'success' },
	cancelled: { label: 'Cancelled', tone: 'muted' },
};

export const STATUS_TONE_COLORS = {
	warning: { bg: '#FEF3C7', fg: '#92400E' },
	info: { bg: '#E0E7FF', fg: '#3730A3' },
	success: { bg: '#D1FAE5', fg: '#065F46' },
	muted: { bg: '#F3F4F6', fg: '#374151' },
	danger: { bg: '#FEE2E2', fg: '#991B1B' },
};

export const STATUS_TABS = [
	{ key: 'all', label: 'All' },
	{ key: 'pending', label: 'Pending' },
	{ key: 'quoted', label: 'Quoted' },
	{ key: 'accepted', label: 'Hired' },
	{ key: 'started', label: 'Active' },
	{ key: 'completed', label: 'Done' },
	{ key: 'cancelled', label: 'Cancelled' },
];

export const serviceLabel = (k) => SERVICE_TYPES.find((s) => s.key === k)?.label || k;
export const serviceIcon = (k) => SERVICE_TYPES.find((s) => s.key === k)?.icon || '🔩';
export const priorityColor = (k) => PRIORITIES.find((p) => p.key === k)?.color || '#9CA3AF';
export const priorityLabel = (k) => PRIORITIES.find((p) => p.key === k)?.label || k;
export const statusLabel = (k) => REQUEST_STATUSES[k]?.label || k;
export const statusTone = (k) => REQUEST_STATUSES[k]?.tone || 'muted';
