import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import EcoHomeScreen from '../screens/eco/EcoHomeScreen';
import SubmitRecyclingScreen from '../screens/eco/SubmitRecyclingScreen';
import MySubmissionsScreen from '../screens/eco/MySubmissionsScreen';
import SubmissionDetailScreen from '../screens/eco/SubmissionDetailScreen';
import LeaderboardScreen from '../screens/eco/LeaderboardScreen';
import RedeemPointsScreen from '../screens/eco/RedeemPointsScreen';
import NearbyRecyclersScreen from '../screens/eco/NearbyRecyclersScreen';
import VerifyTokenScreen from '../screens/eco/VerifyTokenScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator();

export default function EcoStack() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: { backgroundColor: colors.surface },
				headerTitleStyle: { color: colors.text, fontWeight: '700' },
				headerTintColor: colors.primary,
			}}
		>
			<Stack.Screen name="EcoHome" component={EcoHomeScreen} options={{ headerShown: false }} />
			<Stack.Screen name="SubmitRecycling" component={SubmitRecyclingScreen} options={{ title: 'Submit recycling' }} />
			<Stack.Screen name="MySubmissions" component={MySubmissionsScreen} options={{ headerShown: false }} />
			<Stack.Screen name="SubmissionDetail" component={SubmissionDetailScreen} options={{ title: 'Submission' }} />
			<Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: 'Eco leaderboard' }} />
			<Stack.Screen name="Redeem" component={RedeemPointsScreen} options={{ title: 'Redeem EcoPoints' }} />
			<Stack.Screen name="NearbyRecyclers" component={NearbyRecyclersScreen} options={{ title: 'Nearby recyclers' }} />
			<Stack.Screen name="VerifyToken" component={VerifyTokenScreen} options={{ title: 'Verify recycling token' }} />
		</Stack.Navigator>
	);
}
