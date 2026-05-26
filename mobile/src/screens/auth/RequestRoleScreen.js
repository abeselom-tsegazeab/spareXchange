// "Get verified" flow: upgrade from individual -> technician/garage/repair-shop/recycler.
// Step 1: UI + document picker UX. Step 2 will POST to /api/users/verify-role (multipart).

import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Banner from '../../components/Banner';
import { colors, radius, spacing, typography } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';

const ROLE_OPTIONS = [
	{ key: 'technician', label: 'Technician', desc: 'Repair specialist taking service jobs' },
	{ key: 'garage', label: 'Garage', desc: 'Auto-service business with parts inventory' },
	{ key: 'repair-shop', label: 'Repair Shop', desc: 'Storefront repair business' },
	{ key: 'recycler', label: 'Recycler', desc: 'Verifies eco drop-offs and grants EcoPoints' },
];

export default function RequestRoleScreen({ navigation }) {
	const user = useAuthStore((s) => s.user);
	const submitting = useAuthStore((s) => s.isSubmitting);
	const requestRoleVerification = useAuthStore((s) => s.requestRoleVerification);

	const [userType, setUserType] = useState(user?.userType !== 'individual' ? user?.userType : 'technician');
	const [expertise, setExpertise] = useState(user?.expertise || '');
	const [documents, setDocuments] = useState([]);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const pickDocument = async () => {
		setError(null);
		try {
			const res = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ['images'],
				quality: 0.8,
				allowsMultipleSelection: true,
				selectionLimit: 5 - documents.length,
			});
			if (res.canceled) return;
			const picked = (res.assets || []).slice(0, 5 - documents.length);
			setDocuments((prev) => [...prev, ...picked]);
		} catch (e) {
			setError(e?.message || 'Could not open the document picker.');
		}
	};

	const removeDoc = (uri) => setDocuments((prev) => prev.filter((d) => d.uri !== uri));

	const canSubmit = !!userType && documents.length > 0;

	const onSubmit = async () => {
		setError(null);
		if (!canSubmit) {
			setError('Choose a role and attach at least one verification document.');
			return;
		}
		const res = await requestRoleVerification({
			requestedType: userType,
			documents,
			expertise: expertise.trim() || undefined,
		});
		if (res.success) setSuccess(true);
		else setError(res.message || 'Could not submit verification request.');
	};

	if (success) {
		return (
			<ScreenContainer scroll>
				<View style={{ flex: 1, justifyContent: 'center' }}>
					<Banner
						tone="success"
						title="Submitted for review"
						message="An admin will review your documents shortly. You'll get a notification once your role is verified."
					/>
					<Button title="Back to profile" onPress={() => navigation.popToTop()} size="lg" />
				</View>
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer scroll keyboard>
			<Text style={typography.h2}>Apply for a verified role</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
				Verified accounts can offer professional services, redeem EcoPoints, post bulk listings and
				display a trust badge on their profile.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}

			<Text style={[typography.label, { marginBottom: spacing.sm }]}>Choose role</Text>
			<View style={{ gap: spacing.sm, marginBottom: spacing.lg }}>
				{ROLE_OPTIONS.map((r) => {
					const active = userType === r.key;
					return (
						<Pressable
							key={r.key}
							onPress={() => setUserType(r.key)}
							style={[styles.roleCard, active && styles.roleCardActive]}
						>
							<View style={[styles.radio, active && styles.radioActive]}>
								{active ? <View style={styles.radioDot} /> : null}
							</View>
							<View style={{ flex: 1 }}>
								<Text style={[typography.bodyStrong, active && { color: colors.primaryDark }]}>
									{r.label}
								</Text>
								<Text style={typography.caption}>{r.desc}</Text>
							</View>
						</Pressable>
					);
				})}
			</View>

			{userType === 'technician' || userType === 'garage' || userType === 'repair-shop' ? (
				<Input
					label="Area of expertise"
					placeholder="e.g. Engine repair, electrical, body work"
					value={expertise}
					onChangeText={setExpertise}
				/>
			) : null}

			<Card>
				<Text style={typography.h4}>Verification documents</Text>
				<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.md }]}>
					Upload up to 5 images of supporting documents (business license, ID, certificates, etc.).
				</Text>

				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{documents.map((d) => (
						<View key={d.uri} style={styles.thumb}>
							<Image source={{ uri: d.uri }} style={styles.thumbImg} />
							<Pressable style={styles.thumbRemove} onPress={() => removeDoc(d.uri)} hitSlop={8}>
								<Text style={{ color: '#fff', fontWeight: '800' }}>×</Text>
							</Pressable>
						</View>
					))}
					{documents.length < 5 ? (
						<Pressable onPress={pickDocument} style={[styles.thumb, styles.thumbAdd]}>
							<Text style={{ fontSize: 32, color: colors.textMuted, lineHeight: 32 }}>+</Text>
							<Text style={[typography.caption, { marginTop: 4 }]}>Add</Text>
						</Pressable>
					) : null}
				</ScrollView>
			</Card>

			<Button
				title="Submit for review"
				onPress={onSubmit}
				disabled={!canSubmit}
				loading={submitting}
				size="lg"
				style={{ marginTop: spacing.xxl }}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	roleCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.md,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		backgroundColor: colors.surface,
	},
	roleCardActive: { borderColor: colors.primary, backgroundColor: '#ECFDF5' },
	radio: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: colors.borderStrong,
		marginRight: spacing.md,
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioActive: { borderColor: colors.primary },
	radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
	thumb: {
		width: 88,
		height: 88,
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
});
