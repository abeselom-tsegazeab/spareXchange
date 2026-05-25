// Shown after login when the backend responds { mfaRequired: true }.

import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';

export default function MFAValidateScreen({ navigation }) {
	const [code, setCode] = useState('');
	const [error, setError] = useState(null);

	const email = useAuthStore((s) => s.pendingMfaEmail);
	const validate = useAuthStore((s) => s.validateMfaLogin);
	const submitting = useAuthStore((s) => s.isSubmitting);

	const canSubmit = code.replace(/\D/g, '').length >= 6;

	const onSubmit = async () => {
		setError(null);
		if (!canSubmit) return;
		const res = await validate({ email, code: code.trim() });
		if (!res.success) setError(res.message || 'Invalid MFA code');
	};

	return (
		<ScreenContainer scroll keyboard>
			<Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ marginBottom: spacing.lg }}>
				<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>‹ Back</Text>
			</Pressable>

			<Text style={typography.h1}>Two-factor verification</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
				Enter the 6-digit code from your authenticator app. You can also use one of your saved backup
				codes.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}

			<View style={styles.userBadge}>
				<Text style={typography.caption}>Signing in as</Text>
				<Text style={typography.bodyStrong}>{email || 'your account'}</Text>
			</View>

			<Input
				label="Authenticator code"
				placeholder="123456"
				value={code}
				onChangeText={setCode}
				keyboardType="number-pad"
				maxLength={10}
				autoCapitalize="none"
				autoCorrect={false}
			/>

			<Button
				title="Verify and continue"
				onPress={onSubmit}
				disabled={!canSubmit}
				loading={submitting}
				size="lg"
			/>

			<View style={styles.footer}>
				<Pressable onPress={() => navigation.popToTop()} hitSlop={8}>
					<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>Cancel sign-in</Text>
				</Pressable>
			</View>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	userBadge: {
		padding: spacing.md,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
		marginBottom: spacing.lg,
	},
	footer: { alignItems: 'center', marginTop: spacing.xxl },
});
