import mongoose from "mongoose";
import { logger } from "../utils/logger.js";
import { AuthenticationError, NotFoundError } from "../utils/errors.js";

/**
 * Centralized Error Handling Middleware
 * Catches all errors and returns appropriate HTTP responses
 * Prevents information leakage in production
 */

export const errorHandler = (err, req, res, next) => {
	// Default values
	err.statusCode = err.statusCode || 500;
	err.message = err.message || "Internal Server Error";

	// Log error details
	logError(err, req);

	// Handle specific error types
	const errorResponse = formatErrorResponse(err, req);

	// Send response
	res.status(err.statusCode).json(errorResponse);
};

/**
 * Format error response based on environment
 */
const formatErrorResponse = (err, req) => {
	const isDevelopment = process.env.NODE_ENV === "development";
	const isTest = process.env.NODE_ENV === "test";
	const showDetails = isDevelopment || isTest;

	// Base response
	const response = {
		success: false,
		message: err.isOperational ? err.message : "Something went wrong",
	};

	// Add error details in development/test
	if (showDetails) {
		response.error = {
			name: err.name,
			message: err.message,
			stack: err.stack,
		};

		if (err.errors) {
			response.errors = err.errors;
		}

		if (err.code) {
			response.code = err.code;
		}
	}

	// Add request info for debugging
	if (isDevelopment) {
		response.request = {
			method: req.method,
			url: req.originalUrl,
			timestamp: new Date().toISOString(),
		};
	}

	return response;
};

/**
 * Log error with appropriate level
 */
const logError = (err, req) => {
	const errorContext = {
		method: req.method,
		url: req.originalUrl,
		userId: req.userId || "anonymous",
		ip: req.ip,
		userAgent: req.get("User-Agent"),
	};

	// Operational errors (expected business logic errors)
	if (err.isOperational) {
		logger.warn("Operational Error", {
			...errorContext,
			error: {
				name: err.name,
				message: err.message,
				statusCode: err.statusCode,
			},
		});
	}
	// Programming errors or system failures
	else {
		logger.error("System Error", {
			...errorContext,
			error: {
				name: err.name,
				message: err.message,
				stack: err.stack,
			},
		});
	}
};

/**
 * Handle MongoDB CastError (invalid ObjectId)
 */
export const handleCastErrorDB = (err) => {
	const message = `Invalid ${err.path}: ${err.value}`;
	return new (require("../utils/errors.js").ValidationError)(message);
};

/**
 * Handle MongoDB Duplicate Key Error
 */
export const handleDuplicateKeyDB = (err) => {
	const field = Object.keys(err.keyValue)[0];
	const value = err.keyValue[field];
	const message = `${field} "${value}" already exists`;
	return new (require("../utils/errors.js").ConflictError)(message);
};

/**
 * Handle MongoDB Validation Error
 */
export const handleValidationErrorDB = (err) => {
	const errors = Object.values(err.errors).map((el) => ({
		field: el.path,
		message: el.message,
	}));

	const message = `Invalid input data: ${errors.map(e => e.field).join(", ")}`;
	return new (require("../utils/errors.js").ValidationError)(message, errors);
};

/**
 * Handle JWT Errors
 */
export const handleJWTError = () => {
	return new (require("../utils/errors.js").AuthenticationError)("Invalid token. Please log in again.");
};

export const handleJWTExpiredError = () => {
	return new AuthenticationError("Your session has expired. Please log in again.");
};

/**
 * 404 Not Found Handler - Catches undefined routes
 */
export const notFoundHandler = (req, res, next) => {
	next(new NotFoundError(`Route ${req.originalUrl}`));
};

/**
 * Unhandled Rejection Handler (for async errors outside request cycle)
 */
export const handleUnhandledRejection = (error) => {
	logger.error("💥 Unhandled Rejection", {
		error: {
			name: error.name,
			message: error.message,
			stack: error.stack,
		},
	});

	// Shut down gracefully in production
	if (process.env.NODE_ENV === "production") {
		logger.error("💥 Shutting down due to unhandled rejection");
		process.exit(1);
	}
};

/**
 * Uncaught Exception Handler (for synchronous errors outside request cycle)
 */
export const handleUncaughtException = (error) => {
	logger.error("💥 Uncaught Exception", {
		error: {
			name: error.name,
			message: error.message,
			stack: error.stack,
		},
	});

	// Shut down gracefully in production
	if (process.env.NODE_ENV === "production") {
		logger.error("💥 Shutting down due to uncaught exception");
		process.exit(1);
	}
};

export default errorHandler;
