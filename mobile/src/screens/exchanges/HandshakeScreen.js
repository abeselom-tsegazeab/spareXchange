import React, { useEffect, useRef, useState } from 'react';
import {
	Alert,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { CameraView, useCameraPermissions } from 'expo-camera';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { colors, radius, spacing, typography } from '../../config/theme';
import { useExchangesStore } from '../../store/exchangesStore';
import { useAuthStore } from '../../store/authStore';

const formatCountdown = (ms) => {
	if (ms <= 0) return 'expired';
	const total = Math.floor(ms / 1000);
	const m = Math.floor(total / 60);
	const s = total % 60;
	return `${m}:${String(s).padStart(2, '0')}`;
};

export default function HandshakeScreen({ route, navigation }) {
	const { id } = route.params || {};
	const me = useAuthStore((s) => s.user);
	const {
		exchange,
		fetchExchange,
		generateHandshake,
		regenerateHandshake,
		verifyHandshake,
		submitting,
		getRoleFor,
	} = useExchangesStore();

	const [token, setToken] = useState('');
	const [error, setError] = useState(null);
	const [info, setInfo] = useState(null);
	const [serverToken, setServerToken] = useState(null);
	const [expiresAt, setExpiresAt] = useState(null);
	const [now, setNow] = useState(Date.now());
	const [scanOpen, setScanOpen] = useState(false);
	const [permission, requestPermission] = useCameraPermissions();
	const scannedRef = useRef(false);

	useEffect(() => {
		if (id && (!exchange || exchange._id !== id)) fetchExchange(id);
	}, [id, exchange, fetchExchange]);

	useEffect(() => {
		const i = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(i);
	}, []);

	const { isSeller, isBuyer } = getRoleFor(exchange, me?._id);

	const ms = expiresAt ? new Date(expiresAt).getTime() - now : 0;

	const onGenerate = async (regen = false) => {
		setError(null);
		setInfo(null);
		const res = regen ? await regenerateHandshake(id) : await generateHandshake(id);
		if (res.success) {
			setServerToken(res.token);
			setExpiresAt(res.expiresAt);
			setInfo(`Token valid for 30 minutes. Regen #${res.regenerationCount || 1}.`);
		} else {
			setError(res.message || 'Could not generate token.');
		}
	};

	const onVerify = async (codeOverride) => {
		setError(null);
		setInfo(null);
		const code = (codeOverride || token).replace(/\D/g, '').slice(0, 6);
		if (code.length !== 6) {
			setError('Enter the 6-digit code from the seller.');
			return;
		}
		const res = await verifyHandshake(id, { token: code });
		if (res.success) {
			setInfo('✓ Handshake verified. Exchange completed.');
			setTimeout(() => navigation.goBack(), 1500);
		} else {
			setError(res.message || 'Invalid code.');
		}
	};

	const openScanner = async () => {
		if (!permission?.granted) {
			const res = await requestPermission();
			if (!res.granted) {
				Alert.alert('Permission needed', 'Allow camera access to scan the QR code.');
				return;
			}
		}
		scannedRef.current = false;
		setScanOpen(true);
	};

	const onScan = ({ data }) => {
		if (scannedRef.current) return;
		scannedRef.current = true;
		setScanOpen(false);
		const clean = String(data || '').replace(/\D/g, '').slice(0, 6);
		setToken(clean);
		onVerify(clean);
	};

	return (
		<ScreenContainer scroll>
			<Text style={typography.h2}>Handshake</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
				When you meet in person, the seller shows the QR code and the buyer scans (or types) the
				6-digit token. This completes the exchange securely.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}
			{info ? <Banner tone="success" message={info} /> : null}

			{isSeller ? (
				<Card>
					<Text style={typography.h4}>Show this to the buyer</Text>
					<Text style={[typography.caption, { marginTop: spacing.xs }]}>
						The buyer scans the QR or types the 6-digit code. The code is valid for 30 minutes.
					</Text>

					<View style={styles.qrFrame}>
						{serverToken ? (
							<QRCode value={serverToken} size={200} backgroundColor="#fff" />
						) : (
							<View style={styles.qrPlaceholder}>
								<Text style={typography.muted}>QR appears after generating</Text>
							</View>
						)}
					</View>

					{serverToken ? (
						<>
							<Text style={styles.code}>{serverToken}</Text>
							<Text style={[typography.caption, { textAlign: 'center' }]}>
								Expires in {formatCountdown(ms)}
							</Text>
						</>
					) : null}

					<View style={{ height: spacing.lg }} />
					{!serverToken ? (
						<Button title="Generate handshake token" onPress={() => onGenerate(false)} loading={submitting} />
					) : (
						<Button title="Regenerate token" variant="secondary" onPress={() => onGenerate(true)} loading={submitting} />
					)}
				</Card>
			) : null}

			{isBuyer ? (
				<Card>
					<Text style={typography.h4}>Confirm receipt</Text>
					<Text style={[typography.caption, { marginTop: spacing.xs, marginBottom: spacing.md }]}>
						Scan the seller's QR code or enter the 6-digit token they show you.
					</Text>

					<Button title="📷 Scan QR code" onPress={openScanner} />
					<View style={{ height: spacing.md }} />

					<Input
						label="…or enter token manually"
						value={token}
						onChangeText={setToken}
						keyboardType="number-pad"
						maxLength={6}
						placeholder="123456"
					/>
					<Button
						title="Verify and complete"
						onPress={() => onVerify()}
						loading={submitting}
						disabled={token.replace(/\D/g, '').length !== 6}
					/>
				</Card>
			) : null}

			<Modal visible={scanOpen} animationType="slide" onRequestClose={() => setScanOpen(false)} statusBarTranslucent>
				<View style={styles.scannerWrap}>
					<CameraView
						style={StyleSheet.absoluteFillObject}
						onBarcodeScanned={onScan}
						barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
					/>
					<View pointerEvents="none" style={styles.scanFrame} />
					<Pressable style={styles.scannerClose} onPress={() => setScanOpen(false)} hitSlop={8}>
						<Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>×</Text>
					</Pressable>
					<View style={styles.scannerHint}>
						<Text style={{ color: '#fff', textAlign: 'center' }}>
							Align the seller's QR within the frame
						</Text>
					</View>
				</View>
			</Modal>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	qrFrame: {
		marginTop: spacing.lg,
		alignItems: 'center',
		justifyContent: 'center',
		padding: spacing.lg,
		backgroundColor: '#fff',
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
	},
	qrPlaceholder: {
		width: 200,
		height: 200,
		backgroundColor: colors.surfaceAlt,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
	},
	code: {
		fontSize: 32,
		fontWeight: '900',
		letterSpacing: 8,
		textAlign: 'center',
		marginTop: spacing.lg,
		color: colors.text,
	},

	scannerWrap: { flex: 1, backgroundColor: '#000' },
	scanFrame: {
		position: 'absolute',
		top: '30%',
		left: '15%',
		width: '70%',
		aspectRatio: 1,
		borderWidth: 3,
		borderColor: '#fff',
		borderRadius: 16,
	},
	scannerClose: {
		position: 'absolute',
		top: 48,
		right: 24,
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: 'rgba(0,0,0,0.55)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	scannerHint: {
		position: 'absolute',
		bottom: 64,
		left: 0,
		right: 0,
		paddingHorizontal: spacing.lg,
	},
});
