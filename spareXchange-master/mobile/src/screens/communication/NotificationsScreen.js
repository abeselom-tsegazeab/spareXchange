import React, { useCallback } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import NotificationRow from '../../components/NotificationRow';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { useNotificationsStore } from '../../store/notificationsStore';

export default function NotificationsScreen({ navigation }) {
	const {
		notifications,
		unreadCount,
		loading,
		error,
		fetchNotifications,
		markRead,
		markAllRead,
		deleteNotification,
	} = useNotificationsStore();

	useFocusEffect(
		useCallback(() => {
			fetchNotifications();
		}, [fetchNotifications])
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

	const onDelete = (item) => {
		Alert.alert('Delete notification?', item.title || item.message, [
			{ text: 'Cancel', style: 'cancel' },
			{ text: 'Delete', style: 'destructive', onPress: () => deleteNotification(item._id) },
		]);
	};

	return (
		<ScreenContainer padded={false}>
			<View style={styles.header}>
				<View style={styles.titleRow}>
					<Text style={typography.h2}>Notifications</Text>
					{unreadCount > 0 ? (
						<Pressable onPress={markAllRead} hitSlop={8}>
							<Text style={styles.markAll}>Mark all read</Text>
						</Pressable>
					) : null}
				</View>
				<Text style={typography.muted}>
					{unreadCount > 0 ? `${unreadCount} unread` : 'You are all caught up.'}
				</Text>
				{error && !notifications.length ? (
					<Banner tone="danger" message={error} style={{ marginTop: spacing.md }} />
				) : null}
			</View>

			{loading && !notifications.length ? (
				<Loader fullscreen label="Loading notifications..." />
			) : (
				<FlatList
					data={notifications}
					keyExtractor={(item) => item._id}
					contentContainerStyle={styles.list}
					refreshControl={
						<RefreshControl refreshing={loading} onRefresh={fetchNotifications} tintColor={colors.primary} />
					}
					renderItem={({ item }) => (
						<NotificationRow item={item} onPress={() => onPress(item)} onDelete={onDelete} />
					)}
					ListEmptyComponent={
						<EmptyState
							title="No notifications"
							message="Alerts for exchanges, matches, and messages will appear here."
						/>
					}
				/>
			)}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
	titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	markAll: { ...typography.caption, color: colors.primaryDark, fontWeight: '800' },
	list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.huge },
});
