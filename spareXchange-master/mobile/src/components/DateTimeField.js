import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { colors, radius, spacing, typography } from '../config/theme';

const formatDateTime = (d) =>
	d
		? `${d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}  ·  ${d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`
		: 'Select date & time';

export default function DateTimeField({ label, value, onChange, error, minimumDate, helper }) {
	const [mode, setMode] = useState(null); // 'date' | 'time' | null
	const [draft, setDraft] = useState(value || null);

	const open = (m) => setMode(m);

	const handleChange = (event, selected) => {
		if (Platform.OS === 'android') {
			setMode(null);
			if (event.type === 'dismissed') return;
		}
		if (!selected) return;
		const next = new Date(draft || new Date());
		if (mode === 'date') {
			next.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
		} else if (mode === 'time') {
			next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
		} else {
			next.setTime(selected.getTime());
		}
		setDraft(next);
		onChange?.(next);
	};

	return (
		<View style={{ marginBottom: spacing.lg }}>
			{label ? <Text style={styles.label}>{label}</Text> : null}
			<View style={styles.row}>
				<Pressable
					onPress={() => open('date')}
					style={[styles.field, error ? styles.fieldError : null, { flex: 1 }]}
				>
					<Text style={[styles.value, !value && styles.placeholder]}>
						{value
							? value.toLocaleDateString(undefined, {
									year: 'numeric',
									month: 'short',
									day: 'numeric',
								})
							: 'Pick date'}
					</Text>
				</Pressable>
				<View style={{ width: spacing.sm }} />
				<Pressable
					onPress={() => open('time')}
					style={[styles.field, error ? styles.fieldError : null, { flex: 1 }]}
				>
					<Text style={[styles.value, !value && styles.placeholder]}>
						{value
							? value.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
							: 'Pick time'}
					</Text>
				</Pressable>
			</View>
			{value ? (
				<Text style={styles.preview}>Meeting at: {formatDateTime(value)}</Text>
			) : helper ? (
				<Text style={styles.helper}>{helper}</Text>
			) : null}
			{error ? <Text style={styles.error}>{error}</Text> : null}

			{mode ? (
				<DateTimePicker
					value={draft || value || new Date()}
					mode={mode}
					display={Platform.OS === 'ios' ? 'spinner' : 'default'}
					minimumDate={minimumDate}
					onChange={handleChange}
				/>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	label: { ...typography.label, marginBottom: spacing.xs },
	row: { flexDirection: 'row' },
	field: {
		minHeight: 48,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
		paddingHorizontal: spacing.md,
		justifyContent: 'center',
	},
	fieldError: { borderColor: colors.danger },
	value: { ...typography.body, color: colors.text },
	placeholder: { color: colors.textSubtle },
	preview: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
	helper: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
	error: { ...typography.caption, color: colors.danger, marginTop: spacing.xs },
});
