// Simple bottom-sheet built on React Native's Modal — no extra deps.

import React from 'react';
import {
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../config/theme';

const BottomSheet = ({ visible, onClose, title, children, footer, maxHeightPct = 0.85 }) => {
	return (
		<Modal
			visible={visible}
			animationType="slide"
			transparent
			onRequestClose={onClose}
			statusBarTranslucent
		>
			<View style={styles.backdrop}>
				<Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
				<View style={[styles.sheet, { maxHeight: `${Math.round(maxHeightPct * 100)}%` }]}>
					<View style={styles.handle} />
					{title ? (
						<View style={styles.header}>
							<Text style={typography.h3}>{title}</Text>
							<Pressable onPress={onClose} hitSlop={10}>
								<Text style={styles.close}>×</Text>
							</Pressable>
						</View>
					) : null}
					<View style={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }}>{children}</View>
					{footer ? <View style={styles.footer}>{footer}</View> : null}
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: colors.overlay,
		justifyContent: 'flex-end',
	},
	sheet: {
		backgroundColor: colors.surface,
		borderTopLeftRadius: radius.xl,
		borderTopRightRadius: radius.xl,
		paddingTop: spacing.md,
	},
	handle: {
		alignSelf: 'center',
		width: 44,
		height: 4,
		borderRadius: 2,
		backgroundColor: colors.borderStrong,
		marginBottom: spacing.md,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: spacing.lg,
		paddingBottom: spacing.md,
		borderBottomWidth: 1,
		borderBottomColor: colors.border,
		marginBottom: spacing.md,
	},
	close: { fontSize: 28, lineHeight: 28, color: colors.textMuted, fontWeight: '300' },
	footer: {
		borderTopWidth: 1,
		borderTopColor: colors.border,
		padding: spacing.lg,
	},
});

export default BottomSheet;
