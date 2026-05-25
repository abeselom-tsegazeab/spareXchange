import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ExchangesListScreen from '../screens/exchanges/ExchangesListScreen';
import ExchangeDetailScreen from '../screens/exchanges/ExchangeDetailScreen';
import ProposeExchangeScreen from '../screens/exchanges/ProposeExchangeScreen';
import NegotiateMeetingScreen from '../screens/exchanges/NegotiateMeetingScreen';
import HandshakeScreen from '../screens/exchanges/HandshakeScreen';
import HandoverPhotoScreen from '../screens/exchanges/HandoverPhotoScreen';
import { colors } from '../config/theme';

const Stack = createNativeStackNavigator();

export default function TradesStack() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: { backgroundColor: colors.surface },
				headerTitleStyle: { color: colors.text, fontWeight: '700' },
				headerTintColor: colors.primary,
			}}
		>
			<Stack.Screen name="ExchangesList" component={ExchangesListScreen} options={{ headerShown: false }} />
			<Stack.Screen name="ExchangeDetail" component={ExchangeDetailScreen} options={{ title: 'Exchange' }} />
			<Stack.Screen name="ProposeExchange" component={ProposeExchangeScreen} options={{ title: 'Propose exchange' }} />
			<Stack.Screen name="NegotiateMeeting" component={NegotiateMeetingScreen} options={{ title: 'Negotiate meeting' }} />
			<Stack.Screen name="Handshake" component={HandshakeScreen} options={{ title: 'Handshake' }} />
			<Stack.Screen name="HandoverPhoto" component={HandoverPhotoScreen} options={{ title: 'Handover photo' }} />
		</Stack.Navigator>
	);
}
