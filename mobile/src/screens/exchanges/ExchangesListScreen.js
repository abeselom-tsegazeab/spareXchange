import React, { useEffect, useState } from 'react';
import {
	FlatList,
	Image,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import EmptyState from '../../components/EmptyState';
import Banner from '../../components/Banner';
import StatusPill from '../../components/StatusPill';
import { colors, radius, shadow, spacing, typography } from '../../config/theme';
import { STATUS_TABS } from '../../config/exchangeStatus';
import { resolveAssetUrl } from '../../config/env';
import { useExchangesStore } from '../../store/exchangesStore';
import { useAuthStore } from '../../store/authStore';

export default function ExchangesListScreen({ navigation }) {
	const me = useAuthStore((s) => s.user);
	const { exchanges, loading, error, fetchExchanges, getRoleFor } = useExchangesStore();
	const [tab, setTab] = useState('all');

	useEffect(() => {
		fetchExchanges(tab === 'all' ? undefined : tab);
	}, [tab, fetchExchanges]);

	const onRefresh = () => fetchExchanges(tab === 'all' ? undefined : tab);

	const renderItem = ({ item }) => {
		const { isBuyer, isSeller } = getRoleFor(item, me?._id);
		const counterparty = isBuyer ? item.sellerId : item.buyerId;
		const meeting = item.meetingDetails;
		const cover = resolveAssetUrl(item.listingId?.images?.[0]);

		return (
			<Pressable
				style={({ pressed }) => [styles.card, shadow.sm, pressed && { opacity: 0.85 }]}
				onPress={() => navigation.navigate('ExchangeDetail', { id: item._id })}
			>
				<View style={styles.cardHead}>
					{cover ? (
						<Image source={{ uri: cover }} style={styles.cover} />
					) : (
						<View style={[styles.cover, styles.coverFallback]}>
							<Text style={{ color: colors.textMuted }}>—</Text>
						</View>
					)}
					<View style={{ flex: 1 }}>
						<Text style={typography.bodyStrong} numberOfLines={2}>
							{item.listingId?.title || 'Listing'}
						</Text>
						<Text style={typography.caption}>
							{isBuyer ? 'Buying from' : 'Selling to'} {counterparty?.name || 'user'}
						</Text>
						<View style={styles.pillRow}>
							<StatusPill status={item.status} />
							{item.disputeStatus === 'open' ? (
								<View style={[styles.miniPill, { backgroundColor: '#FEE2E2' }]}>
									<Text style={[styles.miniPillText, { color: '#991B1B' }]}>Dispute open</Text>
								</View>
							) : null}
							{meeting?.isLocked ? (
								<View style={[styles.miniPill, { backgroundColor: '#E0E7FF' }]}>
									<Text style={[styles.miniPillText, { color: '#3730A3' }]}>🔒 Meeting locked</Text>
								</View>
							) : null}
						</View>
					</View>
				</View>

				{(item.offeredItems || meeting?.location || meeting?.time) ? (
					<View style={styles.metaBlock}>
						{item.offeredItems ? (
							<Text style={styles.metaLine} numberOfLines={1}>
								💼 {item.offeredItems}
							</Text>
						) : null}
						{meeting?.location ? (
							<Text style={styles.metaLine} numberOfLines={1}>
								📍 {meeting.location}
							</Text>
						) : null}
						{meeting?.time ? (
							<Text style={styles.metaLine}>🕒 {new Date(meeting.time).toLocaleString()}</Text>
						) : null}
					</View>
				) : null}
			</Pressable>
		);
	};

	return (
		<ScreenContainer padded={false}>
			<View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
				<Text style={typography.h2}>Trades</Text>
				<Text style={typography.muted}>Your exchanges, negotiations and handovers.</Text>

				{error ? <Banner tone="danger" message={error} /> : null}

				<ScrollView
					horizontal
					showsHorizontalScrollIndicator={false}
					style={{ marginTop: spacing.lg, marginBottom: spacing.md }}
				>
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
				data={exchanges}
				keyExtractor={(item) => item._id}
				renderItem={renderItem}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={onRefresh}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
				contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.huge }}
				ListEmptyComponent={
					<EmptyState
						icon="⇄"
						title={tab === 'all' ? 'No exchanges yet' : 'Nothing in this tab'}
						message="Propose a trade from any listing's detail page to start your first exchange."
					/>
				}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
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

	card: {
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
		marginBottom: spacing.md,
	},
	cardHead: { flexDirection: 'row', gap: spacing.md },
	cover: { width: 72, height: 72, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
	coverFallback: { alignItems: 'center', justifyContent: 'center' },
	pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
	miniPill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill, marginRight: spacing.xs, marginTop: spacing.xs },
	miniPillText: { ...typography.caption, fontWeight: '800' },
	metaBlock: {
		marginTop: spacing.md,
		paddingTop: spacing.md,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		gap: 4,
	},
	metaLine: { ...typography.caption, color: colors.text },
});
