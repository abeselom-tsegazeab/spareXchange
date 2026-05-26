import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../config/theme';
import { tierProgress } from '../config/ecoCatalog';

const EcoTierCard = ({ points = 0, name, compact = false }) => {
	const { tier, pct, toNext, max } = tierProgress(points);

	return (
		<View style={[styles.card, compact && styles.compact, { borderColor: tier.color }]}>
			<View style={[styles.badge, { backgroundColor: tier.color }]}>
				<Text style={styles.badgeText}>{tier.key}</Text>
			</View>
			<View style={{ flex: 1, marginLeft: spacing.md }}>
				<Text style={typography.muted}>{name ? `${name}'s EcoTier` : 'Your EcoTier'}</Text>
				<Text style={styles.points}>
					{points.toLocaleString()} <Text style={typography.muted}>EcoPoints</Text>
				</Text>
				<View style={styles.progressTrack}>
					<View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: tier.color }]} />
				</View>
				<Text style={styles.progressLabel}>
					{tier.next
						? `${toNext.toLocaleString()} pts to reach ${tier.next} (next tier @ ${max + 1})`
						: 'You\'ve reached the top tier — keep going!'}
				</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.lg,
		borderWidth: 2,
		borderRadius: radius.lg,
		backgroundColor: colors.surface,
	},
	compact: { padding: spacing.md },
	badge: {
		width: 64,
		height: 64,
		borderRadius: 32,
		alignItems: 'center',
		justifyContent: 'center',
	},
	badgeText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
	points: { ...typography.h3, marginTop: 2 },
	progressTrack: {
		marginTop: spacing.sm,
		height: 8,
		backgroundColor: colors.surfaceAlt,
		borderRadius: 4,
		overflow: 'hidden',
	},
	progressFill: { height: '100%', borderRadius: 4 },
	progressLabel: { ...typography.caption, marginTop: 4 },
});

export default EcoTierCard;
