import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CommunityHomeScreen from '../screens/community/CommunityHomeScreen';
import ActivityFeedScreen from '../screens/community/ActivityFeedScreen';
import AchievementsScreen from '../screens/community/AchievementsScreen';
import AchievementLeaderboardScreen from '../screens/community/AchievementLeaderboardScreen';
import PublicProfileScreen from '../screens/community/PublicProfileScreen';
import { useStackScreenDefaults } from './navigationStyles';

const Stack = createNativeStackNavigator();

export default function CommunityStack() {
	const hdr = useStackScreenDefaults();
	return (
		<Stack.Navigator
			screenOptions={{
				...hdr,
			}}
		>
			<Stack.Screen name="CommunityHome" component={CommunityHomeScreen} options={{ title: 'Community' }} />
			<Stack.Screen name="ActivityFeed" component={ActivityFeedScreen} options={{ title: 'Activity' }} />
			<Stack.Screen name="Achievements" component={AchievementsScreen} options={{ title: 'Achievements' }} />
			<Stack.Screen
				name="AchievementLeaderboard"
				component={AchievementLeaderboardScreen}
				options={{ title: 'Leaderboard' }}
			/>
			<Stack.Screen name="PublicProfile" component={PublicProfileScreen} options={{ title: 'Profile' }} />
		</Stack.Navigator>
	);
}
