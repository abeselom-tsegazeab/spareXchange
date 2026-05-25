import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Card from './Card';
import { colors, spacing, typography } from '../config/theme';

export default function AnalyticsSection({ title, children }) {
	return (
		<Card style={styles.section}>
			<Text style={typography.h4}>{title}</Text>
			<View style={{ marginTop: spacing.sm }}>{children}</View>
		</Card>
	);
}

export const KV = ({ label, value }) => (
	<View style={styles.kv}>
		<Text style={typography.muted}>{label}</Text>
		<Text style={typography.bodyStrong}>{String(value ?? '—')}</Text>
	</View>
);

export const AggList = ({ items, labelKey = '_id', valueKey = 'count' }) => {
	if (!items?.length) return <Text style={typography.muted}>No data</Text>;
	return items.map((item, i) => (
		<KV key={String(item[labelKey] ?? i)} label={String(item[labelKey] ?? 'Unknown')} value={item[valueKey]} />
	));
};

const styles = StyleSheet.create({
	section: { marginBottom: spacing.lg },
	kv: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: spacing.xs,
		borderTopWidth: 1,
		borderTopColor: colors.border,
	},
});
