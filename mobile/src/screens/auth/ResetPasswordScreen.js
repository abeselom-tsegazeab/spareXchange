import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import PasswordChecklist from '../../components/PasswordChecklist';
import { colors, spacing, typography } from '../../config/theme';
import { isNonEmpty, isStrongPassword } from '../../utils/validators';
import { useAuthStore } from '../../store/authStore';

export default function ResetPasswordScreen({ route, navigation }) {
	const initialToken = route?.params?.token || '';
	const [token, setToken] = useState(initialToken);
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [touched, setTouched] = useState({});
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState(null);

	const submitting = useAuthStore((s) => s.isSubmitting);
	const resetPassword = useAuthStore((s) => s.resetPassword);

	const errors = {
		token: touched.token && !isNonEmpty(token) ? 'Reset token is required' : null,
		password:
			touched.password && !isStrongPassword(password)
				? 'Password does not meet all requirements'
				: null,
		confirm: touched.confirm && password !== confirm ? 'Passwords do not match' : null,
	};
	const canSubmit = isNonEmpty(token) && isStrongPassword(password) && password === confirm;

	const onSubmit = async () => {
		setTouched({ token: true, password: true, confirm: true });
		setError(null);
		if (!canSubmit) return;
		const res = await resetPassword({ token: token.trim(), password });
		if (res.success) setSuccess(true);
		else setError(res.message || 'Could not reset password.');
	};

	if (success) {
		return (
			<ScreenContainer scroll>
				<View style={{ flex: 1, justifyContent: 'center' }}>
					<Banner
						tone="success"
						title="Password updated"
						message="You can now sign in with your new password."
					/>
					<Button title="Back to sign in" onPress={() => navigation.navigate('Login')} size="lg" />
				</View>
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer scroll keyboard>
			<Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ marginBottom: spacing.lg }}>
				<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>‹ Back</Text>
			</Pressable>

			<Text style={typography.h1}>Reset password</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
				Paste the reset token from your email and choose a new strong password.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}

			<Input
				label="Reset token"
				placeholder="The long token from the reset email"
				value={token}
				onChangeText={setToken}
				onBlur={() => setTouched((t) => ({ ...t, token: true }))}
				autoCapitalize="none"
				autoCorrect={false}
				error={errors.token}
				helper="It's the random string at the end of the reset URL."
			/>

			<Input
				label="New password"
				placeholder="Strong password"
				value={password}
				onChangeText={setPassword}
				onBlur={() => setTouched((t) => ({ ...t, password: true }))}
				secureTextEntry
				autoCapitalize="none"
				error={errors.password}
			/>

			<PasswordChecklist password={password} />

			<Input
				label="Confirm password"
				placeholder="Re-type the new password"
				value={confirm}
				onChangeText={setConfirm}
				onBlur={() => setTouched((t) => ({ ...t, confirm: true }))}
				secureTextEntry
				autoCapitalize="none"
				error={errors.confirm}
			/>

			<Button
				title="Reset password"
				onPress={onSubmit}
				loading={submitting}
				disabled={!canSubmit}
				size="lg"
			/>

			<View style={styles.footer}>
				<Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
					<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>Cancel and sign in</Text>
				</Pressable>
			</View>
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
