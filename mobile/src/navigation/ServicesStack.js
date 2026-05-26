import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ServicesHomeScreen from '../screens/services/ServicesHomeScreen';
import CreateRequestScreen from '../screens/services/CreateRequestScreen';
import MyRequestsScreen from '../screens/services/MyRequestsScreen';
import NearbyJobsScreen from '../screens/services/NearbyJobsScreen';
import RequestDetailScreen from '../screens/services/RequestDetailScreen';
import TechniciansDirectoryScreen from '../screens/services/TechniciansDirectoryScreen';
import TechnicianProfileScreen from '../screens/services/TechnicianProfileScreen';
import { useStackScreenDefaults } from './navigationStyles';

const Stack = createNativeStackNavigator();

export default function ServicesStack() {
	const hdr = useStackScreenDefaults();
	return (
		<Stack.Navigator
			screenOptions={{
				...hdr,
			}}
		>
			<Stack.Screen name="ServicesHome" component={ServicesHomeScreen} options={{ headerShown: false }} />
			<Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{ title: 'New request' }} />
			<Stack.Screen name="MyRequests" component={MyRequestsScreen} options={{ headerShown: false }} />
			<Stack.Screen name="NearbyJobs" component={NearbyJobsScreen} options={{ headerShown: false }} />
			<Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Request' }} />
			<Stack.Screen name="TechniciansDirectory" component={TechniciansDirectoryScreen} options={{ headerShown: false }} />
			<Stack.Screen name="TechnicianProfile" component={TechnicianProfileScreen} options={{ title: 'Technician' }} />
		</Stack.Navigator>
	);
}
