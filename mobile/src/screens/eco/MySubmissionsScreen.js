import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import EmptyState from '../../components/EmptyState';
import SubmissionCard from '../../components/SubmissionCard';
import Button from '../../components/Button';
import { colors, radius, spacing, typography } from '../../config/theme';
import { useSustainabilityStore } from '../../store/sustainabilityStore';

const TABS = [
	{ key: 'all', label: 'All' },
	{ key: 'pending', label: 'Pending' },
	{ key: 'approved', label: 'Approved' },
	{ key: 'completed', label: 'Completed' },
	{ key: 'rejected', label: 'Rejected' },
];

export default function MySubmissionsScreen({ navigation }) {
	const { submissions, loading, fetchMySubmissions } = useSustainabilityStore();
	const [tab, setTab] = useState('all');

	useEffect(() => {
		fetchMySubmissions();
	}, [fetchMySubmissions]);

	const filtered = (submissions || []).filter((s) => (tab === 'all' ? true : s.status === tab));

	return (
		<ScreenContainer padded={false}>
			<View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
				<View style={styles.headRow}>
					<View>
						<Text style={typography.h2}>My submissions</Text>
						<Text style={typography.muted}>Track your recycling history.</Text>
					</View>
					<Button title="+ New" onPress={() => navigation.navigate('SubmitRecycling')} fullWidth={false} size="sm" />
				</View>

				<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
					{TABS.map((t) => (
						<Pressable
							key={t.key}
							onPress={() => setTab(t.key)}
							style={[styles.tab, tab === t.key && styles.tabActive]}
						>
							<Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
						</Pressable>
					))}
				</ScrollView>
			</View>

			<FlatList
				data={filtered}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<SubmissionCard
						submission={item}
						onPress={() => navigation.navigate('SubmissionDetail', { id: item._id })}
					/>
				)}
				contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.huge }}
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={fetchMySubmissions} tintColor={colors.primary} colors={[colors.primary]} />
				}
				ListEmptyComponent={
					<EmptyState
						icon="♻"
						title={tab === 'all' ? 'Nothing to show' : 'Nothing in this tab'}
						message="Submit recycling to earn EcoPoints and grow your tier."
						actionLabel={tab === 'all' ? 'Submit recycling' : null}
						onAction={tab === 'all' ? () => navigation.navigate('SubmitRecycling') : null}
					/>
				}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	tab: {
		paddingHorizontal: spacing.md,
		paddingVertical: 8,
		borderRadius: radius.pill,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
		marginRight: spacing.xs,
	},
	tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	tabText: { ...typography.caption, fontWeight: '700', color: colors.text },
	tabTextActive: { color: colors.textInverse },
});
