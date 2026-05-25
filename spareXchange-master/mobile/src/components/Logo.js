import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../config/theme';

const Logo = ({ size = 'md' }) => {
	const isLg = size === 'lg';
	return (
		<View style={styles.wrap}>
			<View style={[styles.mark, isLg && styles.markLg]}>
				<Text style={[styles.markText, isLg && { fontSize: 28 }]}>SX</Text>
			</View>
			<View>
				<Text style={[typography.h3, isLg && { fontSize: 24 }]}>SpareXChange</Text>
				<Text style={typography.caption}>Trade · Repair · Recycle</Text>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
	mark: {
		width: 44,
		height: 44,
		borderRadius: radius.md,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
	markLg: { width: 56, height: 56, borderRadius: radius.lg },
	markText: { color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: -0.5 },
});

export default Logo;
