import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Card from '../../components/Card';
import DateTimeField from '../../components/DateTimeField';
import SafeZonesSheet from './SafeZonesSheet';
import { colors, radius, spacing, typography } from '../../config/theme';
import { useExchangesStore } from '../../store/exchangesStore';

export default function NegotiateMeetingScreen({ route, navigation }) {
	const { exchange } = route.params || {};
	const negotiate = useExchangesStore((s) => s.negotiate);
	const submitting = useExchangesStore((s) => s.submitting);

	const [meetingLocation, setMeetingLocation] = useState(exchange?.meetingDetails?.location || '');
	const [meetingTime, setMeetingTime] = useState(
		exchange?.meetingDetails?.time ? new Date(exchange.meetingDetails.time) : null
	);
	const [negotiationNotes, setNegotiationNotes] = useState(exchange?.negotiationNotes || '');
	const [safeZoneOpen, setSafeZoneOpen] = useState(false);
	const [error, setError] = useState(null);

	const wasLocked = exchange?.meetingDetails?.isLocked;

	const save = async (lock = false) => {
		setError(null);
		const res = await negotiate(exchange._id, {
			meetingLocation: meetingLocation.trim(),
			meetingTime: meetingTime ? meetingTime.toISOString() : undefined,
			negotiationNotes,
			isLocked: lock,
		});
		if (res.success) navigation.goBack();
		else setError(res.message || 'Could not update meeting');
	};

	const confirmLock = () => {
		if (!meetingLocation.trim() || !meetingTime) {
			Alert.alert('Almost there', 'Set both location AND time before locking.');
			return;
		}
		Alert.alert(
			'Lock meeting?',
			'Once locked the location and time cannot be changed. The handshake step becomes available.',
			[
				{ text: 'Cancel', style: 'cancel' },
				{ text: 'Lock', style: 'destructive', onPress: () => save(true) },
			]
		);
	};

	if (wasLocked) {
		return (
			<ScreenContainer scroll>
				<Banner
					tone="info"
					title="Meeting already locked"
					message="The location and time for this exchange are final. Open the handshake step when you meet."
				/>
				<Card>
					<Text style={typography.muted}>Where</Text>
					<Text style={typography.bodyStrong}>{exchange?.meetingDetails?.location}</Text>
					<View style={{ height: spacing.md }} />
					<Text style={typography.muted}>When</Text>
					<Text style={typography.bodyStrong}>
						{exchange?.meetingDetails?.time
							? new Date(exchange.meetingDetails.time).toLocaleString()
							: '—'}
					</Text>
				</Card>
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer scroll keyboard>
			{error ? <Banner tone="danger" message={error} /> : null}

			<Text style={typography.h2}>Negotiate meeting</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
				Both you and your counterparty can edit these. Lock when you've fully agreed.
			</Text>

			<Text style={[typography.label, { marginBottom: spacing.xs }]}>Meeting location *</Text>
			<Input
				value={meetingLocation}
				onChangeText={setMeetingLocation}
				placeholder="Pick a safe zone or type an address"
				autoCapitalize="words"
			/>
			<Pressable onPress={() => setSafeZoneOpen(true)} style={styles.safeZoneBtn} hitSlop={6}>
				<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>
					＋ Choose a verified safe zone
				</Text>
			</Pressable>

			<DateTimeField
				label="Meeting time *"
				value={meetingTime}
				onChange={setMeetingTime}
				minimumDate={new Date()}
			/>

			<Input
				label="Negotiation notes"
				value={negotiationNotes}
				onChangeText={setNegotiationNotes}
				placeholder="Anything the other person should bring or know"
				multiline
				numberOfLines={3}
				maxLength={500}
			/>

			<Button title="Save changes" onPress={() => save(false)} loading={submitting} size="lg" />
			<View style={{ height: spacing.md }} />
			<Button title="🔒 Lock meeting" variant="secondary" onPress={confirmLock} size="lg" />

			<SafeZonesSheet
				visible={safeZoneOpen}
				onClose={() => setSafeZoneOpen(false)}
				onSelect={(z) => {
					setMeetingLocation(z.name);
					setSafeZoneOpen(false);
				}}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	safeZoneBtn: { alignSelf: 'flex-start', marginTop: -spacing.sm, marginBottom: spacing.sm, paddingVertical: 4 },
});
