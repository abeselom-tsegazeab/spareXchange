import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Card = ({ children, onPress, style, flat = false, padding }) => {
	const { colors, radius, shadow: shadowTokens, spacing } = useTheme();
	const pad = padding ?? spacing.lg;

	const styles = useMemo(
		() =>
			StyleSheet.create({
				base: {
					backgroundColor: colors.surface,
					borderRadius: radius.card,
					borderWidth: 1,
					borderColor: colors.border,
				},
			}),
		[colors.surface, colors.border, radius.card]
	);

	const content = (
		<View
			style={[
				styles.base,
				{ padding: pad },
				!flat && shadowTokens.sm,
				style,
			]}
		>
			{children}
		</View>
	);

	if (onPress) {
		return (
			<Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
				{content}
			</Pressable>
		);
	}
	return content;
};

export default Card;
