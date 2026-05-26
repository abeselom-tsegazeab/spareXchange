import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, spacing, typography } from '../config/theme';

const SearchBar = ({
	value,
	onChangeText,
	placeholder = 'Search parts, brands, models...',
	onFilterPress,
	filterActive = false,
	autoFocus = false,
}) => {
	return (
		<View style={styles.row}>
			<View style={styles.fieldWrap}>
				<Text style={styles.searchIcon}>⌕</Text>
				<TextInput
					value={value}
					onChangeText={onChangeText}
					placeholder={placeholder}
					placeholderTextColor={colors.textSubtle}
					style={styles.input}
					returnKeyType="search"
					autoCapitalize="none"
					autoCorrect={false}
					autoFocus={autoFocus}
				/>
				{value ? (
					<Pressable onPress={() => onChangeText?.('')} hitSlop={8}>
						<Text style={styles.clear}>×</Text>
					</Pressable>
				) : null}
			</View>
			{onFilterPress ? (
				<Pressable
					onPress={onFilterPress}
					style={[styles.filterBtn, filterActive && styles.filterBtnActive]}
				>
					<Text style={[styles.filterIcon, filterActive && { color: colors.textInverse }]}>≡</Text>
				</Pressable>
			) : null}
		</View>
	);
};

const styles = StyleSheet.create({
	row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
	fieldWrap: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		paddingHorizontal: spacing.md,
		height: 46,
	},
	searchIcon: {
		fontSize: 20,
		color: colors.textMuted,
		marginRight: spacing.sm,
		fontWeight: '900',
	},
	input: { flex: 1, ...typography.body, paddingVertical: 0 },
	clear: { color: colors.textMuted, fontSize: 22, fontWeight: '300', paddingHorizontal: 4 },
	filterBtn: {
		width: 46,
		height: 46,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
		alignItems: 'center',
		justifyContent: 'center',
	},
	filterBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
	filterIcon: { fontSize: 22, fontWeight: '900', color: colors.text },
});

export default SearchBar;
