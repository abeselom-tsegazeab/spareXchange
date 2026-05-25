import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../config/theme';

const palette = {
	info: { bg: '#EFF6FF', border: '#BFDBFE', icon: '#1D4ED8', text: '#1E3A8A' },
	success: { bg: '#ECFDF5', border: '#A7F3D0', icon: '#047857', text: '#064E3B' },
	warning: { bg: '#FFFBEB', border: '#FDE68A', icon: '#B45309', text: '#78350F' },
	danger: { bg: '#FEF2F2', border: '#FECACA', icon: '#B91C1C', text: '#7F1D1D' },
};

const icons = {
	info: 'i',
	success: '✓',
	warning: '!',
	danger: '✕',
};

const Banner = ({ tone = 'info', title, message, style }) => {
	const p = palette[tone] || palette.info;
	return (
		<View style={[styles.wrap, { backgroundColor: p.bg, borderColor: p.border }, style]}>
			<View style={[styles.iconBadge, { borderColor: p.icon }]}>
				<Text style={{ color: p.icon, fontWeight: '900' }}>{icons[tone]}</Text>
			</View>
			<View style={{ flex: 1 }}>
				{title ? <Text style={[styles.title, { color: p.text }]}>{title}</Text> : null}
				{message ? <Text style={[styles.message, { color: p.text }]}>{message}</Text> : null}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrap: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: spacing.md,
		padding: spacing.md,
		borderRadius: radius.md,
		borderWidth: 1,
		marginBottom: spacing.lg,
	},
	iconBadge: {
		width: 24,
		height: 24,
		borderRadius: 12,
		borderWidth: 1.5,
		alignItems: 'center',
		justifyContent: 'center',
	},
	title: { ...typography.bodyStrong, marginBottom: 2 },
	message: { ...typography.muted, color: colors.text },
});

export default Banner;
