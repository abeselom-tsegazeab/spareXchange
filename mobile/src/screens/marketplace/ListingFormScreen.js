// Shared form used by both Create and Edit listing flows.

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
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Chip from '../../components/Chip';
import BottomSheet from '../../components/BottomSheet';
import { colors, radius, spacing, typography } from '../../config/theme';
import { CATEGORIES, CONDITIONS } from '../../config/catalog';
import { useListingsStore } from '../../store/listingsStore';

const MAX_IMAGES = 6;

const blankVehicle = { brand: '', model: '', yearStart: '', yearEnd: '' };

export default function ListingFormScreen({ route, navigation }) {
	const editingId = route?.params?.id || null;
	const initial = route?.params?.initial || null;

	const { createListing, updateListing, creating, updating } = useListingsStore();
	const submitting = creating || updating;

	const [title, setTitle] = useState(initial?.title || '');
	const [description, setDescription] = useState(initial?.description || '');
	const [price, setPrice] = useState(initial?.price ? String(initial.price) : '');
	const [category, setCategory] = useState(initial?.category || null);
	const [condition, setCondition] = useState(initial?.condition || null);
	const [brand, setBrand] = useState(initial?.brand || '');
	const [model, setModel] = useState(initial?.model || '');
	const [year, setYear] = useState(initial?.year ? String(initial.year) : '');
	const [location, setLocation] = useState(initial?.location || '');
	const [images, setImages] = useState(
		(initial?.images || []).map((uri) => ({ uri, _existing: true }))
	);
	const [specs, setSpecs] = useState(() => {
		if (!initial?.specifications) return [];
		return Object.entries(initial.specifications).map(([k, v]) => ({ k, v }));
	});
	const [compatVehicles, setCompatVehicles] = useState(
		initial?.compatibleVehicles?.map((v) => ({
			brand: v.brand,
			model: v.model,
			yearStart: v.yearStart ? String(v.yearStart) : '',
			yearEnd: v.yearEnd ? String(v.yearEnd) : '',
		})) || []
	);
	const [error, setError] = useState(null);
	const [touched, setTouched] = useState({});
	const [showVehicleSheet, setShowVehicleSheet] = useState(false);
	const [vehicleDraft, setVehicleDraft] = useState(blankVehicle);

	useEffect(() => {
		navigation.setOptions({ title: editingId ? 'Edit listing' : 'New listing' });
	}, [navigation, editingId]);

	const pickImages = async () => {
		try {
			const remaining = MAX_IMAGES - images.length;
			if (remaining <= 0) return;
			const res = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				quality: 0.6,            // smaller payload for base64 over HTTP
				allowsMultipleSelection: true,
				selectionLimit: remaining,
				base64: true,            // backend's uploadImage() expects data:URL
			});
			if (res.canceled) return;
			setImages((prev) => [...prev, ...(res.assets || [])]);
		} catch (e) {
			setError(e?.message || 'Could not open the image picker.');
		}
	};

	const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

	const addSpec = () => setSpecs((p) => [...p, { k: '', v: '' }]);
	const updateSpec = (i, patch) =>
		setSpecs((p) => p.map((s, idx) => (i === idx ? { ...s, ...patch } : s)));
	const removeSpec = (i) => setSpecs((p) => p.filter((_, idx) => idx !== i));

	const addCompat = () => {
		setVehicleDraft(blankVehicle);
		setShowVehicleSheet(true);
	};
	const confirmCompat = () => {
		if (!vehicleDraft.brand.trim() || !vehicleDraft.model.trim()) return;
		setCompatVehicles((p) => [...p, vehicleDraft]);
		setShowVehicleSheet(false);
	};
	const removeCompat = (i) => setCompatVehicles((p) => p.filter((_, idx) => idx !== i));

	const errs = {
		title: touched.title && !title.trim() ? 'Title is required' : null,
		description:
			touched.description && description.trim().length < 10
				? 'Add at least 10 characters of description'
				: null,
		price: touched.price && (!price || Number(price) <= 0) ? 'Enter a valid price' : null,
		location: touched.location && !location.trim() ? 'Location is required' : null,
		category: touched.submit && !category ? 'Pick a category' : null,
		condition: touched.submit && !condition ? 'Pick a condition' : null,
		images: touched.submit && images.length === 0 ? 'Add at least one photo' : null,
	};
	const canSubmit =
		title.trim() &&
		description.trim().length >= 10 &&
		Number(price) > 0 &&
		location.trim() &&
		category &&
		condition &&
		images.length > 0;

	const buildPayload = () => {
		const specsMap = specs.reduce((acc, { k, v }) => {
			if (k.trim()) acc[k.trim()] = String(v || '').trim();
			return acc;
		}, {});
		const compatible = compatVehicles
			.filter((v) => v.brand?.trim() && v.model?.trim())
			.map((v) => ({
				brand: v.brand.trim(),
				model: v.model.trim(),
				yearStart: v.yearStart ? Number(v.yearStart) : undefined,
				yearEnd: v.yearEnd ? Number(v.yearEnd) : undefined,
			}));
		return {
			title: title.trim(),
			description: description.trim(),
			price: Number(price),
			category,
			condition,
			brand: brand.trim() || undefined,
			model: model.trim() || undefined,
			year: year ? Number(year) : undefined,
			location: location.trim(),
			specifications: Object.keys(specsMap).length ? specsMap : undefined,
			compatibleVehicles: compatible,
			images,
		};
	};

	const onSubmit = async () => {
		setTouched((t) => ({ ...t, submit: true }));
		setError(null);
		if (!canSubmit) return;
		const payload = buildPayload();
		const res = editingId
			? await updateListing(editingId, payload)
			: await createListing(payload);
		if (res.success) {
			navigation.goBack();
		} else {
			setError(res.message || 'Could not save the listing.');
		}
	};

	return (
		<ScreenContainer scroll keyboard>
			{error || errs.category || errs.condition || errs.images ? (
				<Banner
					tone="danger"
					message={error || errs.category || errs.condition || errs.images}
				/>
			) : null}

			<Text style={[typography.label, { marginBottom: spacing.sm }]}>Photos *</Text>
			<Text style={[typography.caption, { marginBottom: spacing.sm }]}>
				Add up to {MAX_IMAGES}. The first image is used as the cover.
			</Text>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
				{images.map((img, i) => (
					<View key={`${img.uri}-${i}`} style={styles.thumb}>
						<Image source={{ uri: img.uri }} style={styles.thumbImg} />
						{i === 0 ? (
							<View style={styles.coverBadge}>
								<Text style={styles.coverText}>Cover</Text>
							</View>
						) : null}
						<Pressable style={styles.thumbRemove} onPress={() => removeImage(i)} hitSlop={8}>
							<Text style={{ color: '#fff', fontWeight: '800' }}>×</Text>
						</Pressable>
					</View>
				))}
				{images.length < MAX_IMAGES ? (
					<Pressable onPress={pickImages} style={[styles.thumb, styles.thumbAdd]}>
						<Text style={{ fontSize: 32, color: colors.textMuted, lineHeight: 32 }}>+</Text>
						<Text style={typography.caption}>Add</Text>
					</Pressable>
				) : null}
			</ScrollView>

			<Input
				label="Title *"
				value={title}
				onChangeText={setTitle}
				onBlur={() => setTouched((t) => ({ ...t, title: true }))}
				placeholder="e.g. Brembo front brake pads"
				maxLength={120}
				error={errs.title}
			/>

			<Input
				label="Description *"
				value={description}
				onChangeText={setDescription}
				onBlur={() => setTouched((t) => ({ ...t, description: true }))}
				placeholder="Condition details, fitment notes, history..."
				multiline
				numberOfLines={4}
				maxLength={2000}
				error={errs.description}
				helper={`${description.length}/2000`}
			/>

			<Input
				label="Price (ETB) *"
				value={price}
				onChangeText={(v) => setPrice(v.replace(/\D/g, ''))}
				onBlur={() => setTouched((t) => ({ ...t, price: true }))}
				placeholder="0"
				keyboardType="number-pad"
				error={errs.price}
			/>

			<Text style={[typography.label, { marginBottom: spacing.sm }]}>Category *</Text>
			<View style={styles.chipsRow}>
				{CATEGORIES.map((c) => (
					<Chip
						key={c.key}
						label={c.label}
						active={category === c.key}
						onPress={() => setCategory(c.key)}
					/>
				))}
			</View>

			<Text style={[typography.label, { marginTop: spacing.md, marginBottom: spacing.sm }]}>
				Condition *
			</Text>
			<View style={styles.chipsRow}>
				{CONDITIONS.map((c) => (
					<Chip
						key={c.key}
						label={c.label}
						active={condition === c.key}
						onPress={() => setCondition(c.key)}
					/>
				))}
			</View>

			<View style={[styles.row, { marginTop: spacing.lg }]}>
				<View style={{ flex: 1 }}>
					<Input label="Brand" value={brand} onChangeText={setBrand} placeholder="Brembo" />
				</View>
				<View style={{ width: spacing.md }} />
				<View style={{ flex: 1 }}>
					<Input label="Model" value={model} onChangeText={setModel} placeholder="P83073" />
				</View>
			</View>
			<View style={styles.row}>
				<View style={{ flex: 1 }}>
					<Input
						label="Year"
						value={year}
						onChangeText={(v) => setYear(v.replace(/\D/g, '').slice(0, 4))}
						placeholder="2018"
						keyboardType="number-pad"
					/>
				</View>
				<View style={{ width: spacing.md }} />
				<View style={{ flex: 1 }}>
					<Input
						label="Location *"
						value={location}
						onChangeText={setLocation}
						onBlur={() => setTouched((t) => ({ ...t, location: true }))}
						placeholder="Addis Ababa"
						autoCapitalize="words"
						error={errs.location}
					/>
				</View>
			</View>

			<Text style={[typography.label, { marginTop: spacing.md, marginBottom: spacing.sm }]}>
				Specifications (optional)
			</Text>
			{specs.map((s, i) => (
				<View key={i} style={styles.row}>
					<View style={{ flex: 1 }}>
						<Input
							label={i === 0 ? 'Key' : ' '}
							value={s.k}
							onChangeText={(v) => updateSpec(i, { k: v })}
							placeholder="Material"
						/>
					</View>
					<View style={{ width: spacing.md }} />
					<View style={{ flex: 1 }}>
						<Input
							label={i === 0 ? 'Value' : ' '}
							value={s.v}
							onChangeText={(v) => updateSpec(i, { v })}
							placeholder="Ceramic"
						/>
					</View>
					<Pressable onPress={() => removeSpec(i)} style={styles.iconBtn} hitSlop={6}>
						<Text style={styles.iconBtnText}>×</Text>
					</Pressable>
				</View>
			))}
			<Button title={specs.length ? 'Add another spec' : 'Add a spec'} variant="secondary" size="sm" onPress={addSpec} />

			<Text style={[typography.label, { marginTop: spacing.xl, marginBottom: spacing.sm }]}>
				Compatible vehicles (optional)
			</Text>
			{compatVehicles.map((v, i) => (
				<View key={i} style={styles.compatCard}>
					<View style={{ flex: 1 }}>
						<Text style={typography.bodyStrong}>
							{v.brand} {v.model}
						</Text>
						<Text style={typography.caption}>
							{v.yearStart || '?'}–{v.yearEnd || 'present'}
						</Text>
					</View>
					<Pressable onPress={() => removeCompat(i)} hitSlop={6}>
						<Text style={{ color: colors.danger, fontWeight: '800', fontSize: 20 }}>×</Text>
					</Pressable>
				</View>
			))}
			<Button title="Add compatible vehicle" variant="secondary" size="sm" onPress={addCompat} />

			<Button
				title={editingId ? 'Save changes' : 'Publish listing'}
				onPress={onSubmit}
				loading={submitting}
				size="lg"
				style={{ marginTop: spacing.xxl }}
			/>

			<BottomSheet
				visible={showVehicleSheet}
				onClose={() => setShowVehicleSheet(false)}
				title="Add compatible vehicle"
				footer={
					<Button
						title="Add vehicle"
						onPress={confirmCompat}
						disabled={!vehicleDraft.brand.trim() || !vehicleDraft.model.trim()}
					/>
				}
			>
				<Input label="Brand *" value={vehicleDraft.brand} onChangeText={(v) => setVehicleDraft((d) => ({ ...d, brand: v }))} placeholder="Toyota" />
				<Input label="Model *" value={vehicleDraft.model} onChangeText={(v) => setVehicleDraft((d) => ({ ...d, model: v }))} placeholder="Camry" />
				<View style={styles.row}>
					<View style={{ flex: 1 }}>
						<Input
							label="Year start"
							value={vehicleDraft.yearStart}
							onChangeText={(v) => setVehicleDraft((d) => ({ ...d, yearStart: v.replace(/\D/g, '').slice(0, 4) }))}
							placeholder="2012"
							keyboardType="number-pad"
						/>
					</View>
					<View style={{ width: spacing.md }} />
					<View style={{ flex: 1 }}>
						<Input
							label="Year end"
							value={vehicleDraft.yearEnd}
							onChangeText={(v) => setVehicleDraft((d) => ({ ...d, yearEnd: v.replace(/\D/g, '').slice(0, 4) }))}
							placeholder="2017"
							keyboardType="number-pad"
						/>
					</View>
				</View>
			</BottomSheet>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	thumb: {
		width: 100,
		height: 100,
		borderRadius: radius.md,
		marginRight: spacing.sm,
		overflow: 'hidden',
		position: 'relative',
		backgroundColor: colors.surfaceAlt,
	},
	thumbImg: { width: '100%', height: '100%' },
	thumbAdd: {
		alignItems: 'center',
		justifyContent: 'center',
		borderWidth: 1,
		borderStyle: 'dashed',
		borderColor: colors.borderStrong,
	},
	thumbRemove: {
		position: 'absolute',
		top: 4,
		right: 4,
		backgroundColor: 'rgba(17,24,39,0.65)',
		width: 22,
		height: 22,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
	},
	coverBadge: {
		position: 'absolute',
		bottom: 4,
		left: 4,
		backgroundColor: 'rgba(16,185,129,0.95)',
		paddingHorizontal: 6,
		paddingVertical: 2,
		borderRadius: 6,
	},
	coverText: { color: '#fff', fontWeight: '800', fontSize: 10 },
	chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
	row: { flexDirection: 'row', alignItems: 'flex-start' },
	iconBtn: {
		width: 40,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 32,
	},
	iconBtnText: { color: colors.danger, fontSize: 22, fontWeight: '800' },
	compatCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.md,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		backgroundColor: colors.surface,
		marginBottom: spacing.sm,
	},
});
