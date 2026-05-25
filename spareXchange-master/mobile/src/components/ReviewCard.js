import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import Card from './Card';
import StarRating from './StarRating';
import { colors, radius, spacing, typography } from '../config/theme';
import { resolveAssetUrl } from '../config/env';

export default function ReviewCard({ review }) {
	const reviewer = review.reviewerId;
	return (
		<Card style={styles.card}>
			<View style={styles.head}>
				{reviewer?.profilePicture ? (
					<Image source={{ uri: resolveAssetUrl(reviewer.profilePicture) }} style={styles.avatar} />
				) : (
					<View style={[styles.avatar, styles.avatarFallback]}>
						<Text style={styles.avatarText}>{(reviewer?.name || '?').charAt(0).toUpperCase()}</Text>
					</View>
				)}
				<View style={{ flex: 1 }}>
					<Text style={typography.bodyStrong}>{reviewer?.name || 'User'}</Text>
					<StarRating value={review.rating} readonly size={18} />
				</View>
				<Text style={typography.caption}>
					{new Date(review.createdAt).toLocaleDateString()}
				</Text>
			</View>
			{review.comment ? (
				<Text style={[typography.body, { marginTop: spacing.sm }]}>{review.comment}</Text>
			) : null}
		</Card>
	);
}

const styles = StyleSheet.create({
	card: { marginBottom: spacing.md },
	head: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	avatar: { width: 40, height: 40, borderRadius: 20 },
	avatarFallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
	avatarText: { color: '#fff', fontWeight: '900' },
});
