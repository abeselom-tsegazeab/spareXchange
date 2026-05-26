import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import CommunicationStack from './CommunicationStack';
import OperationsStack from './OperationsStack';
import CommunityStack from './CommunityStack';
import SplashScreen from '../screens/SplashScreen';
import { useAuthStore } from '../store/authStore';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
	const { navigationTheme } = useTheme();
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const isHydrating = useAuthStore((s) => s.isHydrating);
	const hydrate = useAuthStore((s) => s.hydrate);

	useEffect(() => {
		hydrate();
	}, [hydrate]);

	return (
		<NavigationContainer theme={navigationTheme}>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				{isHydrating ? (
					<Stack.Screen name="Splash" component={SplashScreen} />
				) : isAuthenticated ? (
					<>
						<Stack.Screen name="Main" component={MainTabs} />
						<Stack.Screen name="Communication" component={CommunicationStack} />
						<Stack.Screen name="Operations" component={OperationsStack} />
						<Stack.Screen name="Community" component={CommunityStack} />
					</>
				) : (
					<Stack.Screen name="Auth" component={AuthStack} />
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
