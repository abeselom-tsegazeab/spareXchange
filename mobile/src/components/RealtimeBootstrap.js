import React, { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { startMobileIntegration, stopMobileIntegration } from '../services/realtimeService';

export default function RealtimeBootstrap() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const userId = useAuthStore((s) => s.user?._id);

	useEffect(() => {
		if (isAuthenticated && userId) {
			startMobileIntegration(userId);
			return () => {
				stopMobileIntegration();
			};
		}
		stopMobileIntegration();
		return undefined;
	}, [isAuthenticated, userId]);

	return null;
}
