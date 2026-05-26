import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyListingsScreen from '../screens/marketplace/MyListingsScreen';
import ListingFormScreen from '../screens/marketplace/ListingFormScreen';
import ListingDetailScreen from '../screens/marketplace/ListingDetailScreen';
import MarketInsightsScreen from '../screens/operations/MarketInsightsScreen';
import { useStackScreenDefaults } from './navigationStyles';

const Stack = createNativeStackNavigator();

export default function SellStack() {
	const hdr = useStackScreenDefaults();
	return (
		<Stack.Navigator
			screenOptions={{
				...hdr,
			}}
		>
			<Stack.Screen name="MyListings" component={MyListingsScreen} options={{ headerShown: false }} />
			<Stack.Screen
				name="CreateListing"
				component={ListingFormScreen}
				options={{ title: 'New listing' }}
			/>
			<Stack.Screen
				name="EditListing"
				component={ListingFormScreen}
				options={{ title: 'Edit listing' }}
			/>
			<Stack.Screen
				name="ListingDetail"
				component={ListingDetailScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="MarketInsights"
				component={MarketInsightsScreen}
				options={{ title: 'Market insights' }}
			/>
		</Stack.Navigator>
	);
}
