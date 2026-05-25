import React, { useEffect, useState } from 'react';
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import SearchBar from '../../components/SearchBar';
import EmptyState from '../../components/EmptyState';
import { colors, radius, shadow, spacing, typography } from '../../config/theme';
import { resolveAssetUrl } from '../../config/env';
import { useServicesStore } from '../../store/servicesStore';

export default function TechniciansDirectoryScreen({ navigation }) {
	const { technicians, loading, fetchTechnicians } = useServicesStore();
	const [search, setSearch] = useState('');

	useEffect(() => {
		fetchTechnicians();
	}, [fetchTechnicians]);

	useEffect(() => {
		const t = setTimeout(() => fetchTechnicians(search), 300);
		return () => clearTimeout(t);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [search]);

	const renderItem = ({ item }) => (
		<Pressable
			onPress={() => navigation.navigate('TechnicianProfile', { id: item._id })}
			style={({ pressed }) => [styles.card, shadow.sm, pressed && { opacity: 0.85 }]}
		>
			{item.profilePicture ? (
				<Image source={{ uri: resolveAssetUrl(item.profilePicture) }} style={styles.avatar} />
			) : (
				<View style={[styles.avatar, styles.avatarFallback]}>
					<Text style={styles.avatarText}>{(item.name || '?').charAt(0).toUpperCase()}</Text>
				</View>
			)}
			<View style={{ flex: 1 }}>
				<Text style={typography.bodyStrong}>{item.name}</Text>
				<Text style={typography.caption} numberOfLines={2}>
					{item.expertise || 'Service technician'}
				</Text>
				{item.location ? <Text style={typography.caption}>📍 {item.location}</Text> : null}
				<View style={styles.pillsRow}>
					<View style={[styles.pill, { backgroundColor: '#D1FAE5' }]}>
						<Text style={[styles.pillText, { color: '#065F46' }]}>Trust {item.trustScore || 80}/100</Text>
					</View>
					{item.totalReviews ? (
						<View style={[styles.pill, { backgroundColor: '#E0E7FF' }]}>
							<Text style={[styles.pillText, { color: '#3730A3' }]}>{item.totalReviews} reviews</Text>
						</View>
					) : null}
				</View>
			</View>
			<Text style={{ fontSize: 22, color: colors.textMuted, fontWeight: '900' }}>›</Text>
		</Pressable>
	);

	return (
		<ScreenContainer padded={false}>
			<View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
				<Text style={typography.h2}>Find a pro</Text>
				<Text style={typography.muted}>Verified technicians ready to help.</Text>
				<View style={{ marginTop: spacing.md, marginBottom: spacing.md }}>
					<SearchBar
						value={search}
						onChangeText={setSearch}
						placeholder="Search expertise, name, location..."
					/>
				</View>
			</View>

			<FlatList
				data={technicians}
				keyExtractor={(item) => item._id}
				renderItem={renderItem}
				contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.huge }}
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={() => fetchTechnicians(search)} tintColor={colors.primary} colors={[colors.primary]} />
				}
				ListEmptyComponent={<EmptyState icon="👷" title="No technicians" message="Try a different search." />}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		padding: spacing.md,
		borderRadius: radius.lg,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
		marginBottom: spacing.md,
	},
	avatar: { width: 56, height: 56, borderRadius: 28 },
	avatarFallback: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
	avatarText: { color: '#fff', fontWeight: '900', fontSize: 22 },
	pillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
	pill: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radius.pill, marginRight: spacing.xs, marginTop: spacing.xs },
	pillText: { ...typography.caption, fontWeight: '800', fontSize: 11 },
});
