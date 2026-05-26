import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Chip = ({ label, active, onPress, onRemove, style, disabled }) => {
	const { colors, typography, radius, spacing } = useTheme();

	const styles = useMemo(
		() =>
			StyleSheet.create({
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
			}),
		[spacing.md, spacing.xs, radius.pill]
	);

	const inactiveSkin = { backgroundColor: colors.surface, borderColor: colors.border };
	const activeSkin = { backgroundColor: colors.primary, borderColor: colors.primary };

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled}
			style={({ pressed }) => [
				styles.base,
				active ? activeSkin : inactiveSkin,
				pressed && !disabled && { opacity: 0.78 },
				style,
			]}
			hitSlop={6}
		>
			<Text
				style={[
					typography.caption,
					active ? { color: colors.textInverse, fontWeight: '600' } : { color: colors.text },
				]}
				numberOfLines={1}
			>
				{label}
			</Text>
			{onRemove && active ? (
				<Text onPress={onRemove} style={{ color: colors.textInverse, fontWeight: '800' }}>
					{'  ×'}
				</Text>
			) : null}
		</Pressable>
	);
};

export default Chip;
