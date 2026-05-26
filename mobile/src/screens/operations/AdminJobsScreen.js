import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { spacing, typography } from '../../config/theme';
import { useAdminStore } from '../../store/adminStore';

export default function AdminJobsScreen() {
	const { runSavedSearchAlertsJob, submitting } = useAdminStore();
	const [limitSearches, setLimitSearches] = useState('20');
	const [limitListings, setLimitListings] = useState('5');
	const [result, setResult] = useState(null);
	const [error, setError] = useState(null);

	const onRun = async () => {
		setError(null);
		setResult(null);
		const res = await runSavedSearchAlertsJob({
			limitSearches: Number(limitSearches) || 20,
			limitListingsPerSearch: Number(limitListings) || 5,
		});
		if (res.success) {
			setResult(res.result || res.message);
		} else {
			setError(res.message);
		}
	};

	return (
		<ScreenContainer scroll keyboard>
			<Text style={typography.h2}>Admin jobs</Text>
			<Text style={[typography.muted, { marginBottom: spacing.lg }]}>
				Manually trigger the saved-search alerts processor. Normally this runs on a schedule server-side.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}
			{result ? (
				<Banner
					tone="success"
					title="Job completed"
					message={typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)}
				/>
			) : null}

			<Card>
				<Input
					label="Max searches to process"
					value={limitSearches}
					onChangeText={(v) => setLimitSearches(v.replace(/\D/g, ''))}
					keyboardType="number-pad"
				/>
				<Input
					label="Max listings per search"
					value={limitListings}
					onChangeText={(v) => setLimitListings(v.replace(/\D/g, ''))}
					keyboardType="number-pad"
				/>
				<Button title="Run saved-search alerts" onPress={onRun} loading={submitting} size="lg" />
			</Card>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({});
