import React, { useEffect } from 'react';
import {
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import EcoTierCard from '../../components/EcoTierCard';
import SubmissionCard from '../../components/SubmissionCard';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import { colors, radius, spacing, typography } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';
import { useSustainabilityStore } from '../../store/sustainabilityStore';

export default function EcoHomeScreen({ navigation }) {
	const me = useAuthStore((s) => s.user);
	const {
		submissions,
		leaderboard,
		leaderboardStats,
		loading,
		fetchMySubmissions,
		fetchLeaderboard,
		fetchLeaderboardStats,
	} = useSustainabilityStore();

	const isRecycler = me?.userType === 'recycler';

	useEffect(() => {
		fetchMySubmissions();
		fetchLeaderboard();
		fetchLeaderboardStats();
	}, [fetchMySubmissions, fetchLeaderboard, fetchLeaderboardStats]);

	const onRefresh = () => {
		fetchMySubmissions();
		fetchLeaderboard();
		fetchLeaderboardStats();
	};

	const recent = (submissions || []).slice(0, 3);
	const topThree = (leaderboard || []).slice(0, 3);

	return (
		<ScreenContainer scroll padded>
			<ScrollView
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
				}
				scrollEnabled={false}
			>
				<Text style={typography.h2}>EcoPoints</Text>
				<Text style={[typography.muted, { marginBottom: spacing.lg }]}>
					Recycle, redeem and climb the green tiers.
				</Text>

				<EcoTierCard points={me?.ecoPoints || 0} />

				<View style={styles.cta}>
					<Pressable onPress={() => navigation.navigate('SubmitRecycling')} style={styles.actionTile}>
						<Text style={styles.actionIcon}>♻️</Text>
						<Text style={styles.actionLabel}>Submit recycling</Text>
					</Pressable>
					<Pressable onPress={() => navigation.navigate('NearbyRecyclers')} style={styles.actionTile}>
						<Text style={styles.actionIcon}>📍</Text>
						<Text style={styles.actionLabel}>Find recyclers</Text>
					</Pressable>
					<Pressable onPress={() => navigation.navigate('Redeem')} style={styles.actionTile}>
						<Text style={styles.actionIcon}>🎁</Text>
						<Text style={styles.actionLabel}>Redeem points</Text>
					</Pressable>
					{isRecycler ? (
						<Pressable onPress={() => navigation.navigate('VerifyToken')} style={styles.actionTile}>
							<Text style={styles.actionIcon}>✅</Text>
							<Text style={styles.actionLabel}>Verify token</Text>
						</Pressable>
					) : null}
				</View>

				<Card style={{ marginTop: spacing.lg }}>
					<View style={styles.sectionHead}>
						<Text style={typography.h4}>My recent submissions</Text>
						<Pressable onPress={() => navigation.navigate('MySubmissions')} hitSlop={6}>
							<Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '800' }]}>
								See all ›
							</Text>
						</Pressable>
					</View>
					{recent.length === 0 ? (
						<EmptyState
							icon="♻"
							title="No recycling yet"
							message="Submit your first item and earn EcoPoints."
							actionLabel="Submit recycling"
							onAction={() => navigation.navigate('SubmitRecycling')}
						/>
					) : (
						<View style={{ marginTop: spacing.md }}>
							{recent.map((s) => (
								<SubmissionCard
									key={s._id}
									submission={s}
									onPress={() => navigation.navigate('SubmissionDetail', { id: s._id })}
								/>
							))}
						</View>
					)}
				</Card>

				<Card style={{ marginTop: spacing.lg }}>
					<View style={styles.sectionHead}>
						<Text style={typography.h4}>Leaderboard</Text>
						<Pressable onPress={() => navigation.navigate('Leaderboard')} hitSlop={6}>
							<Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '800' }]}>
								Full board ›
							</Text>
						</Pressable>
					</View>
					{leaderboardStats?.totalEcoPoints ? (
						<Text style={[typography.caption, { marginTop: spacing.xs }]}>
							{leaderboardStats.totalEcoPoints.toLocaleString()} pts earned across all members
							{leaderboardStats.monthlyGrowthPct != null
								? `  ·  +${leaderboardStats.monthlyGrowthPct}% this month`
								: ''}
						</Text>
					) : null}
					<View style={{ marginTop: spacing.md }}>
						{topThree.map((u, idx) => (
							<View
								key={u._id}
								style={[styles.lbRow, u._id === me?._id && { backgroundColor: '#ECFDF5' }]}
							>
								<Text style={styles.lbRank}>#{idx + 1}</Text>
								<View style={{ flex: 1 }}>
									<Text style={typography.bodyStrong}>{u.name}</Text>
									<Text style={typography.caption}>{u.ecoTier || ''}</Text>
								</View>
								<Text style={typography.bodyStrong}>{u.ecoPoints.toLocaleString()}</Text>
							</View>
						))}
					</View>
				</Card>

				<View style={{ height: spacing.huge }} />
			</ScrollView>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	cta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.lg },
	actionTile: {
		flexBasis: '47%',
		flexGrow: 1,
		padding: spacing.md,
		borderRadius: radius.lg,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: 'flex-start',
	},
	actionIcon: { fontSize: 26, marginBottom: spacing.xs },
	actionLabel: { ...typography.bodyStrong },
	sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	lbRow: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.sm,
		borderRadius: radius.md,
		marginBottom: 4,
	},
	lbRank: { ...typography.bodyStrong, width: 36 },
});
