import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../config/theme';

export default function MessageBubble({ message, isMine }) {
	return (
		<View style={[styles.wrap, isMine ? styles.mineWrap : styles.theirsWrap]}>
			<View style={[styles.bubble, isMine ? styles.mine : styles.theirs]}>
				<Text style={[typography.body, isMine && { color: colors.textInverse }]}>{message.content}</Text>
				<Text style={[styles.time, isMine && { color: 'rgba(255,255,255,0.75)' }]}>
					{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
				</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { marginBottom: spacing.sm, paddingHorizontal: spacing.lg },
	mineWrap: { alignItems: 'flex-end' },
	theirsWrap: { alignItems: 'flex-start' },
	bubble: {
		maxWidth: '82%',
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		borderRadius: radius.lg,
	},
	mine: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
	theirs: { backgroundColor: colors.surfaceAlt, borderBottomLeftRadius: 4 },
	time: { ...typography.caption, marginTop: 4, fontSize: 10, color: colors.textMuted },
});
