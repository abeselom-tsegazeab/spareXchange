import React, { useCallback } from 'react';
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, radius, spacing, typography } from '../../config/theme';
import { resolveAssetUrl } from '../../config/env';
import { useCommunityStore } from '../../store/communityStore';

const Section = ({ title, children }) => (
	<View style={styles.section}>
		<Text style={typography.h4}>{title}</Text>
		<View style={{ height: spacing.sm }} />
		{children}
	</View>
);

const PersonRow = ({ name, subtitle, avatar, onPress }) => (
	<Pressable onPress={onPress} style={({ pressed }) => [styles.personRow, pressed && { opacity: 0.85 }]}>
		{avatar ? (
			<Image source={{ uri: resolveAssetUrl(avatar) }} style={styles.avatar} />
		) : (
			<View style={[styles.avatar, styles.avatarFallback]}>
				<Text style={styles.avatarText}>{(name || '?').charAt(0).toUpperCase()}</Text>
			</View>
		)}
		<View style={{ flex: 1 }}>
			<Text style={typography.bodyStrong}>{name}</Text>
			{subtitle ? <Text style={typography.caption}>{subtitle}</Text> : null}
		</View>
	</Pressable>
);

export default function CommunityHomeScreen({ navigation }) {
	const { highlights, loadingHighlights, error, fetchHighlights } = useCommunityStore();

	useFocusEffect(
		useCallback(() => {
			fetchHighlights();
		}, [fetchHighlights])
	);

	const openProfile = (userId, userName) => {
		if (!userId) return;
		navigation.navigate('PublicProfile', { userId: String(userId), userName });
	};

	if (loadingHighlights && !highlights) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading community..." />
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer scroll padded={false}>
			<ScrollView
				contentContainerStyle={styles.scroll}
				refreshControl={
					<RefreshControl refreshing={loadingHighlights} onRefresh={fetchHighlights} tintColor={colors.primary} />
				}
			>
				<View style={styles.hero}>
					<Text style={typography.h2}>Community</Text>
					<Text style={typography.muted}>Highlights, activity, and achievements across SpareXChange.</Text>
					<View style={styles.heroActions}>
						<Button title="My activity" onPress={() => navigation.navigate('ActivityFeed')} size="sm" />
						<Button
							title="Achievements"
							variant="outline"
							onPress={() => navigation.navigate('Achievements')}
							size="sm"
						/>
					</View>
				</View>

				{error && !highlights ? <Banner tone="danger" message={error} style={styles.banner} /> : null}

				{highlights?.topContributors?.length ? (
					<Section title="Top contributors this week">
						<Card>
							{highlights.topContributors.map((u) => (
								<PersonRow
									key={String(u.userId)}
									name={u.name}
									subtitle={`${u.listingCount} new listing${u.listingCount === 1 ? '' : 's'}`}
									avatar={u.profilePicture}
									onPress={() => openProfile(u.userId, u.name)}
								/>
							))}
						</Card>
					</Section>
				) : null}

				{highlights?.recentExchanges?.length ? (
					<Section title="Recent exchanges">
						<Card>
							{highlights.recentExchanges.map((ex) => (
								<View key={String(ex.exchangeId)} style={styles.exchangeRow}>
									<Text style={styles.exchangeIcon}>🤝</Text>
									<View style={{ flex: 1 }}>
										<Text style={typography.bodyStrong}>{ex.listing}</Text>
										<Text style={typography.caption}>
											{ex.requester} ↔ {ex.receiver}
										</Text>
									</View>
								</View>
							))}
						</Card>
					</Section>
				) : null}

				{highlights?.topRecyclers?.length ? (
					<Section title="Top recyclers this month">
						<Card>
							{highlights.topRecyclers.map((u) => (
								<PersonRow
									key={String(u.userId)}
									name={u.name}
									subtitle={`${u.totalWeight?.toFixed?.(1) ?? u.totalWeight} kg · ${u.ecoPoints ?? 0} pts`}
									onPress={() => openProfile(u.userId, u.name)}
								/>
							))}
						</Card>
					</Section>
				) : null}

				{highlights?.trustedUsers?.length ? (
					<Section title="Trusted members">
						<Card>
							{highlights.trustedUsers.map((u) => (
								<PersonRow
									key={String(u._id || u.userId)}
									name={u.name}
									subtitle={`Trust ${u.trustScore ?? 0} · ${u.totalReviews ?? 0} reviews`}
									avatar={u.profilePicture}
									onPress={() => openProfile(u._id || u.userId, u.name)}
								/>
							))}
						</Card>
					</Section>
				) : null}

				<Card style={styles.footerCard}>
					<Text style={typography.h4}>Achievement leaderboard</Text>
					<Text style={[typography.muted, { marginTop: spacing.xs }]}>
						See who has unlocked the most badges.
					</Text>
					<View style={{ height: spacing.md }} />
					<Button title="View leaderboard" onPress={() => navigation.navigate('AchievementLeaderboard')} />
				</Card>
			</ScrollView>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	scroll: { paddingBottom: spacing.huge },
	hero: { padding: spacing.lg },
	heroActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
	banner: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
	section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
	personRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
	avatar: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.border },
	avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
	avatarText: { fontWeight: '800', color: colors.primaryDark },
	exchangeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
	exchangeIcon: { fontSize: 20 },
	footerCard: { marginHorizontal: spacing.lg },
});
