import React, { useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import ConversationRow from '../../components/ConversationRow';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { useMessagesStore } from '../../store/messagesStore';

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

export default function ConversationsListScreen({ navigation }) {
	const { conversations, loading, error, fetchConversations } = useMessagesStore();

	useFocusEffect(
		useCallback(() => {
			fetchConversations();
		}, [fetchConversations])
	);

	return (
		<ScreenContainer padded={false}>
			<View style={styles.header}>
				<Text style={typography.h2}>Messages</Text>
				<Text style={typography.muted}>Chat with sellers, buyers, and technicians.</Text>
				{error && !conversations.length ? <Banner tone="danger" message={error} style={{ marginTop: spacing.md }} /> : null}
			</View>

			{loading && !conversations.length ? (
				<Loader fullscreen label="Loading conversations..." />
			) : (
				<FlatList
					data={conversations}
					keyExtractor={(item) => idOf(item.user)}
					contentContainerStyle={styles.list}
					refreshControl={
						<RefreshControl refreshing={loading} onRefresh={fetchConversations} tintColor={colors.primary} />
					}
					renderItem={({ item }) => (
						<ConversationRow
							conversation={item}
							onPress={() =>
								navigation.navigate('Chat', {
									userId: idOf(item.user),
									userName: item.user?.name,
								})
							}
						/>
					)}
					ListEmptyComponent={
						<EmptyState
							title="No conversations yet"
							message="Message a seller from a listing, or reply when someone contacts you."
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
});
