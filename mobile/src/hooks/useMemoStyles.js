/**
 * Keeps stylesheet colors in sync with light/dark (StyleSheet freezes values at definition time otherwise).
 *
 * deps should list theme fields that affect the stylesheet, e.g. [colors.border, colors.surface]
 */
import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export function useMemoStyles(factory, deps) {
	const theme = useTheme();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	return useMemo(() => factory(theme), deps ?? [theme.colorScheme]);
}

export function stylesWith(theme, factory) {
	return StyleSheet.create(factory(theme));
}
