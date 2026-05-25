import React, { useCallback } from 'react';
import {
	FlatList,
	Image,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import ListingCard from '../../components/ListingCard';
import ReviewCard from '../../components/ReviewCard';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import EmptyState from '../../components/EmptyState';
import { colors, radius, spacing, typography } from '../../config/theme';
import { resolveAssetUrl } from '../../config/env';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';

const ROLE_LABELS = {
	individual: 'Individual',
	'repair-shop': 'Repair Shop',
	garage: 'Garage',
	recycler: 'Recycler',
	technician: 'Technician',
	admin: 'Admin',
};

export default function PublicProfileScreen({ route, navigation }) {
	const { userId, userName } = route.params || {};
	const me = useAuthStore((s) => s.user);
	const {
		publicProfile,
		publicListings,
		publicStats,
		loadingProfile,
		loadingListings,
		error,
		fetchPublicProfile,
		fetchPublicListings,
		clearPublicProfile,
	} = useCommunityStore();

	const isSelf = me?._id && userId && String(me._id) === String(userId);

	const load = useCallback(() => {
		if (!userId) return;
		fetchPublicProfile(userId);
		fetchPublicListings(userId, { page: 1, limit: 12 });
	}, [userId, fetchPublicProfile, fetchPublicListings]);

	useFocusEffect(
		useCallback(() => {
			const title = userName || publicProfile?.name || 'Profile';
			navigation.setOptions({ title });
			load();
			return () => clearPublicProfile();
		}, [load, navigation, userName, publicProfile?.name, clearPublicProfile])
	);

	const profile = publicProfile;
	const stats = profile?.stats || {};
	const trust = profile?.trust || {};
	const sustainability = profile?.sustainability || {};
	const reviews = profile?.recentReviews || [];

	const initials = (profile?.name || 'U')
		.split(' ')
		.map((s) => s[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();

	const messageUser = () => {
		navigation.getParent()?.navigate('Communication', {
			screen: 'Chat',
			params: { userId: String(userId), userName: profile?.name || userName },
		});
	};

	const viewReviews = () => {
		navigation.getParent()?.navigate('Communication', {
			screen: 'UserReviews',
			params: { userId: String(userId), userName: profile?.name || userName },
		});
	};

	const viewActivity = () => {
		navigation.navigate('ActivityFeed', { userId: String(userId), userName: profile?.name || userName });
	};

	const openListing = (listing) => {
		navigation.getParent()?.navigate('Main', {
			screen: 'Marketplace',
			params: { screen: 'ListingDetail', params: { id: String(listing._id) } },
		});
	};

	if (loadingProfile && !profile) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading profile..." />
			</ScreenContainer>
		);
	}

	if (!profile && error) {
		return (
			<ScreenContainer>
				<Banner tone="danger" message={error} />
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer scroll padded={false}>
			<ScrollView
				contentContainerStyle={styles.scroll}
				refreshControl={
					<RefreshControl refreshing={loadingProfile} onRefresh={load} tintColor={colors.primary} />
				}
			>
				<View style={styles.header}>
					{profile?.profilePicture ? (
						<Image source={{ uri: resolveAssetUrl(profile.profilePicture) }} style={styles.avatar} />
					) : (
						<View style={[styles.avatar, styles.avatarFallback]}>
							<Text style={styles.avatarText}>{initials}</Text>
						</View>
					)}
					<Text style={typography.h2}>{profile?.name}</Text>
					<Text style={typography.muted}>
						{ROLE_LABELS[profile?.userType] || 'Member'}
						{trust.isVerified ? ' · ✓ Verified' : ''}
					</Text>
					{profile?.location ? <Text style={typography.caption}>{profile.location}</Text> : null}
					{profile?.daysAsMember != null ? (
						<Text style={typography.caption}>Member for {profile.daysAsMember} days</Text>
					) : null}

					<View style={styles.statsRow}>
						<Stat label="Listings" value={stats.activeListings ?? 0} />
						<Stat label="Trades" value={stats.completedExchanges ?? 0} />
						<Stat label="Rating" value={trust.averageRating ?? stats.averageRating ?? '—'} suffix={trust.averageRating ? '' : ''} />
						<Stat label="Trust" value={trust.trustScore ?? stats.trustScore ?? 0} suffix="/100" />
					</View>

					<View style={styles.ecoRow}>
						<Text style={typography.bodyStrong}>
							{sustainability.ecoPoints ?? 0} eco points · {sustainability.ecoTier || 'Bronze'}
						</Text>
						{(sustainability.achievements || []).length ? (
							<Text style={typography.caption}>
								{(sustainability.achievements || []).length} badge
								{(sustainability.achievements || []).length === 1 ? '' : 's'}
							</Text>
						) : null}
					</View>

					{!isSelf ? (
						<View style={styles.actions}>
							<Button title="Message" onPress={messageUser} size="sm" />
							<Button title="View activity" variant="outline" onPress={viewActivity} size="sm" />
						</View>
					) : (
						<Button title="My activity" variant="outline" onPress={viewActivity} style={{ marginTop: spacing.md }} />
					)}
				</View>

				{publicStats ? (
					<Card style={styles.section}>
						<Text style={typography.h4}>Activity stats</Text>
						<Text style={typography.caption}>
							{publicStats.listings?.total ?? 0} listings · {publicStats.exchanges?.total ?? 0} exchanges ·{' '}
							{publicStats.recycling?.totalSubmissions ?? 0} recycling submissions
						</Text>
					</Card>
				) : null}

				<View style={styles.sectionHeader}>
					<Text style={typography.h4}>Active listings</Text>
					{loadingListings ? <Text style={typography.caption}>Loading...</Text> : null}
				</View>
				{publicListings.length ? (
					<View style={styles.grid}>
						{publicListings.map((listing) => (
							<ListingCard
								key={listing._id}
								listing={{ ...listing, available: listing.status === 'active' }}
								onPress={() => openListing(listing)}
								style={styles.gridItem}
							/>
						))}
					</View>
				) : (
					<EmptyState title="No public listings" message="This member has no active listings right now." />
				)}

				<View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
					<Text style={typography.h4}>Recent reviews</Text>
					<Pressable onPress={viewReviews} hitSlop={8}>
						<Text style={styles.link}>See all</Text>
					</Pressable>
				</View>
				{reviews.length ? (
					reviews.map((r) => (
						<View key={r._id} style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm }}>
							<ReviewCard review={{ ...r, reviewerId: r.reviewer || r.reviewerId }} />
						</View>
					))
				) : (
					<EmptyState title="No reviews yet" message="Reviews from completed exchanges appear here." />
				)}
			</ScrollView>
		</ScreenContainer>
	);
}

const Stat = ({ label, value, suffix = '' }) => (
	<View style={styles.stat}>
		<Text style={typography.h4}>
			{value}
			{suffix}
		</Text>
		<Text style={typography.caption}>{label}</Text>
	</View>
);

const styles = StyleSheet.create({
	scroll: { paddingBottom: spacing.huge },
	header: { padding: spacing.lg, alignItems: 'center' },
	avatar: { width: 88, height: 88, borderRadius: radius.full, marginBottom: spacing.md },
	avatarFallback: {
		backgroundColor: colors.primarySoft,
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarText: { fontSize: 28, fontWeight: '800', color: colors.primaryDark },
	statsRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.lg },
	stat: { alignItems: 'center', minWidth: 72 },
	ecoRow: { marginTop: spacing.md, alignItems: 'center' },
	actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
	section: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
	sectionHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: spacing.lg,
		marginBottom: spacing.sm,
	},
	link: { ...typography.caption, color: colors.primaryDark, fontWeight: '800' },
	grid: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		paddingHorizontal: spacing.lg,
		gap: spacing.md,
	},
	gridItem: { width: '47%' },
});
