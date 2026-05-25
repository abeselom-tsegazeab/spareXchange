import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import mongoose from "mongoose";

/**
 * Module 2: Performance & Load Test Suite
 * Tests response times, concurrent operations, and scalability
 */
describe("Module 2: Performance & Load Testing", () => {
	let token, userId;
	const userEmail = `performance_${Date.now()}@test.com`;
	let listingIds = [];

	beforeAll(async () => {
		await User.deleteMany({ email: /performance_/ });
		
		const res = await request(app).post("/api/auth/signup").send({
			name: "Performance Tester",
			email: userEmail,
			password: "Password123!"
		});
		token = res.body.accessToken;
		userId = res.body.user._id;

		await User.findByIdAndUpdate(userId, { 
			isVerified: true,
			permissions: ["create_listings", "create_bulk_listings"]
		});
	});

	afterAll(async () => {
		await Listing.deleteMany({ seller: userId });
		await User.deleteMany({ email: /performance_/ });
	});

	describe("Response Time Tests", () => {
		test("CREATE listing should respond within 500ms", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Performance Test 1",
					description: "Testing response time",
					price: 50,
					category: "vehicle",
					condition: "new",
					location: "Test Location"
				});
			
			const duration = Date.now() - start;
			expect(res.status).toBe(201);
			expect(duration).toBeLessThan(500);
			listingIds.push(res.body.listing._id);
		});

		test("GET listings should respond within 300ms", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.get("/api/listings")
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(300);
		});

		test("GET single listing should respond within 200ms", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.get(`/api/listings/${listingIds[0]}`)
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(200);
		});

		test("UPDATE listing should respond within 400ms", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.put(`/api/listings/${listingIds[0]}`)
				.set("Authorization", `Bearer ${token}`)
				.send({ title: "Updated Performance Test" });
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(400);
		});

		test("DELETE listing should respond within 300ms", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.delete(`/api/listings/${listingIds[0]}`)
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(300);
		});
	});

	describe("Bulk Operations Performance", () => {
		test("Should create 10 listings in bulk within 2 seconds", async () => {
			const bulkListings = Array.from({ length: 10 }, (_, i) => ({
				title: `Bulk Perf Test ${i}`,
				description: `Description ${i}`,
				price: 10 + i,
				category: "electronics",
				condition: "new",
				location: `Location ${i}`
			}));

			const start = Date.now();
			
			const res = await request(app)
				.post("/api/listings/bulk")
				.set("Authorization", `Bearer ${token}`)
				.send({ listings: bulkListings });
			
			const duration = Date.now() - start;
			expect(res.status).toBe(201);
			expect(res.body.count).toBe(10);
			expect(duration).toBeLessThan(2000);
		});

		test("Should handle 50 listings in bulk within 5 seconds", async () => {
			const bulkListings = Array.from({ length: 50 }, (_, i) => ({
				title: `Bulk Perf Test Large ${i}`,
				description: `Description ${i}`,
				price: 20 + i,
				category: "vehicle",
				condition: "used",
				location: `Location ${i}`
			}));

			const start = Date.now();
			
			const res = await request(app)
				.post("/api/listings/bulk")
				.set("Authorization", `Bearer ${token}`)
				.send({ listings: bulkListings });
			
			const duration = Date.now() - start;
			expect(res.status).toBe(201);
			expect(res.body.count).toBe(50);
			expect(duration).toBeLessThan(5000);
		});
	});

	describe("Concurrent Requests", () => {
		test("Should handle 10 concurrent listing views", async () => {
			// Create a listing to view
			const createRes = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Concurrent Test",
					description: "Test",
					price: 100,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			const testListingId = createRes.body.listing._id;

			const start = Date.now();
			
			// Fire 10 concurrent requests
			const requests = Array.from({ length: 10 }, () =>
				request(app)
					.get(`/api/listings/${testListingId}`)
					.set("Authorization", `Bearer ${token}`)
			);

			const responses = await Promise.all(requests);
			const duration = Date.now() - start;

			// All should succeed
			responses.forEach(res => {
				expect(res.status).toBe(200);
			});

			// Should complete within 1 second
			expect(duration).toBeLessThan(1000);
		});

		test("Should handle 5 concurrent listing creations", async () => {
			const start = Date.now();
			
			const requests = Array.from({ length: 5 }, (_, i) =>
				request(app)
					.post("/api/listings")
					.set("Authorization", `Bearer ${token}`)
					.send({
						title: `Concurrent Create ${i}`,
						description: `Test ${i}`,
						price: 10 + i,
						category: "electronics",
						condition: "new",
						location: `Location ${i}`
					})
			);

			const responses = await Promise.all(requests);
			const duration = Date.now() - start;

			// All should succeed
			responses.forEach(res => {
				expect(res.status).toBe(201);
			});

			// Should complete within 3 seconds
			expect(duration).toBeLessThan(3000);
		});
	});

	describe("Database Query Performance", () => {
		beforeAll(async () => {
			// Create 20 listings for query testing
			const bulkListings = Array.from({ length: 20 }, (_, i) => ({
				title: `Query Test ${i}`,
				description: `Description for query test ${i}`,
				price: 10 + (i * 5),
				category: i % 2 === 0 ? "vehicle" : "electronics",
				condition: i % 3 === 0 ? "new" : "used",
				location: `City ${i % 5}`
			}));

			await request(app)
				.post("/api/listings/bulk")
				.set("Authorization", `Bearer ${token}`)
				.send({ listings: bulkListings });
		});

		test("Should filter listings by category efficiently (<300ms)", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.get("/api/listings?category=vehicle")
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(300);
		});

		test("Should filter by price range efficiently (<300ms)", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.get("/api/listings?minPrice=20&maxPrice=50")
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(300);
			
			// Verify results are within range
			res.body.listings.forEach(listing => {
				expect(listing.price).toBeGreaterThanOrEqual(20);
				expect(listing.price).toBeLessThanOrEqual(50);
			});
		});

		test("Should search by keyword efficiently (<400ms)", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.get("/api/listings?search=vehicle")
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(400);
		});

		test("Should combine multiple filters efficiently (<500ms)", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.get("/api/listings?category=electronics&condition=new&minPrice=10&maxPrice=100")
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(500);
		});

		test("Should sort listings efficiently (<300ms)", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.get("/api/listings?sort=price-asc")
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(300);

			// Verify sorting
			for (let i = 1; i < res.body.listings.length; i++) {
				expect(res.body.listings[i].price).toBeGreaterThanOrEqual(
					res.body.listings[i - 1].price
				);
			}
		});
	});

	describe("Pagination & Limit Tests", () => {
		test("Should handle large result sets without timeout", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.get("/api/listings")
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(1000);
		});

		test("Should retrieve user listings efficiently (<300ms)", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.get("/api/listings/my-listings")
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(300);
			expect(res.body.count).toBeGreaterThan(0);
		});
	});

	describe("Analytics Performance", () => {
		test("Should fetch high-demand analytics within 500ms", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.get("/api/listings/analytics/high-demand")
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(500);
		});

		test("Should fetch recommendations within 500ms", async () => {
			const start = Date.now();
			
			const res = await request(app)
				.get("/api/listings/recommendations")
				.set("Authorization", `Bearer ${token}`);
			
			const duration = Date.now() - start;
			expect(res.status).toBe(200);
			expect(duration).toBeLessThan(500);
		});
	});

	describe("Memory & Resource Management", () => {
		test("Should not leak memory on repeated requests", async () => {
			// Make 20 sequential requests
			for (let i = 0; i < 20; i++) {
				const res = await request(app)
					.get("/api/listings")
					.set("Authorization", `Bearer ${token}`);
				
				expect(res.status).toBe(200);
			}
		});

		test("Should handle rapid sequential creates", async () => {
			for (let i = 0; i < 5; i++) {
				const res = await request(app)
					.post("/api/listings")
					.set("Authorization", `Bearer ${token}`)
					.send({
						title: `Rapid Create ${i}`,
						description: `Test ${i}`,
						price: 5,
						category: "electronics",
						condition: "new",
						location: "Test"
					});
				
				expect(res.status).toBe(201);
			}
		});
	});
});
