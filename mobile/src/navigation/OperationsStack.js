import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OperationsHomeScreen from '../screens/operations/OperationsHomeScreen';
import AnalyticsHubScreen from '../screens/operations/AnalyticsHubScreen';
import ReportsListScreen from '../screens/operations/ReportsListScreen';
import ReportDetailScreen from '../screens/operations/ReportDetailScreen';
import AdminJobsScreen from '../screens/operations/AdminJobsScreen';
import { useStackScreenDefaults } from './navigationStyles';

const Stack = createNativeStackNavigator();

export default function OperationsStack() {
	const hdr = useStackScreenDefaults();
	return (
		<Stack.Navigator
			screenOptions={{
				...hdr,
			}}
		>
			<Stack.Screen name="OperationsHome" component={OperationsHomeScreen} options={{ title: 'Operations' }} />
			<Stack.Screen name="AnalyticsHub" component={AnalyticsHubScreen} options={{ title: 'Analytics' }} />
			<Stack.Screen name="ReportsList" component={ReportsListScreen} options={{ title: 'Reports' }} />
			<Stack.Screen name="ReportDetail" component={ReportDetailScreen} options={{ title: 'Report detail' }} />
			<Stack.Screen name="AdminJobs" component={AdminJobsScreen} options={{ title: 'Admin jobs' }} />
		</Stack.Navigator>
	);
}
