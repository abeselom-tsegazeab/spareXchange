import React, { useEffect, useRef, useState } from 'react';
import {
	Pressable,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { colors, radius, spacing, typography } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';

const CODE_LEN = 6;

export default function VerifyEmailScreen({ route, navigation }) {
	const email = route?.params?.email;
	const [digits, setDigits] = useState(Array(CODE_LEN).fill(''));
	const [error, setError] = useState(null);
	const [info, setInfo] = useState(null);
	const [cooldown, setCooldown] = useState(0);
	const refs = useRef([]);

	const submitting = useAuthStore((s) => s.isSubmitting);
	const verifyEmail = useAuthStore((s) => s.verifyEmail);
	const resendVerification = useAuthStore((s) => s.resendVerification);

	const code = digits.join('');
	const canSubmit = code.length === CODE_LEN;

	useEffect(() => {
		if (cooldown <= 0) return undefined;
		const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
		return () => clearTimeout(t);
	}, [cooldown]);

	const setDigit = (i, val) => {
		const v = (val || '').replace(/\D/g, '').slice(-1);
		setDigits((prev) => {
			const next = [...prev];
			next[i] = v;
			return next;
		});
		if (v && i < CODE_LEN - 1) refs.current[i + 1]?.focus();
	};

	const onBackspace = (i) => {
		if (digits[i]) return;
		if (i > 0) {
			refs.current[i - 1]?.focus();
			setDigits((prev) => {
				const n = [...prev];
				n[i - 1] = '';
				return n;
			});
		}
	};

	const onPaste = (text) => {
		const cleaned = (text || '').replace(/\D/g, '').slice(0, CODE_LEN);
		const next = Array(CODE_LEN).fill('');
		for (let i = 0; i < cleaned.length; i++) next[i] = cleaned[i];
		setDigits(next);
		const focusIdx = Math.min(cleaned.length, CODE_LEN - 1);
		refs.current[focusIdx]?.focus();
	};

	const onSubmit = async () => {
		setError(null);
		setInfo(null);
		if (!canSubmit) return;
		const res = await verifyEmail({ code });
		if (!res.success) setError(res.message || 'Invalid or expired code');
	};

	const onResend = async () => {
		if (cooldown > 0) return;
		setError(null);
		const res = await resendVerification();
		if (res.success) {
			setInfo('A fresh 6-digit code is on its way to your inbox.');
			setCooldown(45);
		} else {
			setError(res.message || 'Could not resend code');
		}
	};

	return (
		<ScreenContainer scroll keyboard>
			<Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ marginBottom: spacing.lg }}>
				<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>‹ Back</Text>
			</Pressable>

			<Text style={typography.h1}>Verify your email</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.xl }]}>
				We sent a 6-digit verification code to{' '}
				<Text style={typography.bodyStrong}>{email || 'your inbox'}</Text>. Enter it below to
				activate your account.
			</Text>

			{error ? <Banner tone="danger" title="Verification failed" message={error} /> : null}
			{info ? <Banner tone="success" message={info} /> : null}

			<View style={styles.codeRow}>
				{digits.map((d, i) => (
					<TextInput
						key={i}
						ref={(r) => (refs.current[i] = r)}
						value={d}
						onChangeText={(t) => (t.length > 1 ? onPaste(t) : setDigit(i, t))}
						onKeyPress={({ nativeEvent }) => {
							if (nativeEvent.key === 'Backspace') onBackspace(i);
						}}
						keyboardType="number-pad"
						maxLength={1}
						style={[styles.digit, d && styles.digitFilled]}
						selectTextOnFocus
					/>
				))}
			</View>

			<Button
				title="Verify email"
				onPress={onSubmit}
				disabled={!canSubmit}
				loading={submitting}
				size="lg"
			/>

			<View style={styles.footer}>
				<Text style={typography.muted}>Didn't get it?</Text>
				<Pressable onPress={onResend} disabled={cooldown > 0} hitSlop={8}>
					<Text
						style={[
							typography.bodyStrong,
							{
								marginLeft: 6,
								color: cooldown > 0 ? colors.textSubtle : colors.primaryDark,
							},
						]}
					>
						{cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
					</Text>
				</Pressable>
			</View>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	codeRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginBottom: spacing.xl,
	},
	digit: {
		width: 48,
		height: 56,
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
		textAlign: 'center',
		fontSize: 24,
		fontWeight: '700',
		color: colors.text,
	},
	digitFilled: { borderColor: colors.primary, backgroundColor: '#ECFDF5' },
	footer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: spacing.xxl,
	},
});
