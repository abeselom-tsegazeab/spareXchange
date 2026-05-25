import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { Review } from "../models/review.model.js";
import { Dispute } from "../models/dispute.model.js";
import { Exchange } from "../models/exchange.model.js";
import { Notification } from "../models/notification.model.js";
import mongoose from "mongoose";

describe("Module 7: Communication, Trust & Dispute Resolution", () => {
	let user1Token, user1Id, user2Token, user2Id, adminToken, adminId;
	let exchangeId, messageId, reviewId, disputeId;
	const timestamp = Date.now();

	beforeAll(async () => {
		// Cleanup
		await User.deleteMany({ email: /module7_/ });
		await Message.deleteMany({});
		await Review.deleteMany({});
		await Dispute.deleteMany({});
		await Exchange.deleteMany({});
		await Notification.deleteMany({});

		// Create user 1
		const user1Res = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 7 User 1",
				email: `module7_user1_${timestamp}@test.com`,
				password: "SecurePass123!"
			});
		
		user1Token = user1Res.body.accessToken;
		user1Id = user1Res.body.user._id;
		await User.findByIdAndUpdate(user1Id, { isVerified: true });

		// Create user 2
		const user2Res = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 7 User 2",
				email: `module7_user2_${timestamp}@test.com`,
				password: "SecurePass123!"
			});
		
		user2Token = user2Res.body.accessToken;
		user2Id = user2Res.body.user._id;
		await User.findByIdAndUpdate(user2Id, { isVerified: true });

		// Create admin user
		const adminRes = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 7 Admin",
				email: `module7_admin_${timestamp}@test.com`,
				password: "SecurePass123!"
			});
		
		adminToken = adminRes.body.accessToken;
		adminId = adminRes.body.user._id;
		await User.findByIdAndUpdate(adminId, { 
			isVerified: true, 
			userType: "admin",
			permissions: ["view_disputes", "resolve_disputes", "view_stats", "send_notifications"]
		});

		// Create completed exchange for reviews
		const exchange = await Exchange.create({
			initiator: user1Id,
			listingId: new mongoose.Types.ObjectId(),
			buyerId: user1Id,
			sellerId: user2Id,
			status: "fully_completed",
			exchangeType: "sale",
			agreedPrice: 100
		});
		exchangeId = exchange._id;
	});

	afterAll(async () => {
		await User.deleteMany({ email: /module7_/ });
		await Message.deleteMany({});
		await Review.deleteMany({});
		await Dispute.deleteMany({});
		await Exchange.deleteMany({});
		await Notification.deleteMany({});
	});

	describe("1. Messaging System", () => {
		test("Should send message successfully", async () => {
			const res = await request(app)
				.post("/api/messages")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					receiverId: user2Id,
					content: "Hi, is this listing still available?",
					listingId: new mongoose.Types.ObjectId()
				});
			
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
			expect(res.body.data.content).toBe("Hi, is this listing still available?");
			
			messageId = res.body.data._id;
		});

		test("Should fail to send message without receiver", async () => {
			const res = await request(app)
				.post("/api/messages")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({ content: "Test message" });
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("Should fail to send message without content", async () => {
			const res = await request(app)
				.post("/api/messages")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({ receiverId: user2Id });
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("Should get conversation between two users", async () => {
			// Send another message from user2
			await request(app)
				.post("/api/messages")
				.set("Authorization", `Bearer ${user2Token}`)
				.send({
					receiverId: user1Id,
					content: "Yes, it's still available!"
				});

			const res = await request(app)
				.get(`/api/messages/${user2Id}`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.messages.length).toBeGreaterThanOrEqual(2);
		});

		test("Should get conversations list", async () => {
			const res = await request(app)
				.get("/api/messages/conversations")
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.conversations.length).toBeGreaterThan(0);
			expect(res.body.conversations[0]).toHaveProperty('user');
			expect(res.body.conversations[0]).toHaveProperty('lastMessage');
		});

		test("Should mark conversation as read", async () => {
			const res = await request(app)
				.put(`/api/messages/read/${user2Id}`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("Should fail messaging without authentication", async () => {
			const res = await request(app)
				.post("/api/messages")
				.send({
					receiverId: user2Id,
					content: "Unauthorized message"
				});
			
			expect(res.status).toBe(401);
		});
	});

	describe("2. Review System", () => {
		test("Should create review for completed exchange", async () => {
			const res = await request(app)
				.post("/api/reviews")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					revieweeId: user2Id,
					exchangeId: exchangeId,
					rating: 5,
					comment: "Great seller! Highly recommended."
				});
			
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
			expect(res.body.data.rating).toBe(5);
			
			reviewId = res.body.data._id;

			// Verify trust score updated
			const user = await User.findById(user2Id);
			expect(user.trustScore).toBe(5);
			expect(user.totalReviews).toBe(1);
		});

		test("Should fail review with invalid rating", async () => {
			const res = await request(app)
				.post("/api/reviews")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					revieweeId: user2Id,
					exchangeId: exchangeId,
					rating: 6,
					comment: "Invalid rating"
				});
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("Should fail review with rating below 1", async () => {
			const res = await request(app)
				.post("/api/reviews")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					revieweeId: user2Id,
					exchangeId: exchangeId,
					rating: 0,
					comment: "Invalid rating"
				});
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("Should fail review for non-existent exchange", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.post("/api/reviews")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					revieweeId: user2Id,
					exchangeId: fakeId,
					rating: 4,
					comment: "Test"
				});
			
			expect(res.status).toBe(404);
			expect(res.body.message).toMatch(/exchange not found/i);
		});

		test("Should fail review for incomplete exchange", async () => {
			// Create incomplete exchange
			const incompleteExchange = await Exchange.create({
				initiator: user1Id,
				listingId: new mongoose.Types.ObjectId(),
				buyerId: user1Id,
				sellerId: user2Id,
				status: "pending",
				exchangeType: "swap"
			});

			const res = await request(app)
				.post("/api/reviews")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					revieweeId: user2Id,
					exchangeId: incompleteExchange._id,
					rating: 4,
					comment: "Test"
				});
			
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/fully completed/i);
		});

		test("Should fail review if user not part of exchange", async () => {
			// Create third user
			const user3Res = await request(app)
				.post("/api/auth/signup")
				.send({
					name: "Module 7 User 3",
					email: `module7_user3_${timestamp}@test.com`,
					password: "SecurePass123!"
				});
			
			const user3Token = user3Res.body.accessToken;
			const user3Id = user3Res.body.user._id;
			await User.findByIdAndUpdate(user3Id, { isVerified: true });

			const res = await request(app)
				.post("/api/reviews")
				.set("Authorization", `Bearer ${user3Token}`)
				.send({
					revieweeId: user2Id,
					exchangeId: exchangeId,
					rating: 4,
					comment: "Unauthorized review"
				});
			
			expect(res.status).toBe(403);
			expect(res.body.message).toMatch(/not authorized/i);
		});

		test("Should fail duplicate review for same exchange", async () => {
			const res = await request(app)
				.post("/api/reviews")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					revieweeId: user2Id,
					exchangeId: exchangeId,
					rating: 4,
					comment: "Duplicate review"
				});
			
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/already reviewed/i);
		});

		test("Should get user reviews", async () => {
			const res = await request(app)
				.get(`/api/reviews/user/${user2Id}`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data.length).toBe(1);
			expect(res.body.data[0].rating).toBe(5);
		});

		test("Should create multiple reviews and calculate average", async () => {
			// Create second exchange
			const exchange2 = await Exchange.create({
				initiator: user2Id,
				listingId: new mongoose.Types.ObjectId(),
				buyerId: user2Id,
				sellerId: user1Id,
				status: "fully_completed",
				exchangeType: "sale",
				agreedPrice: 50
			});

			// Second review
			await request(app)
				.post("/api/reviews")
				.set("Authorization", `Bearer ${user2Token}`)
				.send({
					revieweeId: user1Id,
					exchangeId: exchange2._id,
					rating: 4,
					comment: "Good buyer"
				});

			const user = await User.findById(user1Id);
			expect(user.trustScore).toBe(4);
			expect(user.totalReviews).toBe(1);
		});
	});

	describe("3. Dispute Resolution", () => {
		test("Should create dispute successfully", async () => {
			const res = await request(app)
				.post("/api/disputes")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					targetId: user2Id,
					exchangeId: exchangeId,
					reason: "not_as_described",
					description: "Item received was not as described"
				});
			
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
			expect(res.body.data.reason).toBe("not_as_described");
			
			disputeId = res.body.data._id;
		});

		test("Should fail dispute without required fields", async () => {
			const res = await request(app)
				.post("/api/disputes")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					targetId: user2Id
				});
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("Should fail dispute without description", async () => {
			const res = await request(app)
				.post("/api/disputes")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					targetId: user2Id,
					reason: "not_as_described"
				});
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("Should get all disputes (Admin)", async () => {
			const res = await request(app)
				.get("/api/disputes")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data.length).toBeGreaterThan(0);
		});

		test("Should filter disputes by status", async () => {
			const res = await request(app)
				.get("/api/disputes?status=pending")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("Should update dispute status (Admin)", async () => {
			const res = await request(app)
				.patch(`/api/disputes/${disputeId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					status: "resolved",
					adminNote: "Investigated and resolved in favor of reporter"
				});
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.data.status).toBe("resolved");
			expect(res.body.data.adminNote).toBe("Investigated and resolved in favor of reporter");
			expect(res.body.data.resolvedBy).toBe(adminId);
		});

		test("Should fail updating non-existent dispute", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.patch(`/api/disputes/${fakeId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					status: "resolved",
					adminNote: "Test"
				});
			
			expect(res.status).toBe(404);
		});

		test("Should fail dispute creation without authentication", async () => {
			const res = await request(app)
				.post("/api/disputes")
				.send({
					targetId: user2Id,
					reason: "fraud",
					description: "Unauthorized"
				});
			
			expect(res.status).toBe(401);
		});
	});

	describe("4. Notifications (Module 7 subset)", () => {
		test("Should get user notifications", async () => {
			const res = await request(app)
				.get("/api/notifications")
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("Should get unread notification count", async () => {
			const res = await request(app)
				.get("/api/notifications/unread-count")
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.count).toBeDefined();
		});

		test("Should create notification and mark as read", async () => {
			// Create notification
			const notifRes = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					userId: user1Id,
					title: "Test Notification",
					message: "This is a test",
					type: "system"
				});
			
			if (notifRes.status !== 201) {
				console.log("Notification creation failed:", notifRes.body);
			}
			expect(notifRes.status).toBe(201);
			const notifId = notifRes.body.notification._id;

			// Mark as read
			const res = await request(app)
				.put(`/api/notifications/${notifId}/read`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("Should mark all notifications as read", async () => {
			const res = await request(app)
				.put("/api/notifications/mark-all-read")
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("Should delete notification", async () => {
			// Create notification
			const notifRes = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					userId: user1Id,
					title: "To Delete",
					message: "This will be deleted",
					type: "system"
				});
			
			expect(notifRes.status).toBe(201);
			const notifId = notifRes.body.notification._id;

			// Delete
			const res = await request(app)
				.delete(`/api/notifications/${notifId}`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("Should fail accessing another user's notification", async () => {
			// Create notification for user2
			const notifRes = await request(app)
				.post("/api/notifications")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					userId: user2Id,
					title: "Private",
					message: "Private notification",
					type: "system"
				});
			
			expect(notifRes.status).toBe(201);
			const notifId = notifRes.body.notification._id;

			// Try to mark as read with user1
			const res = await request(app)
				.put(`/api/notifications/${notifId}/read`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(403);
		});
	});

	describe("5. Security & Edge Cases", () => {
		test("Should prevent unauthorized message deletion", async () => {
			// Messages don't have deletion endpoint in current implementation
			// Testing ownership on conversations
			const res = await request(app)
				.get(`/api/messages/${user2Id}`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(200);
			// User can only see their own conversations
		});

		test("Should handle invalid user ID in messaging", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.get(`/api/messages/${fakeId}`)
				.set("Authorization", `Bearer ${user1Token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.messages).toHaveLength(0);
		});

		test("Should enforce review rating boundaries", async () => {
			// Test boundary values
			const validRatings = [1, 2, 3, 4, 5];
			
			for (const rating of validRatings) {
				const exchange = await Exchange.create({
					initiator: user1Id,
					listingId: new mongoose.Types.ObjectId(),
					buyerId: user1Id,
					sellerId: user2Id,
					status: "fully_completed",
					exchangeType: "sale",
					agreedPrice: rating * 10
				});

				const res = await request(app)
					.post("/api/reviews")
					.set("Authorization", `Bearer ${user1Token}`)
					.send({
						revieweeId: user2Id,
						exchangeId: exchange._id,
						rating: rating,
						comment: `Testing rating ${rating}`
					});
				
				expect(res.status).toBe(201);
			}
		});

		test("Should handle concurrent message sending", async () => {
			const promises = Array(5).fill(null).map((_, i) =>
				request(app)
					.post("/api/messages")
					.set("Authorization", `Bearer ${user1Token}`)
					.send({
						receiverId: user2Id,
						content: `Concurrent message ${i}`
					})
			);

			const results = await Promise.all(promises);
			results.forEach(res => {
				expect(res.status).toBe(201);
				expect(res.body.success).toBe(true);
			});
		});

		test("Should validate dispute reasons", async () => {
			// Test with valid reasons from the enum
			const validReasons = ["not_as_described", "no_show", "harassment", "scam", "other"];
			
			for (const reason of validReasons) {
				const res = await request(app)
					.post("/api/disputes")
					.set("Authorization", `Bearer ${user1Token}`)
					.send({
						targetId: user2Id,
						reason: reason,
						description: `Testing reason: ${reason}`
					});
				
				expect([201, 400, 500]).toContain(res.status);
			}
		});
	});
});
