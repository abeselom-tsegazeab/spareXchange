import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Location from 'expo-location';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { colors, radius, spacing, typography } from '../../config/theme';
import { SERVICE_TYPES, PRIORITIES } from '../../config/serviceCatalog';
import { useServicesStore } from '../../store/servicesStore';

export default function CreateRequestScreen({ navigation }) {
	const { createRequest, submitting } = useServicesStore();
	const [serviceType, setServiceType] = useState(null);
	const [priority, setPriority] = useState('medium');
	const [description, setDescription] = useState('');
	const [location, setLocation] = useState('');
	const [budgetMin, setBudgetMin] = useState('');
	const [budgetMax, setBudgetMax] = useState('');
	const [phone, setPhone] = useState('');
	const [coords, setCoords] = useState(null);
	const [touched, setTouched] = useState({});
	const [error, setError] = useState(null);

	const errors = {
		serviceType: touched.submit && !serviceType ? 'Pick the type of service' : null,
		description: touched.description && description.trim().length < 10 ? 'Describe the job (at least 10 chars)' : null,
		location: touched.location && !location.trim() ? 'Where are you located?' : null,
		budget:
			touched.submit && budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)
				? 'Min budget must be ≤ max budget'
				: null,
	};
	const canSubmit = serviceType && description.trim().length >= 10 && location.trim();

	const useMyLocation = async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') return;
			const pos = await Location.getCurrentPositionAsync({});
			setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
		} catch (_) {}
	};

	const onSubmit = async () => {
		setTouched({ submit: true, description: true, location: true });
		setError(null);
		if (!canSubmit) return;
		const res = await createRequest({
			serviceType,
			description: description.trim(),
			location: location.trim(),
			priority,
			budgetMin: budgetMin ? Number(budgetMin) : undefined,
			budgetMax: budgetMax ? Number(budgetMax) : undefined,
			contactInfo: phone.trim() ? { phone: phone.trim() } : undefined,
			latitude: coords?.latitude,
			longitude: coords?.longitude,
		});
		if (res.success) navigation.replace('RequestDetail', { id: res.request._id });
		else setError(res.message || 'Could not post the request.');
	};

	return (
		<ScreenContainer scroll keyboard>
			<Text style={typography.h2}>New service request</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
				Describe what you need. Verified technicians will reply with quotes.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}

			<Text style={[typography.label, { marginBottom: spacing.sm }]}>Service type *</Text>
			<ScrollView horizontal showsHorizontalScrollIndicator={false}>
				{SERVICE_TYPES.map((s) => (
					<Pressable
						key={s.key}
						onPress={() => setServiceType(s.key)}
						style={[styles.tile, serviceType === s.key && styles.tileActive]}
					>
						<Text style={{ fontSize: 24 }}>{s.icon}</Text>
						<Text style={[typography.caption, { marginTop: 4 }, serviceType === s.key && { color: colors.primaryDark, fontWeight: '800' }]}>
							{s.label}
						</Text>
					</Pressable>
				))}
			</ScrollView>
			{errors.serviceType ? <Text style={styles.err}>{errors.serviceType}</Text> : null}

			<View style={{ height: spacing.md }} />

			<Input
				label="Describe the job *"
				value={description}
				onChangeText={setDescription}
				onBlur={() => setTouched((t) => ({ ...t, description: true }))}
				placeholder="What's broken? What's needed? Year/model if relevant."
				multiline
				numberOfLines={4}
				maxLength={1000}
				error={errors.description}
				helper={`${description.length}/1000`}
			/>

			<Text style={[typography.label, { marginBottom: spacing.sm }]}>Priority</Text>
			<View style={styles.priorityRow}>
				{PRIORITIES.map((p) => {
					const active = priority === p.key;
					return (
						<Pressable
							key={p.key}
							onPress={() => setPriority(p.key)}
							style={[styles.priChip, { borderColor: p.color }, active && { backgroundColor: p.color }]}
						>
							<Text style={[styles.priText, { color: active ? '#fff' : p.color }]}>{p.label}</Text>
						</Pressable>
					);
				})}
			</View>

			<Input
				label="Location *"
				value={location}
				onChangeText={setLocation}
				onBlur={() => setTouched((t) => ({ ...t, location: true }))}
				placeholder="e.g. Bole, Addis Ababa"
				autoCapitalize="words"
				error={errors.location}
			/>
			<Pressable onPress={useMyLocation} style={styles.geoBtn} hitSlop={6}>
				<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>
					{coords
						? `📍 Using my location · ${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)}`
						: '＋ Attach my GPS location'}
				</Text>
			</Pressable>

			<Text style={[typography.label, { marginBottom: spacing.sm }]}>Budget (ETB) — optional</Text>
			<View style={styles.row}>
				<View style={{ flex: 1 }}>
					<Input
						value={budgetMin}
						onChangeText={(v) => setBudgetMin(v.replace(/\D/g, ''))}
						placeholder="Min"
						keyboardType="number-pad"
					/>
				</View>
				<View style={{ width: spacing.md }} />
				<View style={{ flex: 1 }}>
					<Input
						value={budgetMax}
						onChangeText={(v) => setBudgetMax(v.replace(/\D/g, ''))}
						placeholder="Max"
						keyboardType="number-pad"
					/>
				</View>
			</View>
			{errors.budget ? <Text style={styles.err}>{errors.budget}</Text> : null}

			<Input
				label="Phone (optional)"
				value={phone}
				onChangeText={setPhone}
				placeholder="+251 ..."
				keyboardType="phone-pad"
			/>

			<Button title="Post request" onPress={onSubmit} loading={submitting} disabled={!canSubmit} size="lg" />
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	tile: {
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
	tileActive: { borderColor: colors.primary, backgroundColor: '#ECFDF5' },
	err: { ...typography.caption, color: colors.danger, marginTop: 4 },
	row: { flexDirection: 'row', alignItems: 'flex-start' },
	priorityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
	priChip: {
		paddingHorizontal: spacing.md,
		paddingVertical: 8,
		borderRadius: radius.pill,
		borderWidth: 1.5,
		marginRight: spacing.xs,
		marginBottom: spacing.xs,
	},
	priText: { ...typography.caption, fontWeight: '800' },
	geoBtn: { alignSelf: 'flex-start', marginTop: -spacing.sm, marginBottom: spacing.md, paddingVertical: 4 },
});
