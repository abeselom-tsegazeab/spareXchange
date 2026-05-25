// Secure persistent storage wrapper.
// Used for JWT access tokens, refresh tokens, and tiny credentials.
// Falls back to AsyncStorage on platforms where SecureStore is unavailable.

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const useSecure = Platform.OS !== 'web';

export const storage = {
	async get(key) {
		try {
			if (useSecure) {
				const v = await SecureStore.getItemAsync(key);
				return v ?? null;
			}
			return await AsyncStorage.getItem(key);
		} catch (e) {
			console.warn('storage.get failed', key, e?.message);
			return null;
		}
	},
	async set(key, value) {
		try {
			if (value == null) return this.remove(key);
			if (useSecure) {
				await SecureStore.setItemAsync(key, String(value));
			} else {
				await AsyncStorage.setItem(key, String(value));
			}
		} catch (e) {
			console.warn('storage.set failed', key, e?.message);
		}
	},
	async remove(key) {
		try {
			if (useSecure) {
				await SecureStore.deleteItemAsync(key);
			} else {
				await AsyncStorage.removeItem(key);
			}
		} catch (e) {
			console.warn('storage.remove failed', key, e?.message);
		}
	},
};

export const StorageKeys = {
	accessToken: 'sx_access_token',
	user: 'sx_user',
};

export default storage;
