import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import AnalyticsSection, { AggList, KV } from '../../components/AnalyticsSection';
import Chip from '../../components/Chip';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { useAdminStore } from '../../store/adminStore';

const PERIODS = [
	{ key: 'daily', label: 'Daily', days: 30 },
	{ key: 'weekly', label: 'Weekly', days: 84 },
	{ key: 'monthly', label: 'Monthly', days: 365 },
];

export default function AnalyticsHubScreen() {
	const {
		trends,
		engagement,
		exchangePerformance,
		categoryPerformance,
		sustainability,
		searchAnalytics,
		reviewAnalytics,
		loading,
		error,
		fetchAllAnalytics,
		fetchTrends,
	} = useAdminStore();

	const [period, setPeriod] = useState('daily');

	useFocusEffect(
		useCallback(() => {
			fetchAllAnalytics();
		}, [fetchAllAnalytics])
	);

	const onPeriod = async (p) => {
		setPeriod(p.key);
		await fetchTrends({ period: p.key, days: p.days });
	};

	if (loading && !trends) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading analytics..." />
			</ScreenContainer>
		);
	}

	const trendSlice = (arr) => (arr || []).slice(-5).map((x) => `${x._id}: ${x.count}`).join(' · ') || '—';

	return (
		<ScreenContainer scroll padded={false}>
			<ScrollView
				contentContainerStyle={styles.scroll}
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={fetchAllAnalytics} tintColor={colors.primary} />
				}
			>
				{error ? <Banner tone="danger" message={error} style={{ margin: spacing.lg }} /> : null}

				<AnalyticsSection title="Time-series trends">
					<View style={styles.chips}>
						{PERIODS.map((p) => (
							<Chip key={p.key} label={p.label} active={period === p.key} onPress={() => onPeriod(p)} />
						))}
					</View>
					<KV label="Users (recent)" value={trendSlice(trends?.users)} />
					<KV label="Listings (recent)" value={trendSlice(trends?.listings)} />
					<KV label="Exchanges (recent)" value={trendSlice(trends?.exchanges)} />
				</AnalyticsSection>

				<AnalyticsSection title="User engagement">
					<KV label="Active listers (7d)" value={engagement?.activeListersLast7Days} />
					<KV label="Active exchangers (30d)" value={engagement?.activeExchangersLast30Days} />
					<KV label="Avg listings / user" value={Number(engagement?.avgListingsPerUser || 0).toFixed(1)} />
					<KV label="Retention rate" value={engagement?.retentionMetrics?.retentionRate} />
				</AnalyticsSection>

				<AnalyticsSection title="Exchange performance">
					<KV label="Completion rate" value={exchangePerformance?.completionRate} />
					<KV label="Avg completion time" value={`${exchangePerformance?.avgCompletionTimeHours ?? 0}h`} />
					<KV label="Recent (30d)" value={exchangePerformance?.recentExchangesLast30Days} />
					<AggList items={exchangePerformance?.statusDistribution} />
				</AnalyticsSection>

				<AnalyticsSection title="Categories">
					<Text style={[typography.caption, { marginBottom: spacing.xs }]}>Listings by category</Text>
					<AggList items={categoryPerformance?.listingsByCategory} />
					<Text style={[typography.caption, { marginTop: spacing.sm, marginBottom: spacing.xs }]}>Avg price by category</Text>
					{(categoryPerformance?.avgPriceByCategory || []).slice(0, 6).map((c) => (
						<KV key={c._id} label={c._id || 'Unknown'} value={`ETB ${Math.round(c.avgPrice || 0)}`} />
					))}
				</AnalyticsSection>

				<AnalyticsSection title="Sustainability">
					<KV label="Total submissions" value={sustainability?.recyclingStats?.totalSubmissions} />
					<KV label="Approved" value={sustainability?.recyclingStats?.approvedSubmissions} />
					<KV label="Total eco-points" value={sustainability?.ecoPoints?.totalEcoPoints} />
				</AnalyticsSection>

				<AnalyticsSection title="Search analytics (30d)">
					<KV label="Total searches" value={searchAnalytics?.totalSearches} />
					<KV label="Success rate" value={searchAnalytics?.searchSuccessRate} />
					<Text style={[typography.caption, { marginTop: spacing.sm }]}>Popular queries</Text>
					{(searchAnalytics?.popularQueries || []).slice(0, 5).map((q) => (
						<KV key={q._id} label={q._id} value={q.count} />
					))}
				</AnalyticsSection>

				<AnalyticsSection title="Reviews">
					<KV label="Average rating" value={reviewAnalytics?.averageRating ?? reviewAnalytics?.avgRating} />
					<KV label="Total reviews" value={reviewAnalytics?.totalReviews} />
					<AggList items={reviewAnalytics?.ratingDistribution} labelKey="_id" valueKey="count" />
				</AnalyticsSection>
			</ScrollView>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	scroll: { padding: spacing.lg, paddingBottom: spacing.huge },
	chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
});
