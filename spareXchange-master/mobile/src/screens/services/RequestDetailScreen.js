import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Loader from '../../components/Loader';
import Input from '../../components/Input';
import QuoteCard from '../../components/QuoteCard';
import SubmitQuoteSheet from './SubmitQuoteSheet';
import { colors, radius, spacing, typography } from '../../config/theme';
import {
	priorityColor,
	priorityLabel,
	serviceIcon,
	serviceLabel,
	statusLabel,
	statusTone,
	STATUS_TONE_COLORS,
} from '../../config/serviceCatalog';
import { useServicesStore } from '../../store/servicesStore';
import { useAuthStore } from '../../store/authStore';

const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');
const idOf = (v) => (v && typeof v === 'object' ? v._id : v);

export default function RequestDetailScreen({ route, navigation }) {
	const { id } = route.params || {};
	const me = useAuthStore((s) => s.user);
	const isTech = me?.userType === 'technician' && me?.roleStatus === 'verified';

	const {
		request,
		loadingDetail,
		submitting,
		fetchRequest,
		submitQuote,
		acceptQuote,
		cancelRequest,
		generateHandshakeToken,
		completeWithToken,
	} = useServicesStore();

	const [quoteOpen, setQuoteOpen] = useState(false);
	const [tokenDraft, setTokenDraft] = useState('');
	const [info, setInfo] = useState(null);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchRequest(id);
	}, [id, fetchRequest]);

	if (loadingDetail || !request) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading request..." />
			</ScreenContainer>
		);
	}

	const isOwner = String(idOf(request.userId)) === String(me?._id);
	const myQuote = (request.quotes || []).find((q) => String(idOf(q.technicianId)) === String(me?._id));
	const assignedId = idOf(request.assignedTechnician);
	const isAssignedTech = assignedId && String(assignedId) === String(me?._id);

	const tone = statusTone(request.status);
	const palette = STATUS_TONE_COLORS[tone] || STATUS_TONE_COLORS.muted;
	const pColor = priorityColor(request.priority);

	const onAcceptQuote = (q) => {
		Alert.alert(
			`Hire ${q.technicianId?.name || 'this technician'}?`,
			`You'll commit to ETB ${Number(q.estimatedCost).toLocaleString()}. Other quotes will be auto-declined.`,
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Hire',
					onPress: async () => {
						setError(null);
						const techId = idOf(q.technicianId);
						const res = await acceptQuote(request._id, techId);
						if (res.success) setInfo('Technician hired. They\'ll be in touch shortly.');
						else setError(res.message);
					},
				},
			]
		);
	};

	const onCancel = () => {
		Alert.alert('Cancel request?', 'Quotes will be withdrawn and the request closed.', [
			{ text: 'Keep', style: 'cancel' },
			{
				text: 'Cancel request',
				style: 'destructive',
				onPress: async () => {
					const res = await cancelRequest(request._id);
					if (res.success) setInfo('Request cancelled.');
					else setError(res.message);
				},
			},
		]);
	};

	const onSubmitQuote = async (payload) => submitQuote(request._id, payload);

	const onGenerateToken = async () => {
		setError(null);
		const res = await generateHandshakeToken(request._id);
		if (res.success) setInfo(`Show this 6-digit code to the customer: ${res.token}`);
		else setError(res.message);
	};

	const onCompleteWithToken = async () => {
		setError(null);
		const t = tokenDraft.replace(/\D/g, '');
		if (t.length !== 6) {
			setError('Enter the 6-digit completion token from your technician.');
			return;
		}
		const res = await completeWithToken(request._id, { token: t });
		if (res.success) {
			setInfo('Service completed. Don\'t forget to leave a review!');
			setTokenDraft('');
		} else {
			setError(res.message);
		}
	};

	const canSubmitQuote = isTech && !isOwner && ['pending', 'quoted'].includes(request.status);
	const showCustomerActions = isOwner && (request.quotes?.length || 0) > 0 && request.status === 'quoted';
	const showCustomerCancel = isOwner && ['pending', 'quoted', 'accepted'].includes(request.status);
	const showTechGenerate = isAssignedTech && request.status === 'accepted';
	const showCustomerComplete = isOwner && request.status === 'started';

	return (
		<ScreenContainer scroll padded>
			{info ? <Banner tone="success" message={info} /> : null}
			{error ? <Banner tone="danger" message={error} /> : null}

			<Card style={{ marginBottom: spacing.lg }}>
				<View style={styles.headRow}>
					<View style={styles.iconBox}>
						<Text style={{ fontSize: 26 }}>{serviceIcon(request.serviceType)}</Text>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={typography.h3}>{serviceLabel(request.serviceType)}</Text>
						<View style={styles.pillRow}>
							<View style={[styles.pill, { backgroundColor: palette.bg }]}>
								<Text style={[styles.pillText, { color: palette.fg }]}>{statusLabel(request.status)}</Text>
							</View>
							<View style={[styles.pill, { backgroundColor: pColor }]}>
								<Text style={[styles.pillText, { color: '#fff' }]}>{priorityLabel(request.priority)}</Text>
							</View>
						</View>
					</View>
				</View>
				<Text style={[typography.body, { marginTop: spacing.md }]}>{request.description}</Text>
			</Card>

			<Card style={{ marginBottom: spacing.lg }}>
				<KV k="Location" v={request.location} />
				{request.budgetMin != null || request.budgetMax != null ? (
					<KV k="Budget" v={`ETB ${request.budgetMin ?? '?'} – ${request.budgetMax ?? '?'}`} />
				) : null}
				{request.contactInfo?.phone ? <KV k="Phone" v={request.contactInfo.phone} /> : null}
				<KV k="Posted" v={fmt(request.createdAt)} />
				{request.assignedTechnician ? (
					<KV k="Assigned to" v={request.assignedTechnician?.name || 'Technician'} />
				) : null}
				{request.estimatedCost ? <KV k="Agreed cost" v={`ETB ${request.estimatedCost}`} /> : null}
			</Card>

			{/* Quotes list */}
			<View style={{ marginBottom: spacing.lg }}>
				<Text style={[typography.h4, { marginBottom: spacing.sm }]}>
					Quotes ({request.quotes?.length || 0})
				</Text>
				{request.quotes?.length ? (
					request.quotes.map((q) => (
						<QuoteCard
							key={q._id || idOf(q.technicianId)}
							quote={q}
							isOwn={String(idOf(q.technicianId)) === String(me?._id)}
							isAccepted={assignedId && String(idOf(q.technicianId)) === String(assignedId)}
							onAccept={showCustomerActions ? onAcceptQuote : null}
							accepting={submitting}
						/>
					))
				) : (
					<Text style={typography.muted}>
						{isOwner ? 'No quotes yet — technicians will reply soon.' : 'Be the first to quote.'}
					</Text>
				)}
			</View>

			{/* Actions */}
			{canSubmitQuote ? (
				<Button
					title={myQuote ? 'Update my quote' : 'Submit a quote'}
					onPress={() => setQuoteOpen(true)}
					size="lg"
				/>
			) : null}

			{showTechGenerate ? (
				<>
					<View style={{ height: spacing.sm }} />
					<Button
						title="Generate completion token"
						onPress={onGenerateToken}
						loading={submitting}
						size="lg"
					/>
					{request.verificationToken ? (
						<Banner
							tone="success"
							title="Show this 6-digit code to the customer"
							message={`Code: ${request.verificationToken}`}
							style={{ marginTop: spacing.md }}
						/>
					) : null}
				</>
			) : null}

			{showCustomerComplete ? (
				<Card style={{ marginTop: spacing.lg }}>
					<Text style={typography.h4}>Mark service complete</Text>
					<Text style={[typography.caption, { marginBottom: spacing.md }]}>
						Ask your technician for the 6-digit completion code. Entering it confirms the job is done.
					</Text>
					<Input
						label="Completion token"
						value={tokenDraft}
						onChangeText={(t) => setTokenDraft(t.replace(/\D/g, '').slice(0, 6))}
						placeholder="123456"
						keyboardType="number-pad"
						maxLength={6}
						autoCapitalize="none"
					/>
					<Button
						title="Mark complete"
						onPress={onCompleteWithToken}
						disabled={tokenDraft.replace(/\D/g, '').length !== 6}
						loading={submitting}
					/>
				</Card>
			) : null}

			{showCustomerCancel ? (
				<>
					<View style={{ height: spacing.lg }} />
					<Pressable onPress={onCancel} hitSlop={6} style={{ alignSelf: 'center' }}>
						<Text style={{ color: colors.danger, fontWeight: '700' }}>Cancel request</Text>
					</Pressable>
				</>
			) : null}

			<SubmitQuoteSheet
				visible={quoteOpen}
				initial={myQuote}
				onClose={() => setQuoteOpen(false)}
				onSubmit={onSubmitQuote}
				submitting={submitting}
			/>
		</ScreenContainer>
	);
}

const KV = ({ k, v }) => (
	<View style={styles.kvRow}>
		<Text style={typography.muted}>{k}</Text>
		<Text style={typography.bodyStrong}>{String(v)}</Text>
	</View>
);

const styles = StyleSheet.create({
	headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	iconBox: {
		width: 56, height: 56, borderRadius: radius.md,
		backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center',
	},
	pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
	pill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill, marginRight: spacing.xs },
	pillText: { ...typography.caption, fontWeight: '800', fontSize: 11 },

	kvRow: {
		flexDirection: 'row', justifyContent: 'space-between',
		paddingVertical: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border,
		marginTop: spacing.xs,
	},
});
