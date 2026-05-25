import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Card from './Card';
import { colors, radius, spacing, typography } from '../config/theme';

export default function AchievementBadge({ achievement, onPress }) {
	const unlocked = achievement?.unlocked !== false;
	const progress = achievement?.progress ?? 0;

	return (
		<Card onPress={onPress} style={[styles.card, !unlocked && styles.locked]}>
			<View style={styles.row}>
				<Text style={styles.icon}>{achievement?.icon || '🏅'}</Text>
				<View style={{ flex: 1 }}>
					<Text style={typography.bodyStrong}>{achievement?.name}</Text>
					<Text style={typography.caption}>{achievement?.description}</Text>
					{!unlocked && progress > 0 ? (
						<View style={styles.progressTrack}>
							<View style={[styles.progressFill, { width: `${Math.min(100, progress)}%` }]} />
						</View>
					) : null}
				</View>
				<Text style={[styles.status, unlocked ? styles.unlocked : styles.lockedText]}>
					{unlocked ? 'Unlocked' : `${progress}%`}
				</Text>
			</View>
		</Card>
	);
}

const styles = StyleSheet.create({
	card: { marginBottom: spacing.sm },
	locked: { opacity: 0.85 },
	row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	icon: { fontSize: 28 },
	status: { ...typography.caption, fontWeight: '800' },
	unlocked: { color: colors.success },
	lockedText: { color: colors.textMuted },
	progressTrack: {
		marginTop: spacing.xs,
		height: 4,
		borderRadius: radius.full,
		backgroundColor: colors.border,
		overflow: 'hidden',
	},
	progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radius.full },
});
