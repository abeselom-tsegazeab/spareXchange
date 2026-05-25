/**
 * Async Error Handler Wrapper
 * Eliminates repetitive try-catch blocks in route handlers
 * Automatically forwards errors to Express error middleware
 */

/**
 * Wraps async route handlers to catch errors automatically
 * @param {Function} fn - Async route handler function
 * @returns {Function} Express middleware function
 */
export const asyncHandler = (fn) => {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

/**
 * Alternative: Catch specific errors and transform them
 * @param {Function} fn - Async route handler function
 * @param {Object} errorMap - Map of error types to custom messages
 */
export const asyncHandlerWithTransform = (fn, errorMap = {}) => {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch((error) => {
			// Check if error should be transformed
			const transform = errorMap[error.name] || errorMap[error.code];
			if (transform) {
				const transformedError = typeof transform === "function" 
					? transform(error) 
					: transform;
				return next(transformedError);
			}
			next(error);
		});
	};
};

/**
 * Wrapper with timeout protection
 * @param {Function} fn - Async route handler function
 * @param {Number} timeout - Timeout in milliseconds (default: 30s)
 */
export const asyncHandlerWithTimeout = (fn, timeout = 30000) => {
	return (req, res, next) => {
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => {
				reject(new Error("Request timeout"));
			}, timeout);
		});

		Promise.race([Promise.resolve(fn(req, res, next)), timeoutPromise])
			.catch(next);
	};
};

export default asyncHandler;
