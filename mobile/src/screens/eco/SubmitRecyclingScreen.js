import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import { colors, radius, spacing, typography } from '../../config/theme';
import { ITEM_TYPES, estimatePoints, itemIcon } from '../../config/ecoCatalog';
import { useSustainabilityStore } from '../../store/sustainabilityStore';

export default function SubmitRecyclingScreen({ navigation }) {
	const { createSubmission, submitting } = useSustainabilityStore();

	const [mode, setMode] = useState('weight'); // 'weight' | 'value'
	const [itemType, setItemType] = useState(null);
	const [itemDescription, setItemDescription] = useState('');
	const [estimatedWeight, setEstimatedWeight] = useState('');
	const [estimatedValue, setEstimatedValue] = useState('');
	const [location, setLocation] = useState('');
	const [notes, setNotes] = useState('');
	const [coords, setCoords] = useState(null);
	const [touched, setTouched] = useState({});
	const [error, setError] = useState(null);

	const errors = {
		itemType: touched.submit && !itemType ? 'Pick what you\'re recycling' : null,
		itemDescription: touched.itemDescription && itemDescription.trim().length < 4 ? 'Add a short description' : null,
		amount:
			touched.submit && mode === 'weight' && (!estimatedWeight || Number(estimatedWeight) <= 0)
				? 'Enter the estimated weight'
				: touched.submit && mode === 'value' && (!estimatedValue || Number(estimatedValue) <= 0)
					? 'Enter the estimated value'
					: null,
		location: touched.location && !location.trim() ? 'Where is the drop-off?' : null,
	};

	const estimatedPoints = useMemo(() => {
		if (!itemType) return 0;
		return estimatePoints({
			itemType,
			estimatedWeight: mode === 'weight' ? Number(estimatedWeight) || 0 : undefined,
			estimatedValue: mode === 'value' ? Number(estimatedValue) || 0 : undefined,
		});
	}, [itemType, mode, estimatedWeight, estimatedValue]);

	const canSubmit =
		itemType &&
		itemDescription.trim().length >= 4 &&
		location.trim() &&
		((mode === 'weight' && Number(estimatedWeight) > 0) ||
			(mode === 'value' && Number(estimatedValue) > 0));

	const useMyLocation = async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') return;
			const pos = await Location.getCurrentPositionAsync({});
			setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
		} catch (_) {
			// silent
		}
	};

	const onSubmit = async () => {
		setTouched((t) => ({ ...t, submit: true, itemDescription: true, location: true }));
		setError(null);
		if (!canSubmit) return;
		const payload = {
			itemType,
			itemDescription: itemDescription.trim(),
			location: location.trim(),
			notes: notes.trim() || undefined,
			latitude: coords?.latitude,
			longitude: coords?.longitude,
		};
		if (mode === 'weight') payload.estimatedWeight = Number(estimatedWeight);
		else payload.estimatedValue = Number(estimatedValue);
		const res = await createSubmission(payload);
		if (res.success) {
			navigation.replace('SubmissionDetail', { id: res.submission._id });
		} else {
			setError(res.message || 'Could not submit recycling.');
		}
	};

	return (
		<ScreenContainer scroll keyboard>
			<Text style={typography.h2}>Submit recycling</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
				Get EcoPoints for items you bring to a verified recycler.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}

			<Text style={[typography.label, { marginBottom: spacing.sm }]}>What are you recycling? *</Text>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				{ITEM_TYPES.map((t) => (
					<Pressable
						key={t.key}
						onPress={() => setItemType(t.key)}
						style={[styles.itemTile, itemType === t.key && styles.itemTileActive]}
					>
						<Text style={{ fontSize: 26 }}>{t.icon}</Text>
						<Text style={[typography.caption, { marginTop: 4 }, itemType === t.key && { color: colors.primaryDark, fontWeight: '800' }]}>
							{t.label}
						</Text>
					</Pressable>
				))}
			</ScrollView>
			{errors.itemType ? <Text style={styles.errorText}>{errors.itemType}</Text> : null}

			<View style={{ height: spacing.md }} />

			<Input
				label="Describe the item *"
				value={itemDescription}
				onChangeText={setItemDescription}
				onBlur={() => setTouched((t) => ({ ...t, itemDescription: true }))}
				placeholder="e.g. Old transmission housing — cast aluminum"
				multiline
				numberOfLines={3}
				maxLength={500}
				error={errors.itemDescription}
				helper={`${itemDescription.length}/500`}
			/>

			<Text style={[typography.label, { marginBottom: spacing.sm }]}>Estimate by</Text>
			<View style={styles.segment}>
				<Pressable onPress={() => setMode('weight')} style={[styles.segItem, mode === 'weight' && styles.segItemActive]}>
					<Text style={[styles.segText, mode === 'weight' && styles.segTextActive]}>Weight (kg)</Text>
				</Pressable>
				<Pressable onPress={() => setMode('value')} style={[styles.segItem, mode === 'value' && styles.segItemActive]}>
					<Text style={[styles.segText, mode === 'value' && styles.segTextActive]}>Value (ETB)</Text>
				</Pressable>
			</View>

			{mode === 'weight' ? (
				<Input
					label="Estimated weight (kg) *"
					value={estimatedWeight}
					onChangeText={(v) => setEstimatedWeight(v.replace(/[^0-9.]/g, ''))}
					placeholder="e.g. 15"
					keyboardType="decimal-pad"
					error={errors.amount}
				/>
			) : (
				<Input
					label="Estimated value (ETB) *"
					value={estimatedValue}
					onChangeText={(v) => setEstimatedValue(v.replace(/\D/g, ''))}
					placeholder="e.g. 2000"
					keyboardType="number-pad"
					error={errors.amount}
				/>
			)}

			<Input
				label="Drop-off location *"
				value={location}
				onChangeText={setLocation}
				onBlur={() => setTouched((t) => ({ ...t, location: true }))}
				placeholder="e.g. Eastside Recycling Center"
				autoCapitalize="words"
				error={errors.location}
			/>
			<Pressable onPress={useMyLocation} style={styles.geoBtn} hitSlop={6}>
				<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>
					{coords ? `📍 Using my location  ·  ${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}` : '＋ Attach my GPS location'}
				</Text>
			</Pressable>

			<Input
				label="Notes (optional)"
				value={notes}
				onChangeText={setNotes}
				placeholder="Anything the recycler should know"
				multiline
				numberOfLines={3}
				maxLength={300}
				helper={`${notes.length}/300`}
			/>

			{itemType ? (
				<Card style={{ marginBottom: spacing.lg, backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }}>
					<View style={styles.previewRow}>
						<Text style={{ fontSize: 24 }}>{itemIcon(itemType)}</Text>
						<View style={{ flex: 1, marginLeft: spacing.md }}>
							<Text style={typography.bodyStrong}>Estimated reward</Text>
							<Text style={typography.caption}>
								Based on item type and {mode}. Final amount confirmed at verification.
							</Text>
						</View>
						<Text style={[typography.h3, { color: '#065F46' }]}>+{estimatedPoints}</Text>
					</View>
				</Card>
			) : null}

			<Button title="Submit for recycling" onPress={onSubmit} loading={submitting} size="lg" disabled={!canSubmit} />
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	itemTile: {
		width: 96,
		paddingVertical: spacing.md,
		paddingHorizontal: spacing.xs,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.sm,
		backgroundColor: colors.surface,
	},
	itemTileActive: { borderColor: colors.primary, backgroundColor: '#ECFDF5' },
	errorText: { ...typography.caption, color: colors.danger, marginTop: 4 },
	segment: {
		flexDirection: 'row',
		backgroundColor: colors.surfaceAlt,
		borderRadius: radius.lg,
		padding: 4,
		marginBottom: spacing.lg,
	},
	segItem: { flex: 1, paddingVertical: 8, borderRadius: radius.md, alignItems: 'center' },
	segItemActive: { backgroundColor: colors.surface },
	segText: { ...typography.caption, fontWeight: '700', color: colors.textMuted },
	segTextActive: { color: colors.primaryDark },
	geoBtn: { alignSelf: 'flex-start', marginTop: -spacing.sm, marginBottom: spacing.md, paddingVertical: 4 },
	previewRow: { flexDirection: 'row', alignItems: 'center' },
});
