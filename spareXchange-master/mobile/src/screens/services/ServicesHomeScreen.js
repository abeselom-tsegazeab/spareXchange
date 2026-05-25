// Role-aware Services home.
// For users: "Need help?" CTA, my requests, browse technicians.
// For verified technicians: "Available jobs", my active jobs, my submitted quotes.

import React, { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import Card from '../../components/Card';
import EmptyState from '../../components/EmptyState';
import RequestCard from '../../components/RequestCard';
import Button from '../../components/Button';
import { colors, radius, spacing, typography } from '../../config/theme';
import { useAuthStore } from '../../store/authStore';
import { useServicesStore } from '../../store/servicesStore';

export default function ServicesHomeScreen({ navigation }) {
	const me = useAuthStore((s) => s.user);
	const isTech = me?.userType === 'technician' && me?.roleStatus === 'verified';

	const { myRequests, nearbyJobs, technicians, loading, fetchMyRequests, fetchNearbyJobs, fetchTechnicians } =
		useServicesStore();

	useEffect(() => {
		fetchMyRequests();
		if (isTech) fetchNearbyJobs();
		else fetchTechnicians();
	}, [isTech, fetchMyRequests, fetchNearbyJobs, fetchTechnicians]);

	const onRefresh = () => {
		fetchMyRequests();
		if (isTech) fetchNearbyJobs();
		else fetchTechnicians();
	};

	const goCreate = () => navigation.navigate('CreateRequest');
	const goDetail = (r) => navigation.navigate('RequestDetail', { id: r._id });

	const activeMy = (myRequests || []).filter((r) => !['completed', 'cancelled'].includes(r.status));

	return (
		<ScreenContainer scroll padded>
			<ScrollView
				refreshControl={
					<RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
				}
				scrollEnabled={false}
			>
				<Text style={typography.h2}>Services</Text>
				<Text style={[typography.muted, { marginBottom: spacing.lg }]}>
					{isTech ? 'Find jobs nearby and grow your trust score.' : 'Hire verified technicians or post a request.'}
				</Text>

				{/* Quick actions */}
				<View style={styles.ctaRow}>
					<Pressable onPress={goCreate} style={styles.cta}>
						<Text style={styles.ctaIcon}>＋</Text>
						<Text style={styles.ctaLabel}>Post request</Text>
					</Pressable>
					{isTech ? (
						<Pressable onPress={() => navigation.navigate('NearbyJobs')} style={styles.cta}>
							<Text style={styles.ctaIcon}>📍</Text>
							<Text style={styles.ctaLabel}>Find jobs</Text>
						</Pressable>
					) : (
						<Pressable onPress={() => navigation.navigate('TechniciansDirectory')} style={styles.cta}>
							<Text style={styles.ctaIcon}>👷</Text>
							<Text style={styles.ctaLabel}>Find a pro</Text>
						</Pressable>
					)}
					<Pressable onPress={() => navigation.navigate('MyRequests')} style={styles.cta}>
						<Text style={styles.ctaIcon}>📋</Text>
						<Text style={styles.ctaLabel}>My requests</Text>
					</Pressable>
				</View>

				{/* Active items */}
				<Card style={{ marginTop: spacing.lg }}>
					<View style={styles.sectionHead}>
						<Text style={typography.h4}>Active</Text>
						<Pressable onPress={() => navigation.navigate('MyRequests')} hitSlop={6}>
							<Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '800' }]}>
								See all ›
							</Text>
						</Pressable>
					</View>
					{activeMy.length === 0 ? (
						<EmptyState
							icon="🔧"
							title="Nothing active"
							message="Post a request and verified technicians will come to you with quotes."
							actionLabel="Post request"
							onAction={goCreate}
						/>
					) : (
						<View style={{ marginTop: spacing.md }}>
							{activeMy.slice(0, 3).map((r) => (
								<RequestCard key={r._id} request={r} onPress={goDetail} />
							))}
						</View>
					)}
				</Card>

				{isTech ? (
					<Card style={{ marginTop: spacing.lg }}>
						<View style={styles.sectionHead}>
							<Text style={typography.h4}>Available jobs near you</Text>
							<Pressable onPress={() => navigation.navigate('NearbyJobs')} hitSlop={6}>
								<Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '800' }]}>
									Browse all ›
								</Text>
							</Pressable>
						</View>
						<View style={{ marginTop: spacing.md }}>
							{(nearbyJobs || []).slice(0, 3).map((r) => (
								<RequestCard key={r._id} request={r} onPress={goDetail} showCustomer />
							))}
						</View>
					</Card>
				) : (
					<Card style={{ marginTop: spacing.lg }}>
						<View style={styles.sectionHead}>
							<Text style={typography.h4}>Top technicians</Text>
							<Pressable onPress={() => navigation.navigate('TechniciansDirectory')} hitSlop={6}>
								<Text style={[typography.caption, { color: colors.primaryDark, fontWeight: '800' }]}>
									See all ›
								</Text>
							</Pressable>
						</View>
						<View style={{ marginTop: spacing.md }}>
							{(technicians || []).slice(0, 3).map((t) => (
								<Pressable
									key={t._id}
									onPress={() => navigation.navigate('TechnicianProfile', { id: t._id })}
									style={({ pressed }) => [styles.techRow, pressed && { opacity: 0.85 }]}
								>
									<View style={styles.techAvatar}>
										<Text style={{ color: '#fff', fontWeight: '900' }}>
											{(t.name || '?').charAt(0).toUpperCase()}
										</Text>
									</View>
									<View style={{ flex: 1 }}>
										<Text style={typography.bodyStrong}>{t.name}</Text>
										<Text style={typography.caption}>{t.expertise || 'Service technician'}</Text>
									</View>
									<View style={{ alignItems: 'flex-end' }}>
										<Text style={typography.bodyStrong}>{t.trustScore}/100</Text>
										<Text style={typography.caption}>{t.totalReviews} reviews</Text>
									</View>
								</Pressable>
							))}
						</View>
					</Card>
				)}

				<View style={{ height: spacing.huge }} />
			</ScrollView>
		</ScreenContainer>
	);
}

const styles = StyleSheet.create({
	ctaRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
	cta: {
		flex: 1,
		padding: spacing.md,
		borderRadius: radius.lg,
		backgroundColor: colors.surface,
		borderWidth: 1,
		borderColor: colors.border,
		alignItems: 'flex-start',
	},
	ctaIcon: { fontSize: 24, marginBottom: spacing.xs },
	ctaLabel: { ...typography.bodyStrong, fontSize: 13 },
	sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
	techRow: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: spacing.md,
		paddingVertical: spacing.sm,
		borderTopWidth: 1,
		borderTopColor: colors.border,
		marginTop: 4,
	},
	techAvatar: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
	},
});
