import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import EcoTierCard from '../../components/EcoTierCard';
import { colors, radius, spacing, typography } from '../../config/theme';
import { REWARDS } from '../../config/ecoCatalog';
import { useAuthStore } from '../../store/authStore';
import { useSustainabilityStore } from '../../store/sustainabilityStore';

export default function RedeemPointsScreen({ navigation }) {
	const me = useAuthStore((s) => s.user);
	const { redeemPoints, submitting } = useSustainabilityStore();

	const [selected, setSelected] = useState(null);
	const [customPoints, setCustomPoints] = useState('');
	const [customDesc, setCustomDesc] = useState('');
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	const totalPoints = me?.ecoPoints || 0;
	const finalPoints = selected ? selected.points : Number(customPoints) || 0;
	const finalDesc = selected ? selected.label : customDesc.trim();
	const isVerified = me?.roleStatus === 'verified';

	const canSubmit = isVerified && finalPoints > 0 && finalPoints <= totalPoints && finalDesc;

	const onSubmit = async () => {
		setError(null);
		setSuccess(null);
		if (!canSubmit) return;
		const res = await redeemPoints({ points: finalPoints, rewardDescription: finalDesc });
		if (res.success) {
			setSuccess(`Redeemed ${finalPoints} pts. New balance: ${res.currentPoints} pts.`);
			setSelected(null);
			setCustomPoints('');
			setCustomDesc('');
		} else {
			setError(res.message || 'Could not redeem points.');
		}
	};

	return (
		<ScreenContainer scroll keyboard>
			<EcoTierCard points={totalPoints} />

			<View style={{ height: spacing.lg }} />

			{!isVerified ? (
				<Banner
					tone="warning"
					title="Verified accounts only"
					message="Redemption is open to verified users. Apply from your profile to unlock rewards."
				/>
			) : null}

			{error ? <Banner tone="danger" message={error} /> : null}
			{success ? <Banner tone="success" message={success} /> : null}

			<Text style={[typography.h4, { marginBottom: spacing.sm }]}>Choose a reward</Text>
			<View style={{ gap: spacing.sm }}>
				{REWARDS.map((r) => {
					const active = selected?.key === r.key;
					const affordable = totalPoints >= r.points;
					return (
						<Pressable
							key={r.key}
							onPress={() => {
								setSelected(r);
								setCustomPoints('');
								setCustomDesc('');
							}}
							style={[styles.option, active && styles.optionActive, !affordable && { opacity: 0.5 }]}
							disabled={!affordable}
						>
							<View style={{ flex: 1 }}>
								<Text style={typography.bodyStrong}>{r.label}</Text>
								<Text style={typography.caption}>{r.points.toLocaleString()} EcoPoints</Text>
							</View>
							<View style={[styles.radio, active && styles.radioActive]}>
								{active ? <View style={styles.radioDot} /> : null}
							</View>
						</Pressable>
					);
				})}
			</View>

			<Card style={{ marginTop: spacing.xl }}>
				<Text style={typography.h4}>Or redeem a custom amount</Text>
				<Text style={[typography.caption, { marginBottom: spacing.md }]}>
					Useful for partner promos with specific point amounts.
				</Text>
				<Input
					label="Points to spend"
					value={customPoints}
					onChangeText={(v) => {
						setCustomPoints(v.replace(/\D/g, ''));
						setSelected(null);
					}}
					placeholder="e.g. 350"
					keyboardType="number-pad"
				/>
				<Input
					label="Reward description"
					value={customDesc}
					onChangeText={(v) => {
						setCustomDesc(v);
						setSelected(null);
					}}
					placeholder="e.g. 15% off battery delivery"
					maxLength={140}
				/>
			</Card>

			<View style={{ height: spacing.lg }} />
			<Button
				title={`Redeem ${finalPoints || 0} EcoPoints`}
				onPress={onSubmit}
				disabled={!canSubmit}
				loading={submitting}
				size="lg"
			/>
			{finalPoints > totalPoints ? (
				<Text style={{ color: colors.danger, textAlign: 'center', marginTop: spacing.sm }}>
					You only have {totalPoints.toLocaleString()} pts available.
				</Text>
			) : null}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.md,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		backgroundColor: colors.surface,
	},
	optionActive: { borderColor: colors.primary, backgroundColor: '#ECFDF5' },
	radio: {
		width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.borderStrong,
		alignItems: 'center', justifyContent: 'center', marginLeft: spacing.md,
	},
	radioActive: { borderColor: colors.primary },
	radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
