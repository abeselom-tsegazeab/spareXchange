// SpareXChange Design System
// Centralized colors, typography, spacing, and shadows.

export const colors = {
	primary: '#10B981',          // Emerald green — sustainability theme
	primaryDark: '#059669',
	primaryLight: '#D1FAE5',

	secondary: '#0EA5E9',        // Sky blue — trust / community
	secondaryDark: '#0284C7',

	accent: '#F59E0B',           // Amber — eco-points / rewards

	bg: '#F9FAFB',
	surface: '#FFFFFF',
	surfaceAlt: '#F3F4F6',

	text: '#111827',
	textMuted: '#6B7280',
	textSubtle: '#9CA3AF',
	textInverse: '#FFFFFF',

	border: '#E5E7EB',
	borderStrong: '#D1D5DB',

	success: '#10B981',
	warning: '#F59E0B',
	danger: '#EF4444',
	info: '#3B82F6',

	overlay: 'rgba(17, 24, 39, 0.45)',
};

export const spacing = {
	xxs: 2,
	xs: 4,
	sm: 8,
	md: 12,
	lg: 16,
	xl: 20,
	xxl: 24,
	xxxl: 32,
	huge: 48,
};

export const radius = {
	sm: 6,
	md: 10,
	lg: 14,
	xl: 20,
	pill: 999,
};

export const typography = {
	h1: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
	h2: { fontSize: 24, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
	h3: { fontSize: 20, fontWeight: '700', color: colors.text },
	h4: { fontSize: 17, fontWeight: '600', color: colors.text },
	body: { fontSize: 15, fontWeight: '400', color: colors.text },
	bodyStrong: { fontSize: 15, fontWeight: '600', color: colors.text },
	muted: { fontSize: 13, fontWeight: '400', color: colors.textMuted },
	caption: { fontSize: 12, fontWeight: '500', color: colors.textSubtle },
	label: { fontSize: 13, fontWeight: '600', color: colors.text },
};

export const shadow = {
	sm: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 2,
		elevation: 1,
	},
	md: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.08,
		shadowRadius: 6,
		elevation: 3,
	},
	lg: {
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 6 },
		shadowOpacity: 0.10,
		shadowRadius: 12,
		elevation: 6,
	},
};

export default { colors, spacing, radius, typography, shadow };
