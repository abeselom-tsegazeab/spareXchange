import { useTheme } from '../context/ThemeContext';

/** Native stack defaults aligned with frontend / shadcn header weight (500). */
export function useStackScreenDefaults() {
	const { colors } = useTheme();
	return {
		headerStyle: { backgroundColor: colors.surface },
		headerTitleStyle: {
			color: colors.text,
			fontWeight: '500',
			fontSize: 17,
		},
		headerTintColor: colors.primary,
	};
}
