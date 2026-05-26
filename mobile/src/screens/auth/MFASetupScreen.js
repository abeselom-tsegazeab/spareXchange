// Step 1: triggered from Profile -> Enable 2FA.
// Step 2 will call /auth/mfa/setup, then we render the returned QR + secret + backup codes.

import React, { useEffect, useState } from 'react';
import {
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Banner from '../../components/Banner';
import Loader from '../../components/Loader';
import { colors, radius, spacing, typography } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';

export default function MFASetupScreen({ navigation }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [payload, setPayload] = useState(null);
	const setupMFA = useAuthStore((s) => s.setupMFA);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const res = await setupMFA();
				if (res.success) {
					setPayload({
						qrCodeUrl: res.qrCodeUrl,
						secret: res.secret,
						backupCodes: res.backupCodes,
					});
				} else {
					setError(res.message || 'Could not start MFA setup.');
				}
			} catch (e) {
				setError(e?.message || 'Could not start MFA setup.');
			} finally {
				setLoading(false);
			}
		})();
	}, [setupMFA]);

	if (loading) return <Loader fullscreen label="Generating QR code..." />;

	return (
		<ScreenContainer scroll>
			<Text style={typography.h2}>Enable two-factor authentication</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
				Add an extra layer of security to your account. You'll need an authenticator app such as
				Google Authenticator, Authy or 1Password.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}

			<Card>
				<Text style={typography.h4}>Step 1 — Scan the QR code</Text>
				<View style={styles.qrFrame}>
					{payload?.qrCodeUrl ? (
						<Image source={{ uri: payload.qrCodeUrl }} style={styles.qr} resizeMode="contain" />
					) : (
						<View style={[styles.qr, styles.qrPlaceholder]}>
							<Text style={[typography.caption, { textAlign: 'center', paddingHorizontal: spacing.md }]}>
								QR code preview unavailable in this stub.{'\n'}
								The real QR will render here in Step 2.
							</Text>
						</View>
					)}
				</View>
			</Card>

			<Card style={{ marginTop: spacing.lg }}>
				<Text style={typography.h4}>Step 2 — Or enter this secret manually</Text>
				<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.sm }]}>
					Open your authenticator app, choose "Enter setup key", and use this secret:
				</Text>
				<View style={styles.secretBox}>
					<Text selectable style={styles.secretText}>{payload?.secret}</Text>
				</View>
			</Card>

			<Card style={{ marginTop: spacing.lg }}>
				<Text style={typography.h4}>Step 3 — Save your backup codes</Text>
				<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.sm }]}>
					Each code can be used once if you lose access to your authenticator app. Store them
					somewhere safe.
				</Text>
				<ScrollView style={styles.codesBox}>
					{(payload?.backupCodes || []).map((c) => (
						<Text key={c} selectable style={styles.codeText}>
							{c}
						</Text>
					))}
				</ScrollView>
			</Card>

			<Button
				title="I have the code — Verify"
				onPress={() => navigation.navigate('MFAVerify')}
				size="lg"
				style={{ marginTop: spacing.xxl }}
			/>
			<Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ alignItems: 'center', marginTop: spacing.lg }}>
				<Text style={[typography.bodyStrong, { color: colors.primaryDark }]}>Cancel</Text>
			</Pressable>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	qrFrame: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: spacing.md,
		padding: spacing.lg,
		backgroundColor: '#F3F4F6',
		borderRadius: radius.md,
	},
	qr: { width: 200, height: 200, borderRadius: 8, backgroundColor: '#fff' },
	qrPlaceholder: { alignItems: 'center', justifyContent: 'center' },
	secretBox: {
		padding: spacing.md,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		backgroundColor: colors.surfaceAlt,
	},
	secretText: { fontSize: 18, letterSpacing: 2, fontWeight: '700', color: colors.text },
	codesBox: {
		maxHeight: 160,
		padding: spacing.md,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		backgroundColor: colors.surfaceAlt,
	},
	codeText: { fontSize: 16, letterSpacing: 2, fontWeight: '600', color: colors.text, paddingVertical: 4 },
});
