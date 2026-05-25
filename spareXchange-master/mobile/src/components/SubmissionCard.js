import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../config/theme';
import { itemIcon, itemLabel } from '../config/ecoCatalog';

const STATUS_PALETTE = {
	pending: { bg: '#FEF3C7', fg: '#92400E', label: 'Pending' },
	approved: { bg: '#D1FAE5', fg: '#065F46', label: 'Approved' },
	completed: { bg: '#DBEAFE', fg: '#1E40AF', label: 'Completed' },
	rejected: { bg: '#FEE2E2', fg: '#991B1B', label: 'Rejected' },
};

const SubmissionCard = ({ submission, onPress, style }) => {
	const palette = STATUS_PALETTE[submission?.status] || STATUS_PALETTE.pending;

	return (
		<Pressable
			onPress={() => onPress?.(submission)}
			style={({ pressed }) => [styles.card, shadow.sm, pressed && { opacity: 0.85 }, style]}
		>
			<View style={styles.iconBox}>
				<Text style={{ fontSize: 24 }}>{itemIcon(submission?.itemType)}</Text>
			</View>
			<View style={{ flex: 1 }}>
				<Text style={typography.bodyStrong} numberOfLines={1}>
					{itemLabel(submission?.itemType)}
				</Text>
				<Text style={typography.caption} numberOfLines={2}>
					{submission?.itemDescription}
				</Text>
				<View style={styles.metaRow}>
					<View style={[styles.pill, { backgroundColor: palette.bg }]}>
						<Text style={[styles.pillText, { color: palette.fg }]}>{palette.label}</Text>
					</View>
					<Text style={styles.points}>+{submission?.ecoPointsEarned || 0} pts</Text>
				</View>
				<Text style={styles.location} numberOfLines={1}>
					📍 {submission?.location}
				</Text>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		gap: spacing.md,
		padding: spacing.md,
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		marginBottom: spacing.md,
	},
	iconBox: {
		width: 56,
		height: 56,
		borderRadius: radius.md,
		backgroundColor: colors.surfaceAlt,
		alignItems: 'center',
		justifyContent: 'center',
	},
	metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs, gap: spacing.sm },
	pill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill },
	pillText: { ...typography.caption, fontWeight: '800' },
	points: { ...typography.caption, fontWeight: '800', color: colors.primaryDark },
	location: { ...typography.caption, color: colors.textMuted, marginTop: 4 },
});

export default SubmissionCard;
