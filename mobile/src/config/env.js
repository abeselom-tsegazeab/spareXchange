// API endpoint configuration.
// Override API_BASE_URL via an .env or by editing the constant below.
//
// IMPORTANT for physical devices (Expo Go) on your LAN:
//   Replace `http://10.0.2.2:5000` (Android emulator) or `localhost`
//   with your PC's LAN IP, e.g. `http://192.168.1.42:5000`.
//   See mobile/docs/SETUP_AND_TESTING.md for details.

import Constants from 'expo-constants';

// Try to resolve a sensible default. Order:
// 1. EXPO_PUBLIC_API_URL (env var via app.json extra or .env)
// 2. Manifest extra.apiUrl
// 3. Detected debugger host (Expo dev server) port 5000
// 4. Hardcoded fallback for Android emulator
const getDefaultApiUrl = () => {
	const fromEnv = process.env.EXPO_PUBLIC_API_URL;
	if (fromEnv) return fromEnv;

	const extra = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};
	if (extra.apiUrl) return extra.apiUrl;

	const debuggerHost =
		Constants?.expoConfig?.hostUri ||
		Constants?.manifest?.debuggerHost ||
		Constants?.expoGoConfig?.debuggerHost;

	if (debuggerHost) {
		const host = debuggerHost.split(':')[0];
		return `http://${host}:5000`;
	}

	return 'http://10.0.2.2:5000'; // Android emulator localhost mapping
};

export const API_ORIGIN = getDefaultApiUrl();
export const API_BASE_URL = `${API_ORIGIN}/api`;
export const SOCKET_URL = API_ORIGIN;

// Backend may return either absolute Cloudinary URLs (start with http) or
// local-fallback paths like `/uploads/verification/abc.jpg`. The latter must
// be served from the backend host to render in the mobile app.
export const resolveAssetUrl = (url) => {
	if (!url) return null;
	if (typeof url !== 'string') return url;
	if (url.startsWith('http') || url.startsWith('data:')) return url;
	if (url.startsWith('/')) return `${API_ORIGIN}${url}`;
	return url;
};

export default {
	API_ORIGIN,
	API_BASE_URL,
	SOCKET_URL,
	resolveAssetUrl,
};
