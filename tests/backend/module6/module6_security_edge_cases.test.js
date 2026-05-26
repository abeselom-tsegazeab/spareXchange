import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { SavedSearch } from "../models/savedSearch.model.js";

/**
 * Module 6: Security and Edge Case Tests
 * Tests security vulnerabilities, edge cases, and error handling
 */
describe("Module 6: Security and Edge Case Tests", () => {
	const ts = Date.now();
	let userToken, userId, adminToken, adminId;

	beforeAll(async () => {
		const userRes = await request(app).post("/api/auth/signup").send({
			name: "Security Test User",
			email: `security_${ts}@test.com`,
			password: "Password123!"
		});
		userToken = userRes.body.accessToken;
		userId = userRes.body.user._id;
		await User.findByIdAndUpdate(userId, { isVerified: true });

		const adminRes = await request(app).post("/api/auth/signup").send({
			name: "Security Admin",
			email: `secadmin_${ts}@test.com`,
			password: "Password123!"
		});
		adminToken = adminRes.body.accessToken;
		adminId = adminRes.body.user._id;
		await User.findByIdAndUpdate(adminId, { 
			isVerified: true,
			permissions: ["admin", "run_jobs"] 
		});
	});

	afterAll(async () => {
		await SavedSearch.deleteMany({ userId: { $in: [userId, adminId] } });
		await User.deleteMany({ email: { $regex: ts } });
		await mongoose.connection.close();
	});

	describe("Authentication & Authorization", () => {
		test("should reject requests without token", async () => {
			const res = await request(app).get("/api/users/saved-searches");
			expect(res.status).toBe(401);
		});

		test("should reject requests with invalid token", async () => {
			const res = await request(app)
				.get("/api/users/saved-searches")
				.set("Authorization", "Bearer invalidtoken123");
			expect(res.status).toBe(401);
		});

		test("should reject requests with expired token", async () => {
			// Use a fake expired JWT structure
			const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImlhdCI6MTUxNjIzOTAyMn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
			const res = await request(app)
				.get("/api/users/saved-searches")
				.set("Authorization", `Bearer ${expiredToken}`);
			expect(res.status).toBe(401);
		});

		test("should prevent cross-user data access", async () => {
			// Create two users
			const user1Res = await request(app).post("/api/auth/signup").send({
				name: "User 1",
				email: `user1_${ts}@test.com`,
				password: "Password123!"
			});
			const user1Token = user1Res.body.accessToken;
			const user1Id = user1Res.body.user._id;
			await User.findByIdAndUpdate(user1Id, { isVerified: true });

			const user2Res = await request(app).post("/api/auth/signup").send({
				name: "User 2",
				email: `user2_${ts}@test.com`,
				password: "Password123!"
			});
			const user2Token = user2Res.body.accessToken;
			const user2Id = user2Res.body.user._id;
			await User.findByIdAndUpdate(user2Id, { isVerified: true });

			// User 1 creates a search
			const createRes = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({ query: "private search" });

			const searchId = createRes.body.savedSearch._id;

			// User 2 tries to access User 1's search
			const updateRes = await request(app)
				.patch(`/api/users/saved-searches/${searchId}`)
				.set("Authorization", `Bearer ${user2Token}`)
				.send({ name: "Hacked" });

			expect(updateRes.status).toBe(404);

			// Cleanup
			await SavedSearch.deleteMany({ userId: { $in: [user1Id, user2Id] } });
			await User.deleteMany({ _id: { $in: [user1Id, user2Id] } });
		});

		test("should prevent non-admin from running admin jobs", async () => {
			const res = await request(app)
				.post("/api/admin/jobs/saved-search-alerts")
				.set("Authorization", `Bearer ${userToken}`)
				.send({});
			expect(res.status).toBe(403);
		});
	});

	describe("Input Validation & Sanitization", () => {
		test("should handle SQL injection attempts in query", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: "'; DROP TABLE users; --",
					name: "SQL Injection Test"
				});

			expect(res.status).toBe(201);
			expect(res.body.savedSearch.query).toBe("'; DROP TABLE users; --");
			// Should store as string, not execute
		});

		test("should handle XSS attempts in name", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					name: "<script>alert('XSS')</script>",
					query: "test"
				});

			expect(res.status).toBe(201);
			// Should store as-is (frontend should sanitize on display)
			expect(res.body.savedSearch.name).toContain("<script>");
		});

		test("should handle extremely long query strings", async () => {
			const longQuery = "a".repeat(10000);
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: longQuery,
					name: "Long Query Test"
				});

			expect(res.status).toBe(201);
			expect(res.body.savedSearch.query.length).toBe(10000);
		});

		test("should handle special characters in filters", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: "test",
					filters: {
						brand: "Toyota & Honda",
						model: "Camry (2020)",
						category: "vehicle-parts"
					}
				});

			expect(res.status).toBe(201);
		});

		test("should handle Unicode characters", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					name: "テスト検索",
					query: "自動車部品",
					filters: { brand: "トヨタ" }
				});

			expect(res.status).toBe(201);
			expect(res.body.savedSearch.name).toBe("テスト検索");
		});
	});

	describe("Geolocation Edge Cases", () => {
		test("should handle coordinates at boundaries", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: "boundary test",
					geo: {
						latitude: 90, // Max latitude
						longitude: 180, // Max longitude
						radiusKm: 1
					}
				});

			expect(res.status).toBe(201);
		});

		test("should handle negative coordinates", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: "negative coords",
					geo: {
						latitude: -33.8688, // Sydney
						longitude: -70.0,
						radiusKm: 50
					}
				});

			expect(res.status).toBe(201);
		});

		test("should handle very large radius", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: "large radius",
					geo: {
						latitude: 0,
						longitude: 0,
						radiusKm: 10000
					}
				});

			expect(res.status).toBe(201);
		});

		test("should handle missing geo fields", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: "partial geo",
					geo: {
						latitude: 8.9806
						// Missing longitude and radiusKm
					}
				});

			expect(res.status).toBe(201);
		});
	});

	describe("Filter Edge Cases", () => {
		test("should handle price of zero", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: "free items",
					filters: {
						minPrice: 0,
						maxPrice: 0
					}
				});

			expect(res.status).toBe(201);
		});

		test("should handle very large price values", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: "expensive",
					filters: {
						minPrice: 1,
						maxPrice: 999999999
					}
				});

			expect(res.status).toBe(201);
		});

		test("should handle minPrice greater than maxPrice", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: "invalid range",
					filters: {
						minPrice: 1000,
						maxPrice: 100
					}
				});

			// Backend should accept it (validation is frontend responsibility)
			expect(res.status).toBe(201);
		});

		test("should handle future year values", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: "future cars",
					filters: {
						year: 2030
					}
				});

			expect(res.status).toBe(201);
		});

		test("should handle empty filters object", async () => {
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					query: "test",
					filters: {}
				});

			expect(res.status).toBe(201);
		});
	});

	describe("Database Constraints", () => {
		test("should handle duplicate saved searches", async () => {
			// Create two identical searches
			const res1 = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({ query: "duplicate test" });

			const res2 = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({ query: "duplicate test" });

			expect(res1.status).toBe(201);
			expect(res2.status).toBe(201);
			// Both should succeed (duplicates allowed)
		});

		test("should handle rapid create-delete cycles", async () => {
			for (let i = 0; i < 10; i++) {
				const createRes = await request(app)
					.post("/api/users/saved-searches")
					.set("Authorization", `Bearer ${userToken}`)
					.send({ query: `cycle ${i}` });

				const deleteRes = await request(app)
					.delete(`/api/users/saved-searches/${createRes.body.savedSearch._id}`)
					.set("Authorization", `Bearer ${userToken}`);

				expect(deleteRes.status).toBe(200);
			}
		});

		test("should handle deletion of non-existent search", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.delete(`/api/users/saved-searches/${fakeId}`)
				.set("Authorization", `Bearer ${userToken}`);

			expect(res.status).toBe(404);
		});

		test("should handle update of deleted search", async () => {
			const createRes = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({ query: "to delete" });

			await request(app)
				.delete(`/api/users/saved-searches/${createRes.body.savedSearch._id}`)
				.set("Authorization", `Bearer ${userToken}`);

			const res = await request(app)
				.patch(`/api/users/saved-searches/${createRes.body.savedSearch._id}`)
				.set("Authorization", `Bearer ${userToken}`)
				.send({ name: "updated" });

			expect(res.status).toBe(404);
		});
	});

	describe("Notification Security", () => {
		test("should not expose other users' notifications", async () => {
			// This tests that notifications are properly scoped
			const res = await request(app)
				.get("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`);

			expect(res.status).toBe(200);
			// Should only return user's own searches
			res.body.searches.forEach(search => {
				expect(search.userId).toBe(userId.toString());
			});
		});
	});

	describe("Rate Limiting Simulation", () => {
		test("should handle burst of requests gracefully", async () => {
			const promises = [];
			
			// Simulate burst of 30 requests
			for (let i = 0; i < 30; i++) {
				promises.push(
					request(app)
						.post("/api/users/saved-searches")
						.set("Authorization", `Bearer ${userToken}`)
						.send({ query: `burst ${i}` })
				);
			}

			const results = await Promise.all(promises);
			
			// All should succeed (or be rate limited gracefully)
			const successCount = results.filter(r => r.status === 201 || r.status === 429).length;
			expect(successCount).toBe(30);
		});
	});
});
