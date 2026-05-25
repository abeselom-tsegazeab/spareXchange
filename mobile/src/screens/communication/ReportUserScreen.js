import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Chip from '../../components/Chip';
import { spacing, typography } from '../../config/theme';
import { DISPUTE_REASONS } from '../../config/trustCatalog';
import { useDisputesStore } from '../../store/disputesStore';

export default function ReportUserScreen({ route, navigation }) {
	const { targetId, targetName, exchangeId } = route.params || {};
	const { reportUser, submitting } = useDisputesStore();

	const [reason, setReason] = useState(null);
	const [description, setDescription] = useState('');
	const [error, setError] = useState(null);
	const [info, setInfo] = useState(null);

	const onSubmit = async () => {
		setError(null);
		if (!reason) {
			setError('Select a reason for your report.');
			return;
		}
		if (description.trim().length < 20) {
			setError('Describe what happened (at least 20 characters).');
			return;
		}
		const res = await reportUser({
			targetId,
			exchangeId: exchangeId || undefined,
			reason,
			description: description.trim(),
		});
		if (res.success) {
			setInfo('Report submitted. Our team will review it shortly.');
			setTimeout(() => navigation.goBack(), 1500);
		} else {
			setError(res.message);
		}
	};

	return (
		<ScreenContainer scroll keyboard>
			<Text style={typography.h2}>Report a user</Text>
			<Text style={[typography.muted, { marginBottom: spacing.lg }]}>
				{targetName
					? `Tell us what happened with ${targetName}. Reports are reviewed by admins.`
					: 'Submit a platform dispute report for admin review.'}
			</Text>

			{info ? <Banner tone="success" message={info} /> : null}
			{error ? <Banner tone="danger" message={error} /> : null}

			<Text style={[typography.label, { marginBottom: spacing.sm }]}>Reason *</Text>
			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
				{DISPUTE_REASONS.map((r) => (
					<Chip key={r.key} label={r.label} active={reason === r.key} onPress={() => setReason(r.key)} />
				))}
			</ScrollView>

			<Input
				label="What happened? *"
				value={description}
				onChangeText={setDescription}
				placeholder="Include dates, listing/exchange details, and any evidence you have."
				multiline
				numberOfLines={6}
				maxLength={2000}
				helper={`${description.length}/2000`}
			/>

			<Button title="Submit report" onPress={onSubmit} loading={submitting} size="lg" variant="danger" />
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({});
