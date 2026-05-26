import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { useAdminStore } from '../../store/adminStore';

export default function MarketInsightsScreen() {
	const { highDemand, loading, error, fetchHighDemand } = useAdminStore();

	useFocusEffect(
		useCallback(() => {
			fetchHighDemand();
		}, [fetchHighDemand])
	);

	return (
		<ScreenContainer padded={false}>
			<View style={styles.header}>
				<Text style={typography.h2}>Market insights</Text>
				<Text style={typography.muted}>
					High-demand searches with few results — spot gaps to list the parts buyers want.
				</Text>
				{error ? <Banner tone="danger" message={error} style={{ marginTop: spacing.md }} /> : null}
			</View>

			{loading && !highDemand.length ? (
				<Loader fullscreen label="Loading market data..." />
			) : (
				<FlatList
					data={highDemand}
					keyExtractor={(item) => item._id}
					contentContainerStyle={styles.list}
					refreshControl={
						<RefreshControl refreshing={loading} onRefresh={fetchHighDemand} tintColor={colors.primary} />
					}
					renderItem={({ item, index }) => (
						<Card style={styles.row}>
							<View style={styles.rank}>
								<Text style={styles.rankText}>{index + 1}</Text>
							</View>
							<View style={{ flex: 1 }}>
								<Text style={typography.bodyStrong}>{item._id}</Text>
								<Text style={typography.caption}>
									{item.searchCount} searches · avg {Number(item.avgResults || 0).toFixed(1)} results
								</Text>
								{item.lastSearched ? (
									<Text style={typography.caption}>
										Last searched {new Date(item.lastSearched).toLocaleDateString()}
									</Text>
								) : null}
							</View>
						</Card>
					)}
					ListEmptyComponent={
						<EmptyState
							title="No demand signals yet"
							message="As users search the marketplace, popular unmet queries will appear here."
						/>
					}
				/>
			)}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
	list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.huge },
	row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
	rank: {
		width: 32,
		height: 32,
		borderRadius: 16,
		backgroundColor: colors.primaryLight,
		alignItems: 'center',
		justifyContent: 'center',
	},
	rankText: { fontWeight: '900', color: colors.primaryDark },
});
