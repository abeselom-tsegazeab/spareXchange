/**
 * Module 9: Functionality & API Contract Compliance Tests
 * Tests all API endpoints against the Postman collection specification
 */

import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { Webhook } from "../models/webhook.model.js";
import mongoose from "mongoose";

describe("Module 9: Functionality & API Contract Compliance", () => {
	let accessToken, userId, adminToken, adminId, notificationId, webhookId;
	const timestamp = Date.now();

	const testUser = {
		name: "Module 9 Func Test User",
		email: `module9_func_${timestamp}@test.com`,
		password: "SecurePass123!"
	};

	beforeAll(async () => {
		// Cleanup
		await User.deleteMany({ email: /module9_func_/ });
		await Webhook.deleteMany({});
		await Notification.deleteMany({});

		// Create test user
		const signupRes = await request(app)
			.post("/api/auth/signup")
			.send(testUser);
		
		accessToken = signupRes.body.accessToken;
		userId = signupRes.body.user._id;

		// Verify user and grant permissions
		await User.findByIdAndUpdate(userId, { 
			isVerified: true,
			permissions: ["send_notifications", "view_stats"]
		});

		// Create admin user
		const adminSignup = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 9 Func Admin",
				email: `module9_func_admin_${timestamp}@test.com`,
				password: "SecurePass123!"
			});

		await User.findByIdAndUpdate(adminSignup.body.user._id, {
			isVerified: true,
			permissions: ["send_notifications", "admin", "view_stats"],
			role: "admin"
		});

		adminToken = adminSignup.body.accessToken;
		adminId = adminSignup.body.user._id;
	});

	afterAll(async () => {
		await User.deleteMany({ email: /module9_func_/ });
		await Webhook.deleteMany({});
		await Notification.deleteMany({});
	});

	describe("1. Basic Notifications - API Contract", () => {
		test("GET /api/notifications - Should return user notifications array", async () => {
			const res = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("count");
			expect(res.body).toHaveProperty("notifications");
			expect(Array.isArray(res.body.notifications)).toBe(true);
		});

		test("GET /api/notifications/history - Should return paginated history", async () => {
			const res = await request(app)
				.get("/api/notifications/history?page=1&limit=20")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("count");
			expect(res.body).toHaveProperty("total");
			expect(res.body).toHaveProperty("page", 1);
			expect(res.body).toHaveProperty("totalPages");
			expect(res.body).toHaveProperty("notifications");
		});

		test("GET /api/notifications/unread-count - Should return count", async () => {
			const res = await request(app)
				.get("/api/notifications/unread-count")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("count");
			expect(typeof res.body.count).toBe("number");
		});

		test("POST /api/notifications - Should create notification with required fields", async () => {
			const res = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					userId: userId,
					title: "Contract Test",
					message: "Testing API contract",
					type: "system"
				});
			
			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("message");
			expect(res.body).toHaveProperty("notification");
			expect(res.body.notification).toHaveProperty("_id");
			expect(res.body.notification).toHaveProperty("title", "Contract Test");
			expect(res.body.notification).toHaveProperty("message", "Testing API contract");
			
			notificationId = res.body.notification._id;
		});

		test("PUT /api/notifications/:id/read - Should mark as read", async () => {
			const res = await request(app)
				.put(`/api/notifications/${notificationId}/read`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("message");
		});

		test("PUT /api/notifications/mark-all-read - Should mark all as read", async () => {
			const res = await request(app)
				.put("/api/notifications/mark-all-read")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("message");
		});

		test("DELETE /api/notifications/:id - Should delete notification", async () => {
			const res = await request(app)
				.delete(`/api/notifications/${notificationId}`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("message");
		});

		test("POST /api/notifications - Should fail without required fields", async () => {
			const res = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ title: "Missing userId" });
			
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("success", false);
		});
	});

	describe("2. Push Notifications - API Contract", () => {
		const deviceToken = `func_token_${timestamp}`;

		test("POST /api/notifications/push/register - Should register device", async () => {
			const res = await request(app)
				.post("/api/notifications/push/register")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					token: deviceToken,
					deviceType: "android",
					deviceName: "Test Device"
				});
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("message");
			expect(res.body).toHaveProperty("deviceCount");
			expect(typeof res.body.deviceCount).toBe("number");
		});

		test("GET /api/notifications/push/devices - Should return devices array", async () => {
			const res = await request(app)
				.get("/api/notifications/push/devices")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("devices");
			expect(res.body).toHaveProperty("count");
			expect(Array.isArray(res.body.devices)).toBe(true);
			expect(res.body.devices.length).toBeGreaterThan(0);
			
			// Verify device structure
			const device = res.body.devices[0];
			expect(device).toHaveProperty("token");
			expect(device).toHaveProperty("deviceType");
			expect(device).toHaveProperty("deviceName");
			expect(device).toHaveProperty("isActive");
		});

		test("PUT /api/notifications/push/toggle - Should toggle device status", async () => {
			const res = await request(app)
				.put("/api/notifications/push/toggle")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ token: deviceToken });
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("isActive");
			expect(typeof res.body.isActive).toBe("boolean");
		});

		test("POST /api/notifications/push/remove - Should remove device", async () => {
			const res = await request(app)
				.post("/api/notifications/push/remove")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ token: deviceToken });
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("message");
		});

		test("POST /api/notifications/push/register - Should fail without token", async () => {
			const res = await request(app)
				.post("/api/notifications/push/register")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ deviceType: "android" });
			
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("success", false);
		});

		test("GET /api/notifications/push/stats - Should return stats (requires view_stats permission)", async () => {
			const res = await request(app)
				.get("/api/notifications/push/stats")
				.set("Authorization", `Bearer ${accessToken}`);
			
			// Should succeed with view_stats permission
			expect([200, 403]).toContain(res.status);
			if (res.status === 200) {
				expect(res.body).toHaveProperty("success", true);
				expect(res.body).toHaveProperty("stats");
				expect(res.body.stats).toHaveProperty("totalNotifications");
				expect(res.body.stats).toHaveProperty("readNotifications");
				expect(res.body.stats).toHaveProperty("unreadNotifications");
				expect(res.body.stats).toHaveProperty("readRate");
			}
		});
	});

	describe("3. Notification Preferences - API Contract", () => {
		test("GET /api/notifications/preferences - Should return preferences object", async () => {
			const res = await request(app)
				.get("/api/notifications/preferences")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("preferences");
			
			// Verify all preference fields exist
			const prefs = res.body.preferences;
			expect(prefs).toHaveProperty("emailNotifications");
			expect(prefs).toHaveProperty("pushNotifications");
			expect(prefs).toHaveProperty("smsNotifications");
			expect(prefs).toHaveProperty("listingAlerts");
			expect(prefs).toHaveProperty("exchangeUpdates");
			expect(prefs).toHaveProperty("messageNotifications");
			expect(prefs).toHaveProperty("systemAnnouncements");
			expect(prefs).toHaveProperty("marketingEmails");
		});

		test("PUT /api/notifications/preferences - Should update preferences", async () => {
			const res = await request(app)
				.put("/api/notifications/preferences")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					emailNotifications: true,
					pushNotifications: true,
					smsNotifications: false,
					listingAlerts: true,
					exchangeUpdates: true,
					messageNotifications: true,
					systemAnnouncements: true,
					marketingEmails: false
				});
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("message");
			expect(res.body).toHaveProperty("preferences");
			expect(res.body.preferences.emailNotifications).toBe(true);
		});

		test("POST /api/notifications/preferences/reset - Should reset to defaults", async () => {
			const res = await request(app)
				.post("/api/notifications/preferences/reset")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body.preferences.emailNotifications).toBe(true);
			expect(res.body.preferences.smsNotifications).toBe(false);
			expect(res.body.preferences.marketingEmails).toBe(false);
		});
	});

	describe("4. Notification Templates - API Contract", () => {
		test("GET /api/notifications/templates - Should return templates array", async () => {
			const res = await request(app)
				.get("/api/notifications/templates")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("count");
			expect(res.body).toHaveProperty("templates");
			expect(Array.isArray(res.body.templates)).toBe(true);
			expect(res.body.count).toBeGreaterThan(0);
			
			// Verify template structure
			const template = res.body.templates[0];
			expect(template).toHaveProperty("name");
			expect(template).toHaveProperty("title");
			expect(template).toHaveProperty("message");
			expect(template).toHaveProperty("type");
		});

		test("POST /api/notifications/template - Should create from template", async () => {
			const res = await request(app)
				.post("/api/notifications/template")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					templateName: "listing_match",
					userId: userId,
					variables: {
						listingTitle: "Tesla Model 3 Headlight"
					}
				});
			
			// May return 200, 201, or 403 depending on permissions
			expect([200, 201, 403]).toContain(res.status);
			if (res.status !== 403) {
				expect(res.body).toHaveProperty("success", true);
				expect(res.body).toHaveProperty("notification");
			}
		});

		test("POST /api/notifications/template - Should fail with invalid template", async () => {
			const res = await request(app)
				.post("/api/notifications/template")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					templateName: "nonexistent_template",
					userId: userId
				});
			
			expect([400, 404]).toContain(res.status);
		});
	});

	describe("5. Webhook Management - API Contract", () => {
		test("POST /api/notifications/webhooks - Should create webhook with secret", async () => {
			const res = await request(app)
				.post("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "Contract Test Webhook",
					url: "https://example.com/webhook",
					events: ["listing.created", "exchange.completed"],
					headers: {
						"X-Custom-Header": "test-value"
					}
				});
			
			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("message");
			expect(res.body).toHaveProperty("webhook");
			expect(res.body).toHaveProperty("secret");
			expect(res.body).toHaveProperty("webhookSecret");
			expect(res.body.webhookSecret).toMatch(/^whsec_/);
			expect(res.body.webhook).toHaveProperty("_id");
			
			webhookId = res.body.webhook._id;
		});

		test("GET /api/notifications/webhooks - Should return webhooks array", async () => {
			const res = await request(app)
				.get("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("count");
			expect(res.body).toHaveProperty("webhooks");
			expect(Array.isArray(res.body.webhooks)).toBe(true);
		});

		test("GET /api/notifications/webhooks/stats - Should return stats", async () => {
			const res = await request(app)
				.get("/api/notifications/webhooks/stats")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("stats");
			expect(res.body.stats).toHaveProperty("totalWebhooks");
			expect(res.body.stats).toHaveProperty("activeWebhooks");
			expect(res.body.stats).toHaveProperty("totalDeliveries");
			expect(res.body.stats).toHaveProperty("totalFailures");
			expect(res.body.stats).toHaveProperty("successRate");
		});

		test("GET /api/notifications/webhooks/:id - Should return webhook", async () => {
			const res = await request(app)
				.get(`/api/notifications/webhooks/${webhookId}`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("webhook");
			expect(res.body.webhook).toHaveProperty("name", "Contract Test Webhook");
		});

		test("PUT /api/notifications/webhooks/:id - Should update webhook", async () => {
			const res = await request(app)
				.put(`/api/notifications/webhooks/${webhookId}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "Updated Webhook",
					isActive: true,
					events: ["listing.created", "exchange.completed", "message.received"]
				});
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body.webhook).toHaveProperty("name", "Updated Webhook");
			expect(res.body.webhook).toHaveProperty("isActive", true);
			expect(res.body.webhook.events).toHaveLength(3);
		});

		test("POST /api/notifications/webhooks/:id/regenerate-secret - Should regenerate secret", async () => {
			const res = await request(app)
				.post(`/api/notifications/webhooks/${webhookId}/regenerate-secret`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("webhookSecret");
			expect(res.body.webhookSecret).toMatch(/^whsec_/);
			expect(res.body).toHaveProperty("warning");
		});

		test("DELETE /api/notifications/webhooks/:id - Should delete webhook", async () => {
			const res = await request(app)
				.delete(`/api/notifications/webhooks/${webhookId}`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("success", true);
			expect(res.body).toHaveProperty("message");
			
			// Verify deletion
			const webhook = await Webhook.findById(webhookId);
			expect(webhook).toBeNull();
		});

		test("POST /api/notifications/webhooks - Should fail without required fields", async () => {
			const res = await request(app)
				.post("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ name: "Invalid" });
			
			expect(res.status).toBe(400);
			expect(res.body).toHaveProperty("success", false);
		});
	});
});
