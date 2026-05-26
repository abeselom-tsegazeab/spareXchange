/**
 * Custom Error Classes for SpareXchange
 * Provides structured, operational errors with HTTP status codes
 */

/**
 * Base application error class
 */
class AppError extends Error {
	constructor(message, statusCode, isOperational = true) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		this.timestamp = new Date().toISOString();

		// Capture stack trace (excluding constructor call)
		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * Resource Not Found Error (404)
 */
class NotFoundError extends AppError {
	constructor(resource = "Resource") {
		super(`${resource} not found`, 404);
		this.name = "NotFoundError";
	}
}

/**
 * Validation Error (400)
 */
class ValidationError extends AppError {
	constructor(message, errors = []) {
		super(message, 400);
		this.name = "ValidationError";
		this.errors = errors;
	}
}

/**
 * Authentication Error (401)
 */
class AuthenticationError extends AppError {
	constructor(message = "Authentication required") {
		super(message, 401);
		this.name = "AuthenticationError";
	}
}

/**
 * Authorization Error (403)
 */
class AuthorizationError extends AppError {
	constructor(message = "You don't have permission to perform this action") {
		super(message, 403);
		this.name = "AuthorizationError";
	}
}

/**
 * Conflict Error (409)
 */
class ConflictError extends AppError {
	constructor(message = "Resource already exists") {
		super(message, 409);
		this.name = "ConflictError";
	}
}

/**
 * Rate Limit Error (429)
 */
class RateLimitError extends AppError {
	constructor(message = "Too many requests, please try again later") {
		super(message, 429);
		this.name = "RateLimitError";
	}
}

/**
 * Database Error (500)
 */
class DatabaseError extends AppError {
	constructor(message = "Database operation failed") {
		super(message, 500, false); // Not operational - internal error
		this.name = "DatabaseError";
	}
}

/**
 * External Service Error (502)
 */
class ExternalServiceError extends AppError {
	constructor(service, message = "External service unavailable") {
		super(`${service}: ${message}`, 502, false);
		this.name = "ExternalServiceError";
		this.service = service;
	}
}

/**
 * Business Logic Error (400/422)
 */
class BusinessLogicError extends AppError {
	constructor(message, statusCode = 400) {
		super(message, statusCode);
		this.name = "BusinessLogicError";
	}
}

/**
 * Timeout Error (408)
 */
class TimeoutError extends AppError {
	constructor(message = "Request timeout") {
		super(message, 408);
		this.name = "TimeoutError";
	}
}

export {
	AppError,
	NotFoundError,
	ValidationError,
	AuthenticationError,
	AuthorizationError,
	ConflictError,
	RateLimitError,
	DatabaseError,
	ExternalServiceError,
	BusinessLogicError,
	TimeoutError,
};
