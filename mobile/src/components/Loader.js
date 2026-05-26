import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { spacing } from '../config/theme';
import { useTheme } from '../context/ThemeContext';

const Loader = ({ label, fullscreen = false }) => {
	const { colors, typography, colorScheme } = useTheme();
	const styles = useMemo(
		() =>
			StyleSheet.create({
				wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
				fullscreen: { flex: 1, backgroundColor: colors.bg },
				label: { ...typography.muted, marginTop: spacing.md },
			}),
		[colorScheme, colors.bg]
	);

	return (
		<View style={[styles.wrap, fullscreen && styles.fullscreen]}>
			<ActivityIndicator size="large" color={colors.primary} />
			{label ? <Text style={styles.label}>{label}</Text> : null}
		</View>
	);
};

export default Loader;
