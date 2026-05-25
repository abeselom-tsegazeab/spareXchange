import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import NotificationRow from '../../components/NotificationRow';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { useNotificationsStore } from '../../store/notificationsStore';

const FILTERS = [
	{ key: null, label: 'All' },
	{ key: 'unread', label: 'Unread' },
	{ key: 'message', label: 'Messages' },
	{ key: 'exchange_proposed', label: 'Exchanges' },
	{ key: 'match', label: 'Matches' },
];

export default function NotificationHistoryScreen({ navigation }) {
	const {
		history,
		loadingHistory,
		error,
		historyPagination,
		fetchHistory,
		markRead,
		deleteNotification,
	} = useNotificationsStore();

	const [filter, setFilter] = useState(null);

	const load = useCallback(() => {
		const params = { page: 1, limit: 40 };
		if (filter === 'unread') params.isRead = 'false';
		else if (filter) params.type = filter;
		fetchHistory(params);
	}, [filter, fetchHistory]);

	useFocusEffect(
		useCallback(() => {
			load();
		}, [load])
	);

	const onPress = async (item) => {
		if (!item.isRead) await markRead(item._id);
		const relatedId = item.relatedId || item.data?.exchangeId || item.data?.listingId;
		if (item.type?.startsWith('exchange') && relatedId) {
			navigation.getParent()?.navigate('Main', {
				screen: 'Trades',
				params: { screen: 'ExchangeDetail', params: { id: String(relatedId) } },
			});
		}
	};

	return (
		<ScreenContainer padded={false}>
			<View style={styles.header}>
				<Text style={typography.h2}>Notification history</Text>
				{historyPagination?.total != null ? (
					<Text style={typography.muted}>{historyPagination.total} total</Text>
				) : null}
				{error ? <Banner tone="danger" message={error} style={{ marginTop: spacing.sm }} /> : null}
				<FlatList
					horizontal
					data={FILTERS}
					keyExtractor={(item) => String(item.key)}
					showsHorizontalScrollIndicator={false}
					style={{ marginTop: spacing.md }}
					renderItem={({ item }) => (
						<Chip label={item.label} active={filter === item.key} onPress={() => setFilter(item.key)} />
					)}
				/>
			</View>

			{loadingHistory && !history.length ? (
				<Loader fullscreen label="Loading history..." />
			) : (
				<FlatList
					data={history}
					keyExtractor={(item) => item._id}
					contentContainerStyle={styles.list}
					refreshControl={
						<RefreshControl refreshing={loadingHistory} onRefresh={load} tintColor={colors.primary} />
					}
					renderItem={({ item }) => (
						<NotificationRow item={item} onPress={() => onPress(item)} onDelete={deleteNotification} />
					)}
					ListEmptyComponent={
						<EmptyState title="No notifications" message="History will appear as you use the app." />
					}
				/>
			)}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
	list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.huge },
});
