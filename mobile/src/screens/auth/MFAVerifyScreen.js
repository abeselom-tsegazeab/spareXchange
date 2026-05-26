// Step in MFA enrollment AFTER setup. Confirms the user's authenticator app
// generates valid codes by sending one to /auth/mfa/verify.

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';

export default function MFAVerifyScreen({ navigation }) {
	const [code, setCode] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(null);
	const verifyMFA = useAuthStore((s) => s.verifyMFA);

	const canSubmit = code.replace(/\D/g, '').length === 6;

	const onSubmit = async () => {
		setError(null);
		if (!canSubmit) return;
		try {
			setSubmitting(true);
			const res = await verifyMFA({ code: code.trim() });
			if (res.success) setSuccess(true);
			else setError(res.message || 'Invalid code.');
		} catch (e) {
			setError(e?.message || 'Invalid code.');
		} finally {
			setSubmitting(false);
		}
	};

	if (success) {
		return (
			<ScreenContainer scroll>
				<View style={{ flex: 1, justifyContent: 'center' }}>
					<Banner
						tone="success"
						title="Two-factor auth enabled"
						message="From now on you'll need a code from your authenticator app to sign in."
					/>
					<Button title="Back to profile" onPress={() => navigation.popToTop()} size="lg" />
				</View>
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer scroll keyboard>
			<Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ marginBottom: spacing.lg }}>
				<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>‹ Back</Text>
			</Pressable>

			<Text style={typography.h2}>Confirm 2FA</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
				Type the 6-digit code currently shown in your authenticator app to finish enabling
				two-factor authentication.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}

			<Input
				label="Authenticator code"
				placeholder="123456"
				value={code}
				onChangeText={setCode}
				keyboardType="number-pad"
				maxLength={6}
				autoCapitalize="none"
				autoCorrect={false}
			/>

			<Button
				title="Enable 2FA"
				onPress={onSubmit}
				disabled={!canSubmit}
				loading={submitting}
				size="lg"
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({});
