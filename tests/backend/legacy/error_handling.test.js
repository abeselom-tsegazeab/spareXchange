import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import {
	AppError,
	NotFoundError,
	ValidationError,
	AuthenticationError,
	AuthorizationError,
	ConflictError,
	BusinessLogicError,
} from "../utils/errors.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import errorHandler, { notFoundHandler } from "../middleware/errorHandler.js";

describe("Error Handling System", () => {
	let app;

	beforeEach(() => {
		app = express();
		app.use(express.json());
	});

	describe("Custom Error Classes", () => {
		it("should create AppError with correct properties", () => {
			const error = new AppError("Custom error", 500);
			expect(error.message).toBe("Custom error");
			expect(error.statusCode).toBe(500);
			expect(error.isOperational).toBe(true);
			expect(error.name).toBe("Error");
		});

		it("should create NotFoundError with 404 status", () => {
			const error = new NotFoundError("Listing");
			expect(error.message).toBe("Listing not found");
			expect(error.statusCode).toBe(404);
			expect(error.name).toBe("NotFoundError");
		});

		it("should create ValidationError with error details", () => {
			const errors = [
				{ field: "email", message: "Invalid email" },
				{ field: "password", message: "Too short" },
			];
			const error = new ValidationError("Invalid input", errors);
			expect(error.message).toBe("Invalid input");
			expect(error.statusCode).toBe(400);
			expect(error.errors).toEqual(errors);
			expect(error.name).toBe("ValidationError");
		});

		it("should create AuthenticationError with 401 status", () => {
			const error = new AuthenticationError("Token expired");
			expect(error.message).toBe("Token expired");
			expect(error.statusCode).toBe(401);
			expect(error.name).toBe("AuthenticationError");
		});

		it("should create AuthorizationError with 403 status", () => {
			const error = new AuthorizationError();
			expect(error.message).toBe("You don't have permission to perform this action");
			expect(error.statusCode).toBe(403);
			expect(error.name).toBe("AuthorizationError");
		});

		it("should create ConflictError with 409 status", () => {
			const error = new ConflictError("Email already exists");
			expect(error.message).toBe("Email already exists");
			expect(error.statusCode).toBe(409);
			expect(error.name).toBe("ConflictError");
		});

		it("should create BusinessLogicError with custom status", () => {
			const error = new BusinessLogicError("Cannot delete", 409);
			expect(error.message).toBe("Cannot delete");
			expect(error.statusCode).toBe(409);
			expect(error.name).toBe("BusinessLogicError");
		});
	});

	describe("Error Handler Middleware", () => {
		it("should handle operational errors correctly", async () => {
			app.get("/test", (req, res, next) => {
				next(new NotFoundError("Resource"));
			});
			app.use(errorHandler);

			const response = await request(app).get("/test");

			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toBe("Resource not found");
			expect(response.body.error).toBeDefined();
		});

		it("should handle validation errors with details", async () => {
			app.get("/test", (req, res, next) => {
				const errors = [{ field: "email", message: "Required" }];
				next(new ValidationError("Invalid input", errors));
			});
			app.use(errorHandler);

			const response = await request(app).get("/test");

			expect(response.status).toBe(400);
			expect(response.body.message).toBe("Invalid input");
			expect(response.body.errors).toEqual([{ field: "email", message: "Required" }]);
		});

		it("should handle non-operational errors with generic message", async () => {
			app.get("/test", (req, res, next) => {
				const error = new Error("System crash");
				error.isOperational = false;
				next(error);
			});
			app.use(errorHandler);

			const response = await request(app).get("/test");

			expect(response.status).toBe(500);
			expect(response.body.message).toBe("Something went wrong");
		});

		it("should handle errors without status code (default to 500)", async () => {
			app.get("/test", (req, res, next) => {
				const error = new Error("Unknown error");
				error.isOperational = false; // Mark as non-operational
				next(error);
			});
			app.use(errorHandler);

			const response = await request(app).get("/test");

			expect(response.status).toBe(500);
			expect(response.body.message).toBe("Something went wrong"); // Non-operational errors show generic message
		});

		it("should handle errors without message (default message)", async () => {
			app.get("/test", (req, res, next) => {
				const error = new Error();
				error.statusCode = 400;
				error.isOperational = false; // Mark as non-operational
				next(error);
			});
			app.use(errorHandler);

			const response = await request(app).get("/test");

			expect(response.status).toBe(400);
			expect(response.body.message).toBe("Something went wrong"); // Non-operational errors show generic message
		});
	});

	describe("Not Found Handler", () => {
		it("should return 404 for undefined routes", async () => {
			app.use(notFoundHandler);
			app.use(errorHandler);

			const response = await request(app).get("/nonexistent");

			expect(response.status).toBe(404);
			expect(response.body.success).toBe(false);
			expect(response.body.message).toContain("Route /nonexistent");
		});
	});

	describe("Async Handler Wrapper", () => {
		it("should catch errors from async functions", async () => {
			app.get(
				"/test",
				asyncHandler(async (req, res) => {
					throw new NotFoundError("Async Resource");
				})
			);
			app.use(errorHandler);

			const response = await request(app).get("/test");

			expect(response.status).toBe(404);
			expect(response.body.message).toBe("Async Resource not found");
		});

		it("should handle successful async operations", async () => {
			app.get(
				"/test",
				asyncHandler(async (req, res) => {
					res.status(200).json({ success: true, data: "test" });
				})
			);

			const response = await request(app).get("/test");

			expect(response.status).toBe(200);
			expect(response.body.success).toBe(true);
			expect(response.body.data).toBe("test");
		});

		it("should handle rejected promises", async () => {
			app.get(
				"/test",
				asyncHandler(async (req, res) => {
					await Promise.reject(new AuthenticationError("Rejected"));
				})
			);
			app.use(errorHandler);

			const response = await request(app).get("/test");

			expect(response.status).toBe(401);
			expect(response.body.message).toBe("Rejected");
		});

		it("should handle synchronous errors", async () => {
			app.get(
				"/test",
				asyncHandler((req, res) => {
					throw new ValidationError("Sync error");
				})
			);
			app.use(errorHandler);

			const response = await request(app).get("/test");

			expect(response.status).toBe(400);
			expect(response.body.message).toBe("Sync error");
		});
	});

	describe("MongoDB Error Transformation", () => {
		it("should handle CastError (invalid ObjectId)", async () => {
			const { handleCastErrorDB } = await import("../middleware/errorHandler.js");

			const castError = new mongoose.Error.CastError(
				"ObjectId",
				"invalid-id",
				"_id"
			);

			const transformedError = handleCastErrorDB(castError);

			expect(transformedError).toBeInstanceOf(ValidationError);
			expect(transformedError.message).toBe("Invalid _id: invalid-id");
			expect(transformedError.statusCode).toBe(400);
		});

		it("should handle DuplicateKeyError", async () => {
			const { handleDuplicateKeyDB } = await import("../middleware/errorHandler.js");

			const duplicateError = {
				code: 11000,
				keyValue: { email: "test@example.com" },
			};

			const transformedError = handleDuplicateKeyDB(duplicateError);

			expect(transformedError.name).toBe("ConflictError");
			expect(transformedError.message).toBe('email "test@example.com" already exists');
			expect(transformedError.statusCode).toBe(409);
		});
	});

	describe("Error Response Format", () => {
		it("should include request info in development", async () => {
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = "development";

			// Create fresh app instance
			const devApp = express();
			devApp.use(express.json());
			devApp.get("/test", (req, res, next) => {
				next(new NotFoundError("Test"));
			});
			devApp.use(errorHandler);

			const response = await request(devApp).get("/test");

			expect(response.body.request).toBeDefined();
			expect(response.body.request.method).toBe("GET");
			expect(response.body.request.url).toBe("/test");

			process.env.NODE_ENV = originalEnv;
		});
	});
});
