import React, { useCallback } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, radius, spacing, typography } from '../../config/theme';
import { resolveAssetUrl } from '../../config/env';
import { useCommunityStore } from '../../store/communityStore';
import { useAuthStore } from '../../store/authStore';

const MEDAL = ['🥇', '🥈', '🥉'];

export default function AchievementLeaderboardScreen({ navigation }) {
	const me = useAuthStore((s) => s.user);
	const { achievementLeaderboard, loadingLeaderboard, error, fetchAchievementLeaderboard } = useCommunityStore();

	useFocusEffect(
		useCallback(() => {
			fetchAchievementLeaderboard({ limit: 20 });
		}, [fetchAchievementLeaderboard])
	);

	const openProfile = (userId, userName) => {
		if (!userId) return;
		navigation.navigate('PublicProfile', { userId: String(userId), userName });
	};

	const renderItem = ({ item, index }) => {
		const isMe = String(item.userId) === String(me?._id);
		return (
			<Pressable
				onPress={() => openProfile(item.userId, item.name)}
				style={({ pressed }) => [styles.row, isMe && styles.rowMe, pressed && { opacity: 0.85 }]}
			>
				<Text style={styles.rank}>{MEDAL[index] || `#${index + 1}`}</Text>
				{item.profilePicture ? (
					<Image source={{ uri: resolveAssetUrl(item.profilePicture) }} style={styles.avatar} />
				) : (
					<View style={[styles.avatar, styles.avatarFallback]}>
						<Text style={styles.avatarText}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
					</View>
				)}
				<View style={{ flex: 1 }}>
					<Text style={typography.bodyStrong}>
						{item.name}
						{isMe ? '  · You' : ''}
					</Text>
					<Text style={typography.caption}>{item.ecoTier || 'Bronze'} tier</Text>
				</View>
				<View style={styles.scoreCol}>
					<Text style={typography.h4}>{item.achievementsCount ?? 0}</Text>
					<Text style={typography.caption}>badges</Text>
				</View>
			</Pressable>
		);
	};

	return (
		<ScreenContainer padded={false}>
			{error && !achievementLeaderboard.length ? (
				<Banner tone="danger" message={error} style={styles.banner} />
			) : null}

			{loadingLeaderboard && !achievementLeaderboard.length ? (
				<Loader fullscreen label="Loading leaderboard..." />
			) : (
				<FlatList
					data={achievementLeaderboard}
					keyExtractor={(item) => String(item.userId)}
					contentContainerStyle={styles.list}
					refreshControl={
						<RefreshControl
							refreshing={loadingLeaderboard}
							onRefresh={() => fetchAchievementLeaderboard({ limit: 20 })}
							tintColor={colors.primary}
						/>
					}
					renderItem={renderItem}
					ListEmptyComponent={
						<EmptyState title="No leaderboard data" message="Members with achievements will appear here." />
					}
				/>
			)}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	banner: { margin: spacing.lg },
	list: { padding: spacing.lg, paddingBottom: spacing.huge },
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		paddingVertical: spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
	},
	rowMe: { backgroundColor: colors.primarySoft, borderRadius: radius.md, paddingHorizontal: spacing.sm },
	rank: { width: 28, textAlign: 'center', fontSize: 16 },
	avatar: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.border },
	avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primarySoft },
	avatarText: { fontWeight: '800', color: colors.primaryDark },
	scoreCol: { alignItems: 'flex-end' },
});
