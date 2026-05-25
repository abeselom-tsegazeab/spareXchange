import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors, spacing } from '../config/theme';
import Logo from '../components/Logo';

export default function SplashScreen() {
	return (
		<View style={styles.wrap}>
			<Logo size="lg" />
			<ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: {
		flex: 1,
		backgroundColor: colors.bg,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
