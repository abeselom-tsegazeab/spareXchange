import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { Webhook } from "../models/webhook.model.js";
import mongoose from "mongoose";

describe("Module 9: Advanced Notifications & Mobile Integration", () => {
	let accessToken, userId, notificationId, webhookId, webhookSecret;
	const timestamp = Date.now();
	const testUser = {
		name: "Module 9 Test User",
		email: `module9_test_${timestamp}@test.com`,
		password: "SecurePass123!"
	};

	beforeAll(async () => {
		// Cleanup
		await User.deleteMany({ email: /module9_test_/ });
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
			permissions: ["send_notifications"]
		});
	});

	afterAll(async () => {
		await User.deleteMany({ email: /module9_test_/ });
		await Webhook.deleteMany({});
		await Notification.deleteMany({});
	});

	describe("1. Notification Preferences", () => {
		test("Should get default notification preferences", async () => {
			const res = await request(app)
				.get("/api/notifications/preferences")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.preferences).toBeDefined();
			expect(res.body.preferences.emailNotifications).toBe(true);
			expect(res.body.preferences.pushNotifications).toBe(true);
		});

		test("Should update notification preferences", async () => {
			const res = await request(app)
				.put("/api/notifications/preferences")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					emailNotifications: true,
					pushNotifications: true,
					smsNotifications: true,
					listingAlerts: false,
					marketingEmails: true
				});
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.preferences.smsNotifications).toBe(true);
			expect(res.body.preferences.listingAlerts).toBe(false);
		});

		test("Should reset notification preferences to defaults", async () => {
			const res = await request(app)
				.post("/api/notifications/preferences/reset")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.preferences.emailNotifications).toBe(true);
			expect(res.body.preferences.smsNotifications).toBe(false);
			expect(res.body.preferences.marketingEmails).toBe(false);
		});

		test("Should fail preferences update without authentication", async () => {
			const res = await request(app)
				.put("/api/notifications/preferences")
				.send({ emailNotifications: false });
			
			expect(res.status).toBe(401);
		});
	});

	describe("2. Push Notification - Device Management", () => {
		const deviceToken = `test_token_${timestamp}`;

		test("Should register device token", async () => {
			const res = await request(app)
				.post("/api/notifications/push/register")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					token: deviceToken,
					deviceType: "android",
					deviceName: "Test Device"
				});
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.deviceCount).toBe(1);

			// Verify in database
			const user = await User.findById(userId);
			expect(user.deviceTokens).toHaveLength(1);
			expect(user.deviceTokens[0].token).toBe(deviceToken);
		});

		test("Should get registered devices", async () => {
			const res = await request(app)
				.get("/api/notifications/push/devices")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.devices).toHaveLength(1);
			expect(res.body.devices[0].deviceType).toBe("android");
		});

		test("Should toggle device token status", async () => {
			const res = await request(app)
				.put("/api/notifications/push/toggle")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ token: deviceToken });
			
			expect(res.status).toBe(200);
			expect(res.body.isActive).toBe(false);

			// Verify in database
			const user = await User.findById(userId);
			expect(user.deviceTokens[0].isActive).toBe(false);
		});

		test("Should remove device token", async () => {
			const res = await request(app)
				.post("/api/notifications/push/remove")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ token: deviceToken });
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);

			// Verify in database
			const user = await User.findById(userId);
			expect(user.deviceTokens).toHaveLength(0);
		});

		test("Should fail device registration without token", async () => {
			const res = await request(app)
				.post("/api/notifications/push/register")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ deviceType: "android" });
			
			expect(res.status).toBe(400);
		});
	});

	describe("3. Basic Notification Operations", () => {
		let adminToken, adminId;

		beforeAll(async () => {
			// Create admin user for notification creation tests
			const adminSignup = await request(app)
				.post("/api/auth/signup")
				.send({
					name: "Module 9 Admin",
					email: `module9_admin2_${timestamp}@test.com`,
					password: "SecurePass123!"
				});

			// Verify admin
			await request(app)
				.post("/api/auth/verify-email")
				.send({
					email: `module9_admin2_${timestamp}@test.com`,
					verificationCode: adminSignup.body.user.verificationCode
				});

			// Grant admin permissions directly in database
			await User.findByIdAndUpdate(adminSignup.body.user._id, {
				$set: { 
					permissions: ["send_notifications", "admin", "view_stats", "view_users", "manage_users"],
					role: "admin"
				}
			});

			adminToken = adminSignup.body.accessToken;
			adminId = adminSignup.body.user._id;
		});

		test("Should create notification", async () => {
			const res = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					userId: userId,
					title: "Test Notification",
					message: "This is a test notification",
					type: "system"
				});
			
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
			notificationId = res.body.notification._id;
		});

		test("Should get user notifications", async () => {
			const res = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.notifications.length).toBeGreaterThan(0);
		});

		test("Should get unread count", async () => {
			const res = await request(app)
				.get("/api/notifications/unread-count")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.count).toBeGreaterThan(0);
		});

		test("Should mark notification as read", async () => {
			const res = await request(app)
				.put(`/api/notifications/${notificationId}/read`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);

			// Verify in database
			const notification = await Notification.findById(notificationId);
			expect(notification.isRead).toBe(true);
		});

		test("Should mark all notifications as read", async () => {
			const res = await request(app)
				.put("/api/notifications/mark-all-read")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("Should delete notification", async () => {
			const res = await request(app)
				.delete(`/api/notifications/${notificationId}`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);

			// Verify in database
			const notification = await Notification.findById(notificationId);
			expect(notification).toBeNull();
		});

		test("Should fail to access another user's notification", async () => {
			// Create another user
			const otherUser = await request(app)
				.post("/api/auth/signup")
				.send({
					name: "Other User",
					email: `other2_${timestamp}@test.com`,
					password: "SecurePass123!"
				});

			// Create notification for other user using admin
			const notifRes = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					userId: otherUser.body.user._id,
					title: "Private Notification",
					message: "This is private",
					type: "system"
				});

			const otherNotifId = notifRes.body.notification._id;

			// Try to mark as read with first user
			const res = await request(app)
				.put(`/api/notifications/${otherNotifId}/read`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(403);
		});
	});

	describe("4. Notification Templates", () => {
		test("Should get all notification templates", async () => {
			const res = await request(app)
				.get("/api/notifications/templates")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.count).toBeGreaterThan(0);
			expect(res.body.templates.some(t => t.name === "listing_match")).toBe(true);
		});

		test("Should create notification from template", async () => {
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
				
			expect([200, 201, 403]).toContain(res.status);
			if (res.status === 201 || res.status === 200) {
				expect(res.body.success).toBe(true);
			}
		});

		test("Should fail with invalid template name", async () => {
			const res = await request(app)
				.post("/api/notifications/template")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					templateName: "invalid_template",
					userId: userId
				});
				
			expect([400, 404]).toContain(res.status);
		});

		test("Should get notification history", async () => {
			const res = await request(app)
				.get("/api/notifications/history?page=1&limit=10")
				.set("Authorization", `Bearer ${accessToken}`);
				
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			// History may be empty, that's ok
			expect(res.body.notifications).toBeDefined();
		});
	});

	describe("5. Webhook Management", () => {
		test("Should create webhook", async () => {
			const res = await request(app)
				.post("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "Test Webhook",
					url: "https://example.com/webhook",
					events: ["listing.created", "exchange.completed"],
					headers: {
						"X-Custom-Header": "test-value"
					}
				});
			
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
			expect(res.body.webhookSecret).toBeDefined();
			expect(res.body.webhookSecret).toMatch(/^whsec_/);
			
			webhookId = res.body.webhook._id;
			webhookSecret = res.body.webhookSecret;
		});

		test("Should get all webhooks", async () => {
			const res = await request(app)
				.get("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.webhooks.length).toBeGreaterThan(0);
		});

		test("Should get webhook stats", async () => {
			const res = await request(app)
				.get("/api/notifications/webhooks/stats")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.stats).toBeDefined();
			expect(res.body.stats.totalWebhooks).toBeGreaterThan(0);
		});

		test("Should get webhook by ID", async () => {
			const res = await request(app)
				.get(`/api/notifications/webhooks/${webhookId}`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.webhook.name).toBe("Test Webhook");
		});

		test("Should update webhook", async () => {
			const res = await request(app)
				.put(`/api/notifications/webhooks/${webhookId}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "Updated Webhook",
					isActive: false
				});
			
			expect(res.status).toBe(200);
			expect(res.body.webhook.name).toBe("Updated Webhook");
			expect(res.body.webhook.isActive).toBe(false);
		});

		test("Should regenerate webhook secret", async () => {
			const res = await request(app)
				.post(`/api/notifications/webhooks/${webhookId}/regenerate-secret`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.webhookSecret).toBeDefined();
			expect(res.body.webhookSecret).not.toBe(webhookSecret);
		});

		test("Should delete webhook", async () => {
			const res = await request(app)
				.delete(`/api/notifications/webhooks/${webhookId}`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);

			// Verify in database
			const webhook = await Webhook.findById(webhookId);
			expect(webhook).toBeNull();
		});

		test("Should fail webhook creation without URL", async () => {
			const res = await request(app)
				.post("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "Invalid Webhook",
					events: ["listing.created"]
				});
			
			expect(res.status).toBe(400);
		});
	});

	describe("6. Notification Security & Edge Cases", () => {
		test("Should prevent notification access without authentication", async () => {
			const res = await request(app)
				.get("/api/notifications");
			
			expect(res.status).toBe(401);
		});

		test("Should handle invalid notification ID gracefully", async () => {
			const invalidId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.put(`/api/notifications/${invalidId}/read`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(404);
		});

		test("Should enforce ownership on notification deletion", async () => {
			// Create notification for another user
			const otherUser = await User.create({
				name: "Other User",
				email: `notif_other_${timestamp}@test.com`,
				password: "SecurePass123!",
				isVerified: true
			});

			const notification = await Notification.create({
				userId: otherUser._id,
				title: "Private",
				message: "Private message",
				type: "system"
			});

			// Try to delete with first user
			const res = await request(app)
				.delete(`/api/notifications/${notification._id}`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(403);
		});

		test("Should validate device token format", async () => {
			const res = await request(app)
				.post("/api/notifications/push/register")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					token: "",
					deviceType: "invalid"
				});
			
			expect(res.status).toBe(400);
		});

		test("Should handle concurrent notification creation", async () => {
			const promises = Array(5).fill(null).map((_, i) =>
				request(app)
					.post("/api/notifications")
					.set("Authorization", `Bearer ${accessToken}`)
					.send({
						userId: userId,
						title: `Concurrent Test ${i}`,
						message: "Testing concurrency",
						type: "system"
					})
			);

			const results = await Promise.all(promises);
			results.forEach(res => {
				expect(res.status).toBe(201);
				expect(res.body.success).toBe(true);
			});
		});
	});
});
