import React, { useEffect } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import { colors, radius, spacing, typography } from '../../config/theme';
import { resolveAssetUrl } from '../../config/env';
import { tierFor } from '../../config/ecoCatalog';
import { useSustainabilityStore } from '../../store/sustainabilityStore';
import { useAuthStore } from '../../store/authStore';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function LeaderboardScreen() {
	const me = useAuthStore((s) => s.user);
	const {
		leaderboard,
		leaderboardStats,
		loading,
		fetchLeaderboard,
		fetchLeaderboardStats,
	} = useSustainabilityStore();

	useEffect(() => {
		fetchLeaderboard();
		fetchLeaderboardStats();
	}, [fetchLeaderboard, fetchLeaderboardStats]);

	const onRefresh = () => {
		fetchLeaderboard();
		fetchLeaderboardStats();
	};

	const renderItem = ({ item, index }) => {
		const tier = tierFor(item.ecoPoints);
		const isMe = item._id === me?._id;
		return (
			<View style={[styles.row, isMe && styles.rowMe]}>
				<Text style={styles.rank}>{MEDAL[index] || `#${index + 1}`}</Text>
				{item.profilePicture ? (
					<Image source={{ uri: resolveAssetUrl(item.profilePicture) }} style={styles.avatar} />
				) : (
					<View style={[styles.avatar, styles.avatarFallback, { backgroundColor: tier.color }]}>
						<Text style={styles.avatarText}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
					</View>
				)}
				<View style={{ flex: 1 }}>
					<Text style={typography.bodyStrong}>
						{item.name}
						{isMe ? '  · You' : ''}
					</Text>
					<View style={[styles.tierPill, { backgroundColor: tier.color }]}>
						<Text style={styles.tierPillText}>{tier.key}</Text>
					</View>
				</View>
				<Text style={typography.h4}>{(item.ecoPoints || 0).toLocaleString()}</Text>
			</View>
		);
	};

	return (
		<ScreenContainer padded>
			{leaderboardStats?.totalEcoPoints ? (
				<Card style={{ marginBottom: spacing.lg }}>
					<View style={styles.statsRow}>
						<Stat label="Total points" value={leaderboardStats.totalEcoPoints.toLocaleString()} />
						<View style={styles.divider} />
						<Stat
							label="This month"
							value={`+${leaderboardStats.monthlyGrowthPct ?? 0}%`}
							color={colors.success}
						/>
						<View style={styles.divider} />
						<Stat label="Active eco-users" value={leaderboard?.length || 0} />
					</View>
				</Card>
			) : null}

			<FlatList
				data={leaderboard}
				keyExtractor={(item) => item._id}
				renderItem={renderItem}
				ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
				}
				ListEmptyComponent={<EmptyState title="No-one yet" message="Be the first to climb the green tiers." />}
				contentContainerStyle={{ paddingBottom: spacing.huge }}
			/>
		</ScreenContainer>
	);
}

const Stat = ({ label, value, color }) => (
	<View style={{ flex: 1, alignItems: 'center' }}>
		<Text style={[typography.h3, color ? { color } : null]}>{value}</Text>
		<Text style={typography.caption}>{label}</Text>
	</View>
);

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.md,
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		gap: spacing.md,
	},
	rowMe: { borderColor: colors.primary, backgroundColor: '#ECFDF5' },
	rank: { width: 38, fontSize: 18, fontWeight: '900', textAlign: 'center' },
	avatar: { width: 44, height: 44, borderRadius: 22 },
	avatarFallback: { alignItems: 'center', justifyContent: 'center' },
	avatarText: { color: '#fff', fontWeight: '900', fontSize: 18 },
	tierPill: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, marginTop: 2 },
	tierPillText: { color: '#fff', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
	statsRow: { flexDirection: 'row', alignItems: 'center' },
	divider: { width: 1, height: 36, backgroundColor: colors.border },
});
