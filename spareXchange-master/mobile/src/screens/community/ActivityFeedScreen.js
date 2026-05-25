import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import ActivityFeedRow from '../../components/ActivityFeedRow';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { useCommunityStore } from '../../store/communityStore';

const FILTERS = [
	{ key: null, label: 'All' },
	{ key: 'listing', label: 'Listings' },
	{ key: 'exchange', label: 'Exchanges' },
	{ key: 'review', label: 'Reviews' },
	{ key: 'recycling', label: 'Recycling' },
];

export default function ActivityFeedScreen({ navigation, route }) {
	const userId = route.params?.userId;
	const userName = route.params?.userName;
	const { activities, loadingFeed, error, fetchMyFeed, fetchUserFeed } = useCommunityStore();
	const [filter, setFilter] = useState(null);

	const load = useCallback(() => {
		const params = { page: 1, limit: 30 };
		if (filter) params.type = filter;
		if (userId) fetchUserFeed(userId, params);
		else fetchMyFeed(params);
	}, [filter, userId, fetchMyFeed, fetchUserFeed]);

	useFocusEffect(
		useCallback(() => {
			if (userName) navigation.setOptions({ title: `${userName}'s activity` });
			else navigation.setOptions({ title: 'My activity' });
			load();
		}, [load, navigation, userName])
	);

	const onPressItem = (item) => {
		const listingId = item?.data?.listingId;
		const exchangeId = item?.data?.exchangeId;
		const otherUserId = item?.data?.otherUserId;

		if (listingId) {
			navigation.getParent()?.navigate('Main', {
				screen: 'Marketplace',
				params: { screen: 'ListingDetail', params: { id: String(listingId) } },
			});
		} else if (exchangeId) {
			navigation.getParent()?.navigate('Main', {
				screen: 'Trades',
				params: { screen: 'ExchangeDetail', params: { id: String(exchangeId) } },
			});
		} else if (otherUserId) {
			navigation.navigate('PublicProfile', { userId: String(otherUserId) });
		}
	};

	return (
		<ScreenContainer padded={false}>
			<View style={styles.header}>
				<Text style={typography.muted}>
					{userId ? 'Public activity visible to signed-in members.' : 'Your recent listings, trades, reviews, and recycling.'}
				</Text>
				<View style={styles.chips}>
					{FILTERS.map((f) => (
						<Chip
							key={f.key || 'all'}
							label={f.label}
							selected={filter === f.key}
							onPress={() => setFilter(f.key)}
						/>
					))}
				</View>
				{error && !activities.length ? <Banner tone="danger" message={error} style={{ marginTop: spacing.md }} /> : null}
			</View>

			{loadingFeed && !activities.length ? (
				<Loader fullscreen label="Loading activity..." />
			) : (
				<FlatList
					data={activities}
					keyExtractor={(item, idx) => `${item.type}-${item.timestamp}-${idx}`}
					contentContainerStyle={styles.list}
					refreshControl={
						<RefreshControl refreshing={loadingFeed} onRefresh={load} tintColor={colors.primary} />
					}
					renderItem={({ item }) => <ActivityFeedRow item={item} onPress={() => onPressItem(item)} />}
					ListEmptyComponent={
						<EmptyState title="No activity yet" message="Actions you take on SpareXChange will show up here." />
					}
				/>
			)}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
	chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
	list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.huge },
});
