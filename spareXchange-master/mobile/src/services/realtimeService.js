// Wires Socket.io events to Zustand stores for live updates.

import { initSocket, disconnectSocket, onSocketEvent, offSocketEvent } from '../utils/socket';
import { registerPushWithBackend, unregisterPushFromBackend } from './pushService';
import { useNotificationsStore } from '../store/notificationsStore';
import { useMessagesStore } from '../store/messagesStore';
import { useExchangesStore } from '../store/exchangesStore';

let startedForUserId = null;
const handlers = [];

const addHandler = (event, fn) => {
	onSocketEvent(event, fn);
	handlers.push({ event, fn });
};

const clearHandlers = () => {
	handlers.forEach(({ event, fn }) => offSocketEvent(event, fn));
	handlers.length = 0;
};

export const startMobileIntegration = async (userId) => {
	if (!userId || startedForUserId === String(userId)) return;
	await stopMobileIntegration();

	startedForUserId = String(userId);
	initSocket(startedForUserId);

	try {
		await registerPushWithBackend();
	} catch (_) {
		// Push is best-effort in dev / simulators
	}

	const onNewMessage = (payload) => {
		useMessagesStore.getState().fetchConversations();
		const from = payload?.from;
		if (from) {
			const thread = useMessagesStore.getState().messages;
			if (thread?.length) {
				useMessagesStore.getState().fetchThread(String(from));
			}
		}
	};

	const onNewNotification = () => {
		useNotificationsStore.getState().fetchUnreadCount();
		useNotificationsStore.getState().fetchNotifications();
	};

	const onExchangeEvent = () => {
		useExchangesStore.getState().fetchExchanges();
	};

	addHandler('new_message', onNewMessage);
	addHandler('new_notification', onNewNotification);
	addHandler('exchange:proposed', onExchangeEvent);
	addHandler('exchange:status_updated', onExchangeEvent);
	addHandler('exchange:counter_offered', onExchangeEvent);
	addHandler('exchange:completed', onExchangeEvent);
	addHandler('exchange:disputed', onExchangeEvent);
	addHandler('exchange:dispute_resolved', onExchangeEvent);
	addHandler('exchange:handshake_ready', onExchangeEvent);
	addHandler('exchange:handshake_regenerated', onExchangeEvent);
	addHandler('exchange:meeting_negotiated', onExchangeEvent);
	addHandler('exchange:expired', onExchangeEvent);
};

export const stopMobileIntegration = async () => {
	clearHandlers();
	disconnectSocket();
	await unregisterPushFromBackend();
	startedForUserId = null;
	useNotificationsStore.getState().clearNotifications();
};
