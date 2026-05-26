import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import ReviewCard from '../../components/ReviewCard';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { spacing, typography } from '../../config/theme';
import { useReviewsStore } from '../../store/reviewsStore';

export default function UserReviewsScreen({ route, navigation }) {
	const { userId, userName } = route.params || {};
	const { reviews, loading, error, fetchUserReviews } = useReviewsStore();

	useEffect(() => {
		navigation.setOptions({ title: userName ? `${userName}'s reviews` : 'Reviews' });
	}, [navigation, userName]);

	useEffect(() => {
		if (userId) fetchUserReviews(userId);
	}, [userId, fetchUserReviews]);

	if (loading && !reviews.length) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading reviews..." />
			</ScreenContainer>
		);
	}

	const avg =
		reviews.length > 0
			? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
			: null;

	return (
		<ScreenContainer padded={false}>
			<View style={styles.header}>
				{avg ? (
					<Text style={typography.h3}>
						{avg} ★ average · {reviews.length} review{reviews.length === 1 ? '' : 's'}
					</Text>
				) : (
					<Text style={typography.muted}>No reviews yet</Text>
				)}
				{error ? <Banner tone="danger" message={error} style={{ marginTop: spacing.md }} /> : null}
			</View>

			<FlatList
				data={reviews}
				keyExtractor={(item) => item._id}
				contentContainerStyle={styles.list}
				renderItem={({ item }) => <ReviewCard review={item} />}
				ListEmptyComponent={
					<EmptyState title="No reviews yet" message="This user has not received any public reviews." />
				}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
	list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.huge },
});
