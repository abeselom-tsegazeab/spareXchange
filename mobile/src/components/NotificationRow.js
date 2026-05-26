import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../config/theme';
import { notificationIcon } from '../config/trustCatalog';

const fmtTime = (d) => {
	if (!d) return '';
	const dt = new Date(d);
	const now = new Date();
	const diffH = (now - dt) / 3600000;
	if (diffH < 24) return dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	if (diffH < 168) return dt.toLocaleDateString([], { weekday: 'short' });
	return dt.toLocaleDateString();
};

export default function NotificationRow({ item, onPress, onDelete }) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [styles.row, !item.isRead && styles.unread, pressed && { opacity: 0.9 }]}
		>
			<View style={styles.iconBox}>
				<Text style={{ fontSize: 20 }}>{notificationIcon(item.type)}</Text>
			</View>
			<View style={{ flex: 1 }}>
				<View style={styles.topRow}>
					<Text style={[typography.bodyStrong, !item.isRead && styles.unreadTitle]} numberOfLines={1}>
						{item.title || 'Notification'}
					</Text>
					<Text style={typography.caption}>{fmtTime(item.createdAt)}</Text>
				</View>
				<Text style={typography.caption} numberOfLines={2}>
					{item.message}
				</Text>
			</View>
			{onDelete ? (
				<Pressable onPress={() => onDelete(item)} hitSlop={8} style={styles.delBtn}>
					<Text style={styles.delText}>×</Text>
				</Pressable>
			) : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: spacing.md,
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
		marginBottom: spacing.sm,
	},
	unread: { borderColor: colors.primaryLight, backgroundColor: '#F0FDF4' },
	iconBox: {
		width: 40,
		height: 40,
		borderRadius: radius.md,
		backgroundColor: colors.surfaceAlt,
		alignItems: 'center',
		justifyContent: 'center',
	},
	topRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm, marginBottom: 2 },
	unreadTitle: { fontWeight: '900' },
	delBtn: { padding: 4 },
	delText: { fontSize: 22, color: colors.textMuted, fontWeight: '300' },
});
