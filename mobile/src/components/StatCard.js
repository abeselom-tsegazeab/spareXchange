import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing, typography } from '../config/theme';

export default function StatCard({ label, value, hint, onPress, tone = 'default' }) {
	const bg =
		tone === 'warning' ? '#FEF3C7' : tone === 'danger' ? '#FEE2E2' : tone === 'success' ? '#D1FAE5' : colors.surface;

	const content = (
		<View style={[styles.card, shadow.sm, { backgroundColor: bg }]}>
			<Text style={styles.value}>{value ?? '—'}</Text>
			<Text style={typography.bodyStrong}>{label}</Text>
			{hint ? <Text style={typography.caption}>{hint}</Text> : null}
		</View>
	);

	if (onPress) {
		return (
			<Pressable onPress={onPress} style={({ pressed }) => [styles.wrap, pressed && { opacity: 0.9 }]}>
				{content}
			</Pressable>
		);
	}
	return <View style={styles.wrap}>{content}</View>;
}

const styles = StyleSheet.create({
	wrap: { width: '48%', marginBottom: spacing.md },
	card: {
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
		minHeight: 96,
	},
	value: { ...typography.h2, color: colors.primaryDark, marginBottom: 4 },
});
