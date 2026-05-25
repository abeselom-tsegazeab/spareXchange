import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing, typography } from '../config/theme';

const Chip = ({ label, active, onPress, onRemove, style, disabled }) => {
	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => [
				styles.base,
				active ? styles.active : styles.inactive,
				pressed && !disabled && { opacity: 0.75 },
				style,
			]}
			hitSlop={6}
		>
			<Text style={[styles.label, active ? styles.labelActive : null]} numberOfLines={1}>
				{label}
			</Text>
			{onRemove && active ? (
				<Text onPress={onRemove} style={styles.x}>
					{'  ×'}
				</Text>
			) : null}
		</Pressable>
	);
};

const styles = StyleSheet.create({
	base: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: spacing.md,
		paddingVertical: 7,
		borderRadius: radius.pill,
		borderWidth: 1,
		marginRight: spacing.xs,
		marginBottom: spacing.xs,
	},
	inactive: { backgroundColor: colors.surface, borderColor: colors.border },
	active: { backgroundColor: colors.primary, borderColor: colors.primary },
	label: { ...typography.caption, color: colors.text, fontWeight: '600' },
	labelActive: { color: colors.textInverse },
	x: { color: colors.textInverse, fontWeight: '900' },
});

export default Chip;
