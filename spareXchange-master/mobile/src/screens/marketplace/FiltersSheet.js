import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import BottomSheet from '../../components/BottomSheet';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing, typography } from '../../config/theme';
import { CATEGORIES, CONDITIONS, SORTS } from '../../config/catalog';

const RADIUS_OPTIONS = [
	{ key: null, label: 'Any distance' },
	{ key: 10, label: '≤ 10 km' },
	{ key: 25, label: '≤ 25 km' },
	{ key: 50, label: '≤ 50 km' },
	{ key: 100, label: '≤ 100 km' },
];

export default function FiltersSheet({ visible, initial, onClose, onApply }) {
	const [draft, setDraft] = useState(initial);

	useEffect(() => {
		if (visible) setDraft(initial);
	}, [visible, initial]);

	const patch = (p) => setDraft((d) => ({ ...d, ...p }));

	return (
		<BottomSheet
			visible={visible}
			onClose={onClose}
			title="Filters"
			footer={
				<View style={styles.footer}>
					<View style={{ flex: 1 }}>
						<Button
							title="Reset"
							variant="secondary"
							onPress={() => onApply?.({
								query: draft.query, // keep search query
								category: null,
								condition: null,
								brand: '',
								model: '',
								year: '',
								minPrice: '',
								maxPrice: '',
								radiusKm: null,
								sort: 'recent',
							})}
						/>
					</View>
					<View style={{ width: spacing.md }} />
					<View style={{ flex: 1 }}>
						<Button title="Apply" onPress={() => onApply?.(draft)} />
					</View>
				</View>
			}
		>
			<ScrollView showsVerticalScrollIndicator={false}>
				<Section title="Category">
					<View style={styles.chips}>
						<Chip label="All" active={!draft.category} onPress={() => patch({ category: null })} />
						{CATEGORIES.map((c) => (
							<Chip
								key={c.key}
								label={c.label}
								active={draft.category === c.key}
								onPress={() => patch({ category: c.key })}
							/>
						))}
					</View>
				</Section>

				<Section title="Condition">
					<View style={styles.chips}>
						<Chip label="Any" active={!draft.condition} onPress={() => patch({ condition: null })} />
						{CONDITIONS.map((c) => (
							<Chip
								key={c.key}
								label={c.label}
								active={draft.condition === c.key}
								onPress={() => patch({ condition: c.key })}
							/>
						))}
					</View>
				</Section>

				<Section title="Fitment (advanced)">
					<View style={styles.row}>
						<View style={{ flex: 1 }}>
							<Input label="Brand" value={draft.brand} onChangeText={(v) => patch({ brand: v })} placeholder="Toyota" />
						</View>
						<View style={{ width: spacing.md }} />
						<View style={{ flex: 1 }}>
							<Input label="Model" value={draft.model} onChangeText={(v) => patch({ model: v })} placeholder="Camry" />
						</View>
					</View>
					<Input
						label="Year"
						value={draft.year}
						onChangeText={(v) => patch({ year: v.replace(/\D/g, '').slice(0, 4) })}
						placeholder="2018"
						keyboardType="number-pad"
					/>
				</Section>

				<Section title="Price (ETB)">
					<View style={styles.row}>
						<View style={{ flex: 1 }}>
							<Input
								label="Min"
								value={draft.minPrice}
								onChangeText={(v) => patch({ minPrice: v.replace(/\D/g, '') })}
								placeholder="0"
								keyboardType="number-pad"
							/>
						</View>
						<View style={{ width: spacing.md }} />
						<View style={{ flex: 1 }}>
							<Input
								label="Max"
								value={draft.maxPrice}
								onChangeText={(v) => patch({ maxPrice: v.replace(/\D/g, '') })}
								placeholder="—"
								keyboardType="number-pad"
							/>
						</View>
					</View>
				</Section>

				<Section title="Distance">
					<View style={styles.chips}>
						{RADIUS_OPTIONS.map((r) => (
							<Chip
								key={String(r.key)}
								label={r.label}
								active={draft.radiusKm === r.key}
								onPress={() => patch({ radiusKm: r.key })}
							/>
						))}
					</View>
				</Section>

				<Section title="Sort by">
					<View style={styles.chips}>
						{SORTS.map((s) => (
							<Chip
								key={s.key}
								label={s.label}
								active={draft.sort === s.key}
								onPress={() => patch({ sort: s.key })}
							/>
						))}
					</View>
				</Section>
			</ScrollView>
		</BottomSheet>
	);
}

const Section = ({ title, children }) => (
	<View style={{ marginBottom: spacing.lg }}>
		<Text style={[typography.label, { marginBottom: spacing.sm }]}>{title}</Text>
		{children}
	</View>
);

const styles = StyleSheet.create({
	chips: { flexDirection: 'row', flexWrap: 'wrap' },
	row: { flexDirection: 'row', alignItems: 'flex-start' },
	footer: { flexDirection: 'row', alignItems: 'center' },
});
