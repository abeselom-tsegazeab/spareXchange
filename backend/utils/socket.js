import { Server } from "socket.io";

let io;
const allowedSocketOrigins = [
	"http://localhost:5173",
	"https://sparexchange-two.vercel.app",
	"https://sparexchange.netlify.app",
	process.env.CLIENT_URL,
	process.env.FRONTEND_URL,
].filter(Boolean);



export const initSocket = (server) => {
	io = new Server(server, {
		cors: {
			origin: (origin, callback) => {
				if (!origin) {
					callback(null, true);
					return;
				}

				const normalizedOrigin = origin.replace(/\/$/, "");
				const isAllowed = allowedSocketOrigins.some((allowedOrigin) => allowedOrigin.replace(/\/$/, "") === normalizedOrigin);

				if (isAllowed) {
					callback(null, true);
				} else {
					callback(new Error(`Socket origin not allowed: ${origin}`));
				}
			},
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
