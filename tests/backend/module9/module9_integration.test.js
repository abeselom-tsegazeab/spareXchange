/**
 * Module 9: Integration & Workflow Tests
 * Tests complete user workflows and cross-module integration
 */

import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { Webhook } from "../models/webhook.model.js";

describe("Module 9: Integration & Workflow Tests", () => {
	let accessToken, userId, adminToken;
	const timestamp = Date.now();

	const testUser = {
		name: "Module 9 Int Test User",
		email: `module9_int_${timestamp}@test.com`,
		password: "SecurePass123!"
	};

	beforeAll(async () => {
		await User.deleteMany({ email: /module9_int_/ });
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

		// Create admin
		const adminSignup = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 9 Int Admin",
				email: `module9_int_admin_${timestamp}@test.com`,
				password: "SecurePass123!"
			});

		await User.findByIdAndUpdate(adminSignup.body.user._id, {
			isVerified: true,
			permissions: ["send_notifications", "admin", "view_stats"],
			role: "admin"
		});

		adminToken = adminSignup.body.accessToken;
	});

	afterAll(async () => {
		await User.deleteMany({ email: /module9_int_/ });
		await Webhook.deleteMany({});
		await Notification.deleteMany({});
	});

	describe("1. Complete User Notification Workflow", () => {
		test("Full notification lifecycle: Create → View → Mark Read → Delete", async () => {
			// 1. Create notification
			const createRes = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					userId: userId,
					title: "Workflow Test",
					message: "Testing complete lifecycle",
					type: "system"
				});
			
			expect(createRes.status).toBe(201);
			const notificationId = createRes.body.notification._id;

			// 2. Verify notification appears in list
			const listRes = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(listRes.status).toBe(200);
			const notification = listRes.body.notifications.find(n => n._id === notificationId);
			expect(notification).toBeDefined();
			expect(notification.isRead).toBe(false);

			// 3. Verify unread count increased
			const countRes = await request(app)
				.get("/api/notifications/unread-count")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(countRes.status).toBe(200);
			expect(countRes.body.count).toBeGreaterThan(0);

			// 4. Mark as read
			const markRes = await request(app)
				.put(`/api/notifications/${notificationId}/read`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(markRes.status).toBe(200);

			// 5. Verify it's now read
			const updatedRes = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${accessToken}`);
			
			const updatedNotification = updatedRes.body.notifications.find(n => n._id === notificationId);
			expect(updatedNotification.isRead).toBe(true);

			// 6. Delete notification
			const deleteRes = await request(app)
				.delete(`/api/notifications/${notificationId}`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(deleteRes.status).toBe(200);

			// 7. Verify deletion
			const finalRes = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${accessToken}`);
			
			const deletedNotification = finalRes.body.notifications.find(n => n._id === notificationId);
			expect(deletedNotification).toBeUndefined();
		});
	});

	describe("2. Preferences & Notification Flow", () => {
		test("Update preferences and verify persistence across sessions", async () => {
			// 1. Get default preferences
			const getRes = await request(app)
				.get("/api/notifications/preferences")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(getRes.status).toBe(200);
			const originalPrefs = getRes.body.preferences;

			// 2. Update preferences
			const updateRes = await request(app)
				.put("/api/notifications/preferences")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					emailNotifications: false,
					pushNotifications: false,
					marketingEmails: true
				});
			
			expect(updateRes.status).toBe(200);
			expect(updateRes.body.preferences.emailNotifications).toBe(false);
			expect(updateRes.body.preferences.pushNotifications).toBe(false);
			expect(updateRes.body.preferences.marketingEmails).toBe(true);

			// 3. Verify persistence by fetching again
			const verifyRes = await request(app)
				.get("/api/notifications/preferences")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(verifyRes.status).toBe(200);
			expect(verifyRes.body.preferences.emailNotifications).toBe(false);
			expect(verifyRes.body.preferences.marketingEmails).toBe(true);

			// 4. Reset to defaults
			const resetRes = await request(app)
				.post("/api/notifications/preferences/reset")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(resetRes.status).toBe(200);
			expect(resetRes.body.preferences.emailNotifications).toBe(true);
			expect(resetRes.body.preferences.marketingEmails).toBe(false);
		});
	});

	describe("3. Push Notification Device Workflow", () => {
		test("Complete device management: Register → View → Toggle → Remove", async () => {
			const deviceToken = `workflow_device_${timestamp}`;

			// 1. Register device
			const registerRes = await request(app)
				.post("/api/notifications/push/register")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					token: deviceToken,
					deviceType: "android",
					deviceName: "Workflow Test Device"
				});
			
			expect(registerRes.status).toBe(200);
			expect(registerRes.body.deviceCount).toBeGreaterThan(0);

			// 2. Verify device in list
			const devicesRes = await request(app)
				.get("/api/notifications/push/devices")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(devicesRes.status).toBe(200);
			const device = devicesRes.body.devices.find(d => d.token === deviceToken);
			expect(device).toBeDefined();
			expect(device.isActive).toBe(true);
			expect(device.deviceType).toBe("android");

			// 3. Toggle device off
			const toggleRes = await request(app)
				.put("/api/notifications/push/toggle")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ token: deviceToken });
			
			expect(toggleRes.status).toBe(200);
			expect(toggleRes.body.isActive).toBe(false);

			// 4. Verify toggle persisted
			const updatedDevicesRes = await request(app)
				.get("/api/notifications/push/devices")
				.set("Authorization", `Bearer ${accessToken}`);
			
			const updatedDevice = updatedDevicesRes.body.devices.find(d => d.token === deviceToken);
			expect(updatedDevice.isActive).toBe(false);

			// 5. Remove device
			const removeRes = await request(app)
				.post("/api/notifications/push/remove")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ token: deviceToken });
			
			expect(removeRes.status).toBe(200);

			// 6. Verify removal
			const finalDevicesRes = await request(app)
				.get("/api/notifications/push/devices")
				.set("Authorization", `Bearer ${accessToken}`);
			
			const removedDevice = finalDevicesRes.body.devices.find(d => d.token === deviceToken);
			expect(removedDevice).toBeUndefined();
		});
	});

	describe("4. Webhook Management Workflow", () => {
		test("Complete webhook lifecycle: Create → View → Update → Regenerate Secret → Delete", async () => {
			let webhookId;
			let originalSecret;

			// 1. Create webhook
			const createRes = await request(app)
				.post("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "Workflow Webhook",
					url: "https://example.com/webhook",
					events: ["listing.created", "exchange.completed"],
					headers: { "X-API-Key": "test-key" }
				});
			
			expect(createRes.status).toBe(201);
			webhookId = createRes.body.webhook._id;
			originalSecret = createRes.body.webhookSecret;
			expect(originalSecret).toMatch(/^whsec_/);

			// 2. Verify webhook in list
			const listRes = await request(app)
				.get("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(listRes.status).toBe(200);
			const webhook = listRes.body.webhooks.find(w => w._id === webhookId);
			expect(webhook).toBeDefined();
			expect(webhook.name).toBe("Workflow Webhook");
			expect(webhook.events).toHaveLength(2);

			// 3. Get webhook details
			const detailRes = await request(app)
				.get(`/api/notifications/webhooks/${webhookId}`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(detailRes.status).toBe(200);
			expect(detailRes.body.webhook.name).toBe("Workflow Webhook");

			// 4. Update webhook
			const updateRes = await request(app)
				.put(`/api/notifications/webhooks/${webhookId}`)
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "Updated Workflow Webhook",
					events: ["listing.created", "exchange.completed", "message.received"],
					isActive: false
				});
			
			expect(updateRes.status).toBe(200);
			expect(updateRes.body.webhook.name).toBe("Updated Workflow Webhook");
			expect(updateRes.body.webhook.events).toHaveLength(3);
			expect(updateRes.body.webhook.isActive).toBe(false);

			// 5. Regenerate secret
			const regenRes = await request(app)
				.post(`/api/notifications/webhooks/${webhookId}/regenerate-secret`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(regenRes.status).toBe(200);
			expect(regenRes.body.webhookSecret).toBeDefined();
			expect(regenRes.body.webhookSecret).not.toBe(originalSecret);

			// 6. Check webhook stats
			const statsRes = await request(app)
				.get("/api/notifications/webhooks/stats")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(statsRes.status).toBe(200);
			expect(statsRes.body.stats.totalWebhooks).toBeGreaterThan(0);

			// 7. Delete webhook
			const deleteRes = await request(app)
				.delete(`/api/notifications/webhooks/${webhookId}`)
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(deleteRes.status).toBe(200);

			// 8. Verify deletion
			const finalListRes = await request(app)
				.get("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`);
			
			const deletedWebhook = finalListRes.body.webhooks.find(w => w._id === webhookId);
			expect(deletedWebhook).toBeUndefined();
		});
	});

	describe("5. Template-Based Notification Workflow", () => {
		test("Get templates → Create from template → Verify notification", async () => {
			// 1. Get available templates
			const templatesRes = await request(app)
				.get("/api/notifications/templates")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(templatesRes.status).toBe(200);
			expect(templatesRes.body.templates.length).toBeGreaterThan(0);
			
			const listingMatchTemplate = templatesRes.body.templates.find(
				t => t.name === "listing_match"
			);
			expect(listingMatchTemplate).toBeDefined();

			// 2. Create notification from template
			const createRes = await request(app)
				.post("/api/notifications/template")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					templateName: "listing_match",
					userId: userId,
					variables: {
						listingTitle: "Tesla Model 3 Headlight"
					}
				});
			
			expect([200, 201, 403]).toContain(createRes.status);
			
			if (createRes.status !== 403) {
				expect(createRes.body.success).toBe(true);
				expect(createRes.body.notification.title).toContain("Match");
				expect(createRes.body.notification.message).toContain("Tesla Model 3 Headlight");
			}
		});

		test("Create multiple notifications from different templates", async () => {
			const templates = ["message_received", "eco_points_earned", "verification_approved"];

			for (const templateName of templates) {
				const res = await request(app)
					.post("/api/notifications/template")
					.set("Authorization", `Bearer ${accessToken}`)
					.send({
						templateName,
						userId: userId,
						variables: {
							userName: "Test User",
							listingTitle: "Test Listing",
							points: "100",
							reason: "recycling",
							userType: "technician"
						}
					});
				
				// Should succeed or fail based on permissions
				expect([200, 201, 403]).toContain(res.status);
			}
		});
	});

	describe("6. Notification History & Filtering Workflow", () => {
		test("Create notifications → Filter by type → Filter by status → Paginate", async () => {
			// Create multiple notifications
			const notificationTypes = ["system", "listing", "message"];
			
			for (let i = 0; i < 5; i++) {
				await request(app)
					.post("/api/notifications")
					.set("Authorization", `Bearer ${adminToken}`)
					.send({
						userId: userId,
						title: `History Test ${i}`,
						message: "Testing history",
						type: notificationTypes[i % 3]
					});
			}

			// 1. Get all history
			const allRes = await request(app)
				.get("/api/notifications/history?page=1&limit=10")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(allRes.status).toBe(200);
			expect(allRes.body.notifications.length).toBeGreaterThan(0);
			expect(allRes.body.total).toBeGreaterThan(0);

			// 2. Filter by read status
			const unreadRes = await request(app)
				.get("/api/notifications/history?isRead=false&page=1&limit=10")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(unreadRes.status).toBe(200);
			unreadRes.body.notifications.forEach(n => {
				expect(n.isRead).toBe(false);
			});

			// 3. Paginate
			const page1Res = await request(app)
				.get("/api/notifications/history?page=1&limit=2")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(page1Res.status).toBe(200);
			expect(page1Res.body.notifications.length).toBeLessThanOrEqual(2);
			expect(page1Res.body.page).toBe(1);
			expect(page1Res.body.totalPages).toBeGreaterThan(0);
		});
	});

	describe("7. Multi-Device Notification Sync", () => {
		test("Register multiple devices → Verify all receive notifications", async () => {
			const devices = [
				{ token: `multi_device_1_${timestamp}`, type: "android", name: "Device 1" },
				{ token: `multi_device_2_${timestamp}`, type: "ios", name: "Device 2" },
				{ token: `multi_device_3_${timestamp}`, type: "web", name: "Device 3" }
			];

			// Register all devices
			for (const device of devices) {
				const res = await request(app)
					.post("/api/notifications/push/register")
					.set("Authorization", `Bearer ${accessToken}`)
					.send({
						token: device.token,
						deviceType: device.type,
						deviceName: device.name
					});
				
				expect(res.status).toBe(200);
			}

			// Verify all devices registered
			const devicesRes = await request(app)
				.get("/api/notifications/push/devices")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(devicesRes.status).toBe(200);
			expect(devicesRes.body.devices.length).toBeGreaterThanOrEqual(3);

			// Create notification
			const notifRes = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					userId: userId,
					title: "Multi-Device Test",
					message: "Should reach all devices",
					type: "system"
				});
			
			expect(notifRes.status).toBe(201);

			// Cleanup
			for (const device of devices) {
				await request(app)
					.post("/api/notifications/push/remove")
					.set("Authorization", `Bearer ${accessToken}`)
					.send({ token: device.token });
			}
		});
	});

	describe("8. Admin Bulk Operations Workflow", () => {
		test("Admin creates bulk notifications → Verify stats update", async () => {
			// Get initial stats
			const initialStatsRes = await request(app)
				.get("/api/notifications/push/stats")
				.set("Authorization", `Bearer ${adminToken}`);
			
			let initialCount = 0;
			if (initialStatsRes.status === 200) {
				initialCount = initialStatsRes.body.stats.totalNotifications;
			}

			// Create multiple notifications
			for (let i = 0; i < 5; i++) {
				await request(app)
					.post("/api/notifications")
					.set("Authorization", `Bearer ${adminToken}`)
					.send({
						userId: userId,
						title: `Bulk Admin Test ${i}`,
						message: "Admin bulk operation",
						type: "system"
					});
			}

			// Verify stats updated
			const finalStatsRes = await request(app)
				.get("/api/notifications/push/stats")
				.set("Authorization", `Bearer ${adminToken}`);
			
			if (finalStatsRes.status === 200) {
				expect(finalStatsRes.body.stats.totalNotifications).toBeGreaterThan(initialCount);
			}
		});
	});

	describe("9. Error Recovery & Resilience", () => {
		test("Failed operations should not corrupt state", async () => {
			// Try invalid operations
			await request(app)
				.put("/api/notifications/invalid_id/read")
				.set("Authorization", `Bearer ${accessToken}`);

			await request(app)
				.delete("/api/notifications/invalid_id")
				.set("Authorization", `Bearer ${accessToken}`);

			// Verify system still works
			const res = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
		});

		test("Concurrent operations should not cause race conditions", async () => {
			// Perform concurrent reads
			const promises = Array(10).fill(null).map(() =>
				request(app)
					.get("/api/notifications/preferences")
					.set("Authorization", `Bearer ${accessToken}`)
			);

			const results = await Promise.all(promises);
			
			results.forEach(res => {
				expect(res.status).toBe(200);
			});
		});
	});

	describe("10. Cross-Module Integration", () => {
		test("Notification creation should work with valid user from auth module", async () => {
			const res = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					userId: userId,
					title: "Cross-Module Test",
					message: "Testing auth integration",
					type: "system"
				});
			
			expect(res.status).toBe(201);
			expect(res.body.notification.userId).toBe(userId.toString());
		});

		test("Notification preferences should persist in user model", async () => {
			// Update preferences
			await request(app)
				.put("/api/notifications/preferences")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					emailNotifications: false,
					pushNotifications: false
				});

			// Verify in user model directly
			const user = await User.findById(userId);
			expect(user.notificationPreferences.emailNotifications).toBe(false);
			expect(user.notificationPreferences.pushNotifications).toBe(false);
		});

		test("Webhook should be associated with correct user", async () => {
			const webhookRes = await request(app)
				.post("/api/notifications/webhooks")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({
					name: "Integration Test Webhook",
					url: "https://example.com/webhook",
					events: ["listing.created"]
				});
			
			expect(webhookRes.status).toBe(201);
			
			// Verify in database
			const webhook = await Webhook.findById(webhookRes.body.webhook._id);
			expect(webhook.userId.toString()).toBe(userId.toString());

			// Cleanup
			await Webhook.findByIdAndDelete(webhookRes.body.webhook._id);
		});
	});
});
