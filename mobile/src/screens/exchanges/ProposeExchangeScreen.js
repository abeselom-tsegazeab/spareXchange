import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Card from '../../components/Card';
import DateTimeField from '../../components/DateTimeField';
import SafeZonesSheet from './SafeZonesSheet';
import { colors, radius, spacing, typography } from '../../config/theme';
import { resolveAssetUrl } from '../../config/env';
import { useExchangesStore } from '../../store/exchangesStore';

export default function ProposeExchangeScreen({ route, navigation }) {
	const { listing } = route.params || {};
	const propose = useExchangesStore((s) => s.propose);
	const submitting = useExchangesStore((s) => s.submitting);

	const [offeredItems, setOfferedItems] = useState('');
	const [meetingLocation, setMeetingLocation] = useState('');
	const [meetingTime, setMeetingTime] = useState(null);
	const [safeZoneOpen, setSafeZoneOpen] = useState(false);
	const [error, setError] = useState(null);
	const [touched, setTouched] = useState({});

	const errors = {
		offeredItems: touched.offeredItems && !offeredItems.trim() ? 'Describe what you\'re offering' : null,
		meetingLocation: touched.meetingLocation && !meetingLocation.trim() ? 'Pick a meeting place' : null,
	};
	const canSubmit = offeredItems.trim() && meetingLocation.trim();

	const onSubmit = async () => {
		setError(null);
		setTouched({ offeredItems: true, meetingLocation: true });
		if (!canSubmit) return;
		const res = await propose({
			listingId: listing?._id,
			offeredItems: offeredItems.trim(),
			meetingLocation: meetingLocation.trim(),
			meetingTime: meetingTime ? meetingTime.toISOString() : undefined,
		});
		if (res.success) {
			navigation.replace('ExchangeDetail', { id: res.exchange._id });
		} else {
			setError(res.message || 'Could not propose the exchange.');
		}
	};

	return (
		<ScreenContainer scroll keyboard>
			<Text style={typography.h2}>Propose an exchange</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
				Tell the seller what you're offering and where you'd like to meet. They can accept, reject or
				counter your offer.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}

			{listing ? (
				<Card style={{ marginBottom: spacing.lg }}>
					<View style={styles.itemRow}>
						{listing.images?.[0] ? (
							<Image source={{ uri: resolveAssetUrl(listing.images[0]) }} style={styles.cover} />
						) : (
							<View style={[styles.cover, { backgroundColor: colors.surfaceAlt }]} />
						)}
						<View style={{ flex: 1 }}>
							<Text style={typography.bodyStrong} numberOfLines={2}>{listing.title}</Text>
							<Text style={typography.muted}>
								Listed for ETB {Number(listing.price || 0).toLocaleString()}
							</Text>
							<Text style={typography.caption}>by {listing.seller?.name || 'Seller'}</Text>
						</View>
					</View>
				</Card>
			) : null}

			<Input
				label="What you're offering *"
				value={offeredItems}
				onChangeText={setOfferedItems}
				onBlur={() => setTouched((t) => ({ ...t, offeredItems: true }))}
				placeholder="e.g. Cash 200 USD, or my Bosch alternator + 100 USD"
				multiline
				numberOfLines={3}
				maxLength={500}
				error={errors.offeredItems}
				helper={`${offeredItems.length}/500`}
			/>

			<Text style={[typography.label, { marginBottom: spacing.xs }]}>Meeting location *</Text>
			<Input
				value={meetingLocation}
				onChangeText={setMeetingLocation}
				onBlur={() => setTouched((t) => ({ ...t, meetingLocation: true }))}
				placeholder="Pick a safe zone or type an address"
				autoCapitalize="words"
				error={errors.meetingLocation}
			/>
			<Pressable onPress={() => setSafeZoneOpen(true)} style={styles.safeZoneBtn} hitSlop={6}>
				<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>
					＋ Choose a verified safe zone
				</Text>
			</Pressable>

			<View style={{ height: spacing.md }} />

			<DateTimeField
				label="Suggested meeting time (optional)"
				value={meetingTime}
				onChange={setMeetingTime}
				minimumDate={new Date()}
				helper="You'll be able to lock the final time after the seller accepts."
			/>

			<Banner
				tone="info"
				title="Stay safe"
				message="Meet only in verified public safe zones during the day. SpareXChange will never ask you to pay outside the platform."
			/>

			<Button
				title="Send proposal"
				onPress={onSubmit}
				loading={submitting}
				disabled={!canSubmit}
				size="lg"
			/>

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
	itemRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
	cover: { width: 64, height: 64, borderRadius: radius.md },
	safeZoneBtn: { alignSelf: 'flex-start', marginTop: -spacing.sm, marginBottom: spacing.sm, paddingVertical: 4 },
});
