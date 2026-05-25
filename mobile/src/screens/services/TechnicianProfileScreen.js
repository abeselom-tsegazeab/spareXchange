import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';
import { colors, radius, spacing, typography } from '../../config/theme';
import { resolveAssetUrl } from '../../config/env';
import { useServicesStore } from '../../store/servicesStore';

export default function TechnicianProfileScreen({ route, navigation }) {
	const { id } = route.params || {};
	const { technician, loadingDetail, fetchTechnician } = useServicesStore();

	useEffect(() => {
		fetchTechnician(id);
	}, [id, fetchTechnician]);

	if (loadingDetail || !technician) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading technician..." />
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer scroll>
			<Card>
				<View style={styles.headRow}>
					{technician.profilePicture ? (
						<Image source={{ uri: resolveAssetUrl(technician.profilePicture) }} style={styles.avatar} />
					) : (
						<View style={[styles.avatar, styles.avatarFallback]}>
							<Text style={styles.avatarText}>
								{(technician.name || '?').charAt(0).toUpperCase()}
							</Text>
						</View>
					)}
					<View style={{ flex: 1 }}>
						<Text style={typography.h3}>{technician.name}</Text>
						<Text style={typography.muted}>{technician.expertise || 'Service technician'}</Text>
						{technician.location ? <Text style={typography.caption}>📍 {technician.location}</Text> : null}
					</View>
				</View>

				<View style={styles.statsRow}>
					<Stat label="Trust" value={`${technician.trustScore || 80}/100`} />
					<View style={styles.divider} />
					<Stat label="Reviews" value={technician.totalReviews || 0} />
					<View style={styles.divider} />
					<Stat label="EcoPoints" value={technician.ecoPoints || 0} />
				</View>
			</Card>

			<Card style={{ marginTop: spacing.lg }}>
				<Text style={typography.h4}>About</Text>
				<Text style={[typography.body, { marginTop: spacing.xs }]}>
					{technician.expertise
						? `Specialised in ${technician.expertise.toLowerCase()}.`
						: 'Verified SpareXChange technician.'}
				</Text>
				{technician.phone ? <KV k="Phone" v={technician.phone} /> : null}
			</Card>

			<View style={{ height: spacing.lg }} />
			<Button
				title="Post a request"
				onPress={() => navigation.navigate('CreateRequest')}
				size="lg"
			/>
			<View style={{ height: spacing.sm }} />
			<Button
				title="View public profile"
				variant="outline"
				onPress={() =>
					navigation.getParent()?.navigate('Community', {
						screen: 'PublicProfile',
						params: { userId: id, userName: technician.name },
					})
				}
				size="lg"
			/>
			<View style={{ height: spacing.sm }} />
			<Button
				title="Message technician"
				variant="secondary"
				onPress={() =>
					navigation.navigate('Communication', {
						screen: 'Chat',
						params: { userId: id, userName: technician.name },
					})
				}
				size="lg"
			/>
		</ScreenContainer>
	);
}

const Stat = ({ label, value }) => (
	<View style={{ flex: 1, alignItems: 'center' }}>
		<Text style={typography.h3}>{value}</Text>
		<Text style={typography.caption}>{label}</Text>
	</View>
);

const KV = ({ k, v }) => (
	<View style={styles.kv}>
		<Text style={typography.muted}>{k}</Text>
		<Text style={typography.bodyStrong}>{String(v)}</Text>
	</View>
);

const styles = StyleSheet.create({
	headRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	avatar: { width: 72, height: 72, borderRadius: 36 },
	avatarFallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
	avatarText: { color: '#fff', fontWeight: '900', fontSize: 28 },
	statsRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: spacing.lg,
		paddingTop: spacing.md,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	divider: { width: 1, height: 32, backgroundColor: colors.border },
	kv: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: spacing.xs,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		marginTop: spacing.xs,
	},
});
