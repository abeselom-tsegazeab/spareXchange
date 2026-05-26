import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BottomSheet from '../../components/BottomSheet';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { colors, radius, spacing, typography } from '../../config/theme';
import { DISPUTE_REASONS } from '../../config/exchangeStatus';

export default function OpenDisputeSheet({ visible, onClose, onSubmit, submitting }) {
	const [reasonKey, setReasonKey] = useState(null);
	const [customReason, setCustomReason] = useState('');
	const [error, setError] = useState(null);

	const finalReason = reasonKey === 'Other' ? customReason.trim() : reasonKey;
	const canSubmit = !!finalReason;

	const handleSubmit = async () => {
		setError(null);
		if (!canSubmit) return;
		const res = await onSubmit?.({ reason: finalReason });
		if (res?.success) {
			setReasonKey(null);
			setCustomReason('');
			onClose?.();
		} else {
			setError(res?.message || 'Could not open dispute');
		}
	};

	return (
		<BottomSheet visible={visible} onClose={onClose} title="Open a dispute">
			<Banner
				tone="warning"
				title="Use disputes responsibly"
				message="Try messaging the other party first. Disputes are reviewed by our team and can affect both parties' trust scores."
			/>
			{error ? <Banner tone="danger" message={error} /> : null}

			<Text style={[typography.label, { marginBottom: spacing.sm }]}>Reason</Text>
			<View style={{ gap: spacing.xs, marginBottom: spacing.md }}>
				{DISPUTE_REASONS.map((r) => {
					const active = reasonKey === r;
					return (
						<Pressable
							key={r}
							onPress={() => setReasonKey(r)}
							style={[styles.option, active && styles.optionActive]}
						>
							<View style={[styles.radio, active && styles.radioActive]}>
								{active ? <View style={styles.radioDot} /> : null}
							</View>
							<Text style={[typography.body, active && { fontWeight: '700', color: colors.primaryDark }]}>
								{r}
							</Text>
						</Pressable>
					);
				})}
			</View>

			{reasonKey === 'Other' ? (
				<Input
					label="Tell us more *"
					value={customReason}
					onChangeText={setCustomReason}
					placeholder="Describe what went wrong"
					multiline
					numberOfLines={3}
					maxLength={500}
				/>
			) : null}

			<Button title="File dispute" onPress={handleSubmit} disabled={!canSubmit} loading={submitting} variant="danger" />
			<View style={{ height: spacing.md }} />
		</BottomSheet>
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
		width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: colors.borderStrong,
		marginRight: spacing.md, alignItems: 'center', justifyContent: 'center',
	},
	radioActive: { borderColor: colors.primary },
	radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
});
