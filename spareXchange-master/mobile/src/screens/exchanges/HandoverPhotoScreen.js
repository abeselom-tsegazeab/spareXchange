// Capture/upload a handover photo as condition proof.

import React, { useEffect, useState } from 'react';
import {
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Card from '../../components/Card';
import { colors, radius, spacing, typography } from '../../config/theme';
import { resolveAssetUrl } from '../../config/env';
import { useExchangesStore } from '../../store/exchangesStore';

export default function HandoverPhotoScreen({ route, navigation }) {
	const { id } = route.params || {};
	const exchange = useExchangesStore((s) => s.exchange);
	const fetchExchange = useExchangesStore((s) => s.fetchExchange);
	const upload = useExchangesStore((s) => s.uploadHandoverPhoto);
	const submitting = useExchangesStore((s) => s.submitting);

	const [picked, setPicked] = useState(null); // {uri, base64, mimeType}
	const [error, setError] = useState(null);
	const [info, setInfo] = useState(null);

	useEffect(() => {
		if (id && (!exchange || exchange._id !== id)) fetchExchange(id);
	}, [id, exchange, fetchExchange]);

	const fromCamera = async () => {
		setError(null);
		try {
			const perm = await ImagePicker.requestCameraPermissionsAsync();
			if (!perm.granted) {
				setError('Camera permission is required to take a handover photo.');
				return;
			}
			const res = await ImagePicker.launchCameraAsync({
				quality: 0.6,
				allowsEditing: true,
				aspect: [4, 3],
				base64: true,
			});
			if (!res.canceled) setPicked(res.assets[0]);
		} catch (e) {
			setError(e?.message || 'Could not open the camera.');
		}
	};

	const fromLibrary = async () => {
		setError(null);
		try {
			const res = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				quality: 0.6,
				allowsEditing: true,
				aspect: [4, 3],
				base64: true,
			});
			if (!res.canceled) setPicked(res.assets[0]);
		} catch (e) {
			setError(e?.message || 'Could not open the picker.');
		}
	};

	const onUpload = async () => {
		if (!picked) return;
		setError(null);
		setInfo(null);
		// Build data URL so the wire payload is self-contained.
		const mime = picked.mimeType || 'image/jpeg';
		const photoUrl = picked.base64 ? `data:${mime};base64,${picked.base64}` : picked.uri;
		const res = await upload(id, { photoUrl });
		if (res.success) {
			setInfo('Handover photo uploaded.');
			setPicked(null);
		} else {
			setError(res.message || 'Upload failed');
		}
	};

	const existing = exchange?.handoverPhotos || [];

	return (
		<ScreenContainer scroll>
			<Text style={typography.h2}>Handover proof</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
				Snap a clear photo of the item at handover. Both parties can upload — it protects everyone if
				a dispute arises later.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}
			{info ? <Banner tone="success" message={info} /> : null}

			<Card>
				{picked ? (
					<>
						<Image source={{ uri: picked.uri }} style={styles.preview} resizeMode="cover" />
						<View style={{ height: spacing.md }} />
						<Button title="Upload photo" onPress={onUpload} loading={submitting} />
						<View style={{ height: spacing.sm }} />
						<Button title="Replace photo" variant="secondary" onPress={() => setPicked(null)} />
					</>
				) : (
					<>
						<View style={styles.empty}>
							<Text style={typography.muted}>No photo selected</Text>
						</View>
						<View style={{ height: spacing.md }} />
						<Button title="📷 Take photo" onPress={fromCamera} />
						<View style={{ height: spacing.sm }} />
						<Button title="🖼 Choose from gallery" variant="secondary" onPress={fromLibrary} />
					</>
				)}
			</Card>

			{existing.length ? (
				<>
					<Text style={[typography.h4, { marginTop: spacing.xl }]}>Already uploaded</Text>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.md }}>
						{existing.map((url, i) => (
							<Image key={i} source={{ uri: resolveAssetUrl(url) }} style={styles.thumb} />
						))}
					</ScrollView>
				</>
			) : null}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	preview: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
	empty: { width: '100%', aspectRatio: 4 / 3, borderRadius: radius.md, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' },
	thumb: { width: 110, height: 110, borderRadius: radius.md, marginRight: spacing.sm, backgroundColor: colors.surfaceAlt },
});
