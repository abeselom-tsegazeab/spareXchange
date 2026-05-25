import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Loader from '../../components/Loader';
import StarRating from '../../components/StarRating';
import EmptyState from '../../components/EmptyState';
import { colors, spacing, typography } from '../../config/theme';
import { useReviewsStore } from '../../store/reviewsStore';

export default function WriteReviewScreen({ route, navigation }) {
	const params = route.params || {};
	const { reviewable, loading, submitting, error, fetchReviewable, createReview } = useReviewsStore();

	const [selected, setSelected] = useState(null);
	const [rating, setRating] = useState(5);
	const [comment, setComment] = useState('');
	const [info, setInfo] = useState(null);
	const [localError, setLocalError] = useState(null);

	useEffect(() => {
		if (params.exchangeId && params.revieweeId) {
			setSelected({
				exchangeId: params.exchangeId,
				revieweeId: params.revieweeId,
				revieweeName: params.revieweeName,
				listingTitle: params.listingTitle,
			});
		} else {
			fetchReviewable(params.revieweeId);
		}
	}, [params.exchangeId, params.revieweeId, params.revieweeName, params.listingTitle, fetchReviewable]);

	useEffect(() => {
		if (!selected && reviewable.length === 1) setSelected(reviewable[0]);
	}, [reviewable, selected]);

	const onSubmit = async () => {
		setLocalError(null);
		if (!selected) {
			setLocalError('Pick an exchange to review.');
			return;
		}
		if (rating < 1) {
			setLocalError('Select a star rating.');
			return;
		}
		const res = await createReview({
			revieweeId: selected.revieweeId,
			exchangeId: selected.exchangeId,
			rating,
			comment: comment.trim(),
		});
		if (res.success) {
			setInfo('Review submitted. Thank you for helping the community.');
			setTimeout(() => navigation.goBack(), 1200);
		} else {
			setLocalError(res.message);
		}
	};

	if (loading && !selected && !reviewable.length) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading reviewable exchanges..." />
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer scroll keyboard>
			<Text style={typography.h2}>Leave a review</Text>
			<Text style={[typography.muted, { marginBottom: spacing.lg }]}>
				Reviews are tied to completed exchanges and update trust scores.
			</Text>

			{info ? <Banner tone="success" message={info} /> : null}
			{localError || error ? <Banner tone="danger" message={localError || error} /> : null}

			{!selected && reviewable.length > 1 ? (
				<>
					<Text style={[typography.label, { marginBottom: spacing.sm }]}>Pick an exchange</Text>
					<FlatList
						data={reviewable}
						keyExtractor={(item) => item.exchangeId}
						scrollEnabled={false}
						renderItem={({ item }) => (
							<Pressable onPress={() => setSelected(item)} style={styles.pickRow}>
								<Text style={typography.bodyStrong}>{item.listingTitle}</Text>
								<Text style={typography.caption}>
									{item.exchangeType} {item.revieweeName}
								</Text>
							</Pressable>
						)}
						ListEmptyComponent={
							<EmptyState
								title="Nothing to review"
								message="Complete an exchange first, then come back to rate your counterparty."
							/>
						}
					/>
				</>
			) : null}

			{selected ? (
				<Card>
					<Text style={typography.h4}>{selected.listingTitle || 'Exchange'}</Text>
					<Text style={typography.muted}>
						Reviewing {selected.revieweeName || 'counterparty'}
					</Text>

					<Text style={[typography.label, { marginTop: spacing.lg, marginBottom: spacing.sm }]}>
						Rating *
					</Text>
					<StarRating value={rating} onChange={setRating} />

					<Input
						label="Comment (optional)"
						value={comment}
						onChangeText={setComment}
						placeholder="How was communication and the handover?"
						multiline
						numberOfLines={4}
						maxLength={500}
						helper={`${comment.length}/500`}
					/>

					<Button title="Submit review" onPress={onSubmit} loading={submitting} size="lg" />
				</Card>
			) : null}

			{!selected && !reviewable.length && !loading ? (
				<EmptyState
					title="No exchanges to review"
					message="Finish a trade first — reviews unlock after both parties mark it complete."
				/>
			) : null}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	pickRow: {
		padding: spacing.md,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 8,
		marginBottom: spacing.sm,
		backgroundColor: colors.surface,
	},
});
