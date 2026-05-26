import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import Card from './Card';
import { colors, radius, spacing, typography } from '../config/theme';
import { resolveAssetUrl } from '../config/env';

const TYPE_ICON = {
	listing_created: '📦',
	listing: '📦',
	exchange_completed: '🤝',
	review_received: '⭐',
	review: '⭐',
	recycling_completed: '♻️',
};

const formatWhen = (ts) => {
	if (!ts) return '';
	const d = new Date(ts);
	const now = new Date();
	const diffMs = now - d;
	const mins = Math.floor(diffMs / 60000);
	if (mins < 60) return `${Math.max(1, mins)}m ago`;
	const hrs = Math.floor(mins / 60);
	if (hrs < 48) return `${hrs}h ago`;
	return d.toLocaleDateString();
};

export default function ActivityFeedRow({ item, onPress }) {
	const icon = TYPE_ICON[item?.type] || '✨';
	const image = item?.data?.image ? resolveAssetUrl(item.data.image) : null;

	return (
		<Card onPress={onPress} style={styles.card}>
			<View style={styles.row}>
				<View style={styles.iconWrap}>
					<Text style={styles.icon}>{icon}</Text>
				</View>
				<View style={{ flex: 1 }}>
					<Text style={typography.bodyStrong}>{item.title}</Text>
					<Text style={typography.body} numberOfLines={2}>
						{item.description}
					</Text>
					<Text style={typography.caption}>{formatWhen(item.timestamp)}</Text>
				</View>
				{image ? <Image source={{ uri: image }} style={styles.thumb} /> : null}
			</View>
		</Card>
	);
}

const styles = StyleSheet.create({
	card: { marginBottom: spacing.sm },
	row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
	iconWrap: {
		width: 40,
		height: 40,
		borderRadius: radius.full,
		backgroundColor: colors.primarySoft,
		alignItems: 'center',
		justifyContent: 'center',
	},
	icon: { fontSize: 18 },
	thumb: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.border },
});
