import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, typography } from '../config/theme';

const PriceTag = ({ price, currency = 'ETB', style, size = 'md' }) => {
	const big = size === 'lg';
	return (
		<View style={[styles.wrap, style]}>
			<Text style={[big ? typography.h2 : typography.h4, { color: colors.text }]}>
				{currency} {Number(price || 0).toLocaleString()}
			</Text>
		</View>
	);
};

const styles = StyleSheet.create({
	wrap: { flexDirection: 'row', alignItems: 'baseline' },
});

export default PriceTag;
