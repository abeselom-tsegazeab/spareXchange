import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { colors, radius, shadow, spacing, typography } from '../config/theme';
import { summarizeSavedSearch } from '../config/savedSearchHelpers';

export default function SavedSearchCard({
	item,
	onPress,
	onEdit,
	onDelete,
	onToggleNotify,
	toggling = false,
}) {
	const title = item.name?.trim() || summarizeSavedSearch(item);

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [styles.card, shadow.sm, pressed && { opacity: 0.9 }]}
		>
			<View style={styles.headRow}>
				<View style={{ flex: 1 }}>
					<Text style={typography.bodyStrong} numberOfLines={1}>
						{title}
					</Text>
					<Text style={[typography.caption, { marginTop: 2 }]} numberOfLines={2}>
						{summarizeSavedSearch(item)}
					</Text>
				</View>
				<View style={styles.notifyRow}>
					<Text style={styles.bell}>{item.notify ? '🔔' : '🔕'}</Text>
					<Switch
						value={!!item.notify}
						onValueChange={() => onToggleNotify?.(item)}
						disabled={toggling}
						trackColor={{ false: colors.border, true: colors.primaryLight }}
						thumbColor={item.notify ? colors.primary : colors.surface}
					/>
				</View>
			</View>

			<View style={styles.actions}>
				<Pressable onPress={() => onEdit?.(item)} hitSlop={6}>
					<Text style={styles.actionText}>Edit</Text>
				</Pressable>
				<Text style={styles.dot}>·</Text>
				<Pressable onPress={() => onDelete?.(item)} hitSlop={6}>
					<Text style={[styles.actionText, { color: colors.danger }]}>Delete</Text>
				</Pressable>
				<Text style={styles.dot}>·</Text>
				<Pressable onPress={onPress} hitSlop={6}>
					<Text style={[styles.actionText, { color: colors.primaryDark }]}>Run search</Text>
				</Pressable>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
		marginBottom: spacing.md,
	},
	headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
	notifyRow: { alignItems: 'center', gap: 2 },
	bell: { fontSize: 14 },
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: spacing.sm,
		paddingTop: spacing.sm,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	actionText: { ...typography.caption, fontWeight: '700', color: colors.textMuted },
	dot: { color: colors.textSubtle, marginHorizontal: spacing.xs },
});
