import React, { useState } from 'react';
import { Text, View } from 'react-native';

import BottomSheet from '../../components/BottomSheet';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { spacing, typography } from '../../config/theme';

export default function SubmitQuoteSheet({ visible, initial, onClose, onSubmit, submitting }) {
	const [estimatedCost, setEstimatedCost] = useState(initial?.estimatedCost ? String(initial.estimatedCost) : '');
	const [additionalNotes, setAdditionalNotes] = useState(initial?.additionalNotes || '');
	const [error, setError] = useState(null);

	const canSubmit = Number(estimatedCost) > 0;

	const handleSubmit = async () => {
		setError(null);
		if (!canSubmit) return;
		const res = await onSubmit?.({
			estimatedCost: Number(estimatedCost),
			additionalNotes: additionalNotes.trim(),
		});
		if (res?.success) {
			setEstimatedCost('');
			setAdditionalNotes('');
			onClose?.();
		} else {
			setError(res?.message || 'Could not send quote.');
		}
	};

	return (
		<BottomSheet visible={visible} onClose={onClose} title={initial ? 'Update quote' : 'Submit a quote'}>
			<Text style={[typography.caption, { marginBottom: spacing.md }]}>
				The customer sees this immediately. You can update or withdraw it any time before they accept.
			</Text>
			{error ? <Banner tone="danger" message={error} /> : null}
			<Input
				label="Estimated cost (ETB) *"
				value={estimatedCost}
				onChangeText={(v) => setEstimatedCost(v.replace(/\D/g, ''))}
				placeholder="e.g. 450"
				keyboardType="number-pad"
			/>
			<Input
				label="Notes for the customer (optional)"
				value={additionalNotes}
				onChangeText={setAdditionalNotes}
				placeholder="When you can come, what's included, etc."
				multiline
				numberOfLines={3}
				maxLength={500}
				helper={`${additionalNotes.length}/500`}
			/>
			<Button title={initial ? 'Update quote' : 'Send quote'} onPress={handleSubmit} disabled={!canSubmit} loading={submitting} />
			<View style={{ height: spacing.md }} />
		</BottomSheet>
	);
}
