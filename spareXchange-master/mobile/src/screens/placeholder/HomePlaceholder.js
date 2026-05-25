// Placeholder home tab. Module 2 (Marketplace) will replace this entirely.

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Logo from '../../components/Logo';
import { colors, spacing, typography } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';

export default function HomePlaceholder() {
	const user = useAuthStore((s) => s.user);
	return (
		<ScreenContainer scroll>
			<View style={{ marginBottom: spacing.xl }}>
				<Logo size="md" />
			</View>
			<Text style={[typography.h2, { marginBottom: spacing.xs }]}>
				Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
			</Text>
			<Text style={[typography.muted, { marginBottom: spacing.xl }]}>
				Module 1 (Identity & Security) UI is live. Marketplace, exchanges, recycling, services and
				community features will arrive in Modules 2–10.
			</Text>

			<Card style={{ marginBottom: spacing.lg }}>
				<Text style={typography.h4}>Coming next</Text>
				<Text style={[typography.muted, { marginTop: spacing.xs }]}>
					Module 2 — Marketplace & Inventory: search, advanced fitment filter, listing detail,
					compatibility voting, "My Listings" management.
				</Text>
			</Card>

			<Card style={{ marginBottom: spacing.lg }}>
				<Text style={typography.h4}>Your account</Text>
				<Row k="Email" v={user?.email || '—'} />
				<Row k="Role" v={user?.userType || 'individual'} />
				<Row k="Verified" v={user?.isVerified ? 'Yes' : 'No'} />
				<Row k="EcoPoints" v={user?.ecoPoints ?? 0} />
			</Card>
		</ScreenContainer>
	);
}

const Row = ({ k, v }) => (
	<View style={styles.row}>
		<Text style={typography.muted}>{k}</Text>
		<Text style={typography.bodyStrong}>{String(v)}</Text>
	</View>
);

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingVertical: spacing.sm,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		marginTop: spacing.sm,
	},
});
