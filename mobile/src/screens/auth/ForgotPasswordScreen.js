import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { isEmail } from '../../utils/validators';
import { useAuthStore } from '../../store/authStore';

export default function ForgotPasswordScreen({ navigation }) {
	const [email, setEmail] = useState('');
	const [touched, setTouched] = useState(false);
	const [sent, setSent] = useState(false);
	const [error, setError] = useState(null);

	const forgotPassword = useAuthStore((s) => s.forgotPassword);
	const submitting = useAuthStore((s) => s.isSubmitting);

	const emailError = touched && !isEmail(email) ? 'Enter a valid email address' : null;
	const canSubmit = isEmail(email);

	const onSubmit = async () => {
		setTouched(true);
		setError(null);
		if (!canSubmit) return;
		const res = await forgotPassword({ email: email.trim() });
		if (res.success) setSent(true);
		else setError(res.message || 'Could not send reset email.');
	};

	return (
		<ScreenContainer scroll keyboard>
			<Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ marginBottom: spacing.lg }}>
				<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>‹ Back</Text>
			</Pressable>

			<Text style={typography.h1}>Forgot password?</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
				Enter the email you registered with — we'll send a secure password reset link.
			</Text>

			{sent ? (
				<>
					<Banner
						tone="success"
						title="Check your inbox"
						message={`If an account exists for ${email.trim()}, a reset link has been sent. The link expires in 1 hour.`}
					/>
					<Button
						title="I have my reset code"
						onPress={() => navigation.navigate('ResetPassword')}
						size="lg"
					/>
					<View style={{ height: spacing.md }} />
					<Button title="Back to sign in" variant="secondary" onPress={() => navigation.navigate('Login')} size="lg" />
				</>
			) : (
				<>
					{error ? <Banner tone="danger" message={error} /> : null}
					<Input
						label="Email"
						placeholder="you@example.com"
						value={email}
						onChangeText={setEmail}
						onBlur={() => setTouched(true)}
						keyboardType="email-address"
						autoCapitalize="none"
						autoCorrect={false}
						error={emailError}
					/>
					<Button
						title="Send reset link"
						onPress={onSubmit}
						loading={submitting}
						disabled={!canSubmit}
						size="lg"
					/>

					<View style={styles.footer}>
						<Text style={typography.muted}>Remembered it?</Text>
						<Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
							<Text style={[typography.bodyStrong, { color: colors.primaryDark, marginLeft: 6 }]}>
								Sign in
							</Text>
						</Pressable>
					</View>
				</>
			)}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: spacing.xxl,
	},
});
