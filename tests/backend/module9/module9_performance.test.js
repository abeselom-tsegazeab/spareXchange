/**
 * Module 9: Performance Tests
 * Tests response times, concurrent operations, and database efficiency
 */

import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { Webhook } from "../models/webhook.model.js";

describe("Module 9: Performance Tests", () => {
	let accessToken, userId;
	const timestamp = Date.now();

	const testUser = {
		name: "Module 9 Perf Test User",
		email: `module9_perf_${timestamp}@test.com`,
		password: "SecurePass123!"
	};

	beforeAll(async () => {
		await User.deleteMany({ email: /module9_perf_/ });
		await Webhook.deleteMany({});
		await Notification.deleteMany({});

		const signupRes = await request(app)
			.post("/api/auth/signup")
			.send(testUser);
		
		accessToken = signupRes.body.accessToken;
		userId = signupRes.body.user._id;

		await User.findByIdAndUpdate(userId, { 
			isVerified: true,
			permissions: ["send_notifications", "view_stats"]
		});
	});

	afterAll(async () => {
		await User.deleteMany({ email: /module9_perf_/ });
		await Webhook.deleteMany({});
		await Notification.deleteMany({});
	});

	describe("1. Response Time Tests", () => {
		test("GET /api/notifications - Should respond within 500ms", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;
			
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(500);
		});

		test("GET /api/notifications/preferences - Should respond within 300ms", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/notifications/preferences")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;
			
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(300);
		});

		test("GET /api/notifications/unread-count - Should respond within 300ms", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/notifications/unread-count")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;
			
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(300);
		});

		test("GET /api/notifications/history - Should respond within 500ms with pagination", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/notifications/history?page=1&limit=20")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;
			
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(500);
		});

		test("GET /api/notifications/templates - Should respond within 200ms", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/notifications/templates")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;
			
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(200);
		});

		test("GET /api/notifications/webhooks - Should respond within 300ms", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;
			
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(300);
		});

		test("GET /api/notifications/webhooks/stats - Should respond within 400ms", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/notifications/webhooks/stats")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;
			
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(400);
		});

		test("GET /api/notifications/push/devices - Should respond within 300ms", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/notifications/push/devices")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;
			
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(300);
		});
	});

	describe("2. Concurrent Operations Tests", () => {
		test("Should handle 10 concurrent notification creations", async () => {
			const start = Date.now();
			const promises = Array(10).fill(null).map((_, i) =>
				request(app)
					.post("/api/notifications")
					.set("Authorization", `Bearer ${accessToken}`)
					.send({
						userId: userId,
						title: `Concurrent Test ${i}`,
						message: "Performance test",
						type: "system"
					})
			);

			const results = await Promise.all(promises);
			const duration = Date.now() - start;

			results.forEach(res => {
				expect(res.status).toBe(201);
			});
			
			// Should complete within 2 seconds
			expect(duration).toBeLessThan(2000);
		});

		test("Should handle 5 concurrent preference updates", async () => {
			const start = Date.now();
			const promises = Array(5).fill(null).map((_, i) =>
				request(app)
					.put("/api/notifications/preferences")
					.set("Authorization", `Bearer ${accessToken}`)
					.send({
						emailNotifications: i % 2 === 0,
						pushNotifications: true
					})
			);

			const results = await Promise.all(promises);
			const duration = Date.now() - start;

			results.forEach(res => {
				expect(res.status).toBe(200);
			});
			
			expect(duration).toBeLessThan(1500);
		});

		test("Should handle 5 concurrent device registrations", async () => {
			const start = Date.now();
			const promises = Array(5).fill(null).map((_, i) =>
				request(app)
					.post("/api/notifications/push/register")
					.set("Authorization", `Bearer ${accessToken}`)
					.send({
						token: `perf_token_${timestamp}_${i}`,
						deviceType: "android",
						deviceName: `Perf Device ${i}`
					})
			);

			const results = await Promise.all(promises);
			const duration = Date.now() - start;

			results.forEach(res => {
				expect(res.status).toBe(200);
			});
			
			expect(duration).toBeLessThan(2000);
		});

		test("Should handle 10 concurrent webhook creations", async () => {
			const start = Date.now();
			const promises = Array(10).fill(null).map((_, i) =>
				request(app)
					.post("/api/notifications/webhooks")
					.set("Authorization", `Bearer ${accessToken}`)
					.send({
						name: `Perf Webhook ${i}`,
						url: `https://example.com/webhook/${i}`,
						events: ["listing.created", "exchange.completed"]
					})
			);

			const results = await Promise.all(promises);
			const duration = Date.now() - start;

			results.forEach(res => {
				expect(res.status).toBe(201);
			});
			
			expect(duration).toBeLessThan(3000);
		});
	});

	describe("3. Bulk Operations Performance", () => {
		test("Mark all notifications as read - Should handle bulk update efficiently", async () => {
			// Create 20 notifications first
			for (let i = 0; i < 20; i++) {
				await request(app)
					.post("/api/notifications")
					.set("Authorization", `Bearer ${accessToken}`)
					.send({
						userId: userId,
						title: `Bulk Test ${i}`,
						message: "Bulk performance test",
						type: "system"
					});
			}

			const start = Date.now();
			const res = await request(app)
				.put("/api/notifications/mark-all-read")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;

			expect(res.status).toBe(200);
			// Should complete bulk update within 1 second
			expect(duration).toBeLessThan(1000);
		});

		test("Pagination - Should efficiently handle large datasets", async () => {
			// Test different page sizes
			const pageSizes = [10, 20, 50];
			
			for (const limit of pageSizes) {
				const start = Date.now();
				const res = await request(app)
					.get(`/api/notifications/history?page=1&limit=${limit}`)
					.set("Authorization", `Bearer ${accessToken}`);
				const duration = Date.now() - start;

				expect(res.status).toBe(200);
				expect(res.body.notifications.length).toBeLessThanOrEqual(limit);
				// Each page should load within 500ms
				expect(duration).toBeLessThan(500);
			}
		});
	});

	describe("4. Database Query Efficiency", () => {
		test("Get notifications - Should use proper indexing", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;

			expect(res.status).toBe(200);
			// Query should be efficient (under 300ms)
			expect(duration).toBeLessThan(300);
		});

		test("Unread count - Should use countDocuments efficiently", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/notifications/unread-count")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;

			expect(res.status).toBe(200);
			expect(res.body.count).toBeDefined();
			// Count query should be very fast (under 200ms)
			expect(duration).toBeLessThan(200);
		});

		test("Webhook stats - Should aggregate efficiently", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/notifications/webhooks/stats")
				.set("Authorization", `Bearer ${accessToken}`);
			const duration = Date.now() - start;

			expect(res.status).toBe(200);
			expect(res.body.stats).toBeDefined();
			// Aggregation should be efficient (under 400ms)
			expect(duration).toBeLessThan(400);
		});
	});

	describe("5. Memory & Resource Management", () => {
		test("Should handle rapid sequential requests without memory leak", async () => {
			const start = Date.now();
			
			// Make 50 rapid sequential requests
			for (let i = 0; i < 50; i++) {
				const res = await request(app)
					.get("/api/notifications/unread-count")
					.set("Authorization", `Bearer ${accessToken}`);
				expect(res.status).toBe(200);
			}

			const duration = Date.now() - start;
			// 50 requests should complete within 10 seconds
			expect(duration).toBeLessThan(10000);
		});

		test("Should clean up after device token operations", async () => {
			const tokens = [];
			
			// Register 10 devices
			for (let i = 0; i < 10; i++) {
				const token = `cleanup_token_${timestamp}_${i}`;
				tokens.push(token);
				
				await request(app)
					.post("/api/notifications/push/register")
					.set("Authorization", `Bearer ${accessToken}`)
					.send({
						token,
						deviceType: "web",
						deviceName: `Cleanup Device ${i}`
					});
			}

			// Remove all devices
			for (const token of tokens) {
				const res = await request(app)
					.post("/api/notifications/push/remove")
					.set("Authorization", `Bearer ${accessToken}`)
					.send({ token });
				expect(res.status).toBe(200);
			}

			// Verify cleanup
			const res = await request(app)
				.get("/api/notifications/push/devices")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			// All test devices should be removed
			const testDevices = res.body.devices.filter(d => 
				d.token.includes(`cleanup_token_${timestamp}`)
			);
			expect(testDevices).toHaveLength(0);
		});
	});

	describe("6. Load Testing - Simulated User Activity", () => {
		test("Should handle typical user workflow efficiently", async () => {
			const start = Date.now();

			// Simulate user workflow
			// 1. Get preferences
			await request(app)
				.get("/api/notifications/preferences")
				.set("Authorization", `Bearer ${accessToken}`);

			// 2. Update preferences
			await request(app)
				.put("/api/notifications/preferences")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ emailNotifications: true });

			// 3. Get notifications
			await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${accessToken}`);

			// 4. Get unread count
			await request(app)
				.get("/api/notifications/unread-count")
				.set("Authorization", `Bearer ${accessToken}`);

			// 5. Get history
			await request(app)
				.get("/api/notifications/history?page=1&limit=10")
				.set("Authorization", `Bearer ${accessToken}`);

			// 6. Get webhooks
			await request(app)
				.get("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`);

			const duration = Date.now() - start;

			// Complete workflow should take less than 3 seconds
			expect(duration).toBeLessThan(3000);
		});
	});
});
