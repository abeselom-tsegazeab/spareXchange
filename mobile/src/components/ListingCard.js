import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, spacing, typography } from '../config/theme';
import { categoryLabel, conditionLabel } from '../config/catalog';
import { resolveAssetUrl } from '../config/env';

const ListingCard = ({ listing, onPress, variant = 'grid', style }) => {
	const cover = resolveAssetUrl(listing?.images?.[0]);
	const isHorizontal = variant === 'horizontal';

	return (
		<Pressable
			onPress={() => onPress?.(listing)}
			style={({ pressed }) => [
				isHorizontal ? styles.hCard : styles.card,
				pressed && { opacity: 0.85 },
				shadow.sm,
				style,
			]}
		>
			<View style={isHorizontal ? styles.hImageWrap : styles.imageWrap}>
				{cover ? (
					<Image source={{ uri: cover }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
				) : (
					<View style={[StyleSheet.absoluteFillObject, styles.noImage]}>
						<Text style={{ color: colors.textMuted, fontWeight: '700' }}>No photo</Text>
					</View>
				)}
				{!listing?.available ? (
					<View style={styles.soldBadge}>
						<Text style={styles.soldText}>Unavailable</Text>
					</View>
				) : null}
				{listing?.seller?.verifiedSeller ? (
					<View style={styles.verifiedBadge}>
						<Text style={styles.verifiedText}>✓ Verified</Text>
					</View>
				) : null}
			</View>

			<View style={isHorizontal ? styles.hBody : styles.body}>
				<Text style={styles.title} numberOfLines={2}>
					{listing?.title}
				</Text>
				<Text style={styles.price}>
					ETB {Number(listing?.price || 0).toLocaleString()}
				</Text>
				<View style={styles.metaRow}>
					<Text style={styles.metaText} numberOfLines={1}>
						{categoryLabel(listing?.category)} · {conditionLabel(listing?.condition)}
					</Text>
				</View>
				<Text style={styles.location} numberOfLines={1}>
					📍 {listing?.location || '—'}
				</Text>
			</View>
		</Pressable>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
		marginBottom: spacing.md,
		flex: 1,
	},
	hCard: {
		flexDirection: 'row',
		backgroundColor: colors.surface,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		overflow: 'hidden',
		marginBottom: spacing.md,
	},
	imageWrap: { width: '100%', aspectRatio: 1.2, backgroundColor: colors.surfaceAlt, position: 'relative' },
	hImageWrap: { width: 110, height: 110, backgroundColor: colors.surfaceAlt, position: 'relative' },
	noImage: { alignItems: 'center', justifyContent: 'center' },
	body: { padding: spacing.md },
	hBody: { padding: spacing.md, flex: 1, justifyContent: 'center' },
	title: { ...typography.bodyStrong, marginBottom: 2 },
	price: { ...typography.h4, color: colors.text, marginBottom: spacing.xs },
	metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xxs },
	metaText: { ...typography.caption, color: colors.textMuted },
	location: { ...typography.caption, color: colors.textSubtle },
	soldBadge: {
		position: 'absolute',
		top: spacing.sm,
		left: spacing.sm,
		backgroundColor: 'rgba(17,24,39,0.85)',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: radius.sm,
	},
	soldText: { color: '#fff', fontWeight: '700', fontSize: 11 },
	verifiedBadge: {
		position: 'absolute',
		top: spacing.sm,
		right: spacing.sm,
		backgroundColor: '#D1FAE5',
		paddingHorizontal: 8,
		paddingVertical: 4,
		borderRadius: radius.sm,
	},
	verifiedText: { color: '#065F46', fontWeight: '800', fontSize: 11 },
});

export default ListingCard;
