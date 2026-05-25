import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BrowseScreen from '../screens/marketplace/BrowseScreen';
import ListingDetailScreen from '../screens/marketplace/ListingDetailScreen';
import SavedSearchesScreen from '../screens/savedSearches/SavedSearchesScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator();

export default function MarketplaceStack() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: { backgroundColor: colors.surface },
				headerTitleStyle: { color: colors.text, fontWeight: '700' },
				headerTintColor: colors.primary,
			}}
		>
			<Stack.Screen name="Browse" component={BrowseScreen} options={{ headerShown: false }} />
			<Stack.Screen
				name="ListingDetail"
				component={ListingDetailScreen}
				options={{ headerShown: false }}
			/>
			<Stack.Screen
				name="SavedSearches"
				component={SavedSearchesScreen}
				options={{ title: 'Saved Searches' }}
			/>
		</Stack.Navigator>
	);
}
