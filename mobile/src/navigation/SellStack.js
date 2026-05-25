import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MyListingsScreen from '../screens/marketplace/MyListingsScreen';
import ListingFormScreen from '../screens/marketplace/ListingFormScreen';
import ListingDetailScreen from '../screens/marketplace/ListingDetailScreen';
import MarketInsightsScreen from '../screens/operations/MarketInsightsScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator();

export default function SellStack() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: { backgroundColor: colors.surface },
				headerTitleStyle: { color: colors.text, fontWeight: '700' },
				headerTintColor: colors.primary,
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
