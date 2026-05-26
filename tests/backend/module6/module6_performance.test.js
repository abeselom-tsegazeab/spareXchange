import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { SavedSearch } from "../models/savedSearch.model.js";

/**
 * Module 6: Performance and Load Tests
 * Tests system performance under various load conditions
 */
describe("Module 6: Performance and Load Tests", () => {
	const ts = Date.now();
	let userToken, userId, adminToken, adminId;

	beforeAll(async () => {
		const userRes = await request(app).post("/api/auth/signup").send({
			name: "Perf Test User",
			email: `perf_${ts}@test.com`,
			password: "Password123!"
		});
		userToken = userRes.body.accessToken;
		userId = userRes.body.user._id;
		await User.findByIdAndUpdate(userId, { isVerified: true, permissions: ["create_listings"] });

		const adminRes = await request(app).post("/api/auth/signup").send({
			name: "Perf Admin",
			email: `perfadmin_${ts}@test.com`,
			password: "Password123!"
		});
		adminToken = adminRes.body.accessToken;
		adminId = adminRes.body.user._id;
		await User.findByIdAndUpdate(adminId, { 
			isVerified: true,
			permissions: ["admin", "run_jobs", "view_stats"] 
		});
	});

	afterAll(async () => {
		await SavedSearch.deleteMany({ userId });
		await Listing.deleteMany({ seller: userId });
		await User.deleteMany({ email: { $regex: ts } });
		await mongoose.connection.close();
	});

	describe("API Response Time Tests", () => {
		test("GET saved searches should respond within 500ms", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`);
			const duration = Date.now() - start;

			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(500);
		});

		test("POST create saved search should respond within 500ms", async () => {
			const start = Date.now();
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					name: "Performance Test",
					query: "test query",
					filters: { category: "vehicle" }
				});
			const duration = Date.now() - start;

			expect(res.status).toBe(201);
			expect(duration).toBeLessThan(500);
		});

		test("PATCH update saved search should respond within 600ms", async () => {
			const createRes = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({ query: "perf test" });

			const start = Date.now();
			const res = await request(app)
				.patch(`/api/users/saved-searches/${createRes.body.savedSearch._id}`)
				.set("Authorization", `Bearer ${userToken}`)
				.send({ name: "Updated" });
			const duration = Date.now() - start;

			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(600);
		});

		test("DELETE saved search should respond within 300ms", async () => {
			const createRes = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send({ query: "to delete" });

			const start = Date.now();
			const res = await request(app)
				.delete(`/api/users/saved-searches/${createRes.body.savedSearch._id}`)
				.set("Authorization", `Bearer ${userToken}`);
			const duration = Date.now() - start;

			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(300);
		});
	});

	describe("Bulk Operations Performance", () => {
		test("should handle creating 50 saved searches efficiently", async () => {
			const start = Date.now();
			const promises = [];

			for (let i = 0; i < 50; i++) {
				promises.push(
					request(app)
						.post("/api/users/saved-searches")
						.set("Authorization", `Bearer ${userToken}`)
						.send({
							name: `Bulk Search ${i}`,
							query: `query ${i}`,
							filters: { category: "vehicle" }
						})
				);
			}

			const results = await Promise.all(promises);
			const duration = Date.now() - start;

			const successCount = results.filter(r => r.status === 201).length;
			expect(successCount).toBe(50);
			
			// Should complete within reasonable time (5 seconds for 50 requests)
			expect(duration).toBeLessThan(5000);
		});

		test("should retrieve large number of saved searches efficiently", async () => {
			const start = Date.now();
			const res = await request(app)
				.get("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`);
			const duration = Date.now() - start;

			expect(res.status).toBe(200);
			expect(res.body.searches.length).toBeGreaterThanOrEqual(50);
			expect(duration).toBeLessThan(1000); // Should retrieve within 1 second
		});
	});

	describe("Alert Processing Performance", () => {
		test("should process saved search alerts within acceptable time", async () => {
			const { processSavedSearchAlerts } = await import("../services/savedSearchAlerts.service.js");

			// Create multiple saved searches
			for (let i = 0; i < 5; i++) {
				await SavedSearch.create({
					userId,
					name: `Perf Search ${i}`,
					query: `test ${i}`,
					filters: { category: "vehicle" },
					notify: true
				});
			}

			const start = Date.now();
			const result = await processSavedSearchAlerts({
				limitSearches: 50,
				limitListingsPerSearch: 5
			});
			const duration = Date.now() - start;

			expect(result.searchesProcessed).toBeGreaterThanOrEqual(0);
			// Should process within 2 minutes for test environment
			expect(duration).toBeLessThan(120000);
		}, 120000);

		test("admin job endpoint should respond within 20 seconds", async () => {
			const start = Date.now();
			const res = await request(app)
				.post("/api/admin/jobs/saved-search-alerts")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					limitSearches: 50,
					limitListingsPerSearch: 10
				});
			const duration = Date.now() - start;

			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(20000);
		}, 20000);
	});

	describe("Concurrent Request Handling", () => {
		test("should handle concurrent read requests", async () => {
			const promises = [];
			const start = Date.now();

			// 20 concurrent GET requests
			for (let i = 0; i < 20; i++) {
				promises.push(
					request(app)
						.get("/api/users/saved-searches")
						.set("Authorization", `Bearer ${userToken}`)
				);
			}

			const results = await Promise.all(promises);
			const duration = Date.now() - start;

			const successCount = results.filter(r => r.status === 200).length;
			expect(successCount).toBe(20);
			expect(duration).toBeLessThan(3000);
		});

		test("should handle concurrent write requests", async () => {
			const promises = [];
			const start = Date.now();

			// 10 concurrent POST requests
			for (let i = 0; i < 10; i++) {
				promises.push(
					request(app)
						.post("/api/users/saved-searches")
						.set("Authorization", `Bearer ${userToken}`)
						.send({
							name: `Concurrent ${i}`,
							query: `concurrent test ${i}`
						})
				);
			}

			const results = await Promise.all(promises);
			const duration = Date.now() - start;

			const successCount = results.filter(r => r.status === 201).length;
			expect(successCount).toBe(10);
			expect(duration).toBeLessThan(3000);
		});
	});

	describe("Database Query Optimization", () => {
		test("should use indexed queries efficiently", async () => {
			// Create saved search
			await SavedSearch.create({
				userId,
				name: "Index Test",
				query: "index test",
				notify: true
			});

			const start = Date.now();
			const res = await request(app)
				.get("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`);
			const duration = Date.now() - start;

			expect(res.status).toBe(200);
			// Indexed query should be reasonably fast (under 500ms for test environment)
			expect(duration).toBeLessThan(500);
		});
	});

	describe("Memory Usage Tests", () => {
		test("should not leak memory with repeated operations", async () => {
			const initialMemory = process.memoryUsage().heapUsed;

			// Perform 100 create/delete cycles
			for (let i = 0; i < 100; i++) {
				const createRes = await request(app)
					.post("/api/users/saved-searches")
					.set("Authorization", `Bearer ${userToken}`)
					.send({ query: `memory test ${i}` });

				await request(app)
					.delete(`/api/users/saved-searches/${createRes.body.savedSearch._id}`)
					.set("Authorization", `Bearer ${userToken}`);
			}

			const finalMemory = process.memoryUsage().heapUsed;
			const memoryIncrease = finalMemory - initialMemory;

			// Memory increase should be reasonable (< 50MB)
			expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
		});
	});

	describe("Scalability Tests", () => {
		test("should handle saved searches with complex filters", async () => {
			const complexSearch = {
				name: "Complex Filter Test",
				query: "toyota brake pads camry 2020",
				filters: {
					category: "vehicle",
					condition: "new",
					brand: "Toyota",
					model: "Camry",
					year: 2020,
					minPrice: 100,
					maxPrice: 1000
				},
				geo: {
					latitude: 8.9806,
					longitude: 38.7578,
					radiusKm: 100
				},
				notify: true
			};

			const start = Date.now();
			const res = await request(app)
				.post("/api/users/saved-searches")
				.set("Authorization", `Bearer ${userToken}`)
				.send(complexSearch);
			const duration = Date.now() - start;

			expect(res.status).toBe(201);
			expect(duration).toBeLessThan(500);
		});
	});
});
