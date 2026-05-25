import React, { useState } from 'react';
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../config/theme';

const Input = ({
	label,
	value,
	onChangeText,
	placeholder,
	error,
	helper,
	secureTextEntry = false,
	keyboardType = 'default',
	autoCapitalize = 'sentences',
	autoCorrect = true,
	multiline = false,
	numberOfLines,
	maxLength,
	leftIcon,
	rightAccessory,
	onBlur,
	onFocus,
	editable = true,
	style,
	inputStyle,
}) => {
	const [focused, setFocused] = useState(false);
	const [hidden, setHidden] = useState(secureTextEntry);

	const borderColor = error
		? colors.danger
		: focused
			? colors.primary
			: colors.border;

	return (
		<View style={[styles.wrap, style]}>
			{label ? <Text style={styles.label}>{label}</Text> : null}
			<View
				style={[
					styles.fieldRow,
					{ borderColor, backgroundColor: editable ? colors.surface : colors.surfaceAlt },
					multiline && { minHeight: 96, alignItems: 'flex-start', paddingVertical: spacing.md },
				]}
			>
				{leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
				<TextInput
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor={colors.textSubtle}
					secureTextEntry={hidden}
					keyboardType={keyboardType}
					autoCapitalize={autoCapitalize}
					autoCorrect={autoCorrect}
					multiline={multiline}
					numberOfLines={numberOfLines}
					maxLength={maxLength}
					editable={editable}
					onFocus={(e) => {
						setFocused(true);
						onFocus && onFocus(e);
					}}
					onBlur={(e) => {
						setFocused(false);
						onBlur && onBlur(e);
					}}
					style={[styles.input, inputStyle]}
				/>
				{secureTextEntry ? (
					<Pressable hitSlop={8} onPress={() => setHidden((h) => !h)} style={styles.rightIcon}>
						<Text style={styles.toggle}>{hidden ? 'Show' : 'Hide'}</Text>
					</Pressable>
				) : rightAccessory ? (
					<View style={styles.rightIcon}>{rightAccessory}</View>
				) : null}
			</View>
			{error ? (
				<Text style={styles.error}>{error}</Text>
			) : helper ? (
				<Text style={styles.helper}>{helper}</Text>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	wrap: { marginBottom: spacing.lg },
	label: { ...typography.label, marginBottom: spacing.xs },
	fieldRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: radius.lg,
		paddingHorizontal: spacing.md,
		minHeight: 48,
	},
	input: {
		flex: 1,
		fontSize: 15,
		color: colors.text,
		paddingVertical: 0,
	},
	leftIcon: { marginRight: spacing.sm },
	rightIcon: { marginLeft: spacing.sm, paddingHorizontal: spacing.xs },
	toggle: {
		...typography.caption,
		color: colors.primaryDark,
		fontWeight: '700',
	},
	error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
	helper: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});

export default Input;
