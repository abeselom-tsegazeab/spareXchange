import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius, spacing, typography } from '../config/theme';
import { STATUS_TONE_COLORS, statusLabel, statusTone } from '../config/exchangeStatus';

const StatusPill = ({ status, style }) => {
	const tone = statusTone(status);
	const palette = STATUS_TONE_COLORS[tone] || STATUS_TONE_COLORS.muted;
	return (
		<View style={[styles.pill, { backgroundColor: palette.bg }, style]}>
			<Text style={[styles.text, { color: palette.fg }]}>{statusLabel(status)}</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	pill: {
		alignSelf: 'flex-start',
		paddingHorizontal: spacing.sm,
		paddingVertical: 4,
		borderRadius: radius.pill,
	},
	text: { ...typography.caption, fontWeight: '800' },
});

export default StatusPill;
