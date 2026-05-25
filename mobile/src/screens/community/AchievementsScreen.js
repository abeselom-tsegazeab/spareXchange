import React, { useCallback } from 'react';
import { Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import AchievementBadge from '../../components/AchievementBadge';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { useCommunityStore } from '../../store/communityStore';

export default function AchievementsScreen({ navigation }) {
	const {
		achievements,
		loadingAchievements,
		checkingAchievements,
		lastUnlockMessage,
		error,
		fetchAchievements,
		checkAchievements,
	} = useCommunityStore();

	const load = useCallback(() => {
		fetchAchievements();
	}, [fetchAchievements]);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load])
	);

	const onCheck = async () => {
		const result = await checkAchievements();
		if (result.success && result.unlocked?.length) {
			Alert.alert('New badges!', result.message || `Unlocked ${result.unlocked.length} achievement(s).`);
		} else if (result.success) {
			Alert.alert('All caught up', result.message || 'No new achievements right now.');
		}
	};

	const items = [...(achievements.unlocked || []), ...(achievements.locked || [])];

	return (
		<ScreenContainer padded={false}>
			<View style={styles.header}>
				{achievements.stats ? (
					<Card>
						<Text style={typography.h3}>{achievements.stats.totalUnlocked ?? 0} unlocked</Text>
						<Text style={typography.muted}>
							{achievements.stats.completionPercentage ?? 0}% complete · {achievements.ecoPoints ?? 0} eco points
						</Text>
					</Card>
				) : null}
				<View style={{ height: spacing.md }} />
				<Button title="Check for new badges" onPress={onCheck} loading={checkingAchievements} />
				<View style={{ height: spacing.sm }} />
				<Button
					title="Achievement leaderboard"
					variant="outline"
					onPress={() => navigation.navigate('AchievementLeaderboard')}
				/>
				{lastUnlockMessage ? (
					<Banner tone="success" message={lastUnlockMessage} style={{ marginTop: spacing.md }} />
				) : null}
				{error && !items.length ? <Banner tone="danger" message={error} style={{ marginTop: spacing.md }} /> : null}
			</View>

			{loadingAchievements && !items.length ? (
				<Loader fullscreen label="Loading achievements..." />
			) : (
				<FlatList
					data={items}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.list}
					refreshControl={
						<RefreshControl refreshing={loadingAchievements} onRefresh={load} tintColor={colors.primary} />
					}
					renderItem={({ item }) => <AchievementBadge achievement={item} />}
					ListEmptyComponent={
						<EmptyState
							title="No achievements yet"
							message="List items, complete exchanges, and recycle to earn badges."
						/>
					}
				/>
			)}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	header: { padding: spacing.lg, paddingBottom: spacing.sm },
	list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.huge },
});
