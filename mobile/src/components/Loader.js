import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../config/theme';

const Loader = ({ label, fullscreen = false }) => {
	return (
		<View style={[styles.wrap, fullscreen && styles.fullscreen]}>
			<ActivityIndicator size="large" color={colors.primary} />
			{label ? <Text style={styles.label}>{label}</Text> : null}
		</View>
	);
};

const styles = StyleSheet.create({
	wrap: { alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
	fullscreen: { flex: 1, backgroundColor: colors.bg },
	label: { ...typography.muted, marginTop: spacing.md },
});

export default Loader;
