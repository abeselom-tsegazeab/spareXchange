// Picker / discovery sheet for verified meeting locations.

import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import BottomSheet from '../../components/BottomSheet';
import Loader from '../../components/Loader';
import { colors, radius, spacing, typography } from '../../config/theme';
import { useExchangesStore } from '../../store/exchangesStore';

const TYPE_ICON = {
	police: '👮',
	garage: '🛠',
	public: '🏛',
};

export default function SafeZonesSheet({ visible, onClose, onSelect, mode = 'select' }) {
	const safeZones = useExchangesStore((s) => s.safeZones);
	const fetchSafeZones = useExchangesStore((s) => s.fetchSafeZones);

	useEffect(() => {
		if (visible && (!safeZones || safeZones.length === 0)) {
			fetchSafeZones();
		}
	}, [visible, safeZones, fetchSafeZones]);

	return (
		<BottomSheet
			visible={visible}
			onClose={onClose}
			title={mode === 'select' ? 'Pick a safe zone' : 'Verified safe zones'}
		>
			<Text style={[typography.caption, { marginBottom: spacing.md }]}>
				Verified meeting points reduce exchange risk. Pick the closest one to keep both parties safe.
			</Text>
			{!safeZones?.length ? (
				<Loader />
			) : (
				safeZones.map((z) => (
					<Pressable
						key={z.id}
						onPress={() => onSelect?.(z)}
						style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
					>
						<View style={styles.icon}>
							<Text style={{ fontSize: 20 }}>{TYPE_ICON[z.type] || '📍'}</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={typography.bodyStrong}>{z.name}</Text>
							<Text style={typography.caption}>{z.address}</Text>
						</View>
						{mode === 'select' ? (
							<Text style={{ color: colors.primaryDark, fontWeight: '900', fontSize: 18 }}>›</Text>
						) : null}
					</Pressable>
				))
			)}
		</BottomSheet>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: spacing.md,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.md,
		backgroundColor: colors.surface,
		marginBottom: spacing.sm,
	},
	icon: {
		width: 40,
		height: 40,
		borderRadius: radius.md,
		backgroundColor: colors.surfaceAlt,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
});
