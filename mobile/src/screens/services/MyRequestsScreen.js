import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import RequestCard from '../../components/RequestCard';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import { colors, radius, spacing, typography } from '../../config/theme';
import { STATUS_TABS } from '../../config/serviceCatalog';
import { useServicesStore } from '../../store/servicesStore';

export default function MyRequestsScreen({ navigation }) {
	const { myRequests, loading, fetchMyRequests } = useServicesStore();
	const [tab, setTab] = useState('all');

	useEffect(() => {
		fetchMyRequests();
	}, [fetchMyRequests]);

	const filtered = (myRequests || []).filter((r) => (tab === 'all' ? true : r.status === tab));

	return (
		<ScreenContainer padded={false}>
			<View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
				<View style={styles.headRow}>
					<View>
						<Text style={typography.h2}>My requests</Text>
						<Text style={typography.muted}>Track quotes and active jobs.</Text>
					</View>
					<Button title="+ New" onPress={() => navigation.navigate('CreateRequest')} fullWidth={false} size="sm" />
				</View>
				<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
					{STATUS_TABS.map((t) => (
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
					<RequestCard request={item} onPress={(r) => navigation.navigate('RequestDetail', { id: r._id })} />
				)}
				contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.huge }}
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={fetchMyRequests} tintColor={colors.primary} colors={[colors.primary]} />
				}
				ListEmptyComponent={
					<EmptyState
						icon="📋"
						title={tab === 'all' ? 'No requests yet' : 'Nothing in this tab'}
						message="Post a request and let verified technicians compete for your job."
						actionLabel={tab === 'all' ? 'New service request' : null}
						onAction={tab === 'all' ? () => navigation.navigate('CreateRequest') : null}
					/>
				}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	tab: {
		paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill,
		borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, marginRight: spacing.xs,
	},
	tabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	tabText: { ...typography.caption, fontWeight: '700', color: colors.text },
	tabTextActive: { color: colors.textInverse },
});
