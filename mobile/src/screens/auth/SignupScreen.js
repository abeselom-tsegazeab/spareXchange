import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import PasswordChecklist from '../../components/PasswordChecklist';
import { colors, radius, spacing, typography } from '../../config/theme';
import { isEmail, isNonEmpty, isStrongPassword } from '../../utils/validators';
import { useAuthStore } from '../../store/authStore';

const ROLES = [
	{ key: 'individual', label: 'Individual', desc: 'Buy, sell or trade personal parts' },
	{ key: 'repair-shop', label: 'Repair Shop', desc: 'List bulk inventory and accept service jobs' },
	{ key: 'recycler', label: 'Recycler', desc: 'Verify recycling drop-offs and award EcoPoints' },
];

export default function SignupScreen({ navigation }) {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [userType, setUserType] = useState('individual');
	const [touched, setTouched] = useState({});
	const [submitError, setSubmitError] = useState(null);

	const signup = useAuthStore((s) => s.signup);
	const submitting = useAuthStore((s) => s.isSubmitting);

	const errors = {
		name: touched.name && !isNonEmpty(name) ? 'Name is required' : null,
		email: touched.email && !isEmail(email) ? 'Enter a valid email address' : null,
		password:
			touched.password && !isStrongPassword(password)
				? 'Password does not meet all requirements'
				: null,
	};
	const canSubmit = isNonEmpty(name) && isEmail(email) && isStrongPassword(password);

	const onSubmit = async () => {
		setTouched({ name: true, email: true, password: true });
		setSubmitError(null);
		if (!canSubmit) return;
		const res = await signup({ name: name.trim(), email: email.trim(), password, userType });
		if (res.success) {
			navigation.navigate('VerifyEmail', { email: email.trim() });
		} else {
			setSubmitError(res.message || 'Could not create your account.');
		}
	};

	return (
		<ScreenContainer scroll keyboard>
			<Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ marginBottom: spacing.lg }}>
				<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>‹ Back</Text>
			</Pressable>

			<Text style={typography.h1}>Create your account</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
				Start trading spare parts, earning EcoPoints and connecting with verified technicians.
			</Text>

			{submitError ? <Banner tone="danger" title="Sign-up failed" message={submitError} /> : null}

			<Input
				label="Full name"
				placeholder="e.g. Jane Doe"
				value={name}
				onChangeText={setName}
				onBlur={() => setTouched((t) => ({ ...t, name: true }))}
				autoCapitalize="words"
				error={errors.name}
			/>

			<Input
				label="Email"
				placeholder="you@example.com"
				value={email}
				onChangeText={setEmail}
				onBlur={() => setTouched((t) => ({ ...t, email: true }))}
				keyboardType="email-address"
				autoCapitalize="none"
				autoCorrect={false}
				error={errors.email}
			/>

			<Input
				label="Password"
				placeholder="Strong password"
				value={password}
				onChangeText={setPassword}
				onBlur={() => setTouched((t) => ({ ...t, password: true }))}
				secureTextEntry
				autoCapitalize="none"
				error={errors.password}
			/>

			<PasswordChecklist password={password} />

			<Text style={[typography.label, { marginBottom: spacing.sm }]}>I am signing up as</Text>
			<View style={styles.roles}>
				{ROLES.map((r) => {
					const active = userType === r.key;
					return (
						<Pressable
							key={r.key}
							onPress={() => setUserType(r.key)}
							style={[styles.roleCard, active && styles.roleCardActive]}
						>
							<View style={[styles.radio, active && styles.radioActive]}>
								{active ? <View style={styles.radioDot} /> : null}
							</View>
							<View style={{ flex: 1 }}>
								<Text style={[typography.bodyStrong, active && { color: colors.primaryDark }]}>
									{r.label}
								</Text>
								<Text style={typography.caption}>{r.desc}</Text>
							</View>
						</Pressable>
					);
				})}
			</View>

			<Button
				title="Create account"
				onPress={onSubmit}
				loading={submitting}
				disabled={!canSubmit}
				size="lg"
				style={{ marginTop: spacing.xl }}
			/>

			<Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.lg }]}>
				By signing up you agree to our Terms and Privacy Policy.
			</Text>

			<View style={styles.footer}>
				<Text style={typography.muted}>Already have an account?</Text>
				<Pressable onPress={() => navigation.navigate('Login')} hitSlop={8}>
					<Text style={[typography.bodyStrong, { color: colors.primaryDark, marginLeft: 6 }]}>
						Sign in
					</Text>
				</Pressable>
			</View>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	roles: { gap: spacing.sm },
	roleCard: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.md,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		backgroundColor: colors.surface,
		marginBottom: spacing.sm,
	},
	roleCardActive: {
		borderColor: colors.primary,
		backgroundColor: '#ECFDF5',
	},
	radio: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: colors.borderStrong,
		marginRight: spacing.md,
		alignItems: 'center',
		justifyContent: 'center',
	},
	radioActive: { borderColor: colors.primary },
	radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: spacing.xxl,
	},
});
