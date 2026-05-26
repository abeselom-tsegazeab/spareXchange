import React from 'react';
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

const Button = ({
	title,
	onPress,
	loading = false,
	disabled = false,
	variant = 'primary',
	size = 'md',
	leftIcon,
	rightIcon,
	style,
	fullWidth = true,
}) => {
	const { colors, typography, radius, spacing } = useTheme();
	const v = variantStyle(variant, disabled || loading, colors, typography);
	const s = sizeStyle(size);

	return (
		<Pressable
			onPress={onPress}
			disabled={disabled || loading}
			style={({ pressed }) => [
				styles.base,
				{ borderRadius: radius.card },
				v.container,
				s.container,
				fullWidth && { alignSelf: 'stretch' },
				pressed && !disabled && !loading && { opacity: 0.85 },
				style,
			]}
			accessibilityRole="button"
			accessibilityState={{ disabled: disabled || loading, busy: loading }}
		>
			{loading ? (
				<ActivityIndicator color={v.label.color} />
			) : (
				<View style={styles.row}>
					{leftIcon ? <View style={{ marginRight: spacing.sm }}>{leftIcon}</View> : null}
					<Text style={[v.label, s.label]} numberOfLines={1}>
						{title}
					</Text>
					{rightIcon ? <View style={{ marginLeft: spacing.sm }}>{rightIcon}</View> : null}
				</View>
			)}
		</Pressable>
	);
};

const variantStyle = (variant, dimmed, colors, typography) => {
	const dimColor = dimmed ? colors.textSubtle : null;
	switch (variant) {
		case 'secondary':
			return {
				container: {
					backgroundColor: colors.surface,
					borderWidth: 1,
					borderColor: dimColor || colors.border,
				},
				label: { ...typography.bodyStrong, color: dimColor || colors.text },
			};
		case 'ghost':
			return {
				container: { backgroundColor: 'transparent' },
				label: { ...typography.bodyStrong, color: dimColor || colors.primaryDark },
			};
		case 'danger':
			return {
				container: {
					backgroundColor: dimColor || colors.danger,
				},
				label: {
					...typography.bodyStrong,
					color: '#FFFFFF',
				},
			};
		case 'primary':
		default:
			return {
				container: { backgroundColor: dimColor || colors.primary },
				label: {
					...typography.bodyStrong,
					color: colors.textInverse,
				},
			};
	}
};

const sizeStyle = (size) => {
	switch (size) {
		case 'sm':
			return {
				container: { paddingVertical: 8, paddingHorizontal: 14, minHeight: 36 },
				label: { fontSize: 13 },
			};
		case 'lg':
			return {
				container: { paddingVertical: 16, paddingHorizontal: 20, minHeight: 54 },
				label: { fontSize: 17 },
			};
		case 'md':
		default:
			return {
				container: { paddingVertical: 13, paddingHorizontal: 18, minHeight: 48 },
				label: { fontSize: 15 },
			};
	}
};

const styles = StyleSheet.create({
	base: {
		alignItems: 'center',
		justifyContent: 'center',
	},
	row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
});

export default Button;
