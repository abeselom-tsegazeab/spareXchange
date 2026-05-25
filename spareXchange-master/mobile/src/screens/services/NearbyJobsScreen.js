// Technician-only: browse open requests with serviceType filter.

import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import ScreenContainer from '../../components/ScreenContainer';
import RequestCard from '../../components/RequestCard';
import EmptyState from '../../components/EmptyState';
import Chip from '../../components/Chip';
import Banner from '../../components/Banner';
import { colors, spacing, typography } from '../../config/theme';
import { SERVICE_TYPES } from '../../config/serviceCatalog';
import { useServicesStore } from '../../store/servicesStore';
import { useAuthStore } from '../../store/authStore';

export default function NearbyJobsScreen({ navigation }) {
	const me = useAuthStore((s) => s.user);
	const isTech = me?.userType === 'technician' && me?.roleStatus === 'verified';

	const { nearbyJobs, loading, error, fetchNearbyJobs } = useServicesStore();
	const [serviceType, setServiceType] = useState(null);

	useEffect(() => {
		fetchNearbyJobs({ serviceType });
	}, [serviceType, fetchNearbyJobs]);

	return (
		<ScreenContainer padded={false}>
			<View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
				<Text style={typography.h2}>Available jobs</Text>
				<Text style={typography.muted}>Pick a request, submit a quote, and win the job.</Text>

				{!isTech ? (
					<Banner
						tone="warning"
						title="Verified technicians only"
						message="Apply for a Technician role from your profile to bid on open jobs."
					/>
				) : null}

				{error ? <Banner tone="danger" message={error} /> : null}

				<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: spacing.lg, marginBottom: spacing.md }}>
					<Chip label="All" active={!serviceType} onPress={() => setServiceType(null)} />
					{SERVICE_TYPES.map((s) => (
						<Chip
							key={s.key}
							label={s.label}
							active={serviceType === s.key}
							onPress={() => setServiceType(s.key)}
						/>
					))}
				</ScrollView>
			</View>

			<FlatList
				data={nearbyJobs}
				keyExtractor={(item) => item._id}
				renderItem={({ item }) => (
					<RequestCard
						request={item}
						showCustomer
						onPress={(r) => navigation.navigate('RequestDetail', { id: r._id })}
					/>
				)}
				contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.huge }}
				refreshControl={
					<RefreshControl
						refreshing={loading}
						onRefresh={() => fetchNearbyJobs({ serviceType })}
						tintColor={colors.primary}
						colors={[colors.primary]}
					/>
				}
				ListEmptyComponent={
					<EmptyState
						icon="🔍"
						title="No open jobs"
						message="Nothing matches this filter right now. Try a broader category or check back later."
					/>
				}
			/>
		</ScreenContainer>
	);
}
