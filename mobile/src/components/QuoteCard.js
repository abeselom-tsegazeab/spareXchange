import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../config/theme';

const QuoteCard = ({ quote, isOwn, isAccepted, onAccept, accepting }) => {
	const tech = quote?.technicianId;
	const initial = (tech?.name || '?').charAt(0).toUpperCase();
	return (
		<View style={[styles.card, isAccepted && styles.cardAccepted]}>
			<View style={styles.headRow}>
				<View style={styles.avatar}>
					<Text style={styles.avatarText}>{initial}</Text>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={typography.bodyStrong}>{tech?.name || 'Technician'}</Text>
					<Text style={typography.caption}>
						{tech?.expertise ? `${tech.expertise} · ` : ''}Trust {tech?.trustScore ?? 80}/100
					</Text>
				</View>
				<View style={styles.priceBox}>
					<Text style={typography.muted}>ETB</Text>
					<Text style={styles.price}>{Number(quote?.estimatedCost || 0).toLocaleString()}</Text>
				</View>
			</View>
			{quote?.additionalNotes ? (
				<Text style={[typography.body, { marginTop: spacing.sm }]}>{quote.additionalNotes}</Text>
			) : null}
			{onAccept && !isAccepted ? (
				<Pressable
					onPress={() => onAccept?.(quote)}
					style={({ pressed }) => [styles.acceptBtn, pressed && { opacity: 0.85 }]}
					disabled={accepting}
				>
					<Text style={styles.acceptText}>{accepting ? 'Hiring...' : 'Hire this technician'}</Text>
				</Pressable>
			) : null}
			{isAccepted ? (
				<View style={styles.acceptedBadge}>
					<Text style={styles.acceptedText}>✓ Hired</Text>
				</View>
			) : null}
			{isOwn ? (
				<View style={[styles.acceptedBadge, { backgroundColor: '#E0E7FF' }]}>
					<Text style={[styles.acceptedText, { color: '#3730A3' }]}>This is your quote</Text>
				</View>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
		marginBottom: spacing.sm,
	},
	cardAccepted: { borderColor: colors.success, backgroundColor: '#ECFDF5' },
	headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	avatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarText: { color: '#fff', fontWeight: '900', fontSize: 18 },
	priceBox: { alignItems: 'flex-end' },
	price: { ...typography.h4 },
	acceptBtn: {
		marginTop: spacing.md,
		backgroundColor: colors.primary,
		paddingVertical: 12,
		borderRadius: radius.md,
		alignItems: 'center',
	},
	acceptText: { color: '#fff', fontWeight: '800' },
	acceptedBadge: {
		marginTop: spacing.md,
		alignSelf: 'flex-start',
		backgroundColor: '#D1FAE5',
		paddingHorizontal: spacing.sm,
		paddingVertical: 4,
		borderRadius: radius.pill,
	},
	acceptedText: { color: '#065F46', fontWeight: '800', fontSize: 12 },
});

export default QuoteCard;
