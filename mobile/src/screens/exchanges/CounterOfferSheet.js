import React, { useState } from 'react';
import { Text, View } from 'react-native';

import BottomSheet from '../../components/BottomSheet';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { spacing, typography } from '../../config/theme';

export default function CounterOfferSheet({ visible, onClose, onSubmit, submitting }) {
	const [offeredItems, setOfferedItems] = useState('');
	const [note, setNote] = useState('');
	const [error, setError] = useState(null);

	const canSubmit = offeredItems.trim().length > 0;

	const handleSubmit = async () => {
		setError(null);
		if (!canSubmit) return;
		const res = await onSubmit?.({ offeredItems: offeredItems.trim(), note: note.trim() });
		if (res?.success) {
			setOfferedItems('');
			setNote('');
			onClose?.();
		} else {
			setError(res?.message || 'Could not send counter-offer.');
		}
	};

	return (
		<BottomSheet visible={visible} onClose={onClose} title="Counter-offer">
			<Text style={[typography.caption, { marginBottom: spacing.md }]}>
				Propose modified terms. The other party can accept, reject or counter again.
			</Text>
			{error ? <Banner tone="danger" message={error} /> : null}
			<Input
				label="Counter-offered items *"
				value={offeredItems}
				onChangeText={setOfferedItems}
				placeholder="e.g. Cash 220 USD, or my listing #1234 + 50 USD"
				multiline
				numberOfLines={3}
				maxLength={500}
			/>
			<Input
				label="Note (optional)"
				value={note}
				onChangeText={setNote}
				placeholder="Why this offer makes sense"
				multiline
				numberOfLines={2}
				maxLength={300}
			/>
			<Button title="Send counter-offer" onPress={handleSubmit} disabled={!canSubmit} loading={submitting} />
			<View style={{ height: spacing.md }} />
		</BottomSheet>
	);
}
