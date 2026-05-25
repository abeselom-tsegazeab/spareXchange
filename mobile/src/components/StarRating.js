import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '../config/theme';

export default function StarRating({ value = 0, onChange, size = 28, readonly = false }) {
	const stars = [1, 2, 3, 4, 5];
	return (
		<View style={styles.row}>
			{stars.map((n) => {
				const filled = n <= value;
				const Star = (
					<Text style={[styles.star, { fontSize: size, color: filled ? '#F59E0B' : colors.border }]}>
						★
					</Text>
				);
				if (readonly || !onChange) return <View key={n}>{Star}</View>;
				return (
					<Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>
						{Star}
					</Pressable>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: 'row', gap: spacing.xs },
	star: { fontWeight: '900' },
});
