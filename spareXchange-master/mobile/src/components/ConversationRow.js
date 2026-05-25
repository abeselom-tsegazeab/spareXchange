import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing, typography } from '../config/theme';
import { resolveAssetUrl } from '../config/env';

const fmtTime = (d) => {
	if (!d) return '';
	const dt = new Date(d);
	const now = new Date();
	const sameDay = dt.toDateString() === now.toDateString();
	return sameDay
		? dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		: dt.toLocaleDateString();
};

export default function ConversationRow({ conversation, onPress }) {
	const user = conversation.user || {};
	const unread = !conversation.isRead && !conversation.sentByMe;

	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [styles.row, shadow.sm, pressed && { opacity: 0.9 }]}
		>
			{user.profilePicture ? (
				<Image source={{ uri: resolveAssetUrl(user.profilePicture) }} style={styles.avatar} />
			) : (
				<View style={[styles.avatar, styles.avatarFallback]}>
					<Text style={styles.avatarText}>{(user.name || '?').charAt(0).toUpperCase()}</Text>
				</View>
			)}
			<View style={{ flex: 1 }}>
				<View style={styles.topRow}>
					<Text style={[typography.bodyStrong, unread && styles.unreadText]} numberOfLines={1}>
						{user.name || 'User'}
					</Text>
					<Text style={typography.caption}>{fmtTime(conversation.lastMessageAt)}</Text>
				</View>
				<Text style={[typography.caption, unread && styles.unreadPreview]} numberOfLines={1}>
					{conversation.sentByMe ? 'You: ' : ''}
					{conversation.lastMessage || 'No messages yet'}
				</Text>
			</View>
			{unread ? <View style={styles.dot} /> : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
		marginBottom: spacing.sm,
	},
	avatar: { width: 48, height: 48, borderRadius: 24 },
	avatarFallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
	avatarText: { color: '#fff', fontWeight: '900', fontSize: 18 },
	topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
	unreadText: { fontWeight: '900' },
	unreadPreview: { color: colors.text, fontWeight: '600' },
	dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
