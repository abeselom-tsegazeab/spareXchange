import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { Review } from "../models/review.model.js";
import { Dispute } from "../models/dispute.model.js";
import { Exchange } from "../models/exchange.model.js";
import { Notification } from "../models/notification.model.js";
import mongoose from "mongoose";

describe("Module 7: Comprehensive Functional & Performance Tests", () => {
	let user1Token, user1Id, user2Token, user2Id, adminToken, adminId;
	const timestamp = Date.now();

	beforeAll(async () => {
		// Cleanup
		await User.deleteMany({ email: /module7_perf_/ });
		await Message.deleteMany({});
		await Review.deleteMany({});
		await Dispute.deleteMany({});
		await Exchange.deleteMany({});
		await Notification.deleteMany({});

		// Create user 1
		const user1Res = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 7 Perf User 1",
				email: `module7_perf_user1_${timestamp}@test.com`,
				password: "SecurePass123!"
			});
		
		user1Token = user1Res.body.accessToken;
		user1Id = user1Res.body.user._id;
		await User.findByIdAndUpdate(user1Id, { isVerified: true });

		// Create user 2
		const user2Res = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 7 Perf User 2",
				email: `module7_perf_user2_${timestamp}@test.com`,
				password: "SecurePass123!"
			});
		
		user2Token = user2Res.body.accessToken;
		user2Id = user2Res.body.user._id;
		await User.findByIdAndUpdate(user2Id, { isVerified: true });

		// Create admin user
		const adminRes = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 7 Perf Admin",
				email: `module7_perf_admin_${timestamp}@test.com`,
				password: "SecurePass123!"
			});
		
		adminToken = adminRes.body.accessToken;
		adminId = adminRes.body.user._id;
		await User.findByIdAndUpdate(adminId, { 
			isVerified: true, 
			userType: "admin",
			permissions: ["view_disputes", "resolve_disputes", "view_stats", "send_notifications"]
		});
	});

	afterAll(async () => {
		await User.deleteMany({ email: /module7_perf_/ });
		await Message.deleteMany({});
		await Review.deleteMany({});
		await Dispute.deleteMany({});
		await Exchange.deleteMany({});
		await Notification.deleteMany({});
	});

	describe("1. Exchange Handshake Verification", () => {
		let acceptedExchangeId;

		beforeEach(async () => {
			// Create an accepted exchange for handshake testing
			const exchange = await Exchange.create({
				buyerId: user1Id,
				sellerId: user2Id,
				listingId: new mongoose.Types.ObjectId(),
				status: "accepted",
				exchangeType: "sale",
				agreedPrice: 100,
				meetingDetails: {
					location: "Test Location",
					time: new Date()
				}
			});
			acceptedExchangeId = exchange._id;
		});

		afterEach(async () => {
			await Exchange.deleteMany({ _id: acceptedExchangeId });
		});

		test("Seller should generate handshake token successfully", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${acceptedExchangeId}/handshake/generate`)
				.set("Authorization", `Bearer ${user2Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.token).toBeDefined();
			expect(res.body.token.length).toBe(6);
			expect(res.body.expiresAt).toBeDefined();
			expect(res.body.regenerationCount).toBe(1);
		});

		test("Buyer should not be able to generate handshake token", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${acceptedExchangeId}/handshake/generate`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(403);
			expect(res.body.message).toMatch(/only the seller/i);
		});

		test("Buyer should verify handshake token successfully", async () => {
			// Generate token first
			const genRes = await request(app)
				.put(`/api/exchanges/${acceptedExchangeId}/handshake/generate`)
				.set("Authorization", `Bearer ${user2Token}`);
			
			const token = genRes.body.token;

			// Verify token
			const res = await request(app)
				.put(`/api/exchanges/${acceptedExchangeId}/handshake/verify`)
				.set("Authorization", `Bearer ${user1Token}`)
				.send({ token });
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toMatch(/handshake verified/i);
		});

		test("Should fail with invalid handshake token", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${acceptedExchangeId}/handshake/verify`)
				.set("Authorization", `Bearer ${user1Token}`)
				.send({ token: "000000" });
			
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/invalid/i);
		});

		test("Should fail if seller tries to verify their own token", async () => {
			// Generate token
			await request(app)
				.put(`/api/exchanges/${acceptedExchangeId}/handshake/generate`)
				.set("Authorization", `Bearer ${user2Token}`);

			// Seller tries to verify
			const res = await request(app)
				.put(`/api/exchanges/${acceptedExchangeId}/handshake/verify`)
				.set("Authorization", `Bearer ${user2Token}`)
				.send({ token: "123456" });
			
			expect(res.status).toBe(403);
			expect(res.body.message).toMatch(/only the buyer/i);
		});

		test("Seller should regenerate handshake token", async () => {
			// Generate initial token
			await request(app)
				.put(`/api/exchanges/${acceptedExchangeId}/handshake/generate`)
				.set("Authorization", `Bearer ${user2Token}`);

			// Regenerate
			const res = await request(app)
				.put(`/api/exchanges/${acceptedExchangeId}/handshake/regenerate`)
				.set("Authorization", `Bearer ${user2Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.regenerationCount).toBe(2);
			expect(res.body.remainingAttempts).toBe(3);
		});

		test("Should enforce max 5 token regenerations", async () => {
			// Generate and regenerate 5 times
			await request(app)
				.put(`/api/exchanges/${acceptedExchangeId}/handshake/generate`)
				.set("Authorization", `Bearer ${user2Token}`);

			for (let i = 0; i < 4; i++) {
				await request(app)
					.put(`/api/exchanges/${acceptedExchangeId}/handshake/regenerate`)
					.set("Authorization", `Bearer ${user2Token}`);
			}

			// 6th attempt should fail
			const res = await request(app)
				.put(`/api/exchanges/${acceptedExchangeId}/handshake/regenerate`)
				.set("Authorization", `Bearer ${user2Token}`);
			
			expect(res.status).toBe(429);
			expect(res.body.message).toMatch(/maximum.*regenerations/i);
		});

		test("Should fail handshake on non-accepted exchange", async () => {
			const pendingExchange = await Exchange.create({
				buyerId: user1Id,
				sellerId: user2Id,
				listingId: new mongoose.Types.ObjectId(),
				status: "pending",
				exchangeType: "sale"
			});

			const res = await request(app)
				.put(`/api/exchanges/${pendingExchange._id}/handshake/generate`)
				.set("Authorization", `Bearer ${user2Token}`);
			
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/not in a valid state/i);

			await Exchange.deleteOne({ _id: pendingExchange._id });
		});
	});

	describe("2. Exchange Dispute Opening", () => {
		let activeExchangeId;

		beforeEach(async () => {
			const exchange = await Exchange.create({
				buyerId: user1Id,
				sellerId: user2Id,
				listingId: new mongoose.Types.ObjectId(),
				status: "accepted",
				exchangeType: "sale",
				agreedPrice: 100
			});
			activeExchangeId = exchange._id;
		});

		afterEach(async () => {
			await Exchange.deleteMany({ _id: activeExchangeId });
		});

		test("User should open dispute on exchange successfully", async () => {
			const res = await request(app)
				.post(`/api/exchanges/${activeExchangeId}/dispute`)
				.set("Authorization", `Bearer ${user1Token}`)
				.send({ reason: "Item condition does not match the agreed details" });
			
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toMatch(/dispute opened/i);
		});

		test("Should fail to open dispute without reason", async () => {
			const res = await request(app)
				.post(`/api/exchanges/${activeExchangeId}/dispute`)
				.set("Authorization", `Bearer ${user1Token}`)
				.send({});
			
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/reason is required/i);
		});

		test("Should fail to open dispute on non-existent exchange", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.post(`/api/exchanges/${fakeId}/dispute`)
				.set("Authorization", `Bearer ${user1Token}`)
				.send({ reason: "Test reason" });
			
			expect(res.status).toBe(404);
		});

		test("Should fail to open duplicate dispute", async () => {
			// Open first dispute
			await request(app)
				.post(`/api/exchanges/${activeExchangeId}/dispute`)
				.set("Authorization", `Bearer ${user1Token}`)
				.send({ reason: "First dispute" });

			// Try to open second
			const res = await request(app)
				.post(`/api/exchanges/${activeExchangeId}/dispute`)
				.set("Authorization", `Bearer ${user1Token}`)
				.send({ reason: "Second dispute" });
			
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/already open/i);
		});

		test("Admin should resolve exchange dispute", async () => {
			// Open dispute
			await request(app)
				.post(`/api/exchanges/${activeExchangeId}/dispute`)
				.set("Authorization", `Bearer ${user1Token}`)
				.send({ reason: "Test dispute" });

			// Resolve
			const res = await request(app)
				.put(`/api/exchanges/${activeExchangeId}/dispute/resolve`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					resolution: "After review, completion is approved.",
					outcome: "buyer_wins"
				});
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toMatch(/dispute resolved/i);
		});

		test("Non-participant should not open dispute", async () => {
			const thirdUserRes = await request(app)
				.post("/api/auth/signup")
				.send({
					name: "Third User",
					email: `module7_perf_third_${timestamp}@test.com`,
					password: "SecurePass123!"
				});
			
			const thirdToken = thirdUserRes.body.accessToken;

			const res = await request(app)
				.post(`/api/exchanges/${activeExchangeId}/dispute`)
				.set("Authorization", `Bearer ${thirdToken}`)
				.send({ reason: "Unauthorized dispute" });
			
			expect(res.status).toBe(403);
		});
	});

	describe("3. Performance Tests - Messaging", () => {
		test("Should handle 50 concurrent message sends", async () => {
			const startTime = Date.now();
			
			const promises = Array(50).fill(null).map((_, i) =>
				request(app)
					.post("/api/messages")
					.set("Authorization", `Bearer ${user1Token}`)
					.send({
						receiverId: user2Id,
						content: `Performance test message ${i}`
					})
			);

			const results = await Promise.all(promises);
			const endTime = Date.now();
			const duration = endTime - startTime;

			// All should succeed
			results.forEach(res => {
				expect(res.status).toBe(201);
			});

			// Should complete within reasonable time (< 5 seconds)
			expect(duration).toBeLessThan(5000);
			console.log(`50 concurrent messages sent in ${duration}ms`);
		});

		test("Should retrieve large conversation efficiently", async () => {
			// Send 100 messages
			for (let i = 0; i < 100; i++) {
				await request(app)
					.post("/api/messages")
					.set("Authorization", `Bearer ${user1Token}`)
					.send({
						receiverId: user2Id,
						content: `Message ${i}`
					});
			}

			const startTime = Date.now();
			const res = await request(app)
				.get(`/api/messages/${user2Id}`)
				.set("Authorization", `Bearer ${user1Token}`);
			const endTime = Date.now();

			expect(res.status).toBe(200);
			expect(res.body.messages.length).toBeGreaterThanOrEqual(100);
			
			const duration = endTime - startTime;
			expect(duration).toBeLessThan(2000); // Should retrieve in < 2 seconds
			console.log(`Retrieved ${res.body.messages.length} messages in ${duration}ms`);
		});

		test("Should handle rapid conversation list fetches", async () => {
			const startTime = Date.now();
			
			const promises = Array(20).fill(null).map(() =>
				request(app)
					.get("/api/messages/conversations")
					.set("Authorization", `Bearer ${user1Token}`)
			);

			const results = await Promise.all(promises);
			const endTime = Date.now();

			results.forEach(res => {
				expect(res.status).toBe(200);
			});

			const duration = endTime - startTime;
			expect(duration).toBeLessThan(3000);
			console.log(`20 conversation fetches completed in ${duration}ms`);
		});
	});

	describe("4. Performance Tests - Reviews", () => {
		test("Should handle multiple review submissions", async () => {
			const startTime = Date.now();
			
			// Create 10 completed exchanges and reviews
			for (let i = 0; i < 10; i++) {
				const exchange = await Exchange.create({
					buyerId: user1Id,
					sellerId: user2Id,
					listingId: new mongoose.Types.ObjectId(),
					status: "fully_completed",
					exchangeType: "sale",
					agreedPrice: i * 10
				});

				await request(app)
					.post("/api/reviews")
					.set("Authorization", `Bearer ${user1Token}`)
					.send({
						revieweeId: user2Id,
						exchangeId: exchange._id,
						rating: (i % 5) + 1,
						comment: `Review ${i}`
					});
			}

			const endTime = Date.now();
			const duration = endTime - startTime;
			
			expect(duration).toBeLessThan(5000);
			console.log(`10 reviews created in ${duration}ms`);

			// Verify trust score calculation
			const user = await User.findById(user2Id);
			expect(user.totalReviews).toBeGreaterThanOrEqual(10);
		});

		test("Should retrieve user reviews efficiently", async () => {
			const startTime = Date.now();
			
			const res = await request(app)
				.get(`/api/reviews/user/${user2Id}`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			const endTime = Date.now();

			expect(res.status).toBe(200);
			expect(res.body.data.length).toBeGreaterThan(0);
			
			const duration = endTime - startTime;
			expect(duration).toBeLessThan(1000);
			console.log(`Retrieved ${res.body.data.length} reviews in ${duration}ms`);
		});
	});

	describe("5. Performance Tests - Notifications", () => {
		test("Should handle bulk notification creation", async () => {
			const startTime = Date.now();
			
			const promises = Array(30).fill(null).map((_, i) =>
				request(app)
					.post("/api/notifications")
					.set("Authorization", `Bearer ${adminToken}`)
					.send({
						userId: user1Id,
						title: `Notification ${i}`,
						message: `Test notification ${i}`,
						type: "system"
					})
			);

			const results = await Promise.all(promises);
			const endTime = Date.now();

			results.forEach(res => {
				expect(res.status).toBe(201);
			});

			const duration = endTime - startTime;
			expect(duration).toBeLessThan(5000);
			console.log(`30 notifications created in ${duration}ms`);
		});

		test("Should retrieve notifications efficiently", async () => {
			const startTime = Date.now();
			
			const res = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${user1Token}`);
			
			const endTime = Date.now();

			expect(res.status).toBe(200);
			
			const duration = endTime - startTime;
			expect(duration).toBeLessThan(1000);
			console.log(`Retrieved notifications in ${duration}ms`);
		});

		test("Should mark all notifications as read quickly", async () => {
			const res = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${user1Token}`);
			
			const count = res.body.notifications.length;

			const startTime = Date.now();
			
			const markRes = await request(app)
				.put("/api/notifications/mark-all-read")
				.set("Authorization", `Bearer ${user1Token}`);
			
			const endTime = Date.now();

			expect(markRes.status).toBe(200);
			
			const duration = endTime - startTime;
			expect(duration).toBeLessThan(1000);
			console.log(`Marked ${count} notifications as read in ${duration}ms`);
		});
	});

	describe("6. Integration Tests - Complete Workflows", () => {
		test("Complete messaging workflow: send, receive, read, list", async () => {
			// User 1 sends message
			const sendRes = await request(app)
				.post("/api/messages")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					receiverId: user2Id,
					content: "Hello from integration test!"
				});
			
			expect(sendRes.status).toBe(201);
			const messageId = sendRes.body.data._id;

			// User 2 receives and views conversation
			const convRes = await request(app)
				.get(`/api/messages/${user1Id}`)
				.set("Authorization", `Bearer ${user2Token}`);
			
			expect(convRes.status).toBe(200);
			expect(convRes.body.messages.length).toBeGreaterThan(0);

			// User 2 marks as read
			const readRes = await request(app)
				.put(`/api/messages/read/${user1Id}`)
				.set("Authorization", `Bearer ${user2Token}`);
			
			expect(readRes.status).toBe(200);

			// Check conversations list
			const listRes = await request(app)
				.get("/api/messages/conversations")
				.set("Authorization", `Bearer ${user2Token}`);
			
			expect(listRes.status).toBe(200);
			expect(listRes.body.conversations.length).toBeGreaterThan(0);
		});

		test("Complete review workflow: complete exchange, review, verify score", async () => {
			// Create completed exchange
			const exchange = await Exchange.create({
				buyerId: user1Id,
				sellerId: user2Id,
				listingId: new mongoose.Types.ObjectId(),
				status: "fully_completed",
				exchangeType: "sale",
				agreedPrice: 200
			});

			// User 1 reviews User 2
			const reviewRes = await request(app)
				.post("/api/reviews")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					revieweeId: user2Id,
					exchangeId: exchange._id,
					rating: 5,
					comment: "Excellent transaction!"
				});
			
			expect(reviewRes.status).toBe(201);

			// Verify trust score updated
			const user = await User.findById(user2Id);
			expect(user.trustScore).toBeGreaterThanOrEqual(4);
			expect(user.totalReviews).toBeGreaterThanOrEqual(1);

			// Fetch reviews
			const reviewsRes = await request(app)
				.get(`/api/reviews/user/${user2Id}`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(reviewsRes.status).toBe(200);
			expect(reviewsRes.body.data.length).toBeGreaterThan(0);
		});

		test("Complete dispute workflow: report, view, resolve", async () => {
			// User 1 reports User 2
			const reportRes = await request(app)
				.post("/api/disputes")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					targetId: user2Id,
					reason: "scam",
					description: "Integration test dispute"
				});
			
			expect(reportRes.status).toBe(201);
			const disputeId = reportRes.body.data._id;

			// Admin views disputes
			const viewRes = await request(app)
				.get("/api/disputes")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(viewRes.status).toBe(200);
			expect(viewRes.body.data.length).toBeGreaterThan(0);

			// Admin resolves dispute
			const resolveRes = await request(app)
				.patch(`/api/disputes/${disputeId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					status: "resolved",
					adminNote: "Resolved via integration test"
				});
			
			expect(resolveRes.status).toBe(200);
			expect(resolveRes.body.data.status).toBe("resolved");
		});

		test("Complete notification workflow: create, view, mark read, delete", async () => {
			// Admin creates notification for user 1
			const createRes = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					userId: user1Id,
					title: "Integration Test",
					message: "Test notification",
					type: "system"
				});
			
			expect(createRes.status).toBe(201);
			const notifId = createRes.body.notification._id;

			// User 1 views notifications
			const viewRes = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(viewRes.status).toBe(200);
			expect(viewRes.body.notifications.length).toBeGreaterThan(0);

			// Check unread count
			const countRes = await request(app)
				.get("/api/notifications/unread-count")
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(countRes.status).toBe(200);
			expect(countRes.body.count).toBeGreaterThan(0);

			// Mark as read
			const markRes = await request(app)
				.put(`/api/notifications/${notifId}/read`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(markRes.status).toBe(200);

			// Delete notification
			const deleteRes = await request(app)
				.delete(`/api/notifications/${notifId}`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(deleteRes.status).toBe(200);
		});
	});

	describe("7. Security & Authorization Tests", () => {
		test("Should prevent accessing other user's messages", async () => {
			const thirdUserRes = await request(app)
				.post("/api/auth/signup")
				.send({
					name: "Third User",
					email: `module7_perf_security_${timestamp}@test.com`,
					password: "SecurePass123!"
				});
			
			const thirdToken = thirdUserRes.body.accessToken;
			const thirdId = thirdUserRes.body.user._id;
			await User.findByIdAndUpdate(thirdId, { isVerified: true });

			// User 1 and 2 have conversation, User 3 shouldn't see it
			const res = await request(app)
				.get(`/api/messages/${user2Id}`)
				.set("Authorization", `Bearer ${thirdToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.messages.length).toBe(0);
		});

		test("Should prevent non-admin from viewing disputes", async () => {
			const res = await request(app)
				.get("/api/disputes")
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect([401, 403]).toContain(res.status);
		});

		test("Should prevent non-admin from resolving disputes", async () => {
			const dispute = await Dispute.create({
				reporterId: user1Id,
				targetId: user2Id,
				reason: "not_as_described",
				description: "Test dispute"
			});

			const res = await request(app)
				.patch(`/api/disputes/${dispute._id}`)
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					status: "resolved",
					adminNote: "Unauthorized resolution"
				});
			
			expect([401, 403]).toContain(res.status);

			await Dispute.deleteOne({ _id: dispute._id });
		});

		test("Should prevent creating notification without permission", async () => {
			const res = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					userId: user2Id,
					title: "Unauthorized",
					message: "Should fail",
					type: "system"
				});
			
			expect([401, 403]).toContain(res.status);
		});

		test("Should enforce token authentication on all endpoints", async () => {
			const endpoints = [
				{ method: "get", path: "/api/messages/conversations" },
				{ method: "get", path: "/api/notifications" },
				{ method: "post", path: "/api/reviews", body: { revieweeId: user2Id, exchangeId: new mongoose.Types.ObjectId(), rating: 5 } },
				{ method: "post", path: "/api/disputes", body: { targetId: user2Id, reason: "scam", description: "Test" } }
			];

			for (const endpoint of endpoints) {
				let res;
				if (endpoint.method === "get") {
					res = await request(app).get(endpoint.path);
				} else {
					res = await request(app).post(endpoint.path).send(endpoint.body);
				}
				
				expect(res.status).toBe(401);
			}
		});
	});

	describe("8. Data Validation & Edge Cases", () => {
		test("Should handle empty message content", async () => {
			const res = await request(app)
				.post("/api/messages")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					receiverId: user2Id,
					content: "   "
				});
			
			// Should either trim and accept or reject
			expect([201, 400]).toContain(res.status);
		});

		test("Should handle very long messages", async () => {
			const longMessage = "A".repeat(5000);
			
			const res = await request(app)
				.post("/api/messages")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					receiverId: user2Id,
					content: longMessage
				});
			
			expect(res.status).toBe(201);
		});

		test("Should handle special characters in messages", async () => {
			const specialContent = "Hello! @#$%^&*()_+-=[]{}|;':\",./<>?🎉🚀";
			
			const res = await request(app)
				.post("/api/messages")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					receiverId: user2Id,
					content: specialContent
				});
			
			expect(res.status).toBe(201);
			expect(res.body.data.content).toBe(specialContent);
		});

		test("Should handle review with no comment", async () => {
			const exchange = await Exchange.create({
				buyerId: user1Id,
				sellerId: user2Id,
				listingId: new mongoose.Types.ObjectId(),
				status: "fully_completed",
				exchangeType: "sale"
			});

			const res = await request(app)
				.post("/api/reviews")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					revieweeId: user2Id,
					exchangeId: exchange._id,
					rating: 4
				});
			
			expect(res.status).toBe(201);

			await Exchange.deleteOne({ _id: exchange._id });
		});

		test("Should handle dispute with all valid reason types", async () => {
			const reasons = ["not_as_described", "no_show", "harassment", "scam", "other"];
			
			for (const reason of reasons) {
				const res = await request(app)
					.post("/api/disputes")
					.set("Authorization", `Bearer ${user1Token}`)
					.send({
						targetId: user2Id,
						reason: reason,
						description: `Testing ${reason}`
					});
				
				expect(res.status).toBe(201);
			}
		});

		test("Should handle notification with all type variations", async () => {
			const types = ["listing", "system", "message", "eco-points", "verification", "match"];
			
			for (const type of types) {
				const res = await request(app)
					.post("/api/notifications")
					.set("Authorization", `Bearer ${adminToken}`)
					.send({
						userId: user1Id,
						title: `Test ${type}`,
						message: `Notification of type ${type}`,
						type: type
					});
				
				expect(res.status).toBe(201);
			}
		});
	});
});
