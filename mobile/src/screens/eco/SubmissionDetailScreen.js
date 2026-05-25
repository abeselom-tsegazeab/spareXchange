// Recycling submission detail — shows the verification token + QR.
// The recycler scans this when the user drops off the item.

import React, { useEffect } from 'react';
import { Share, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import Button from '../../components/Button';
import { colors, radius, spacing, typography } from '../../config/theme';
import { itemIcon, itemLabel } from '../../config/ecoCatalog';
import { useSustainabilityStore } from '../../store/sustainabilityStore';

export default function SubmissionDetailScreen({ route, navigation }) {
	const { id } = route.params || {};
	const { submission, loadingDetail, fetchSubmission } = useSustainabilityStore();

	useEffect(() => {
		fetchSubmission(id);
	}, [id, fetchSubmission]);

	if (loadingDetail || !submission) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading submission..." />
			</ScreenContainer>
		);
	}

	const qrPayload = `sparexchange:recycle:${submission.verificationToken}`;

	const onShare = () =>
		Share.share({
			message: `Verify my SpareXChange recycling drop-off with code: ${submission.verificationToken}`,
		});

	const statusBanner = () => {
		switch (submission.status) {
			case 'approved':
				return (
					<Banner
						tone="success"
						title="Approved"
						message={`You earned +${submission.ecoPointsEarned} EcoPoints. The recycler has verified your drop-off.`}
					/>
				);
			case 'completed':
				return (
					<Banner
						tone="info"
						title="Completed"
						message="Your recycling has been processed. Thanks for keeping things circular ♻️"
					/>
				);
			case 'rejected':
				return (
					<Banner
						tone="danger"
						title="Rejected"
						message={submission.notes || 'The recycler could not approve this submission.'}
					/>
				);
			case 'pending':
			default:
				return (
					<Banner
						tone="warning"
						title="Awaiting verification"
						message="Show the QR / 6-digit code below to the recycler at drop-off."
					/>
				);
		}
	};

	return (
		<ScreenContainer scroll>
			{statusBanner()}

			<Card>
				<View style={styles.headRow}>
					<View style={styles.iconBox}>
						<Text style={{ fontSize: 28 }}>{itemIcon(submission.itemType)}</Text>
					</View>
					<View style={{ flex: 1 }}>
						<Text style={typography.h3}>{itemLabel(submission.itemType)}</Text>
						<Text style={typography.caption}>{submission.itemDescription}</Text>
					</View>
				</View>

				<View style={{ marginTop: spacing.lg }}>
					<Spec k="Status" v={submission.status} />
					<Spec k="Reward" v={`+${submission.ecoPointsEarned || 0} EcoPoints`} />
					{submission.estimatedWeight ? <Spec k="Weight" v={`${submission.estimatedWeight} kg`} /> : null}
					{submission.estimatedValue ? <Spec k="Value" v={`ETB ${submission.estimatedValue}`} /> : null}
					<Spec k="Drop-off" v={submission.location} />
					<Spec k="Submitted" v={new Date(submission.createdAt).toLocaleString()} />
				</View>
			</Card>

			{submission.status === 'pending' ? (
				<Card style={{ marginTop: spacing.lg }}>
					<Text style={typography.h4}>Show this to the recycler</Text>
					<View style={styles.qrFrame}>
						<QRCode value={qrPayload} size={200} backgroundColor="#fff" />
					</View>
					<Text style={styles.token}>{submission.verificationToken}</Text>
					<Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.xs }]}>
						Recycler can scan the QR or type the 6-digit code to verify and award your points.
					</Text>
					<View style={{ height: spacing.md }} />
					<Button title="Share code" variant="secondary" onPress={onShare} />
				</Card>
			) : null}

			{submission.notes ? (
				<Card style={{ marginTop: spacing.lg }}>
					<Text style={typography.h4}>Notes</Text>
					<Text style={[typography.body, { marginTop: spacing.xs }]}>{submission.notes}</Text>
				</Card>
			) : null}
		</ScreenContainer>
	);
}

const Spec = ({ k, v }) => (
	<View style={styles.specRow}>
		<Text style={typography.muted}>{k}</Text>
		<Text style={typography.bodyStrong}>{String(v)}</Text>
	</View>
);

const styles = StyleSheet.create({
	headRow: { flexDirection: 'row', alignItems: 'center' },
	iconBox: {
		width: 56,
		height: 56,
		borderRadius: radius.md,
		backgroundColor: colors.surfaceAlt,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
	specRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: spacing.xs,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		marginTop: spacing.xs,
	},
	qrFrame: {
		alignItems: 'center',
		justifyContent: 'center',
		padding: spacing.lg,
		backgroundColor: '#fff',
		borderRadius: radius.md,
		borderWidth: 1,
		borderColor: colors.border,
		marginTop: spacing.md,
	},
	token: {
		fontSize: 32,
		fontWeight: '900',
		letterSpacing: 8,
		textAlign: 'center',
		marginTop: spacing.md,
		color: colors.text,
	},
});
