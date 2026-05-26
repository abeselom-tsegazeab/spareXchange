// Recycler-only screen: scan or type a recycling token to approve the submission.

import React, { useRef, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { colors, radius, spacing, typography } from '../../config/theme';
import { itemIcon, itemLabel } from '../../config/ecoCatalog';
import { useSustainabilityStore } from '../../store/sustainabilityStore';

const parseQrPayload = (data) => {
	if (!data) return null;
	const s = String(data).trim();
	const match = s.match(/sparexchange:recycle:(\d{6})/i);
	if (match) return match[1];
	const digits = s.replace(/\D/g, '');
	if (digits.length === 6) return digits;
	return null;
};

export default function VerifyTokenScreen() {
	const { verifyByToken, submitting } = useSustainabilityStore();
	const [token, setToken] = useState('');
	const [error, setError] = useState(null);
	const [verified, setVerified] = useState(null);
	const [scanOpen, setScanOpen] = useState(false);
	const [permission, requestPermission] = useCameraPermissions();
	const scannedRef = useRef(false);

	const canSubmit = token.replace(/\D/g, '').length === 6;

	const onVerify = async (codeOverride) => {
		setError(null);
		setVerified(null);
		const code = (codeOverride || token).replace(/\D/g, '').slice(0, 6);
		if (code.length !== 6) {
			setError('Enter the 6-digit token from the user.');
			return;
		}
		const res = await verifyByToken({ token: code });
		if (res.success) {
			setVerified(res.submission);
			setToken('');
		} else {
			setError(res.message || 'Invalid token.');
		}
	};

	const openScanner = async () => {
		if (!permission?.granted) {
			const r = await requestPermission();
			if (!r.granted) {
				Alert.alert('Camera permission needed', 'Allow camera access to scan the QR.');
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
		const code = parseQrPayload(data);
		if (!code) {
			setError('That QR code is not a SpareXChange recycling code.');
			return;
		}
		setToken(code);
		onVerify(code);
	};

	return (
		<ScreenContainer scroll keyboard>
			<Text style={typography.h2}>Verify recycling</Text>
			<Text style={[typography.muted, { marginTop: spacing.xs, marginBottom: spacing.lg }]}>
				Scan the user's QR or type the 6-digit code from their submission. Eco-points are awarded as
				soon as the token is accepted.
			</Text>

			{error ? <Banner tone="danger" message={error} /> : null}
			{verified ? (
				<Banner
					tone="success"
					title="Verified ✓"
					message={`Awarded ${verified.ecoPointsEarned || 0} EcoPoints for ${itemLabel(verified.itemType)}.`}
				/>
			) : null}

			<Card>
				<Button title="📷 Scan QR" onPress={openScanner} />
				<View style={{ height: spacing.md }} />
				<Input
					label="…or enter the 6-digit code"
					value={token}
					onChangeText={setToken}
					keyboardType="number-pad"
					maxLength={6}
					placeholder="123456"
				/>
				<Button title="Verify" onPress={() => onVerify()} loading={submitting} disabled={!canSubmit} />
			</Card>

			{verified ? (
				<Card style={{ marginTop: spacing.lg }}>
					<Text style={typography.h4}>Submission detail</Text>
					<View style={styles.row}>
						<Text style={{ fontSize: 24, marginRight: spacing.md }}>{itemIcon(verified.itemType)}</Text>
						<View style={{ flex: 1 }}>
							<Text style={typography.bodyStrong}>{itemLabel(verified.itemType)}</Text>
							<Text style={typography.caption}>{verified.itemDescription}</Text>
						</View>
					</View>
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
							Align the user's QR within the frame
						</Text>
					</View>
				</View>
			</Modal>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.md },

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
	scannerHint: { position: 'absolute', bottom: 64, left: 0, right: 0, paddingHorizontal: spacing.lg },
});
