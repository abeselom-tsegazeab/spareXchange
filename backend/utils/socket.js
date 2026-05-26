import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
	io = new Server(server, {
		cors: {
			origin: process.env.CLIENT_URL || "http://localhost:5173",
			methods: ["GET", "POST"],
			credentials: true,
		},
	});

	io.on("connection", (socket) => {
		console.log("A user connected:", socket.id);

		// Join a private room for the user
		socket.on("join", (userId) => {
			socket.join(userId);
			console.log(`User ${userId} joined their private room.`);
		});

		socket.on("disconnect", () => {
			console.log("User disconnected:", socket.id);
		});
	});

	return io;
};

export const getIO = () => {
	if (!io) {
		throw new Error("Socket.io not initialized!");
	}
	return io;
};

export const emitToUser = (userId, event, data) => {
	try {
		if (io) {
			io.to(userId).emit(event, data);
		}
	} catch (error) {
		console.error('Socket emit error:', error.message);
	}
};
