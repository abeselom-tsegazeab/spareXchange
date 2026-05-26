import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import BrowseScreen from '../screens/marketplace/BrowseScreen';
import ListingDetailScreen from '../screens/marketplace/ListingDetailScreen';
import SavedSearchesScreen from '../screens/savedSearches/SavedSearchesScreen';
import { useStackScreenDefaults } from './navigationStyles';

const Stack = createNativeStackNavigator();

export default function MarketplaceStack() {
	const hdr = useStackScreenDefaults();
	return (
		<Stack.Navigator
			screenOptions={{
				...hdr,
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
