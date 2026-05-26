import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '../config/theme';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';

const EmptyState = ({ icon = '∅', title, message, actionLabel, onAction, style }) => {
	const { colors, typography, radius, colorScheme } = useTheme();

	const styles = useMemo(
		() =>
			StyleSheet.create({
				wrap: {
					alignItems: 'center',
					justifyContent: 'center',
					paddingVertical: spacing.huge,
					paddingHorizontal: spacing.lg,
				},
				iconBox: {
					width: 72,
					height: 72,
					borderRadius: radius.card,
					backgroundColor: colors.surfaceAlt,
					alignItems: 'center',
					justifyContent: 'center',
					marginBottom: spacing.md,
				},
				icon: { fontSize: 32, color: colors.textMuted, fontWeight: '800' },
				title: { ...typography.h3, textAlign: 'center' },
				message: { ...typography.muted, textAlign: 'center', marginTop: spacing.xs, maxWidth: 320 },
			}),
		[colorScheme]
	);

	return (
		<View style={[styles.wrap, style]}>
			<View style={styles.iconBox}>
				<Text style={styles.icon}>{icon}</Text>
			</View>
			{title ? <Text style={styles.title}>{title}</Text> : null}
			{message ? <Text style={styles.message}>{message}</Text> : null}
			{actionLabel && onAction ? (
				<View style={{ marginTop: spacing.lg, alignSelf: 'stretch' }}>
					<Button title={actionLabel} onPress={onAction} />
				</View>
			) : null}
		</View>
	);
};

export default EmptyState;
