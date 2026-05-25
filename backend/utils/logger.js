import winston from "winston";
import path from "path";
import fs from "fs";

// Ensure logs directory exists
const logsDir = path.join(path.resolve(), "backend", "logs");
if (!fs.existsSync(logsDir)) {
	fs.mkdirSync(logsDir, { recursive: true });
}

// Define log format
const logFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.errors({ stack: true }),
	winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
		let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
		
		// Add metadata if present
		if (Object.keys(meta).length > 0) {
			log += "\n" + JSON.stringify(meta, null, 2);
		}
		
		// Add stack trace for errors
		if (stack) {
			log += "\n" + stack;
		}
		
		return log;
	})
);

// JSON format for file logs (easier to parse)
const jsonFormat = winston.format.combine(
	winston.format.timestamp(),
	winston.format.errors({ stack: true }),
	winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	format: logFormat,
	defaultMeta: { service: "sparexchange-api" },
	transports: [
		// Error log - only errors
		new winston.transports.File({
			filename: path.join(logsDir, "error.log"),
			level: "error",
			format: jsonFormat,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),

		// Combined log - all levels
		new winston.transports.File({
			filename: path.join(logsDir, "combined.log"),
			format: jsonFormat,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),

		// HTTP access log
		new winston.transports.File({
			filename: path.join(logsDir, "http.log"),
			format: jsonFormat,
			maxsize: 10485760, // 10MB
			maxFiles: 10,
		}),
	],
});

// Console logging in development
if (process.env.NODE_ENV !== "production") {
	logger.add(
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.printf(({ timestamp, level, message, ...meta }) => {
					const metaStr = Object.keys(meta).length > 0 
						? " " + JSON.stringify(meta, null, 2) 
						: "";
					return `${timestamp} [${level}]: ${message}${metaStr}`;
				})
			),
		})
	);
} else {
	// Production: Console with JSON format for log aggregators
	logger.add(
		new winston.transports.Console({
			format: jsonFormat,
		})
	);
}

// Create child loggers for different modules
export const createLogger = (module) => {
	return logger.child({ module });
};

// Pre-defined module loggers
export const authLogger = createLogger("auth");
export const listingLogger = createLogger("listing");
export const exchangeLogger = createLogger("exchange");
export const userLogger = createLogger("user");
export const notificationLogger = createLogger("notification");
export const matchingLogger = createLogger("matching");

// HTTP request logger middleware
export const httpLogger = (req, res, next) => {
	const start = Date.now();

	res.on("finish", () => {
		const duration = Date.now() - start;
		const logData = {
			method: req.method,
			url: req.originalUrl,
			statusCode: res.statusCode,
			duration: `${duration}ms`,
			ip: req.ip,
			userAgent: req.get("User-Agent"),
			userId: req.userId || "anonymous",
		};

		// Log based on status code
		if (res.statusCode >= 500) {
			logger.error("HTTP 5xx Error", logData);
		} else if (res.statusCode >= 400) {
			logger.warn("HTTP 4xx Client Error", logData);
		} else {
			logger.info("HTTP Request", logData);
		}

		// Also write to HTTP log
		logger.log({
			level: "info",
			message: "HTTP",
			...logData,
		});
	});

	next();
};

export { logger };
export default logger;
