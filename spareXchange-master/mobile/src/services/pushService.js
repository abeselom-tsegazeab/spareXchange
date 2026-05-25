// Expo push notification registration — registers token with backend.

import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import { notificationsApi } from '../api/notifications.api';
import { storage, StorageKeys } from '../utils/storage';

Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowAlert: true,
		shouldPlaySound: true,
		shouldSetBadge: true,
	}),
});

export const getPushToken = async () => {
	if (!Device.isDevice) return null;

	const { status: existing } = await Notifications.getPermissionsAsync();
	let finalStatus = existing;
	if (existing !== 'granted') {
		const { status } = await Notifications.requestPermissionsAsync();
		finalStatus = status;
	}
	if (finalStatus !== 'granted') return null;

	try {
		const projectId =
			Constants.expoConfig?.extra?.eas?.projectId ||
			Constants.easConfig?.projectId;
		if (projectId) {
			const expo = await Notifications.getExpoPushTokenAsync({ projectId });
			return expo.data;
		}
	} catch (_) {
		// Fall through to native device token
	}

	try {
		const native = await Notifications.getDevicePushTokenAsync();
		return native.data;
	} catch (_) {
		return null;
	}
};

export const registerPushWithBackend = async () => {
	const token = await getPushToken();
	if (!token) return { success: false, message: 'Push permission or token unavailable' };

	const deviceType = Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web';
	const deviceName = Device.modelName || Device.deviceName || 'Mobile device';

	await notificationsApi.pushRegister({ token, deviceType, deviceName });
	await storage.set(StorageKeys.pushToken, token);

	return { success: true, token };
};

export const unregisterPushFromBackend = async () => {
	const token = await storage.get(StorageKeys.pushToken);
	if (token) {
		try {
			await notificationsApi.pushRemove({ token });
		} catch (_) {}
		await storage.remove(StorageKeys.pushToken);
	}
};
