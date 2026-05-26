import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import http from "http";
import { initSocket } from "./utils/socket.js";
import { logger, httpLogger } from "./utils/logger.js";
import errorHandler, { notFoundHandler, handleUnhandledRejection, handleUncaughtException } from "./middleware/errorHandler.js";

import { connectDB } from "./db/connectDB.js";
import { startExpiryCron, startSavedSearchCron } from "./services/cron.service.js";
import "./models/ecoPointTransaction.model.js"; // Ensure ledger model is registered

import authRoutes from "./routes/auth.route.js";
import listingRoutes from "./routes/listing.route.js";
import technicianRequestRoutes from "./routes/technicianRequest.route.js";
import recyclingSubmissionRoutes from "./routes/recyclingSubmission.v2.route.js";
import notificationRoutes from "./routes/notification.route.js";
import messageRoutes from "./routes/message.route.js";
import exchangeRoutes from "./routes/exchange.route.js";
import reviewRoutes from "./routes/review.route.js";
import adminRoutes from "./routes/admin.route.js";
import userRoutes from "./routes/user.route.js";
import disputeRoutes from "./routes/dispute.route.js";
import cartRoutes from "./routes/cart.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));

app.use(express.json({ limit: '50mb' })); // allows us to parse incoming requests:req.body (increased for image uploads)
app.use(express.urlencoded({ limit: '50mb', extended: true })); // for parsing URL-encoded data
app.use(cookieParser()); // allows us to parse incoming cookies

// Security Middleware
app.use(helmet());

// Rate Limiting
// Disable rate limiting in test environment for faster test execution
const isTestEnv = process.env.NODE_ENV === "test";

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: isTestEnv ? 10000 : 100, // Much higher limit for tests
	message: "Too many requests from this IP, please try again after 15 minutes",
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req, res) => isTestEnv, // Skip rate limiting entirely in test environment
});

app.use("/api/auth", authLimiter);
app.use("/api/users", authLimiter);

// Strict limiter for recycling to prevent point farming
const recyclingLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 10, // Limit each IP to 10 submissions per hour
	message: "Too many recycling submissions from this IP, please try again after an hour",
	standardHeaders: true,
	legacyHeaders: false,
});
app.use("/api/recycling-submissions", recyclingLimiter);

// Serve uploaded files statically - MUST be before routes
const uploadsPath = path.join(__dirname, "backend", "uploads");
app.use("/uploads", express.static(uploadsPath));
console.log("✓ Uploads directory served at:", uploadsPath);

// HTTP Request Logging (after routes, before error handler)
app.use(httpLogger);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/technician-requests", technicianRequestRoutes);
app.use("/api/recycling-submissions", recyclingSubmissionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/exchanges", exchangeRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/disputes", disputeRoutes);
app.use("/api/cart", cartRoutes);

// 404 Handler - Must be after all routes
app.use(notFoundHandler);

// Global Error Handler - Must be last
app.use(errorHandler);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "index.html"));
	});
}

const server = http.createServer(app);
initSocket(server);

// Handle uncaught exceptions and rejections
process.on("uncaughtException", handleUncaughtException);
process.on("unhandledRejection", handleUnhandledRejection);

if (process.env.NODE_ENV !== "test") {
	server.listen(PORT, () => {
		connectDB();
		startExpiryCron();
		startSavedSearchCron();
		logger.info(`🚀 Server is running on port: ${PORT}`);
		logger.info(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
	});
}

export { app, server };