import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { colors, radius, spacing, typography } from '../../config/theme';
import { resolveAssetUrl } from '../../config/env';
import { useAuthStore } from '../../store/authStore';

const ROLE_LABELS = {
	individual: 'Individual',
	'repair-shop': 'Repair Shop',
	garage: 'Garage',
	recycler: 'Recycler',
	technician: 'Technician',
	admin: 'Admin',
};

const ecoTier = (points = 0) => {
	if (points <= 100) return { label: 'Seed', color: '#22C55E' };
	if (points <= 500) return { label: 'Sprout', color: '#16A34A' };
	if (points <= 1500) return { label: 'Sapling', color: '#0EA5E9' };
	if (points <= 5000) return { label: 'Oak', color: '#A16207' };
	return { label: 'Gaia', color: '#9333EA' };
};

export default function ProfileScreen({ navigation }) {
	const user = useAuthStore((s) => s.user);
	const logout = useAuthStore((s) => s.logout);
	const tier = ecoTier(user?.ecoPoints || 0);

	const initials = (user?.name || 'U')
		.split(' ')
		.map((s) => s[0])
		.slice(0, 2)
		.join('')
		.toUpperCase();

	return (
		<ScreenContainer scroll>
			<Card>
				<View style={styles.headerRow}>
					{user?.profilePicture ? (
						<Image source={{ uri: resolveAssetUrl(user.profilePicture) }} style={styles.avatar} />
					) : (
						<View style={[styles.avatar, styles.avatarFallback]}>
							<Text style={styles.avatarText}>{initials}</Text>
						</View>
					)}
					<View style={{ flex: 1 }}>
						<Text style={typography.h3}>{user?.name || 'Guest'}</Text>
						<Text style={typography.muted}>{user?.email}</Text>
						<View style={styles.badges}>
							<View style={styles.pill}>
								<Text style={styles.pillText}>{ROLE_LABELS[user?.userType] || 'Individual'}</Text>
							</View>
							<View
								style={[
									styles.pill,
									{
										backgroundColor: user?.isVerified ? '#D1FAE5' : '#FEF3C7',
									},
								]}
							>
								<Text
									style={[
										styles.pillText,
										{ color: user?.isVerified ? '#065F46' : '#92400E' },
									]}
								>
									{user?.isVerified ? '✓ Verified' : '! Email unverified'}
								</Text>
							</View>
						</View>
					</View>
				</View>

				<View style={styles.statsRow}>
					<Stat label="EcoPoints" value={user?.ecoPoints ?? 0} />
					<Stat label="Tier" value={tier.label} valueColor={tier.color} />
					<Stat label="Trust" value={user?.trustScore ?? 80} suffix="/100" />
				</View>
			</Card>

			<View style={{ height: spacing.lg }} />

			<Card padding={0}>
				<Row label="Edit profile" onPress={() => navigation.navigate('EditProfile')} />
				<Divider />
				<Row
					label="Saved searches"
					onPress={() => navigation.getParent()?.navigate('Marketplace', { screen: 'SavedSearches' })}
				/>
				<Divider />
				<Row label="Apply for a verified role" onPress={() => navigation.navigate('RequestRole')} />
				<Divider />
				<Row label="Enable two-factor authentication" onPress={() => navigation.navigate('MFASetup')} />
			</Card>

			<View style={{ height: spacing.lg }} />

			<Button title="Sign out" variant="secondary" onPress={logout} size="lg" />
		</ScreenContainer>
	);
}

const Stat = ({ label, value, suffix, valueColor }) => (
	<View style={styles.stat}>
		<Text style={[typography.h3, valueColor ? { color: valueColor } : null]}>
			{value}
			{suffix ? <Text style={typography.muted}>{suffix}</Text> : null}
		</Text>
		<Text style={typography.caption}>{label}</Text>
	</View>
);

const Row = ({ label, onPress }) => (
	<Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}>
		<Text style={typography.bodyStrong}>{label}</Text>
		<Text style={{ color: colors.textMuted, fontSize: 22, lineHeight: 22 }}>›</Text>
	</Pressable>
);

const Divider = () => <View style={{ height: 1, backgroundColor: colors.border, marginHorizontal: spacing.lg }} />;

const styles = StyleSheet.create({
	headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surfaceAlt },
	avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
	avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
	badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
	pill: {
		paddingHorizontal: spacing.sm,
		paddingVertical: 4,
		borderRadius: radius.pill,
		backgroundColor: '#E0E7FF',
		marginRight: spacing.xs,
		marginBottom: spacing.xs,
	},
	pillText: { fontSize: 11, fontWeight: '700', color: '#3730A3' },
	statsRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: spacing.lg,
		paddingTop: spacing.lg,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
	stat: { alignItems: 'center', flex: 1 },
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: spacing.lg,
		paddingVertical: spacing.lg,
	},
});
