import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../config/theme';
import { passwordStrength } from '../utils/validators';

const items = [
	{ key: 'length', label: '8+ characters' },
	{ key: 'lower', label: 'Lowercase letter (a-z)' },
	{ key: 'upper', label: 'Uppercase letter (A-Z)' },
	{ key: 'number', label: 'Number (0-9)' },
	{ key: 'special', label: 'Special character (@$!%*?&)' },
];

const PasswordChecklist = ({ password }) => {
	const s = passwordStrength(password);
	return (
		<View style={styles.wrap}>
			{items.map((it) => {
				const ok = s[it.key];
				return (
					<View key={it.key} style={styles.row}>
						<View style={[styles.dot, { backgroundColor: ok ? colors.success : colors.borderStrong }]}>
							<Text style={styles.tick}>{ok ? '✓' : ''}</Text>
						</View>
						<Text style={[styles.text, ok && { color: colors.text }]}>{it.label}</Text>
					</View>
				);
			})}
		</View>
	);
};

const styles = StyleSheet.create({
	wrap: { marginBottom: spacing.lg },
	row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
	dot: {
		width: 18,
		height: 18,
		borderRadius: 9,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.sm,
	},
	tick: { color: '#fff', fontSize: 11, fontWeight: '900' },
	text: { ...typography.caption, color: colors.textMuted },
});

export default PasswordChecklist;
