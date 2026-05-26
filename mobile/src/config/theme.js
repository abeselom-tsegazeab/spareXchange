// Mirrors frontend/src/index.css — :root tokens (light) and .dark (hsl-derived).
// Use ThemeProvider + useTheme() so colors/spacing/theme track system appearance.

/** @deprecated Import useTheme(); static colors are LIGHT-only fallback (tests/scripts). */

const BORDER_LIGHT = 'rgba(0, 0, 0, 0.1)';

// ── Semantic palettes (named like CSS vars) ─────────────────────────────────

export const palettes = {
	light: {
		background: '#FFFFFF',
		foreground: '#252525',
		card: '#FFFFFF',
		cardForeground: '#252525',

		popover: '#FFFFFF',
		popoverForeground: '#252525',

		primary: '#16A34A',
		primaryForeground: '#FFFFFF',

		secondary: '#DCFCE7',
		secondaryForeground: '#166534',

		accent: '#BBF7D0',
		accentForeground: '#166534',

		muted: '#F3F4F6',
		mutedForeground: '#6B7280',

		destructive: '#D4183D',
		destructiveForeground: '#FFFFFF',

		border: BORDER_LIGHT,
		borderSubtle: BORDER_LIGHT,

		input: 'transparent',
		inputBackground: '#F9FAFB',

		ring: '#16A34A',

		tabBarInactive: '#6B7280',

		iconMuted: '#6B7280',
		success: '#16A34A',
		successMuted: '#ECFDF5',
		successBorder: '#BBF7D0',
		warning: '#D97706',
		warningMuted: '#FFFBEB',
		info: '#2563EB',
		infoMuted: '#EFF6FF',
		overlay: 'rgba(37, 37, 37, 0.45)',
	},

	dark: {
		background: '#131920',
		foreground: '#F4F4F5',

		card: '#161E28',
		cardForeground: '#F4F4F5',

		popover: '#161E28',
		popoverForeground: '#F4F4F5',

		primary: '#22C55E',
		primaryForeground: '#FFFFFF',

		secondary: '#14532D',
		secondaryForeground: '#BBF7D0',

		accent: '#1E293B',
		accentForeground: '#DCFCE7',

		muted: '#1F2937',
		mutedForeground: '#94A3B8',

		destructive: '#F87171',
		destructiveForeground: '#131920',

		border: '#2D3B4F',
		borderSubtle: 'rgba(255,255,255,0.08)',

		input: '#1F2937',
		inputBackground: '#1A222D',

		ring: '#22C55E',

		tabBarInactive: '#94A3B8',

		iconMuted: '#94A3B8',
		success: '#22C55E',
		successMuted: '#14532D',
		successBorder: '#166534',
		warning: '#FBBF24',
		warningMuted: '#422006',
		info: '#60A5FA',
		infoMuted: '#172554',
		overlay: 'rgba(0, 0, 0, 0.55)',
	},
};

// Legacy flat names (backward compat + easier migration path)
export const toLegacyColors = (p) => ({
	bg: p.background,
	surface: p.card,
	surfaceAlt: p.muted,
	text: p.foreground,
	textMuted: p.mutedForeground,
	textSubtle: p.iconMuted,
	textInverse: p.primaryForeground,
	primary: p.primary,
	primaryDark: p.secondaryForeground,
	primaryForeground: p.primaryForeground,
	primaryLight: p.secondary,
	accentWarm: p.warning,

	secondary: p.accentForeground,
	border: p.border,
	borderStrong: p.border,

	success: p.success,
	warning: p.warning,
	danger: p.destructive,
	info: p.info ?? '#1D4ED8',

	overlay: p.overlay,

	tabBarInactive: p.tabBarInactive,
	ring: p.ring,
	inputBackground: p.inputBackground,
	infoMuted: p.infoMuted,

	// Semantic extras (explicit)
	destructive: p.destructive,
	mutedBg: p.muted,
	accentTint: p.accent,
});

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

// 0.625rem → 10pt (RN density-independent)
export const radius = {
	xs: 6,
	sm: 8,
	md: 10,
	lg: 10,
	xl: 12,
	input: 10,
	card: 10,
	pill: 999,
};

export const createTypography = (semanticOrLegacy) => {
	const c =
		semanticOrLegacy && typeof semanticOrLegacy.foreground === 'string'
			? toLegacyColors(semanticOrLegacy)
			: semanticOrLegacy;
	return {
		h1: { fontSize: 30, fontWeight: '500', color: c.text, letterSpacing: -0.4 },
		h2: { fontSize: 24, fontWeight: '500', color: c.text, letterSpacing: -0.25 },
		h3: { fontSize: 20, fontWeight: '500', color: c.text },
		h4: { fontSize: 17, fontWeight: '500', color: c.text },
		body: { fontSize: 15, fontWeight: '400', color: c.text },
		bodyStrong: { fontSize: 15, fontWeight: '500', color: c.text },
		muted: { fontSize: 13, fontWeight: '400', color: c.textMuted },
		caption: { fontSize: 12, fontWeight: '500', color: c.textMuted },
		label: { fontSize: 13, fontWeight: '500', color: c.text },
		button: { fontSize: 15, fontWeight: '500', color: c.text },
		link: { fontSize: 14, fontWeight: '600', color: c.primaryDark },
	};
};

export const createShadow = (isDark) =>
	isDark
		? {
				sm: {
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 1 },
					shadowOpacity: 0.35,
					shadowRadius: 2,
					elevation: 2,
				},
				md: {
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.4,
					shadowRadius: 4,
					elevation: 4,
				},
				lg: {
					shadowColor: '#000',
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.45,
					shadowRadius: 8,
					elevation: 8,
				},
		  }
		: {
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
					shadowOpacity: 0.1,
					shadowRadius: 12,
					elevation: 6,
				},
		  };

/** @deprecated Prefer useTheme(); these are LIGHT-only for legacy imports */
export const colors = toLegacyColors(palettes.light);
export const typography = createTypography(palettes.light);
export const shadow = createShadow(false);
import { DarkTheme as NavDarkTheme, DefaultTheme as NavLightTheme } from '@react-navigation/native';

export const createNavigationTheme = (semanticPalette, isDarkMode) => {
	const base = isDarkMode ? NavDarkTheme : NavLightTheme;
	const borderRgb = isDarkMode ? '#2D3B4F' : '#E5E7EB';
	return {
		...base,
		colors: {
			...base.colors,
			primary: semanticPalette.primary,
			background: semanticPalette.background,
			card: semanticPalette.card,
			text: semanticPalette.cardForeground || semanticPalette.foreground,
			border: borderRgb,
			notification: semanticPalette.destructive,
		},
	};
};
