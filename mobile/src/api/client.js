// Axios instance for SpareXChange backend.
// - Sends JWT as `Authorization: Bearer <token>` (works because backend's
//   verifyToken middleware reads both cookies AND that header).
// - Normalises errors so screens can show server messages reliably.

import axios from 'axios';
import { API_BASE_URL } from '../config/env';
import { storage, StorageKeys } from '../utils/storage';

let inMemoryToken = null;
let onUnauthorizedHandler = null;

export const setAccessToken = (token) => {
	inMemoryToken = token || null;
};

export const getAccessToken = () => inMemoryToken;

export const setOnUnauthorized = (fn) => {
	onUnauthorizedHandler = typeof fn === 'function' ? fn : null;
};

const api = axios.create({
	baseURL: API_BASE_URL,
	timeout: 20000,
	headers: { Accept: 'application/json' },
});

api.interceptors.request.use(async (config) => {
	if (!inMemoryToken) {
		const stored = await storage.get(StorageKeys.accessToken);
		if (stored) inMemoryToken = stored;
	}
	if (inMemoryToken) {
		config.headers = config.headers || {};
		config.headers.Authorization = `Bearer ${inMemoryToken}`;
	}
	return config;
});

api.interceptors.response.use(
	(response) => response,
	async (error) => {
		const status = error?.response?.status;
		const data = error?.response?.data;

		const normalized = {
			status: status || 0,
			message:
				data?.message ||
				(error?.code === 'ECONNABORTED'
					? 'The request timed out. Check that the backend is reachable from your device.'
					: error?.message || 'Network error'),
			data,
			isNetworkError: !error?.response,
		};

		if (status === 401 && onUnauthorizedHandler) {
			try {
				await onUnauthorizedHandler();
			} catch (_) {
				// swallow
			}
		}

		return Promise.reject(normalized);
	}
);

export default api;
