import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadow, spacing } from '../config/theme';

const Card = ({ children, onPress, style, flat = false, padding = spacing.lg }) => {
	const content = (
		<View
			style={[
				styles.base,
				{ padding },
				!flat && shadow.sm,
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

const styles = StyleSheet.create({
	base: {
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
	},
});

export default Card;
