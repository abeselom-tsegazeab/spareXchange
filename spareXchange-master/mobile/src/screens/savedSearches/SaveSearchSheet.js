import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import * as Location from 'expo-location';

import BottomSheet from '../../components/BottomSheet';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Chip from '../../components/Chip';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { CATEGORIES, CONDITIONS } from '../../config/catalog';
import { filtersToSavedSearchPayload } from '../../config/savedSearchHelpers';

const RADIUS_OPTIONS = [
	{ key: null, label: 'Any distance' },
	{ key: 10, label: '≤ 10 km' },
	{ key: 25, label: '≤ 25 km' },
	{ key: 50, label: '≤ 50 km' },
	{ key: 100, label: '≤ 100 km' },
];

const emptyDraft = () => ({
	name: '',
	query: '',
	filters: {
		category: null,
		condition: null,
		brand: '',
		model: '',
		year: '',
		minPrice: '',
		maxPrice: '',
	},
	geo: { latitude: null, longitude: null, radiusKm: 50 },
	notify: true,
});

export default function SaveSearchSheet({
	visible,
	initial,
	onClose,
	onSubmit,
	submitting,
}) {
	const [draft, setDraft] = useState(emptyDraft());
	const [error, setError] = useState(null);

	useEffect(() => {
		if (!visible) return;
		setError(null);
		if (initial?._id) {
			setDraft({
				name: initial.name || '',
				query: initial.query || '',
				filters: {
					category: initial.filters?.category || null,
					condition: initial.filters?.condition || null,
					brand: initial.filters?.brand || '',
					model: initial.filters?.model || '',
					year: initial.filters?.year != null ? String(initial.filters.year) : '',
					minPrice: initial.filters?.minPrice != null ? String(initial.filters.minPrice) : '',
					maxPrice: initial.filters?.maxPrice != null ? String(initial.filters.maxPrice) : '',
				},
				geo: {
					latitude: initial.geo?.latitude ?? null,
					longitude: initial.geo?.longitude ?? null,
					radiusKm: initial.geo?.radiusKm || 50,
				},
				notify: initial.notify !== false,
			});
		} else if (initial?.filters) {
			const f = initial.filters;
			setDraft({
				name: initial.name || '',
				query: f.query || '',
				filters: {
					category: f.category || null,
					condition: f.condition || null,
					brand: f.brand || '',
					model: f.model || '',
					year: f.year || '',
					minPrice: f.minPrice || '',
					maxPrice: f.maxPrice || '',
				},
				geo: {
					latitude: f.latitude ?? null,
					longitude: f.longitude ?? null,
					radiusKm: f.radiusKm || 50,
				},
				notify: true,
			});
		} else {
			setDraft(emptyDraft());
		}
	}, [visible, initial]);

	const patchFilter = (p) =>
		setDraft((d) => ({ ...d, filters: { ...d.filters, ...p } }));

	const patchGeo = (p) => setDraft((d) => ({ ...d, geo: { ...d.geo, ...p } }));

	const useMyLocation = async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') return;
			const pos = await Location.getCurrentPositionAsync({});
			patchGeo({
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
			});
		} catch (_) {}
	};

	const handleSubmit = async () => {
		setError(null);
		const filters = {
			query: draft.query,
			category: draft.filters.category,
			condition: draft.filters.condition,
			brand: draft.filters.brand,
			model: draft.filters.model,
			year: draft.filters.year,
			minPrice: draft.filters.minPrice,
			maxPrice: draft.filters.maxPrice,
			latitude: draft.geo.latitude,
			longitude: draft.geo.longitude,
			radiusKm: draft.geo.radiusKm,
		};
		const payload = filtersToSavedSearchPayload({
			name: draft.name,
			notify: draft.notify,
			filters,
		});
		const res = await onSubmit?.(payload);
		if (res?.success) onClose?.();
		else setError(res?.message || 'Could not save search.');
	};

	const isEdit = !!initial?._id;

	return (
		<BottomSheet
			visible={visible}
			onClose={onClose}
			title={isEdit ? 'Edit saved search' : 'Save this search'}
		>
			<ScrollView showsVerticalScrollIndicator={false}>
				<Text style={[typography.caption, { marginBottom: spacing.md }]}>
					We'll notify you when new listings match these criteria.
				</Text>
				{error ? <Banner tone="danger" message={error} /> : null}

				<Input
					label="Name (optional)"
					value={draft.name}
					onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
					placeholder="e.g. Brake pads near me"
				/>
				<Input
					label="Keywords"
					value={draft.query}
					onChangeText={(query) => setDraft((d) => ({ ...d, query }))}
					placeholder="brake pads toyota"
					autoCapitalize="none"
				/>

				<Text style={[typography.label, { marginBottom: spacing.sm }]}>Category</Text>
				<View style={styles.chips}>
					<Chip label="Any" active={!draft.filters.category} onPress={() => patchFilter({ category: null })} />
					{CATEGORIES.map((c) => (
						<Chip
							key={c.key}
							label={c.label}
							active={draft.filters.category === c.key}
							onPress={() => patchFilter({ category: c.key })}
						/>
					))}
				</View>

				<Text style={[typography.label, { marginTop: spacing.md, marginBottom: spacing.sm }]}>Condition</Text>
				<View style={styles.chips}>
					<Chip label="Any" active={!draft.filters.condition} onPress={() => patchFilter({ condition: null })} />
					{CONDITIONS.map((c) => (
						<Chip
							key={c.key}
							label={c.label}
							active={draft.filters.condition === c.key}
							onPress={() => patchFilter({ condition: c.key })}
						/>
					))}
				</View>

				<View style={styles.row}>
					<View style={{ flex: 1 }}>
						<Input label="Brand" value={draft.filters.brand} onChangeText={(brand) => patchFilter({ brand })} />
					</View>
					<View style={{ width: spacing.sm }} />
					<View style={{ flex: 1 }}>
						<Input label="Model" value={draft.filters.model} onChangeText={(model) => patchFilter({ model })} />
					</View>
				</View>

				<View style={styles.row}>
					<View style={{ flex: 1 }}>
						<Input
							label="Min price (ETB)"
							value={draft.filters.minPrice}
							onChangeText={(minPrice) => patchFilter({ minPrice: minPrice.replace(/\D/g, '') })}
							keyboardType="number-pad"
						/>
					</View>
					<View style={{ width: spacing.sm }} />
					<View style={{ flex: 1 }}>
						<Input
							label="Max price (ETB)"
							value={draft.filters.maxPrice}
							onChangeText={(maxPrice) => patchFilter({ maxPrice: maxPrice.replace(/\D/g, '') })}
							keyboardType="number-pad"
						/>
					</View>
				</View>

				<Text style={[typography.label, { marginTop: spacing.md, marginBottom: spacing.sm }]}>Distance</Text>
				<View style={styles.chips}>
					{RADIUS_OPTIONS.map((r) => (
						<Chip
							key={String(r.key)}
							label={r.label}
							active={draft.geo.radiusKm === r.key || (!r.key && !draft.geo.radiusKm)}
							onPress={() => patchGeo({ radiusKm: r.key })}
						/>
					))}
				</View>
				<Pressable onPress={useMyLocation} style={styles.locBtn}>
					<Text style={styles.locBtnText}>
						{draft.geo.latitude != null ? '📍 Location set' : '📍 Use my location'}
					</Text>
				</Pressable>

				<View style={styles.notifyRow}>
					<View style={{ flex: 1 }}>
						<Text style={typography.bodyStrong}>Alert me on new matches</Text>
						<Text style={typography.caption}>Push notifications register on login.</Text>
					</View>
					<Switch
						value={draft.notify}
						onValueChange={(notify) => setDraft((d) => ({ ...d, notify }))}
						trackColor={{ false: colors.border, true: colors.primaryLight }}
						thumbColor={draft.notify ? colors.primary : colors.surface}
					/>
				</View>

				<Button
					title={isEdit ? 'Update saved search' : 'Save search'}
					onPress={handleSubmit}
					loading={submitting}
					size="lg"
				/>
				<View style={{ height: spacing.lg }} />
			</ScrollView>
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
	row: { flexDirection: 'row' },
	locBtn: { marginTop: spacing.sm, marginBottom: spacing.md },
	locBtnText: { ...typography.caption, color: colors.primaryDark, fontWeight: '700' },
	notifyRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: spacing.lg,
		paddingVertical: spacing.sm,
	},
});
