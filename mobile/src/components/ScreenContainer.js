import React from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../config/theme';

const ScreenContainer = ({
	children,
	scroll = false,
	keyboard = false,
	padded = true,
	background = colors.bg,
	contentContainerStyle,
	edges = ['top', 'left', 'right'],
	bottomBar,
}) => {
	const padStyle = padded ? { padding: spacing.lg } : null;

	const inner = scroll ? (
		<ScrollView
			contentContainerStyle={[padStyle, contentContainerStyle]}
			keyboardShouldPersistTaps="handled"
			showsVerticalScrollIndicator={false}
		>
			{children}
		</ScrollView>
	) : (
		<View style={[{ flex: 1 }, padStyle, contentContainerStyle]}>{children}</View>
	);

	const body = keyboard ? (
		<KeyboardAvoidingView
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
			style={{ flex: 1 }}
			keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
		>
			{inner}
		</KeyboardAvoidingView>
	) : (
		inner
	);

	return (
		<SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: background }]}>
			{body}
			{bottomBar ? <View style={styles.bottomBar}>{bottomBar}</View> : null}
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	safe: { flex: 1 },
	bottomBar: {
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.md,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		backgroundColor: colors.surface,
	},
});

export default ScreenContainer;
