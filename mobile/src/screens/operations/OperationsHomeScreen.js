import React, { useCallback } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import StatCard from '../../components/StatCard';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { useAdminStore } from '../../store/adminStore';
import { canViewReports, canViewStats, canRunJobs } from '../../utils/adminAccess';
import { useAuthStore } from '../../store/authStore';

export default function OperationsHomeScreen({ navigation }) {
	const user = useAuthStore((s) => s.user);
	const { comprehensiveStats, loading, error, fetchComprehensiveStats } = useAdminStore();

	useFocusEffect(
		useCallback(() => {
			if (canViewStats(user)) fetchComprehensiveStats();
		}, [user, fetchComprehensiveStats])
	);

	if (loading && !comprehensiveStats) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading platform stats..." />
			</ScreenContainer>
		);
	}

	const overview = comprehensiveStats?.overview || {};
	const pending = comprehensiveStats?.pendingItems || {};
	const recent = comprehensiveStats?.recentActivity?.last30Days || {};

	return (
		<ScreenContainer scroll padded={false}>
			<ScrollView
				contentContainerStyle={styles.scroll}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={fetchComprehensiveStats}
						tintColor={colors.primary}
					/>
				}
			>
				<View style={styles.header}>
					<Text style={typography.h2}>Operations</Text>
					<Text style={typography.muted}>Platform intelligence and moderation tools.</Text>
					{error ? <Banner tone="danger" message={error} style={{ marginTop: spacing.md }} /> : null}
				</View>

				{canViewStats(user) ? (
					<>
						<Text style={[typography.label, styles.sectionTitle]}>Overview</Text>
						<View style={styles.grid}>
							<StatCard label="Users" value={overview.totalUsers} hint={`${overview.activeUsers ?? 0} active`} />
							<StatCard label="Listings" value={overview.totalListings} hint={`${overview.activeListings ?? 0} active`} />
							<StatCard label="Exchanges" value={overview.totalExchanges} hint={`${overview.completedExchanges ?? 0} completed`} />
							<StatCard
								label="Pending reports"
								value={pending.reports ?? 0}
								tone="warning"
								onPress={canViewReports(user) ? () => navigation.navigate('ReportsList', { status: 'pending' }) : null}
							/>
						</View>

						<Text style={[typography.label, styles.sectionTitle]}>Last 30 days</Text>
						<View style={styles.grid}>
							<StatCard label="New users" value={recent.newUsers} />
							<StatCard label="New listings" value={recent.newListings} />
							<StatCard label="New exchanges" value={recent.newExchanges} />
							<StatCard label="Pending verifications" value={pending.verifications} tone="warning" />
						</View>

						<Text style={[typography.label, styles.sectionTitle]}>Tools</Text>
						<View style={styles.links}>
							<LinkTile title="Analytics hub" subtitle="Trends, engagement, categories" onPress={() => navigation.navigate('AnalyticsHub')} />
							{canViewReports(user) ? (
								<LinkTile title="Report queue" subtitle="Review and moderate content" onPress={() => navigation.navigate('ReportsList')} />
							) : null}
							{canRunJobs(user) ? (
								<LinkTile title="Admin jobs" subtitle="Run saved-search alert job" onPress={() => navigation.navigate('AdminJobs')} />
							) : null}
						</View>
					</>
				) : (
					<Banner tone="info" message="Your account does not have analytics permissions." />
				)}
			</ScrollView>
		</ScreenContainer>
	);
}

const LinkTile = ({ title, subtitle, onPress }) => (
	<Pressable onPress={onPress} style={({ pressed }) => [styles.link, pressed && { opacity: 0.9 }]}>
		<Text style={typography.bodyStrong}>{title}</Text>
		<Text style={typography.caption}>{subtitle}</Text>
	</Pressable>
);

const styles = StyleSheet.create({
	scroll: { paddingBottom: spacing.huge },
	header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
	sectionTitle: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm, marginTop: spacing.md },
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		paddingHorizontal: spacing.lg,
	},
	links: { paddingHorizontal: spacing.lg, gap: spacing.sm },
	link: {
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: 12,
		padding: spacing.md,
		marginBottom: spacing.sm,
	},
});
