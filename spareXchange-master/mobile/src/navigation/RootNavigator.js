import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import SplashScreen from '../screens/SplashScreen';
import { useAuthStore } from '../store/authStore';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const isHydrating = useAuthStore((s) => s.isHydrating);
	const hydrate = useAuthStore((s) => s.hydrate);

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	return (
		<NavigationContainer>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{isHydrating ? (
					<Stack.Screen name="Splash" component={SplashScreen} />
				) : isAuthenticated ? (
					<Stack.Screen name="Main" component={MainTabs} />
				) : (
					<Stack.Screen name="Auth" component={AuthStack} />
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
