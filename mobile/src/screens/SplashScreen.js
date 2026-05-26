import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { spacing } from '../config/theme';
import Logo from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

export default function SplashScreen() {
	const { colors } = useTheme();
	const styles = useMemo(
		() =>
			StyleSheet.create({
				wrap: {
					flex: 1,
					backgroundColor: colors.bg,
					alignItems: 'center',
					justifyContent: 'center',
				},
			}),
		[colors.bg]
	);

	return (
		<View style={styles.wrap}>
			<Logo size="lg" />
			<ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
		</View>
	);
}
