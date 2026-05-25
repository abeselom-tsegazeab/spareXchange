import React, { useEffect, useRef, useState } from 'react';
import {
	Alert,
	Dimensions,
	FlatList,
	Image,
	Pressable,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Loader from '../../components/Loader';
import Banner from '../../components/Banner';
import ReportListingModal from './ReportListingModal';

import { colors, radius, spacing, typography } from '../../config/theme';
import { categoryLabel, conditionLabel } from '../../config/catalog';
import { resolveAssetUrl } from '../../config/env';
import { useListingsStore } from '../../store/listingsStore';
import { useAuthStore } from '../../store/authStore';

const { width: SCREEN_W } = Dimensions.get('window');

export default function ListingDetailScreen({ route, navigation }) {
	const { id } = route.params || {};
	const me = useAuthStore((s) => s.user);

	const {
		listing,
		loadingDetail,
		fetchListing,
		voteCompatibility,
		reportListing,
	} = useListingsStore();

	const [imageIndex, setImageIndex] = useState(0);
	const [reporting, setReporting] = useState(false);
	const [reportOpen, setReportOpen] = useState(false);
	const [info, setInfo] = useState(null);
	const carouselRef = useRef(null);

	useEffect(() => {
		fetchListing(id);
	}, [id, fetchListing]);

	if (loadingDetail || !listing) {
		return (
			<ScreenContainer>
				<Loader fullscreen label="Loading listing..." />
			</ScreenContainer>
		);
	}

	const isOwner = me?._id && listing.seller && me._id === (listing.seller._id || listing.seller);

	const onVote = async (vehicleId, voteType) => {
		const res = await voteCompatibility(listing._id, vehicleId, voteType);
		if (!res.success) setInfo({ tone: 'danger', text: 'Could not record your vote' });
	};

	const handleReport = async (payload) => {
		setReporting(true);
		const res = await reportListing(listing._id, payload);
		setReporting(false);
		return res;
	};

	const contactSeller = () => {
		const sellerId = listing.seller?._id || listing.seller;
		if (!sellerId) return;
		navigation.navigate('Communication', {
			screen: 'Chat',
			params: {
				userId: String(sellerId),
				userName: listing.seller?.name,
				listingId: listing._id,
			},
		});
	};

	const proposeExchange = () => {
		// Jump into the Trades tab and open the propose screen with this listing.
		navigation.getParent()?.navigate('Trades', {
			screen: 'ProposeExchange',
			params: { listing },
		});
	};

	return (
		<ScreenContainer scroll padded={false}>
			{/* Image carousel */}
			<View style={{ position: 'relative' }}>
				<FlatList
					ref={carouselRef}
					data={listing.images?.length ? listing.images : ['placeholder']}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					keyExtractor={(_, i) => String(i)}
					onMomentumScrollEnd={(e) => {
						const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
						setImageIndex(i);
					}}
					renderItem={({ item }) =>
						item === 'placeholder' ? (
							<View style={[styles.image, styles.noImage]}>
								<Text style={{ color: colors.textMuted }}>No image</Text>
							</View>
						) : (
							<Image source={{ uri: resolveAssetUrl(item) }} style={styles.image} resizeMode="cover" />
						)
					}
				/>
				{(listing.images?.length || 0) > 1 ? (
					<View style={styles.dots}>
						{listing.images.map((_, i) => (
							<View
								key={i}
								style={[styles.dot, i === imageIndex && styles.dotActive]}
							/>
						))}
					</View>
				) : null}
				<Pressable
					style={styles.backBtn}
					onPress={() => navigation.goBack()}
					hitSlop={8}
				>
					<Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>‹</Text>
				</Pressable>
			</View>

			<View style={{ padding: spacing.lg }}>
				{info ? <Banner tone={info.tone} message={info.text} /> : null}

				<Text style={[typography.h2]}>{listing.title}</Text>
				<View style={styles.metaRow}>
					<Text style={typography.muted}>
						{categoryLabel(listing.category)} · {conditionLabel(listing.condition)}
					</Text>
					<Text style={typography.muted}>👁 {listing.views || 0}</Text>
				</View>
				<Text style={[typography.h2, { marginTop: spacing.sm, color: colors.primaryDark }]}>
					ETB {Number(listing.price).toLocaleString()}
				</Text>
				{listing.ecoPoints ? (
					<View style={styles.ecoBadge}>
						<Text style={styles.ecoText}>+{listing.ecoPoints} EcoPoints on completion</Text>
					</View>
				) : null}

				<Card style={{ marginTop: spacing.lg }}>
					<View style={styles.sellerRow}>
						<View style={styles.avatar}>
							<Text style={styles.avatarText}>
								{(listing.seller?.name || 'S').charAt(0)}
							</Text>
						</View>
						<View style={{ flex: 1 }}>
							<Text style={typography.bodyStrong}>{listing.seller?.name || 'Seller'}</Text>
							<Text style={typography.caption}>
								Trust score {listing.seller?.trustScore ?? 80}/100
								{listing.seller?.verifiedSeller ? '   ·   ✓ Verified' : ''}
							</Text>
						</View>
					</View>
				</Card>

				<Card style={{ marginTop: spacing.lg }}>
					<Text style={typography.h4}>Description</Text>
					<Text style={[typography.body, { marginTop: spacing.xs }]}>{listing.description}</Text>
				</Card>

				{(listing.specifications && Object.keys(listing.specifications).length) ||
				listing.brand ||
				listing.model ||
				listing.year ? (
					<Card style={{ marginTop: spacing.lg }}>
						<Text style={typography.h4}>Specifications</Text>
						<Spec k="Brand" v={listing.brand} />
						<Spec k="Model" v={listing.model} />
						<Spec k="Year" v={listing.year} />
						{Object.entries(listing.specifications || {}).map(([k, v]) => (
							<Spec key={k} k={k} v={v} />
						))}
					</Card>
				) : null}

				{listing.compatibleVehicles?.length ? (
					<Card style={{ marginTop: spacing.lg }}>
						<Text style={typography.h4}>Compatible vehicles</Text>
						<Text style={[typography.caption, { marginBottom: spacing.sm }]}>
							Vote thumbs up if you confirmed the fit. Helps the next buyer.
						</Text>
						{listing.compatibleVehicles.map((v) => (
							<View key={v._id} style={styles.compatRow}>
								<View style={{ flex: 1 }}>
									<Text style={typography.bodyStrong}>
										{v.brand} {v.model}
									</Text>
									<Text style={typography.caption}>
										{v.yearStart}–{v.yearEnd || 'present'}
									</Text>
								</View>
								<Pressable onPress={() => onVote(v._id, 'up')} style={styles.voteBtn}>
									<Text style={styles.voteUp}>▲ {v.upvotes || 0}</Text>
								</Pressable>
								<Pressable onPress={() => onVote(v._id, 'down')} style={styles.voteBtn}>
									<Text style={styles.voteDown}>▼ {v.downvotes || 0}</Text>
								</Pressable>
							</View>
						))}
					</Card>
				) : null}

				<Card style={{ marginTop: spacing.lg }}>
					<Text style={typography.h4}>Location</Text>
					<Text style={[typography.body, { marginTop: spacing.xs }]}>📍 {listing.location}</Text>
				</Card>

				<View style={{ height: spacing.xxl }} />

				{isOwner ? (
					<Banner tone="info" message="This is your listing. Manage it from the Sell tab." />
				) : (
					<>
						<Button title="Contact seller" onPress={contactSeller} size="lg" />
						<View style={{ height: spacing.md }} />
						<Button title="Propose exchange" variant="secondary" onPress={proposeExchange} size="lg" />
						<View style={{ height: spacing.md }} />
						<Pressable onPress={() => setReportOpen(true)} style={styles.reportBtn} hitSlop={8}>
							<Text style={styles.reportText}>⚑ Report this listing</Text>
						</Pressable>
					</>
				)}
			</View>

			<ReportListingModal
				visible={reportOpen}
				onClose={() => setReportOpen(false)}
				onSubmit={handleReport}
				submitting={reporting}
			/>
		</ScreenContainer>
	);
}

const Spec = ({ k, v }) =>
	v == null || v === '' ? null : (
		<View style={styles.specRow}>
			<Text style={typography.muted}>{k}</Text>
			<Text style={typography.bodyStrong}>{String(v)}</Text>
		</View>
	);

const styles = StyleSheet.create({
	image: { width: SCREEN_W, height: SCREEN_W * 0.9, backgroundColor: colors.surfaceAlt },
	noImage: { alignItems: 'center', justifyContent: 'center' },
	dots: {
		position: 'absolute',
		bottom: spacing.md,
		left: 0,
		right: 0,
		flexDirection: 'row',
		justifyContent: 'center',
	},
	dot: {
		width: 7,
		height: 7,
		borderRadius: 4,
		backgroundColor: 'rgba(255,255,255,0.5)',
		marginHorizontal: 3,
	},
	dotActive: { backgroundColor: '#fff', width: 18 },
	backBtn: {
		position: 'absolute',
		top: spacing.lg,
		left: spacing.lg,
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: 'rgba(17,24,39,0.55)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
	ecoBadge: {
		marginTop: spacing.sm,
		alignSelf: 'flex-start',
		paddingHorizontal: spacing.md,
		paddingVertical: 4,
		backgroundColor: '#D1FAE5',
		borderRadius: radius.pill,
	},
	ecoText: { color: '#065F46', fontWeight: '700', fontSize: 12 },
	sellerRow: { flexDirection: 'row', alignItems: 'center' },
	avatar: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: spacing.md,
	},
	avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
	specRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingVertical: spacing.xs,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		marginTop: spacing.xs,
	},
	compatRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: spacing.sm,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		gap: spacing.sm,
	},
	voteBtn: {
		paddingHorizontal: spacing.sm,
		paddingVertical: 6,
		borderRadius: radius.md,
		backgroundColor: colors.surfaceAlt,
	},
	voteUp: { color: colors.success, fontWeight: '800' },
	voteDown: { color: colors.danger, fontWeight: '800' },
	reportBtn: { alignItems: 'center', paddingVertical: spacing.sm },
	reportText: { color: colors.danger, fontWeight: '700' },
});
