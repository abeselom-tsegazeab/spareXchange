import { logger, createLogger, httpLogger } from "../utils/logger.js";
import express from "express";
import request from "supertest";

describe("Logging System", () => {
	describe("Logger Instance", () => {
		it("should create logger instance", () => {
			expect(logger).toBeDefined();
			expect(typeof logger.info).toBe("function");
			expect(typeof logger.error).toBe("function");
			expect(typeof logger.warn).toBe("function");
			expect(typeof logger.debug).toBe("function");
		});

		it("should have default metadata", () => {
			expect(logger.defaultMeta).toBeDefined();
			expect(logger.defaultMeta.service).toBe("sparexchange-api");
		});
	});

	describe("Module-Specific Loggers", () => {
		it("should create child logger with module name", () => {
			const customLogger = createLogger("test-module");
			expect(customLogger).toBeDefined();
			expect(typeof customLogger.info).toBe("function");
		});

		it("should export predefined module loggers", async () => {
			const loggers = await import("../utils/logger.js");

			expect(loggers.authLogger).toBeDefined();
			expect(loggers.listingLogger).toBeDefined();
			expect(loggers.exchangeLogger).toBeDefined();
			expect(loggers.userLogger).toBeDefined();
			expect(loggers.notificationLogger).toBeDefined();
			expect(loggers.matchingLogger).toBeDefined();
		});
	});

	describe("Log Levels", () => {
		it("should support info level logging", () => {
			// Should not throw
			expect(() => {
				logger.info("Test info message", { test: "data" });
			}).not.toThrow();
		});

		it("should support error level logging", () => {
			expect(() => {
				logger.error("Test error message", { error: "details" });
			}).not.toThrow();
		});

		it("should support warn level logging", () => {
			expect(() => {
				logger.warn("Test warn message", { warning: "details" });
			}).not.toThrow();
		});

		it("should support debug level logging", () => {
			expect(() => {
				logger.debug("Test debug message", { debug: "data" });
			}).not.toThrow();
		});
	});

	describe("HTTP Logger Middleware", () => {
		it("should log successful requests", async () => {
			const app = express();
			app.use(httpLogger);
			app.get("/test", (req, res) => {
				res.status(200).json({ success: true });
			});

			const response = await request(app).get("/test");
			expect(response.status).toBe(200);
		});

		it("should log client errors (4xx)", async () => {
			const app = express();
			app.use(httpLogger);
			app.get("/test", (req, res) => {
				res.status(404).json({ error: "Not found" });
			});

			const response = await request(app).get("/test");
			expect(response.status).toBe(404);
		});

		it("should log server errors (5xx)", async () => {
			const app = express();
			app.use(httpLogger);
			app.get("/test", (req, res) => {
				res.status(500).json({ error: "Server error" });
			});

			const response = await request(app).get("/test");
			expect(response.status).toBe(500);
		});

		it("should capture request duration", async () => {
			const app = express();
			app.use(httpLogger);
			app.get("/slow", (req, res) => {
				setTimeout(() => {
					res.status(200).json({ success: true });
				}, 50);
			});

			const response = await request(app).get("/slow");
			expect(response.status).toBe(200);
		});

		it("should capture user ID when authenticated", async () => {
			const app = express();
			app.use(httpLogger);
			app.get("/test", (req, res) => {
				req.userId = "user123";
				res.status(200).json({ success: true });
			});

			const response = await request(app).get("/test");
			expect(response.status).toBe(200);
		});
	});

	describe("Log Format", () => {
		it("should include timestamp in logs", () => {
			expect(() => {
				logger.info("Timestamp test");
			}).not.toThrow();
		});

		it("should handle metadata objects", () => {
			const metadata = {
				userId: "123",
				action: "create",
				resource: "listing",
			};

			expect(() => {
				logger.info("Action logged", metadata);
			}).not.toThrow();
		});

		it("should handle error objects with stack traces", () => {
			const error = new Error("Test error");
			error.stack = "Error: Test error\n    at test.js:1:1";

			expect(() => {
				logger.error("Error logged", { error });
			}).not.toThrow();
		});
	});
});
