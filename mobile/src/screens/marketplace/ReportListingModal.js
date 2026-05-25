import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BottomSheet from '../../components/BottomSheet';
import Chip from '../../components/Chip';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { spacing, typography } from '../../config/theme';
import { REPORT_REASONS } from '../../config/catalog';

export default function ReportListingModal({ visible, onClose, onSubmit, submitting }) {
	const [reason, setReason] = useState(null);
	const [details, setDetails] = useState('');
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const canSubmit = !!reason;

	const handleSubmit = async () => {
		setError(null);
		if (!canSubmit) return;
		const res = await onSubmit?.({ reason, details: details.trim() });
		if (res?.success) {
			setSuccess(true);
			setTimeout(() => {
				setSuccess(false);
				setReason(null);
				setDetails('');
				onClose?.();
			}, 1200);
		} else {
			setError(res?.message || 'Could not file report');
		}
	};

	return (
		<BottomSheet visible={visible} onClose={onClose} title="Report this listing">
			{success ? (
				<Banner tone="success" title="Report received" message="Thank you. Our moderators will review it shortly." />
			) : (
				<>
					{error ? <Banner tone="danger" message={error} /> : null}

					<Text style={[typography.label, { marginBottom: spacing.sm }]}>Reason</Text>
					<View style={styles.chips}>
						{REPORT_REASONS.map((r) => (
							<Chip
								key={r.key}
								label={r.label}
								active={reason === r.key}
								onPress={() => setReason(r.key)}
							/>
						))}
					</View>

					<Input
						label="Details (optional)"
						value={details}
						onChangeText={setDetails}
						placeholder="Add context to help our team review faster"
						multiline
						numberOfLines={3}
						maxLength={500}
						helper={`${details.length}/500`}
					/>

					<Button
						title="Submit report"
						onPress={handleSubmit}
						disabled={!canSubmit}
						loading={submitting}
						variant="danger"
					/>
				</>
			)}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	chips: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
});
