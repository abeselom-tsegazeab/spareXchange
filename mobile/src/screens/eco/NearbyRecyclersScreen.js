import React, { useEffect, useState } from 'react';
import {
	FlatList,
	RefreshControl,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import * as Location from 'expo-location';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import EmptyState from '../../components/EmptyState';
import Banner from '../../components/Banner';
import { colors, radius, spacing, typography } from '../../config/theme';
import { itemIcon, itemLabel } from '../../config/ecoCatalog';
import { useSustainabilityStore } from '../../store/sustainabilityStore';

const haversineKm = (a, b) => {
	if (!a || !b) return null;
	const toRad = (d) => (d * Math.PI) / 180;
	const R = 6371;
	const dLat = toRad(b.latitude - a.latitude);
	const dLng = toRad(b.longitude - a.longitude);
	const x = Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
};

export default function NearbyRecyclersScreen() {
	const { nearby, loading, fetchNearbyRecyclers } = useSustainabilityStore();
	const [coords, setCoords] = useState(null);
	const [permError, setPermError] = useState(null);

	const refresh = async (c) => {
		const which = c || coords;
		if (!which) return;
		await fetchNearbyRecyclers({ latitude: which.latitude, longitude: which.longitude, radiusKm: 50 });
	};

	const requestLocation = async () => {
		setPermError(null);
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				setPermError('Location permission is needed to show nearby recyclers.');
				return;
			}
			const pos = await Location.getCurrentPositionAsync({});
			const c = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
			setCoords(c);
			refresh(c);
		} catch (e) {
			setPermError(e?.message || 'Could not get location.');
		}
	};

	useEffect(() => {
		requestLocation();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const renderItem = ({ item }) => {
		const lng = item.locationCoords?.coordinates?.[0];
		const lat = item.locationCoords?.coordinates?.[1];
		const dist =
			item.distanceKm != null
				? item.distanceKm
				: coords && lat != null && lng != null
					? haversineKm(coords, { latitude: lat, longitude: lng })
					: null;
		return (
			<Card style={styles.card}>
				<View style={styles.row}>
					<View style={styles.iconBox}>
						<Text style={{ fontSize: 22 }}>{itemIcon(item.itemType)}</Text>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={typography.bodyStrong}>{itemLabel(item.itemType)}</Text>
						<Text style={typography.caption} numberOfLines={2}>
							{item.itemDescription}
						</Text>
						<Text style={typography.caption}>📍 {item.location}</Text>
					</View>
					{dist != null ? (
						<View style={styles.distBadge}>
							<Text style={styles.distText}>{dist.toFixed(1)} km</Text>
						</View>
					) : null}
				</View>
			</Card>
		);
	};

	return (
		<ScreenContainer padded>
			<Text style={typography.h2}>Nearby recyclers</Text>
			<Text style={[typography.muted, { marginBottom: spacing.lg }]}>
				Verified drop-off points and active recyclers around you.
			</Text>

			{!coords ? (
				<>
					{permError ? <Banner tone="danger" message={permError} /> : null}
					<Banner
						tone="info"
						title="Share your location"
						message="We use your coordinates to query nearby recycling spots. Coordinates never leave your device beyond the API call."
					/>
					<Button title="Enable location" onPress={requestLocation} size="lg" />
				</>
			) : (
				<FlatList
					data={nearby}
					keyExtractor={(item) => item._id}
					renderItem={renderItem}
					refreshControl={
						<RefreshControl refreshing={loading} onRefresh={() => refresh()} tintColor={colors.primary} colors={[colors.primary]} />
					}
					ListEmptyComponent={
						<EmptyState icon="📍" title="No recyclers nearby" message="Try a wider area or another location." />
					}
					contentContainerStyle={{ paddingBottom: spacing.huge }}
				/>
			)}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	card: { marginBottom: spacing.md },
	row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	iconBox: {
		width: 48,
		height: 48,
		borderRadius: radius.md,
		backgroundColor: colors.surfaceAlt,
		alignItems: 'center',
		justifyContent: 'center',
	},
	distBadge: { backgroundColor: '#E0E7FF', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.pill },
	distText: { color: '#3730A3', fontWeight: '800', fontSize: 12 },
});
