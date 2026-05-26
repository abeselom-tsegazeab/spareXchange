import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import Chip from '../../components/Chip';
import Loader from '../../components/Loader';
import { colors, spacing, typography } from '../../config/theme';
import { MODERATOR_ACTIONS, REPORT_STATUSES, reportReasonLabel, reportStatusLabel } from '../../config/operationsCatalog';
import { useAdminStore } from '../../store/adminStore';

export default function ReportDetailScreen({ route, navigation }) {
	const { id } = route.params || {};
	const { report, loadingDetail, submitting, error, fetchReport, updateReport, deleteReport } = useAdminStore();

	const [status, setStatus] = useState('resolved');
	const [moderatorNote, setModeratorNote] = useState('');
	const [action, setAction] = useState(null);
	const [info, setInfo] = useState(null);

	useEffect(() => {
		fetchReport(id);
	}, [id, fetchReport]);

	useEffect(() => {
		if (report) {
			setStatus(report.status || 'pending');
			setModeratorNote(report.moderatorNote || '');
		}
	}, [report]);

	if (loadingDetail || !report) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading report..." />
			</ScreenContainer>
		);
	}

	const onSave = async () => {
		setInfo(null);
		const res = await updateReport(id, {
			status,
			moderatorNote: moderatorNote.trim(),
			action: action || undefined,
		});
		if (res.success) setInfo('Report updated.');
		else Alert.alert('Error', res.message);
	};

	const onDelete = () => {
		Alert.alert('Delete report?', 'This cannot be undone.', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					const res = await deleteReport(id);
					if (res.success) navigation.goBack();
					else Alert.alert('Error', res.message);
				},
			},
		]);
	};

	return (
		<ScreenContainer scroll keyboard>
			{info ? <Banner tone="success" message={info} /> : null}
			{error ? <Banner tone="danger" message={error} /> : null}

			<Card>
				<Text style={typography.h4}>{report.targetModel} report</Text>
				<KV k="Status" v={reportStatusLabel(report.status)} />
				<KV k="Reason" v={reportReasonLabel(report.reason)} />
				<KV k="Reporter" v={report.reporter?.name || report.reporter?.email || '—'} />
				<KV k="Filed" v={new Date(report.createdAt).toLocaleString()} />
				{report.details ? (
					<Text style={[typography.body, { marginTop: spacing.sm }]}>{report.details}</Text>
				) : null}
			</Card>

			<Card style={{ marginTop: spacing.lg }}>
				<Text style={typography.h4}>Moderation</Text>
				<Text style={[typography.label, { marginTop: spacing.md, marginBottom: spacing.sm }]}>New status</Text>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{REPORT_STATUSES.map((s) => (
						<Chip key={s.key} label={s.label} active={status === s.key} onPress={() => setStatus(s.key)} />
					))}
				</ScrollView>

				<Text style={[typography.label, { marginTop: spacing.md, marginBottom: spacing.sm }]}>Action</Text>
				<ScrollView horizontal showsHorizontalScrollIndicator={false}>
					{MODERATOR_ACTIONS.map((a) => (
						<Chip key={String(a.key)} label={a.label} active={action === a.key} onPress={() => setAction(a.key)} />
					))}
				</ScrollView>

				<Input
					label="Moderator note"
					value={moderatorNote}
					onChangeText={setModeratorNote}
					placeholder="Explain the decision for audit trail"
					multiline
					numberOfLines={3}
				/>

				<Button title="Save decision" onPress={onSave} loading={submitting} size="lg" />
				<View style={{ height: spacing.sm }} />
				<Button title="Delete report" variant="danger" onPress={onDelete} loading={submitting} />
			</Card>
		</ScreenContainer>
	);
}

const KV = ({ k, v }) => (
	<View style={styles.kv}>
		<Text style={typography.muted}>{k}</Text>
		<Text style={typography.bodyStrong}>{String(v)}</Text>
	</View>
);

const styles = StyleSheet.create({
	kv: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: spacing.xs,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		marginTop: spacing.xs,
	},
});
