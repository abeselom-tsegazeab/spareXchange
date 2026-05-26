import React, { useState, useMemo } from 'react';
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';

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
	const { colors, typography, radius, spacing } = useTheme();
	const [focused, setFocused] = useState(false);
	const [hidden, setHidden] = useState(secureTextEntry);

	const styles = useMemo(
		() =>
			StyleSheet.create({
				fieldRowBase: {
					flexDirection: 'row',
					alignItems: 'center',
					borderWidth: 1,
					borderRadius: radius.input,
					paddingHorizontal: spacing.md,
					minHeight: 48,
				},
				inputInner: {
					flex: 1,
					fontSize: 15,
					fontWeight: '400',
					color: colors.text,
					paddingVertical: 0,
				},
			}),
		[colors.text, radius.input, spacing.md]
	);

	const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

	return (
		<View style={[ { marginBottom: spacing.lg }, style]}>
			{label ? <Text style={[typography.label, stylesWrap.mb]}>{label}</Text> : null}
			<View
				style={[
					styles.fieldRowBase,
					{
						borderColor,
						backgroundColor: editable ? colors.inputBackground : colors.surfaceAlt,
					},
					multiline && { minHeight: 96, alignItems: 'flex-start', paddingVertical: spacing.md },
				]}
			>
				{leftIcon ? <View style={stylesWrap.left}>{leftIcon}</View> : null}
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
						onFocus?.(e);
					}}
					onBlur={(e) => {
						setFocused(false);
						onBlur?.(e);
					}}
					style={[styles.inputInner, inputStyle]}
				/>
				{secureTextEntry ? (
					<Pressable hitSlop={8} onPress={() => setHidden((h) => !h)} style={stylesWrap.right}>
						<Text style={[typography.caption, stylesWrap.toggle, { color: colors.primary }]}>
							{hidden ? 'Show' : 'Hide'}
						</Text>
					</Pressable>
				) : rightAccessory ? (
					<View style={stylesWrap.right}>{rightAccessory}</View>
				) : null}
			</View>
			{error ? (
				<Text style={[typography.caption, stylesWrap.mt, { color: colors.danger }]}>{error}</Text>
			) : helper ? (
				<Text style={[typography.caption, stylesWrap.mt, { color: colors.textMuted }]}>{helper}</Text>
			) : null}
		</View>
	);
};

const stylesWrap = StyleSheet.create({
	mb: { marginBottom: 4 },
	left: { marginRight: 8 },
	right: { marginLeft: 8, paddingHorizontal: 4 },
	toggle: { fontWeight: '600' },
	mt: { marginTop: 4 },
});

export default Input;
