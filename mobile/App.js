import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import RootNavigator from './src/navigation/RootNavigator';
import RealtimeBootstrap from './src/components/RealtimeBootstrap';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

function ThemedChrome() {
	const { isDark } = useTheme();
	return (
		<>
			<RealtimeBootstrap />
			<RootNavigator />
			<StatusBar style={isDark ? 'light' : 'dark'} />
		</>
	);
}

export default function App() {
	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<SafeAreaProvider>
				<ThemeProvider>
					<ThemedChrome />
				</ThemeProvider>
			</SafeAreaProvider>
		</GestureHandlerRootView>
	);
}
