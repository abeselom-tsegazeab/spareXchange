import React, { useEffect, useRef, useState } from 'react';
import {
	FlatList,
	Image,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import * as Location from 'expo-location';

import ScreenContainer from '../../components/ScreenContainer';
import SearchBar from '../../components/SearchBar';
import Chip from '../../components/Chip';
import ListingCard from '../../components/ListingCard';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import FiltersSheet from './FiltersSheet';
import SaveSearchSheet from '../savedSearches/SaveSearchSheet';

import { colors, radius, spacing, typography } from '../../config/theme';
import { CATEGORIES } from '../../config/catalog';
import { resolveAssetUrl } from '../../config/env';
import { useListingsStore } from '../../store/listingsStore';
import { useAuthStore } from '../../store/authStore';
import { useSavedSearchesStore } from '../../store/savedSearchesStore';

const QUICK_CATEGORIES = [
	{ key: null, label: 'All' },
	...CATEGORIES,
];

export default function BrowseScreen({ navigation }) {
	const user = useAuthStore((s) => s.user);
	const {
		listings,
		recommendations,
		filters,
		loading,
		error,
		patchFilters,
		resetFilters,
		fetchListings,
		fetchRecommendations,
	} = useListingsStore();

	const { createSavedSearch, submitting: savingSearch } = useSavedSearchesStore();

	const [sheetOpen, setSheetOpen] = useState(false);
	const [saveSheetOpen, setSaveSheetOpen] = useState(false);
	const [saveInfo, setSaveInfo] = useState(null);
	const debounceRef = useRef(null);

	// Initial load
	useEffect(() => {
		fetchListings(filters);
		fetchRecommendations();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Refetch (debounced) when filters change
	useEffect(() => {
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => fetchListings(filters), 350);
		return () => clearTimeout(debounceRef.current);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		filters.query,
		filters.category,
		filters.condition,
		filters.brand,
		filters.model,
		filters.year,
		filters.minPrice,
		filters.maxPrice,
		filters.sort,
		filters.radiusKm,
		filters.latitude,
		filters.longitude,
	]);

	const onRefresh = () => {
		fetchListings(filters);
		fetchRecommendations();
	};

	// When the user turns on a radius filter we ask for their location.
	const useMyLocation = async () => {
		try {
			const { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') return;
			const pos = await Location.getCurrentPositionAsync({});
			patchFilters({
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
			});
		} catch (_) {
			// silent — user can still browse without location
		}
	};

	useEffect(() => {
		if (filters.radiusKm && (filters.latitude == null || filters.longitude == null)) {
			useMyLocation();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [filters.radiusKm]);

	const visible = listings || [];

	const activeFilterCount =
		(filters.query?.trim() ? 1 : 0) +
		(filters.category ? 1 : 0) +
		(filters.condition ? 1 : 0) +
		(filters.brand ? 1 : 0) +
		(filters.model ? 1 : 0) +
		(filters.year ? 1 : 0) +
		(filters.minPrice || filters.maxPrice ? 1 : 0) +
		(filters.radiusKm ? 1 : 0) +
		(filters.sort && filters.sort !== 'recent' ? 1 : 0);

	const canSaveSearch = activeFilterCount > 0;

	const goDetail = (l) => navigation.navigate('ListingDetail', { id: l._id });

	const header = (
		<View>
			<View style={styles.headerRow}>
				<View style={{ flex: 1 }}>
					<Text style={typography.h2}>Marketplace</Text>
					<Text style={typography.muted}>
						Hi {user?.name?.split(' ')[0] || 'there'} — find a part or list one for sale.
					</Text>
				</View>
				<Pressable onPress={() => navigation.navigate('SavedSearches')} hitSlop={8} style={styles.savedBtn}>
					<Text style={styles.savedBtnText}>Saved</Text>
				</Pressable>
			</View>

			{saveInfo ? <Banner tone="success" message={saveInfo} style={{ marginTop: spacing.sm }} /> : null}

			<View style={{ marginVertical: spacing.lg }}>
				<SearchBar
					value={filters.query}
					onChangeText={(t) => patchFilters({ query: t })}
					onFilterPress={() => setSheetOpen(true)}
					filterActive={activeFilterCount > 0}
				/>
			</View>

			<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
				{QUICK_CATEGORIES.map((c) => (
					<Chip
						key={String(c.key)}
						label={c.label}
						active={filters.category === c.key}
						onPress={() => patchFilters({ category: c.key })}
					/>
				))}
			</ScrollView>

			{canSaveSearch ? (
				<View style={styles.activeFilters}>
					<Text style={typography.caption}>
						{activeFilterCount} criteria active
					</Text>
					<View style={styles.activeFilterActions}>
						<Pressable onPress={() => setSaveSheetOpen(true)} hitSlop={8}>
							<Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '700' }]}>
								Save search
							</Text>
						</Pressable>
						{activeFilterCount > 1 ? (
							<>
								<Text style={styles.filterDot}>·</Text>
								<Pressable onPress={resetFilters} hitSlop={8}>
									<Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '700' }]}>Clear all</Text>
								</Pressable>
							</>
						) : null}
					</View>
				</View>
			) : null}

			{error && (listings || []).length === 0 && !loading ? (
				<Banner tone="danger" title="Could not load listings" message={error} />
			) : null}

			{recommendations?.length ? (
				<View style={{ marginBottom: spacing.lg }}>
					<View style={styles.sectionHead}>
						<Text style={typography.h4}>Recommended for you</Text>
					</View>
					<ScrollView horizontal showsHorizontalScrollIndicator={false}>
						{recommendations.map((r) => (
							<Pressable
								key={r._id}
								onPress={() => goDetail(r)}
								style={styles.recommendCard}
							>
								<Image source={{ uri: resolveAssetUrl(r.images?.[0]) }} style={styles.recommendImg} />
								<Text style={[typography.bodyStrong, { marginTop: spacing.xs }]} numberOfLines={2}>
									{r.title}
								</Text>
								<Text style={typography.bodyStrong}>
									ETB {Number(r.price).toLocaleString()}
								</Text>
							</Pressable>
						))}
					</ScrollView>
				</View>
			) : null}

			<View style={[styles.sectionHead, { marginBottom: spacing.sm }]}>
				<Text style={typography.h4}>{visible.length} listing{visible.length === 1 ? '' : 's'}</Text>
			</View>
		</View>
	);

	if (loading && (listings || []).length === 0) {
		return (
			<ScreenContainer>
				{header}
				<Loader fullscreen />
			</ScreenContainer>
		);
	}

	return (
		<ScreenContainer padded={false}>
			<FlatList
				data={visible}
				keyExtractor={(item) => item._id}
				numColumns={2}
				columnWrapperStyle={{ gap: spacing.md, paddingHorizontal: spacing.lg }}
				contentContainerStyle={{
					paddingHorizontal: 0,
					paddingTop: spacing.lg,
					paddingBottom: spacing.huge,
				}}
				ListHeaderComponent={<View style={{ paddingHorizontal: spacing.lg }}>{header}</View>}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={onRefresh}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
				renderItem={({ item }) => (
					<ListingCard listing={item} onPress={goDetail} style={{ flex: 1 }} />
				)}
				ListEmptyComponent={
					<EmptyState
						title="No listings match"
						message="Try removing some filters or use different search terms."
						actionLabel="Reset filters"
						onAction={resetFilters}
					/>
				}
			/>
			<FiltersSheet
				visible={sheetOpen}
				initial={filters}
				onClose={() => setSheetOpen(false)}
				onApply={(next) => {
					patchFilters(next);
					setSheetOpen(false);
				}}
			/>
			<SaveSearchSheet
				visible={saveSheetOpen}
				initial={{ filters }}
				onClose={() => setSaveSheetOpen(false)}
				onSubmit={async (payload) => {
					const res = await createSavedSearch(payload);
					if (res.success) {
						setSaveInfo('Search saved — we will alert you on new matches.');
						setSaveSheetOpen(false);
					}
					return res;
				}}
				submitting={savingSearch}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
	savedBtn: {
		paddingHorizontal: spacing.md,
		paddingVertical: spacing.xs,
		borderRadius: radius.pill,
		borderWidth: 1,
		borderColor: colors.border,
		backgroundColor: colors.surface,
	},
	savedBtnText: { ...typography.caption, fontWeight: '800', color: colors.primaryDark },
	activeFilters: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: spacing.md,
	},
	activeFilterActions: { flexDirection: 'row', alignItems: 'center' },
	filterDot: { color: colors.textSubtle, marginHorizontal: spacing.xs },
	sectionHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
	recommendCard: {
		width: 160,
		marginRight: spacing.md,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		borderRadius: radius.lg,
		padding: spacing.sm,
	},
	recommendImg: { width: '100%', height: 100, borderRadius: radius.md, backgroundColor: colors.surfaceAlt },
});
