// Mirrors frontend/src/index.css :root / .dark tokens — use useTheme() in UI.

import React, { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import {
	palettes,
	spacing,
	radius,
	createTypography,
	createShadow,
	createNavigationTheme,
	toLegacyColors,
} from '../config/theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
	const systemScheme = useColorScheme() || 'light';
	const [forcedScheme, setForcedScheme] = useState(null);
	const colorScheme = forcedScheme || systemScheme;
	const isDark = colorScheme === 'dark';

	const value = useMemo(() => {
		const raw = isDark ? palettes.dark : palettes.light;
		const colors = toLegacyColors(raw);
		const typography = createTypography(raw);
		const shadow = createShadow(isDark);
		const navigationTheme = createNavigationTheme(raw, isDark);
		return {
			colorScheme,
			isDark,
			colors,
			typography,
			spacing,
			radius,
			shadow,
			navigationTheme,
			setColorScheme: setForcedScheme,
		};
	}, [colorScheme, isDark]);

	return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error('useTheme must be used inside ThemeProvider');
	}
	return ctx;
}

/** Safe for modules that render outside Provider (tests, storybook fallback). */
export function useMaybeTheme() {
	return useContext(ThemeContext);
}

export default ThemeProvider;
