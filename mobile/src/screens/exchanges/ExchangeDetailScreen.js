import React, { useEffect, useState } from 'react';
import {
	Alert,
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Loader from '../../components/Loader';
import StatusPill from '../../components/StatusPill';
import CounterOfferSheet from './CounterOfferSheet';
import OpenDisputeSheet from './OpenDisputeSheet';

import { colors, radius, shadow, spacing, typography } from '../../config/theme';
import { resolveAssetUrl } from '../../config/env';
import { useExchangesStore } from '../../store/exchangesStore';
import { useAuthStore } from '../../store/authStore';

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : '—');

const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

const historyLabel = (a) =>
	({
		pending: 'Proposed',
		counter_offered: 'Counter-offer made',
		accepted: 'Accepted',
		rejected: 'Rejected',
		cancelled: 'Cancelled',
		meeting_updated: 'Meeting details updated',
		meeting_locked: 'Meeting locked',
		completed_by_buyer: 'Buyer marked complete',
		completed_by_seller: 'Seller marked complete',
		fully_completed: 'Fully completed',
		fully_completed_vid_handshake: 'Completed via handshake',
		handshake_token_generated: 'Handshake token generated',
		handshake_token_regenerated: 'Handshake token regenerated',
		handshake_token_invalidated: 'Previous handshake token invalidated',
		handover_photo_uploaded: 'Handover photo uploaded',
		dispute_opened: 'Dispute opened',
		auto_expired: 'Auto-expired',
	})[a] || a;

export default function ExchangeDetailScreen({ route, navigation }) {
	const { id } = route.params || {};
	const me = useAuthStore((s) => s.user);
	const {
		exchange,
		loadingDetail,
		submitting,
		fetchExchange,
		updateStatus,
		makeCounterOffer,
		complete,
		openDispute,
		getRoleFor,
	} = useExchangesStore();

	const [counterOpen, setCounterOpen] = useState(false);
	const [disputeOpen, setDisputeOpen] = useState(false);
	const [info, setInfo] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchExchange(id);
	}, [id, fetchExchange]);

	if (loadingDetail || !exchange) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading exchange..." />
			</ScreenContainer>
		);
	}

	const { isBuyer, isSeller, isParticipant } = getRoleFor(exchange, me?._id);
	const counterparty = isBuyer ? exchange.sellerId : exchange.buyerId;
	const counterpartyId = idOf(counterparty);
	const meeting = exchange.meetingDetails || {};
	const status = exchange.status;
	const disputed = exchange.disputeStatus === 'open';

	const showActionRow = (label, onPress, variant = 'primary', loading = false) => (
		<Button title={label} onPress={onPress} variant={variant} loading={loading} />
	);

	const handleStatus = async (next, reason) => {
		setError(null);
		const res = await updateStatus(exchange._id, { status: next, reason });
		if (res.success) setInfo(`Status set to ${next.replace('_', ' ')}.`);
		else setError(res.message);
	};

	const confirmCancel = () => {
		Alert.alert('Cancel exchange?', 'You can\'t un-cancel a proposal.', [
			{ text: 'Keep', style: 'cancel' },
			{ text: 'Cancel proposal', style: 'destructive', onPress: () => handleStatus('cancelled', 'User cancelled') },
		]);
	};

	const confirmReject = () => {
		Alert.alert('Reject proposal?', 'The buyer will be notified.', [
			{ text: 'Keep', style: 'cancel' },
			{ text: 'Reject', style: 'destructive', onPress: () => handleStatus('rejected', 'Seller rejected') },
		]);
	};

	const onComplete = async () => {
		setError(null);
		const res = await complete(exchange._id);
		if (res.success) setInfo('Your side is marked complete. Waiting for the other party.');
		else setError(res.message);
	};

	const submitCounter = async ({ offeredItems, note }) =>
		makeCounterOffer(exchange._id, { offeredItems, note });
	const submitDispute = async ({ reason }) => openDispute(exchange._id, { reason });

	return (
		<ScreenContainer scroll padded>
			{error ? <Banner tone="danger" message={error} /> : null}
			{info ? <Banner tone="success" message={info} /> : null}

			{disputed ? (
				<Banner
					tone="danger"
					title="Dispute open"
					message={exchange.disputeReason || 'Our team is reviewing this exchange.'}
				/>
			) : null}

			{/* Listing summary */}
			<Card style={{ marginBottom: spacing.lg }}>
				<View style={styles.listingRow}>
					{exchange.listingId?.images?.[0] ? (
						<Image source={{ uri: resolveAssetUrl(exchange.listingId.images[0]) }} style={styles.cover} />
					) : (
						<View style={[styles.cover, { backgroundColor: colors.surfaceAlt }]} />
					)}
					<View style={{ flex: 1 }}>
						<Text style={typography.bodyStrong} numberOfLines={2}>
							{exchange.listingId?.title || 'Listing'}
						</Text>
						{exchange.listingId?.price != null ? (
							<Text style={typography.muted}>
								Listed for ETB {Number(exchange.listingId.price).toLocaleString()}
							</Text>
						) : null}
						<View style={{ marginTop: spacing.xs }}>
							<StatusPill status={status} />
						</View>
					</View>
				</View>
			</Card>

			{/* Counterparty */}
			<Card style={{ marginBottom: spacing.lg }}>
				<Text style={typography.muted}>{isBuyer ? 'Selling to you' : 'Buying from you'}</Text>
				<Text style={typography.h4}>
					{counterparty?.name || 'User'}
				</Text>
				{counterparty?.trustScore ? (
					<Text style={typography.caption}>Trust score {counterparty.trustScore}/100</Text>
				) : null}
				{counterpartyId ? (
					<View style={{ marginTop: spacing.sm, flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg }}>
						<Pressable
							onPress={() =>
								navigation.getParent()?.navigate('Community', {
									screen: 'PublicProfile',
									params: { userId: counterpartyId, userName: counterparty?.name },
								})
							}
							hitSlop={6}
						>
							<Text style={{ color: colors.primaryDark, fontWeight: '700' }}>View profile</Text>
						</Pressable>
						<Pressable
							onPress={() =>
								navigation.navigate('Communication', {
									screen: 'UserReviews',
									params: { userId: counterpartyId, userName: counterparty?.name },
								})
							}
							hitSlop={6}
						>
							<Text style={{ color: colors.primaryDark, fontWeight: '700' }}>See reviews</Text>
						</Pressable>
						<Pressable
							onPress={() =>
								navigation.navigate('Communication', {
									screen: 'Chat',
									params: { userId: counterpartyId, userName: counterparty?.name },
								})
							}
							hitSlop={6}
						>
							<Text style={{ color: colors.primaryDark, fontWeight: '700' }}>Message</Text>
						</Pressable>
					</View>
				) : null}
			</Card>

			{/* Offer + counter-offers */}
			<Card style={{ marginBottom: spacing.lg }}>
				<Text style={typography.h4}>Offer</Text>
				<Text style={[typography.body, { marginTop: spacing.xs }]}>
					{exchange.offeredItems || 'No description.'}
				</Text>
				{exchange.counterOffers?.length ? (
					<View style={{ marginTop: spacing.md }}>
						<Text style={typography.label}>Counter-offers</Text>
						{exchange.counterOffers.map((co) => (
							<View key={co._id || co.createdAt} style={styles.counterRow}>
								<Text style={typography.bodyStrong}>{co.offeredItems}</Text>
								{co.note ? <Text style={typography.muted}>{co.note}</Text> : null}
								<Text style={typography.caption}>{fmtDate(co.createdAt)}</Text>
							</View>
						))}
					</View>
				) : null}
			</Card>

			{/* Meeting */}
			<Card style={{ marginBottom: spacing.lg }}>
				<Text style={typography.h4}>Meeting</Text>
				<View style={styles.kv}>
					<Text style={typography.muted}>Where</Text>
					<Text style={typography.bodyStrong}>{meeting.location || 'Not set'}</Text>
				</View>
				<View style={styles.kv}>
					<Text style={typography.muted}>When</Text>
					<Text style={typography.bodyStrong}>{fmtDate(meeting.time)}</Text>
				</View>
				{exchange.negotiationNotes ? (
					<View style={styles.kv}>
						<Text style={typography.muted}>Notes</Text>
						<Text style={typography.body}>{exchange.negotiationNotes}</Text>
					</View>
				) : null}
				{meeting.isLocked ? (
					<Text style={[typography.caption, { marginTop: spacing.sm, color: colors.primaryDark, fontWeight: '800' }]}>
						🔒 Meeting is locked — handshake step is unlocked.
					</Text>
				) : null}
			</Card>

			{/* Handover photos */}
			{exchange.handoverPhotos?.length ? (
				<Card style={{ marginBottom: spacing.lg }}>
					<Text style={typography.h4}>Handover proof</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.sm }}>
						{exchange.handoverPhotos.map((url, i) => (
							<Image key={i} source={{ uri: resolveAssetUrl(url) }} style={styles.handoverThumb} />
						))}
					</ScrollView>
				</Card>
			) : null}

			{/* History / audit trail */}
			{exchange.history?.length ? (
				<Card style={{ marginBottom: spacing.lg }}>
					<Text style={typography.h4}>Activity</Text>
					<View style={{ marginTop: spacing.sm }}>
						{exchange.history.map((h, i) => (
							<View key={i} style={styles.historyRow}>
								<View style={styles.historyDot} />
								<View style={{ flex: 1 }}>
									<Text style={typography.bodyStrong}>{historyLabel(h.action)}</Text>
									<Text style={typography.caption}>
										{fmtDate(h.at)}
										{h.note ? `  ·  ${h.note}` : ''}
									</Text>
								</View>
							</View>
						))}
					</View>
				</Card>
			) : null}

			{/* Actions */}
			{isParticipant ? (
				<View style={styles.actionsBlock}>
					{/* Pending: seller decides; buyer can cancel */}
					{status === 'pending' && isSeller ? (
						<>
							<Button title="Accept proposal" onPress={() => handleStatus('accepted')} loading={submitting} />
							<View style={{ height: spacing.sm }} />
							<Button title="Counter-offer" variant="secondary" onPress={() => setCounterOpen(true)} />
							<View style={{ height: spacing.sm }} />
							<Button title="Reject" variant="danger" onPress={confirmReject} />
						</>
					) : null}
					{status === 'pending' && isBuyer ? showActionRow('Cancel proposal', confirmCancel, 'danger') : null}

					{/* Counter-offered: either party can accept/reject/counter again */}
					{status === 'counter_offered' ? (
						<>
							<Button title="Accept latest counter" onPress={() => handleStatus('accepted')} loading={submitting} />
							<View style={{ height: spacing.sm }} />
							<Button title="New counter-offer" variant="secondary" onPress={() => setCounterOpen(true)} />
							<View style={{ height: spacing.sm }} />
							<Button title="Reject" variant="danger" onPress={confirmReject} />
						</>
					) : null}

					{/* Accepted: negotiate, handshake, handover, complete, dispute */}
					{['accepted', 'completed_by_buyer', 'completed_by_seller'].includes(status) ? (
						<>
							<Button
								title="Negotiate meeting"
								variant="secondary"
								onPress={() => navigation.navigate('NegotiateMeeting', { exchange })}
							/>
							<View style={{ height: spacing.sm }} />
							<Button
								title="🔐 Handshake"
								onPress={() => navigation.navigate('Handshake', { id: exchange._id })}
							/>
							<View style={{ height: spacing.sm }} />
							<Button
								title="📷 Upload handover photo"
								variant="secondary"
								onPress={() => navigation.navigate('HandoverPhoto', { id: exchange._id })}
							/>
							{status !== 'fully_completed' ? (
								<>
									<View style={{ height: spacing.sm }} />
									<Button
										title={`Mark complete${isBuyer ? ' (buyer)' : ' (seller)'}`}
										onPress={onComplete}
										loading={submitting}
									/>
								</>
							) : null}
						</>
					) : null}

					{/* Dispute available on most active statuses */}
					{['accepted', 'completed_by_buyer', 'completed_by_seller'].includes(status) && !disputed ? (
						<>
							<View style={{ height: spacing.lg }} />
							<Pressable onPress={() => setDisputeOpen(true)} hitSlop={6} style={{ alignSelf: 'center' }}>
								<Text style={{ color: colors.danger, fontWeight: '700' }}>⚑ Open a dispute</Text>
							</Pressable>
						</>
					) : null}

					{status === 'fully_completed' || status === 'fully_completed_vid_handshake' ? (
						<>
							<View style={{ height: spacing.lg }} />
							<Button
								title="Leave a review"
								onPress={() =>
									navigation.navigate('Communication', {
										screen: 'WriteReview',
										params: {
											revieweeId: counterpartyId,
											revieweeName: counterparty?.name,
											exchangeId: exchange._id,
											listingTitle: exchange.listingId?.title,
										},
									})
								}
							/>
						</>
					) : null}

					{isParticipant && counterpartyId ? (
						<>
							<View style={{ height: spacing.md }} />
							<Pressable
								onPress={() =>
									navigation.navigate('Communication', {
										screen: 'ReportUser',
										params: {
											targetId: counterpartyId,
											targetName: counterparty?.name,
											exchangeId: exchange._id,
										},
									})
								}
								hitSlop={6}
								style={{ alignSelf: 'center' }}
							>
								<Text style={{ color: colors.textMuted, fontWeight: '700' }}>Report this user</Text>
							</Pressable>
						</>
					) : null}
				</View>
			) : null}

			<CounterOfferSheet
				visible={counterOpen}
				onClose={() => setCounterOpen(false)}
				onSubmit={submitCounter}
				submitting={submitting}
			/>
			<OpenDisputeSheet
				visible={disputeOpen}
				onClose={() => setDisputeOpen(false)}
				onSubmit={submitDispute}
				submitting={submitting}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	listingRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
	cover: { width: 76, height: 76, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
	kv: { marginTop: spacing.sm },
	counterRow: {
		marginTop: spacing.sm,
		padding: spacing.md,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		backgroundColor: colors.surfaceAlt,
	},
	handoverThumb: {
		width: 110,
		height: 110,
		borderRadius: radius.md,
		marginRight: spacing.sm,
		backgroundColor: colors.surfaceAlt,
	},
	historyRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: spacing.sm,
	},
	historyDot: {
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.primary,
		marginRight: spacing.md,
		marginTop: 7,
	},
	actionsBlock: { marginTop: spacing.lg, marginBottom: spacing.xxl },
});
