import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ConversationsListScreen from '../screens/communication/ConversationsListScreen';
import ChatScreen from '../screens/communication/ChatScreen';
import NotificationsScreen from '../screens/communication/NotificationsScreen';
import NotificationHistoryScreen from '../screens/communication/NotificationHistoryScreen';
import NotificationPreferencesScreen from '../screens/communication/NotificationPreferencesScreen';
import WriteReviewScreen from '../screens/communication/WriteReviewScreen';
import UserReviewsScreen from '../screens/communication/UserReviewsScreen';
import ReportUserScreen from '../screens/communication/ReportUserScreen';
import { useStackScreenDefaults } from './navigationStyles';

const Stack = createNativeStackNavigator();

export default function CommunicationStack() {
	const hdr = useStackScreenDefaults();
	return (
		<Stack.Navigator
			screenOptions={{
				...hdr,
			}}
		>
			<Stack.Screen name="ConversationsList" component={ConversationsListScreen} options={{ title: 'Messages' }} />
			<Stack.Screen name="Chat" component={ChatScreen} />
			<Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
			<Stack.Screen name="NotificationHistory" component={NotificationHistoryScreen} options={{ title: 'History' }} />
			<Stack.Screen name="NotificationPreferences" component={NotificationPreferencesScreen} options={{ title: 'Settings' }} />
			<Stack.Screen name="WriteReview" component={WriteReviewScreen} options={{ title: 'Leave a review' }} />
			<Stack.Screen name="UserReviews" component={UserReviewsScreen} options={{ title: 'Reviews' }} />
			<Stack.Screen name="ReportUser" component={ReportUserScreen} options={{ title: 'Report user' }} />
		</Stack.Navigator>
	);
}
