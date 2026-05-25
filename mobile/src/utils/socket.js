// Socket.io client for real-time events (messages, exchanges, notifications).

import { io } from 'socket.io-client';
import { SOCKET_URL } from '../config/env';

let socket = null;

export const initSocket = (userId) => {
	if (socket?.connected) return socket;

	socket = io(SOCKET_URL, {
		autoConnect: true,
		transports: ['websocket', 'polling'],
	});

	socket.on('connect', () => {
		if (userId) socket.emit('join', String(userId));
	});

	return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
	}
};

export const onSocketEvent = (event, handler) => {
	if (socket) socket.on(event, handler);
};

export const offSocketEvent = (event, handler) => {
	if (socket) socket.off(event, handler);
};

export default { initSocket, getSocket, disconnectSocket, onSocketEvent, offSocketEvent };
