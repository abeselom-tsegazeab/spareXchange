import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	FlatList,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import MessageBubble from '../../components/MessageBubble';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import { colors, radius, spacing, typography } from '../../config/theme';
import { useMessagesStore } from '../../store/messagesStore';
import { useAuthStore } from '../../store/authStore';

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

export default function ChatScreen({ route, navigation }) {
	const { userId, userName, listingId } = route.params || {};
	const me = useAuthStore((s) => s.user);
	const { messages, loadingThread, sending, error, fetchThread, sendMessage, markThreadRead, clearThread } =
		useMessagesStore();

	const [draft, setDraft] = useState('');
	const listRef = useRef(null);

	useEffect(() => {
		navigation.setOptions({ title: userName || 'Chat' });
	}, [navigation, userName]);

	useFocusEffect(
		useCallback(() => {
			if (userId) {
				fetchThread(userId).then((msgs) => {
					if (msgs?.length) markThreadRead(userId);
				});
			}
			return () => clearThread();
		}, [userId, fetchThread, markThreadRead, clearThread])
	);

	useEffect(() => {
		if (messages.length) {
			setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
		}
	}, [messages.length]);

	const onSend = async () => {
		const text = draft.trim();
		if (!text || !userId) return;
		const res = await sendMessage({ receiverId: userId, content: text, listingId });
		if (res.success) setDraft('');
	};

	if (loadingThread && !messages.length) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading chat..." />
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer padded={false}>
			{error ? <Banner tone="danger" message={error} style={{ margin: spacing.md }} /> : null}

			<FlatList
				ref={listRef}
				data={messages}
				keyExtractor={(item) => item._id}
				contentContainerStyle={styles.list}
				renderItem={({ item }) => (
					<MessageBubble message={item} isMine={String(idOf(item.senderId)) === String(me?._id)} />
				)}
				ListEmptyComponent={
					<Text style={[typography.muted, styles.empty]}>
						Say hello — ask about availability, condition, or meeting details.
					</Text>
				}
			/>

			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : undefined}
				keyboardVerticalOffset={90}
			>
				<View style={styles.composer}>
					<TextInput
						value={draft}
						onChangeText={setDraft}
						placeholder="Type a message..."
						placeholderTextColor={colors.textSubtle}
						style={styles.input}
						multiline
						maxLength={2000}
					/>
					<Button title="Send" onPress={onSend} loading={sending} disabled={!draft.trim()} size="sm" />
				</View>
			</KeyboardAvoidingView>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	list: { paddingVertical: spacing.md, flexGrow: 1 },
	empty: { textAlign: 'center', padding: spacing.xl },
	composer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		gap: spacing.sm,
		padding: spacing.md,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		backgroundColor: colors.surface,
	},
	input: {
		flex: 1,
		minHeight: 44,
		maxHeight: 120,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.lg,
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.sm,
		...typography.body,
	},
});
