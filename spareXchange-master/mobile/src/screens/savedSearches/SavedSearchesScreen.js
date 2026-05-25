import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import SavedSearchCard from '../../components/SavedSearchCard';
import SaveSearchSheet from './SaveSearchSheet';
import EmptyState from '../../components/EmptyState';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { savedSearchToFilters } from '../../config/savedSearchHelpers';
import { useSavedSearchesStore } from '../../store/savedSearchesStore';
import { useListingsStore } from '../../store/listingsStore';

export default function SavedSearchesScreen({ navigation }) {
	const {
		savedSearches,
		loading,
		submitting,
		error,
		fetchSavedSearches,
		createSavedSearch,
		updateSavedSearch,
		deleteSavedSearch,
		toggleNotification,
	} = useSavedSearchesStore();

	const patchFilters = useListingsStore((s) => s.patchFilters);
	const fetchListings = useListingsStore((s) => s.fetchListings);

	const [sheetOpen, setSheetOpen] = useState(false);
	const [editing, setEditing] = useState(null);
	const [info, setInfo] = useState(null);

	useEffect(() => {
		fetchSavedSearches();
	}, [fetchSavedSearches]);

	const runSearch = (item) => {
		const next = savedSearchToFilters(item);
		patchFilters(next);
		fetchListings(next);
		navigation.navigate('Browse');
	};

	const onDelete = (item) => {
		Alert.alert('Delete saved search?', `"${item.name || 'This search'}" will be removed.`, [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					const res = await deleteSavedSearch(item._id);
					if (res.success) setInfo('Saved search deleted.');
					else Alert.alert('Error', res.message);
				},
			},
		]);
	};

	const onToggleNotify = async (item) => {
		const res = await toggleNotification(item._id);
		if (!res.success) Alert.alert('Error', res.message);
	};

	const onSheetSubmit = async (payload) => {
		if (editing?._id) return updateSavedSearch(editing._id, payload);
		const res = await createSavedSearch(payload);
		if (res.success) setInfo('Search saved — we will alert you on new matches.');
		return res;
	};

	return (
		<ScreenContainer padded={false}>
			<View style={styles.header}>
				<Text style={typography.h2}>Saved searches</Text>
				<Text style={typography.muted}>
					Save marketplace filters and get notified when matching parts are listed.
				</Text>
				{info ? <Banner tone="success" message={info} style={{ marginTop: spacing.md }} /> : null}
				{error && !savedSearches.length ? (
					<Banner tone="danger" message={error} style={{ marginTop: spacing.md }} />
				) : null}
				<Pressable
					onPress={() => {
						setEditing(null);
						setSheetOpen(true);
					}}
					style={styles.addBtn}
				>
					<Text style={styles.addBtnText}>+ New saved search</Text>
				</Pressable>
			</View>

			{loading && !savedSearches.length ? (
				<Loader fullscreen label="Loading saved searches..." />
			) : (
				<FlatList
					data={savedSearches}
					keyExtractor={(item) => item._id}
					contentContainerStyle={styles.list}
					refreshControl={
						<RefreshControl
							refreshing={loading}
							onRefresh={fetchSavedSearches}
							tintColor={colors.primary}
							colors={[colors.primary]}
						/>
					}
					renderItem={({ item }) => (
						<SavedSearchCard
							item={item}
							onPress={() => runSearch(item)}
							onEdit={() => {
								setEditing(item);
								setSheetOpen(true);
							}}
							onDelete={onDelete}
							onToggleNotify={onToggleNotify}
							toggling={submitting}
						/>
					)}
					ListEmptyComponent={
						<EmptyState
							title="No saved searches yet"
							message="Save your current marketplace filters to get alerts when new parts match."
							actionLabel="Create one"
							onAction={() => {
								setEditing(null);
								setSheetOpen(true);
							}}
						/>
					}
				/>
			)}

			<SaveSearchSheet
				visible={sheetOpen}
				initial={editing}
				onClose={() => {
					setSheetOpen(false);
					setEditing(null);
				}}
				onSubmit={onSheetSubmit}
				submitting={submitting}
			/>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
	addBtn: {
		marginTop: spacing.lg,
		alignSelf: 'flex-start',
		paddingVertical: spacing.sm,
		paddingHorizontal: spacing.md,
		borderRadius: 999,
		backgroundColor: colors.primary,
	},
	addBtnText: { color: colors.textInverse, fontWeight: '800', fontSize: 14 },
	list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.huge },
});
