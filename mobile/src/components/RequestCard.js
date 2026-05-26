import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../config/theme';
import {
	priorityColor,
	priorityLabel,
	serviceIcon,
	serviceLabel,
	statusLabel,
	statusTone,
	STATUS_TONE_COLORS,
} from '../config/serviceCatalog';

const RequestCard = ({ request, onPress, showCustomer = false }) => {
	const tone = statusTone(request?.status);
	const palette = STATUS_TONE_COLORS[tone] || STATUS_TONE_COLORS.muted;
	const pColor = priorityColor(request?.priority);

	return (
		<Pressable
			onPress={() => onPress?.(request)}
			style={({ pressed }) => [styles.card, shadow.sm, pressed && { opacity: 0.85 }]}
		>
			<View style={styles.headRow}>
				<View style={styles.iconBox}>
					<Text style={{ fontSize: 22 }}>{serviceIcon(request?.serviceType)}</Text>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={typography.bodyStrong} numberOfLines={1}>
						{serviceLabel(request?.serviceType)}
					</Text>
					<Text style={typography.caption} numberOfLines={2}>
						{request?.description}
					</Text>
					<View style={styles.pillRow}>
						<View style={[styles.pill, { backgroundColor: palette.bg }]}>
							<Text style={[styles.pillText, { color: palette.fg }]}>{statusLabel(request?.status)}</Text>
						</View>
						<View style={[styles.pill, { backgroundColor: pColor }]}>
							<Text style={[styles.pillText, { color: '#fff' }]}>{priorityLabel(request?.priority)}</Text>
						</View>
						{request?.quotes?.length ? (
							<View style={[styles.pill, { backgroundColor: '#E0E7FF' }]}>
								<Text style={[styles.pillText, { color: '#3730A3' }]}>
									{request.quotes.length} quote{request.quotes.length === 1 ? '' : 's'}
								</Text>
							</View>
						) : null}
					</View>
				</View>
			</View>
			<View style={styles.metaRow}>
				<Text style={typography.caption} numberOfLines={1}>📍 {request?.location}</Text>
				{request?.budgetMin != null || request?.budgetMax != null ? (
					<Text style={typography.caption}>
						Budget: ETB {request.budgetMin ?? '?'} – {request.budgetMax ?? '?'}
					</Text>
				) : null}
			</View>
			{showCustomer && request?.userId?.name ? (
				<Text style={[typography.caption, { marginTop: 4 }]}>Customer: {request.userId.name}</Text>
			) : null}
		</Pressable>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
		marginBottom: spacing.md,
	},
	headRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
	iconBox: {
		width: 48,
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.surfaceAlt,
		alignItems: 'center',
		justifyContent: 'center',
	},
	pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
	pill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill, marginRight: spacing.xs, marginTop: spacing.xs },
	pillText: { ...typography.caption, fontWeight: '800', fontSize: 11 },
	metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.md, gap: spacing.md },
});

export default RequestCard;
