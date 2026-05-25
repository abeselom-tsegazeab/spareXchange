import React, { useCallback, useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Loader from '../../components/Loader';
import { colors, spacing, typography } from '../../config/theme';
import { PREFERENCE_GROUPS } from '../../config/notificationCatalog';
import { useNotificationsStore } from '../../store/notificationsStore';

export default function NotificationPreferencesScreen() {
	const {
		preferences,
		devices,
		loading,
		submitting,
		error,
		fetchPreferences,
		updatePreferences,
		resetPreferences,
		fetchDevices,
		toggleDevice,
	} = useNotificationsStore();

	const [draft, setDraft] = useState(preferences);
	const [info, setInfo] = useState(null);

	useFocusEffect(
		useCallback(() => {
			fetchPreferences();
			fetchDevices();
		}, [fetchPreferences, fetchDevices])
	);

	useEffect(() => {
		setDraft(preferences);
	}, [preferences]);

	const patch = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

	const onSave = async () => {
		setInfo(null);
		const res = await updatePreferences(draft);
		if (res.success) setInfo('Preferences saved.');
	};

	const onReset = () => {
		Alert.alert('Reset preferences?', 'All notification settings will return to defaults.', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Reset',
				style: 'destructive',
				onPress: async () => {
					const res = await resetPreferences();
					if (res.success) setInfo('Preferences reset to defaults.');
				},
			},
		]);
	};

	if (loading && !preferences) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading preferences..." />
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer scroll keyboard>
			<Text style={typography.h2}>Notification settings</Text>
			<Text style={[typography.muted, { marginBottom: spacing.lg }]}>
				Choose how SpareXChange reaches you. Push tokens register automatically on login.
			</Text>

			{info ? <Banner tone="success" message={info} /> : null}
			{error ? <Banner tone="danger" message={error} /> : null}

			{PREFERENCE_GROUPS.map((group) => (
				<Card key={group.title} style={{ marginBottom: spacing.lg }}>
					<Text style={typography.h4}>{group.title}</Text>
					{group.items.map((item) => (
						<View key={item.key} style={styles.row}>
							<View style={{ flex: 1 }}>
								<Text style={typography.bodyStrong}>{item.label}</Text>
								<Text style={typography.caption}>{item.description}</Text>
							</View>
							<Switch
								value={!!draft[item.key]}
								onValueChange={(v) => patch(item.key, v)}
								trackColor={{ false: colors.border, true: colors.primaryLight }}
								thumbColor={draft[item.key] ? colors.primary : colors.surface}
							/>
						</View>
					))}
				</Card>
			))}

			{devices.length ? (
				<Card style={{ marginBottom: spacing.lg }}>
					<Text style={typography.h4}>Registered devices</Text>
					{devices.map((d) => (
						<View key={d.token} style={styles.deviceRow}>
							<View style={{ flex: 1 }}>
								<Text style={typography.bodyStrong}>{d.deviceName || d.deviceType}</Text>
								<Text style={typography.caption} numberOfLines={1}>
									{d.token}
								</Text>
							</View>
							<Switch
								value={!!d.isActive}
								onValueChange={() => toggleDevice(d.token)}
								disabled={submitting}
							/>
						</View>
					))}
				</Card>
			) : null}

			<Button title="Save preferences" onPress={onSave} loading={submitting} size="lg" />
			<View style={{ height: spacing.sm }} />
			<Button title="Reset to defaults" variant="secondary" onPress={onReset} loading={submitting} />
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: spacing.sm,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		marginTop: spacing.xs,
		gap: spacing.md,
	},
	deviceRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: spacing.sm,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		marginTop: spacing.xs,
		gap: spacing.md,
	},
});
