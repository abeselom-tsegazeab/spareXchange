import React, { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import ScreenContainer from '../../components/ScreenContainer';
import ReportRow from '../../components/ReportRow';
import Chip from '../../components/Chip';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { REPORT_STATUSES } from '../../config/operationsCatalog';
import { useAdminStore } from '../../store/adminStore';

export default function ReportsListScreen({ route, navigation }) {
	const initialStatus = route.params?.status || null;
	const { reports, loading, error, reportsPagination, fetchReports, fetchReportStats, reportStats } =
		useAdminStore();
	const [status, setStatus] = useState(initialStatus);

	useFocusEffect(
		useCallback(() => {
			fetchReports({ status: status || undefined, page: 1, limit: 30 });
			fetchReportStats();
		}, [status, fetchReports, fetchReportStats])
	);

	const filters = [{ key: null, label: 'All' }, ...REPORT_STATUSES];

	return (
		<ScreenContainer padded={false}>
			<View style={styles.header}>
				<Text style={typography.h2}>Reports</Text>
				{reportStats ? (
					<Text style={typography.muted}>
						{reportStats.totalReports ?? 0} total · {reportStats.recentReportsLast30Days ?? 0} this month
					</Text>
				) : null}
				{error ? <Banner tone="danger" message={error} style={{ marginTop: spacing.sm }} /> : null}
				<View style={styles.chips}>
					{filters.map((f) => (
						<Chip key={String(f.key)} label={f.label} active={status === f.key} onPress={() => setStatus(f.key)} />
					))}
				</View>
			</View>

			{loading && !reports.length ? (
				<Loader fullscreen label="Loading reports..." />
			) : (
				<FlatList
					data={reports}
					keyExtractor={(item) => item._id}
					contentContainerStyle={styles.list}
					refreshControl={
						<RefreshControl
							refreshing={loading}
							onRefresh={() => fetchReports({ status: status || undefined, page: 1, limit: 30 })}
							tintColor={colors.primary}
						/>
					}
					renderItem={({ item }) => (
						<ReportRow report={item} onPress={() => navigation.navigate('ReportDetail', { id: item._id })} />
					)}
					ListEmptyComponent={<EmptyState title="No reports" message="Nothing matches this filter." />}
					ListFooterComponent={
						reportsPagination?.totalPages > 1 ? (
							<Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.md }]}>
								Page {reportsPagination.page} of {reportsPagination.totalPages}
							</Text>
						) : null
					}
				/>
			)}
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
	chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.md },
	list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.huge },
});
