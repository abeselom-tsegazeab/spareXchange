import React, { useEffect, useState } from 'react';
import {
	Alert,
	FlatList,
	Pressable,
	RefreshControl,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import ListingCard from '../../components/ListingCard';
import EmptyState from '../../components/EmptyState';
import Button from '../../components/Button';
import Banner from '../../components/Banner';
import { colors, radius, shadow, spacing, typography } from '../../config/theme';
import { useListingsStore } from '../../store/listingsStore';

const TABS = [
	{ key: 'all', label: 'All' },
	{ key: 'available', label: 'Available' },
	{ key: 'unavailable', label: 'Unavailable' },
];

export default function MyListingsScreen({ navigation }) {
	const {
		myListings,
		loading,
		fetchMyListings,
		toggleAvailability,
		renewListing,
		deleteListing,
	} = useListingsStore();

	const [tab, setTab] = useState('all');
	const [info, setInfo] = useState(null);

	useEffect(() => {
		fetchMyListings();
	}, [fetchMyListings]);

	const filtered = (myListings || []).filter((l) => {
		if (tab === 'available') return l.available;
		if (tab === 'unavailable') return !l.available;
		return true;
	});

	const openDetail = (l) => navigation.navigate('ListingDetail', { id: l._id });
	const openEdit = (l) =>
		navigation.navigate('EditListing', { id: l._id, initial: l });
	const openCreate = () => navigation.navigate('CreateListing');

	const onToggle = async (l) => {
		const res = await toggleAvailability(l._id);
		if (res.success) {
			setInfo({ tone: 'success', text: `Marked ${l.available ? 'unavailable' : 'available'}.` });
		} else {
			setInfo({ tone: 'danger', text: res.message || 'Could not change availability.' });
		}
	};

	const onRenew = async (l) => {
		const res = await renewListing(l._id);
		setInfo(
			res.success
				? { tone: 'success', text: 'Listing renewed for 30 days.' }
				: { tone: 'danger', text: res.message || 'Renewal failed.' }
		);
	};

	const onDelete = (l) => {
		Alert.alert('Delete listing', `"${l.title}" will be archived. Continue?`, [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: async () => {
					const res = await deleteListing(l._id);
					setInfo(
						res.success
							? { tone: 'success', text: 'Listing deleted.' }
							: { tone: 'danger', text: res.message || 'Delete failed.' }
					);
				},
			},
		]);
	};

	const renderItem = ({ item }) => (
		<View style={styles.row}>
			<ListingCard listing={item} onPress={openDetail} variant="horizontal" />
			<View style={styles.actions}>
				<ActionButton label="Edit" onPress={() => openEdit(item)} />
				<ActionButton
					label={item.available ? 'Mark unavailable' : 'Mark available'}
					onPress={() => onToggle(item)}
				/>
				<ActionButton label="Renew 30d" onPress={() => onRenew(item)} />
				<ActionButton label="Delete" danger onPress={() => onDelete(item)} />
			</View>
		</View>
	);

	return (
		<ScreenContainer padded={false}>
			<View style={styles.headerWrap}>
				<View style={styles.headerRow}>
					<View>
						<Text style={typography.h2}>My listings</Text>
						<Text style={typography.muted}>Manage what you have for sale.</Text>
					</View>
					<Button title="+ New" onPress={openCreate} fullWidth={false} size="sm" />
				</View>

				{info ? (
					<Banner tone={info.tone} message={info.text} style={{ marginTop: spacing.md, marginBottom: 0 }} />
				) : null}

				<View style={styles.tabs}>
					{TABS.map((t) => (
						<Pressable
							key={t.key}
							onPress={() => setTab(t.key)}
							style={[styles.tab, tab === t.key && styles.tabActive]}
						>
							<Text style={[styles.tabText, tab === t.key && styles.tabTextActive]}>{t.label}</Text>
						</Pressable>
					))}
				</View>
			</View>

			<FlatList
				data={filtered}
				keyExtractor={(item) => item._id}
				renderItem={renderItem}
				contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.huge }}
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={fetchMyListings} tintColor={colors.primary} colors={[colors.primary]} />
				}
				ListEmptyComponent={
					<EmptyState
						title={tab === 'all' ? 'No listings yet' : 'Nothing here'}
						message={
							tab === 'all'
								? 'Post your first part — it takes under a minute and earns you EcoPoints.'
								: 'Switch the tab above to see other listings.'
						}
						actionLabel={tab === 'all' ? 'Create listing' : null}
						onAction={tab === 'all' ? openCreate : null}
					/>
				}
			/>
		</ScreenContainer>
	);
}

const ActionButton = ({ label, onPress, danger }) => (
	<Pressable
		onPress={onPress}
		style={({ pressed }) => [
			styles.actionBtn,
			danger && { borderColor: colors.danger },
			pressed && { opacity: 0.7 },
		]}
		hitSlop={4}
	>
		<Text style={[styles.actionBtnText, danger && { color: colors.danger }]}>{label}</Text>
	</Pressable>
);

const styles = StyleSheet.create({
	headerWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
	headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	tabs: {
		flexDirection: 'row',
		marginTop: spacing.lg,
		marginBottom: spacing.md,
		backgroundColor: colors.surfaceAlt,
		borderRadius: radius.lg,
		padding: 4,
	},
	tab: { flex: 1, paddingVertical: 8, borderRadius: radius.md, alignItems: 'center' },
	tabActive: { backgroundColor: colors.surface, ...shadow.sm },
	tabText: { ...typography.caption, fontWeight: '700', color: colors.textMuted },
	tabTextActive: { color: colors.primaryDark },
	row: { marginBottom: spacing.lg },
	actions: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		gap: spacing.xs,
		marginTop: -spacing.xs,
	},
	actionBtn: {
		paddingHorizontal: spacing.md,
		paddingVertical: 7,
		borderRadius: radius.pill,
		borderWidth: 1,
		borderColor: colors.borderStrong,
		backgroundColor: colors.surface,
		marginRight: spacing.xs,
		marginBottom: spacing.xs,
	},
	actionBtnText: { ...typography.caption, fontWeight: '700', color: colors.text },
});
