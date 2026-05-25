// Bottom tab navigator. Tabs grow as modules ship.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MarketplaceStack from './MarketplaceStack';
import SellStack from './SellStack';
import TradesStack from './TradesStack';
import EcoStack from './EcoStack';
import ServicesStack from './ServicesStack';

import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import MFASetupScreen from '../screens/auth/MFASetupScreen';
import MFAVerifyScreen from '../screens/auth/MFAVerifyScreen';
import RequestRoleScreen from '../screens/auth/RequestRoleScreen';

import { colors } from '../config/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabIcon = ({ label, focused }) => (
	<View style={{ alignItems: 'center', justifyContent: 'center' }}>
		<Text
			style={{
				fontSize: 11,
				fontWeight: focused ? '700' : '500',
				color: focused ? colors.primary : colors.textMuted,
			}}
		>
			{label}
		</Text>
	</View>
);

function ProfileStack() {
	return (
		<Stack.Navigator
			screenOptions={{
				headerStyle: { backgroundColor: colors.surface },
				headerTitleStyle: { color: colors.text, fontWeight: '700' },
				headerTintColor: colors.primary,
			}}
		>
			<Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ title: 'My Profile' }} />
			<Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
			<Stack.Screen name="MFASetup" component={MFASetupScreen} options={{ title: 'Enable 2FA' }} />
			<Stack.Screen name="MFAVerify" component={MFAVerifyScreen} options={{ title: 'Verify 2FA' }} />
			<Stack.Screen name="RequestRole" component={RequestRoleScreen} options={{ title: 'Get Verified' }} />
		</Stack.Navigator>
	);
}

export default function MainTabs() {
	return (
		<Tab.Navigator
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarStyle: {
					backgroundColor: colors.surface,
					borderTopColor: colors.border,
					height: 64,
					paddingBottom: 8,
					paddingTop: 8,
				},
			}}
		>
			<Tab.Screen
				name="Marketplace"
				component={MarketplaceStack}
				options={{ tabBarIcon: ({ focused }) => <TabIcon label="Browse" focused={focused} /> }}
			/>
			<Tab.Screen
				name="Sell"
				component={SellStack}
				options={{ tabBarIcon: ({ focused }) => <TabIcon label="Sell" focused={focused} /> }}
			/>
			<Tab.Screen
				name="Trades"
				component={TradesStack}
				options={{ tabBarIcon: ({ focused }) => <TabIcon label="Trades" focused={focused} /> }}
			/>
			<Tab.Screen
				name="Services"
				component={ServicesStack}
				options={{ tabBarIcon: ({ focused }) => <TabIcon label="Services" focused={focused} /> }}
			/>
			<Tab.Screen
				name="Eco"
				component={EcoStack}
				options={{ tabBarIcon: ({ focused }) => <TabIcon label="Eco" focused={focused} /> }}
			/>
			<Tab.Screen
				name="Profile"
				component={ProfileStack}
				options={{ tabBarIcon: ({ focused }) => <TabIcon label="Profile" focused={focused} /> }}
			/>
		</Tab.Navigator>
	);
}
