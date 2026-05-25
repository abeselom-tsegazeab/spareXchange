import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../config/theme';
import { reportReasonLabel, reportStatusLabel } from '../config/operationsCatalog';

const statusColor = {
	pending: '#92400E',
	reviewed: '#3730A3',
	resolved: '#065F46',
	dismissed: '#6B7280',
};

export default function ReportRow({ report, onPress }) {
	return (
		<Pressable
			onPress={onPress}
			style={({ pressed }) => [styles.row, pressed && { opacity: 0.9 }]}
		>
			<View style={styles.head}>
				<Text style={typography.bodyStrong}>{report.targetModel} report</Text>
				<Text style={[styles.status, { color: statusColor[report.status] || colors.textMuted }]}>
					{reportStatusLabel(report.status)}
				</Text>
			</View>
			<Text style={typography.caption}>
				{reportReasonLabel(report.reason)} · {report.reporter?.name || 'Reporter'}
			</Text>
			{report.details ? (
				<Text style={[typography.caption, { marginTop: 4 }]} numberOfLines={2}>
					{report.details}
				</Text>
			) : null}
			<Text style={[typography.caption, { marginTop: 4 }]}>
				{new Date(report.createdAt).toLocaleString()}
			</Text>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	row: {
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		padding: spacing.md,
		marginBottom: spacing.sm,
	},
	head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
	status: { ...typography.caption, fontWeight: '800' },
});
