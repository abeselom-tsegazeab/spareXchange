import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const tones = {
	info: { icon: '#2563EB' },
	success: { icon: '#16A34A' },
	warning: { icon: '#D97706' },
	danger: { icon: '#D4183D' },
};

const icons = {
	info: 'i',
	success: '✓',
	warning: '!',
	danger: '✕',
};

const Banner = ({ tone = 'info', title, message, style }) => {
	const { colors, typography, radius, spacing, isDark } = useTheme();
	const iconsMeta = tones[tone] || tones.info;

	const palette = useMemo(() => {
		if (tone === 'danger')
			return isDark
				? {
						bg: 'rgba(248,113,113,0.14)',
						border: 'rgba(248,113,113,0.45)',
						text: '#FECACA',
					}
				: {
						bg: '#FEF2F2',
						border: 'rgba(212,24,61,0.25)',
						text: '#7F1D1D',
					};
		if (tone === 'success')
			return isDark
				? { bg: 'rgba(34,197,94,0.14)', border: 'rgba(34,197,94,0.35)', text: '#BBF7D0' }
				: { bg: '#ECFDF5', border: 'rgba(22,163,74,0.28)', text: '#14532D' };
		if (tone === 'warning')
			return isDark
				? { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)', text: '#FDE68A' }
				: { bg: '#FFFBEB', border: 'rgba(217,119,6,0.25)', text: '#78350F' };
		return isDark
			? { bg: colors.infoMuted ?? 'rgba(37,99,235,0.15)', border: 'rgba(96,165,250,0.35)', text: '#BFDBFE' }
			: { bg: '#EFF6FF', border: 'rgba(37,99,235,0.22)', text: '#1E3A8A' };
	}, [tone, isDark, colors]);

	return (
		<View
			style={[
				styles.wrap,
				{
					backgroundColor: palette.bg,
					borderColor: palette.border,
					padding: spacing.md,
					marginBottom: spacing.lg,
					borderRadius: radius.md,
					gap: spacing.md,
				},
				style,
			]}
		>
			<View style={[styles.iconBadge, { borderColor: iconsMeta.icon }]}>
				<Text style={{ color: iconsMeta.icon, fontWeight: '700' }}>{icons[tone]}</Text>
			</View>
			<View style={{ flex: 1 }}>
				{title ? (
					<Text style={[typography.bodyStrong, { color: palette.text, marginBottom: 2 }]}>{title}</Text>
				) : null}
				{message ? (
					<Text style={[typography.muted, { color: palette.text }]}>{message}</Text>
				) : null}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrap: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		borderWidth: 1,
	},
	iconBadge: {
		width: 26,
		height: 26,
		borderRadius: 13,
		borderWidth: 1.5,
		alignItems: 'center',
		justifyContent: 'center',
	},
});

export default Banner;
