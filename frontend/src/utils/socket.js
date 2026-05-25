import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.MODE === "development" 
	? "http://localhost:5000" 
	: window.location.origin;

let socket = null;

export const initSocket = (userId) => {
	if (socket?.connected) {
		console.log("Socket already connected");
		return socket;
	}

	socket = io(SOCKET_URL, {
		withCredentials: true,
		autoConnect: true,
		transports: ["websocket", "polling"],
	});

	// Join user's private room
	socket.on("connect", () => {
		console.log("Socket connected:", socket.id);
		if (userId) {
			socket.emit("join", userId);
			console.log(`User ${userId} joined their private room`);
		}
	});

	socket.on("disconnect", () => {
		console.log("Socket disconnected");
	});

	socket.on("connect_error", (error) => {
		console.error("Socket connection error:", error);
	});

	return socket;
};

export const getSocket = () => {
	if (!socket) {
		throw new Error("Socket not initialized. Call initSocket() first.");
	}
	return socket;
};

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect();
		socket = null;
		console.log("Socket disconnected manually");
	}
};

// Event listeners
export const onNewMessage = (callback) => {
	if (socket) {
		socket.on("new_message", callback);
	}
};

export const offNewMessage = () => {
	if (socket) {
		socket.off("new_message");
	}
};

export const onExchangeEvent = (callback) => {
	if (socket) {
		socket.on("exchange:proposed", callback);
		socket.on("exchange:status_updated", callback);
		socket.on("exchange:completed", callback);
		socket.on("exchange:disputed", callback);
		socket.on("exchange:dispute_resolved", callback);
		socket.on("exchange:handshake_ready", callback);
		socket.on("exchange:handshake_regenerated", callback);
		socket.on("exchange:meeting_negotiated", callback);
		socket.on("exchange:expired", callback);
	}
};

export const offExchangeEvents = () => {
	if (socket) {
		socket.off("exchange:proposed");
		socket.off("exchange:status_updated");
		socket.off("exchange:completed");
		socket.off("exchange:disputed");
		socket.off("exchange:dispute_resolved");
		socket.off("exchange:handshake_ready");
		socket.off("exchange:handshake_regenerated");
		socket.off("exchange:meeting_negotiated");
		socket.off("exchange:expired");
	}
};
