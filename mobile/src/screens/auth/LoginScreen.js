import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Logo from '../../components/Logo';
import { colors, spacing, typography } from '../../config/theme';
import { isEmail, isNonEmpty } from '../../utils/validators';
import { useAuthStore } from '../../store/authStore';

export default function LoginScreen({ navigation }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [touched, setTouched] = useState({});
	const [submitError, setSubmitError] = useState(null);

	const login = useAuthStore((s) => s.login);
	const setPendingMfa = useAuthStore((s) => s.setPendingMfa);
	const submitting = useAuthStore((s) => s.isSubmitting);

	const errors = {
		email: touched.email && !isEmail(email) ? 'Enter a valid email address' : null,
		password: touched.password && !isNonEmpty(password) ? 'Password is required' : null,
	};
	const canSubmit = isEmail(email) && isNonEmpty(password);

	const onSubmit = async () => {
		setTouched({ email: true, password: true });
		setSubmitError(null);
		if (!canSubmit) return;
		const res = await login({ email: email.trim(), password });
		if (!res.success) {
			setSubmitError(res.message || 'Invalid email or password.');
		}
		if (res.mfaRequired) {
			setPendingMfa(email.trim());
			navigation.navigate('MFAValidate');
		}
	};

	return (
		<ScreenContainer scroll keyboard>
			<View style={styles.header}>
				<Logo size="lg" />
			</View>

			<Text style={typography.h1}>Welcome back</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
				Sign in to your SpareXChange account to trade parts, request services and earn EcoPoints.
			</Text>

			{submitError ? <Banner tone="danger" title="Sign-in failed" message={submitError} /> : null}

			<Input
				label="Email"
				placeholder="you@example.com"
				value={email}
				onChangeText={(t) => {
					setEmail(t);
					if (submitError) setSubmitError(null);
				}}
				onBlur={() => setTouched((t) => ({ ...t, email: true }))}
				keyboardType="email-address"
				autoCapitalize="none"
				autoCorrect={false}
				error={errors.email}
			/>

			<Input
				label="Password"
				placeholder="Your password"
				value={password}
				onChangeText={(t) => {
					setPassword(t);
					if (submitError) setSubmitError(null);
				}}
				onBlur={() => setTouched((t) => ({ ...t, password: true }))}
				secureTextEntry
				autoCapitalize="none"
				error={errors.password}
			/>

			<Pressable
				onPress={() => navigation.navigate('ForgotPassword')}
				style={{ alignSelf: 'flex-end', marginTop: -spacing.sm, marginBottom: spacing.lg }}
				hitSlop={8}
			>
				<Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '700' }]}>
					Forgot password?
				</Text>
			</Pressable>

			<Button title="Sign in" onPress={onSubmit} loading={submitting} disabled={!canSubmit} size="lg" />

			<View style={styles.divider}>
				<View style={styles.line} />
				<Text style={[typography.caption, { marginHorizontal: spacing.md }]}>or</Text>
				<View style={styles.line} />
			</View>

			<Button
				title="Continue with Google"
				variant="secondary"
				onPress={() => setSubmitError('Google sign-in is wired up in Module 1 Step 2.')}
				size="lg"
			/>

			<View style={styles.footer}>
				<Text style={typography.muted}>Don't have an account?</Text>
				<Pressable onPress={() => navigation.navigate('Signup')} hitSlop={8}>
					<Text style={[typography.bodyStrong, { color: colors.primaryDark, marginLeft: 6 }]}>
						Create account
					</Text>
				</Pressable>
			</View>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	header: { marginTop: spacing.md, marginBottom: spacing.xxxl, alignItems: 'flex-start' },
	divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
	line: { flex: 1, height: 1, backgroundColor: colors.border },
	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: spacing.xxl,
	},
});
