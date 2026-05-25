import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { SearchLog } from "../models/searchLog.model.js";
import mongoose from "mongoose";

/**
 * Module 2: Advanced Features & Edge Cases Test Suite
 * Tests proximity search, compatibility voting, analytics, and edge cases
 */
describe("Module 2: Advanced Features & Edge Cases", () => {
	let token, userId, listingId, vehicleId;
	const userEmail = `advanced_${Date.now()}@test.com`;

	beforeAll(async () => {
		await User.deleteMany({ email: /advanced_/ });
		await SearchLog.deleteMany({});
		
		const res = await request(app).post("/api/auth/signup").send({
			name: "Advanced Tester",
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
		await User.deleteMany({ email: /advanced_/ });
		await SearchLog.deleteMany({});
	});

	describe("Proximity & Geolocation Search", () => {
		test("Should create listing with geolocation coordinates", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "SF Location Test",
					description: "Test with coordinates",
					price: 100,
					category: "vehicle",
					condition: "new",
					location: "San Francisco, CA",
					locationCoords: { 
						type: "Point", 
						coordinates: [-122.4194, 37.7749] // SF coordinates
					}
				});
			
			expect(res.status).toBe(201);
			expect(res.body.listing.locationCoords.type).toBe("Point");
			listingId = res.body.listing._id;
			vehicleId = res.body.listing.compatibleVehicles?.[0]?._id;
		});

		test("Should find listings within specified radius", async () => {
			// Search near SF (should find the listing)
			const res = await request(app)
				.get("/api/listings?latitude=37.7749&longitude=-122.4194&radius=50")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.listings.some(l => l._id === listingId)).toBe(true);
		});

		test("Should not find listings outside radius", async () => {
			// Search in NYC (should not find SF listing)
			const res = await request(app)
				.get("/api/listings?latitude=40.7128&longitude=-74.0060&radius=10")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.listings.some(l => l._id === listingId)).toBe(false);
		});

		test("Should use default 50km radius when not specified", async () => {
			const res = await request(app)
				.get("/api/listings?latitude=37.7749&longitude=-122.4194")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
		});
	});

	describe("Vehicle Compatibility & Fitment", () => {
		test("Should create listing with multiple compatible vehicles", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Multi-Vehicle Compatible Part",
					description: "Fits multiple vehicles",
					price: 250,
					category: "vehicle",
					condition: "new",
					location: "Los Angeles, CA",
					compatibleVehicles: [
						{ 
							brand: "Tesla", 
							model: "Model 3", 
							yearStart: 2017, 
							yearEnd: 2024 
						},
						{ 
							brand: "BMW", 
							model: "M3", 
							yearStart: 2015, 
							yearEnd: 2020 
						},
						{ 
							brand: "Audi", 
							model: "A4", 
							yearStart: 2016, 
							yearEnd: 2023 
						}
					]
				});
			
			expect(res.status).toBe(201);
			expect(res.body.listing.compatibleVehicles.length).toBe(3);
		});

		test("Should filter by brand", async () => {
			const res = await request(app)
				.get("/api/listings?brand=Tesla")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.listings.length).toBeGreaterThan(0);
		});

		test("Should filter by model", async () => {
			const res = await request(app)
				.get("/api/listings?model=Model 3")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.listings.length).toBeGreaterThan(0);
		});

		test("Should filter by year range (within range)", async () => {
			const res = await request(app)
				.get("/api/listings?brand=Tesla&model=Model 3&year=2020")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.listings.length).toBeGreaterThan(0);
		});

		test("Should filter by year range (outside range)", async () => {
			const res = await request(app)
				.get("/api/listings?brand=BMW&model=M3&year=2010")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			// 2010 is outside 2015-2020 range
			expect(res.body.listings.some(l => 
				l.compatibleVehicles?.some(v => 
					v.brand === "BMW" && v.model === "M3"
				)
			)).toBe(false);
		});
	});

	describe("Community Compatibility Voting", () => {
		let testListingId, testVehicleId;

		beforeAll(async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Voting Test Listing",
					description: "Test voting",
					price: 150,
					category: "vehicle",
					condition: "new",
					location: "Test",
					compatibleVehicles: [
						{ brand: "Honda", model: "Civic", yearStart: 2015, yearEnd: 2020 }
					]
				});
			
			testListingId = res.body.listing._id;
			testVehicleId = res.body.listing.compatibleVehicles[0]._id;
		});

		test("Should upvote compatibility", async () => {
			const res = await request(app)
				.put(`/api/listings/${testListingId}/compatibility/${testVehicleId}/vote`)
				.set("Authorization", `Bearer ${token}`)
				.send({ voteType: "up" });
			
			expect(res.status).toBe(200);
			expect(res.body.vehicle.upvotes).toBe(1);
			expect(res.body.vehicle.downvotes).toBe(0);
		});

		test("Should prevent duplicate upvotes", async () => {
			const res = await request(app)
				.put(`/api/listings/${testListingId}/compatibility/${testVehicleId}/vote`)
				.set("Authorization", `Bearer ${token}`)
				.send({ voteType: "up" });
			
			expect(res.status).toBe(400);
			expect(res.body.message).toContain("already voted");
		});

		test("Should allow changing vote from up to down", async () => {
			const res = await request(app)
				.put(`/api/listings/${testListingId}/compatibility/${testVehicleId}/vote`)
				.set("Authorization", `Bearer ${token}`)
				.send({ voteType: "down" });
			
			expect(res.status).toBe(200);
			expect(res.body.vehicle.upvotes).toBe(0);
			expect(res.body.vehicle.downvotes).toBe(1);
		});

		test("Should allow changing vote from down to up", async () => {
			const res = await request(app)
				.put(`/api/listings/${testListingId}/compatibility/${testVehicleId}/vote`)
				.set("Authorization", `Bearer ${token}`)
				.send({ voteType: "up" });
			
			expect(res.status).toBe(200);
			expect(res.body.vehicle.upvotes).toBe(1);
			expect(res.body.vehicle.downvotes).toBe(0);
		});

		test("Should reject invalid vote type", async () => {
			const res = await request(app)
				.put(`/api/listings/${testListingId}/compatibility/${testVehicleId}/vote`)
				.set("Authorization", `Bearer ${token}`)
				.send({ voteType: "invalid" });
			
			expect(res.status).toBe(400);
		});

		test("Should reject voting on non-existent vehicle", async () => {
			const fakeVehicleId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.put(`/api/listings/${testListingId}/compatibility/${fakeVehicleId}/vote`)
				.set("Authorization", `Bearer ${token}`)
				.send({ voteType: "up" });
			
			expect(res.status).toBe(404);
		});

		test("Should reject voting on non-existent listing", async () => {
			const fakeListingId = new mongoose.Types.ObjectId();
			const fakeVehicleId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.put(`/api/listings/${fakeListingId}/compatibility/${fakeVehicleId}/vote`)
				.set("Authorization", `Bearer ${token}`)
				.send({ voteType: "up" });
			
			expect(res.status).toBe(404);
		});
	});

	describe("Search Logging & Analytics", () => {
		test("Should log searches with zero results", async () => {
			// Search for non-existent item
			await request(app)
				.get("/api/listings?search=RARE_PART_XYZ_123")
				.set("Authorization", `Bearer ${token}`);
			
			await request(app)
				.get("/api/listings?search=RARE_PART_XYZ_123")
				.set("Authorization", `Bearer ${token}`);
			
			await request(app)
				.get("/api/listings?search=RARE_PART_XYZ_123")
				.set("Authorization", `Bearer ${token}`);

			// Check analytics
			const res = await request(app)
				.get("/api/listings/analytics/high-demand")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.analytics.length).toBeGreaterThan(0);
			
			// Should find the high-demand query
			const rarePartQuery = res.body.analytics.find(a => 
				a._id === "rare_part_xyz_123"
			);
			expect(rarePartQuery).toBeDefined();
			expect(rarePartQuery.searchCount).toBeGreaterThanOrEqual(3);
		});

		test("Should aggregate analytics by query", async () => {
			// Create multiple different searches
			const searches = ["brake pads", "oil filter", "spark plugs"];
			
			for (const search of searches) {
				await request(app)
					.get(`/api/listings?search=${search}`)
					.set("Authorization", `Bearer ${token}`);
			}

			const res = await request(app)
				.get("/api/listings/analytics/high-demand")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.count).toBeGreaterThan(0);
		});

		test("Should sort analytics by search count (descending)", async () => {
			const res = await request(app)
				.get("/api/listings/analytics/high-demand")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			
			if (res.body.analytics.length > 1) {
				for (let i = 1; i < res.body.analytics.length; i++) {
					expect(res.body.analytics[i].searchCount).toBeLessThanOrEqual(
						res.body.analytics[i - 1].searchCount
					);
				}
			}
		});

		test("Should limit analytics results to 20", async () => {
			const res = await request(app)
				.get("/api/listings/analytics/high-demand")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.count).toBeLessThanOrEqual(20);
		});
	});

	describe("Listing Expiration & Renewal", () => {
		test("Should set expiration date on creation", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Expiration Test",
					description: "Test",
					price: 50,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect(res.status).toBe(201);
			expect(res.body.listing.expiresAt).toBeDefined();
			
			// Should expire in 30 days
			const expiresAt = new Date(res.body.listing.expiresAt);
			const createdAt = new Date(res.body.listing.createdAt);
			const diffDays = (expiresAt - createdAt) / (1000 * 60 * 60 * 24);
			expect(diffDays).toBeGreaterThanOrEqual(29);
			expect(diffDays).toBeLessThanOrEqual(31);
		});

		test("Should renew listing and extend expiration", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Renewal Test",
					description: "Test",
					price: 60,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			const listingId = res.body.listing._id;
			const initialExpiresAt = new Date(res.body.listing.expiresAt);

			// Renew the listing
			const renewRes = await request(app)
				.put(`/api/listings/${listingId}/renew`)
				.set("Authorization", `Bearer ${token}`);
			
			expect(renewRes.status).toBe(200);
			
			const newExpiresAt = new Date(renewRes.body.expiresAt);
			expect(newExpiresAt).toBeGreaterThan(initialExpiresAt);
		});

		test("Should not show expired listings", async () => {
			// Create a listing
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Expiry Test",
					description: "Test",
					price: 70,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			const listingId = res.body.listing._id;

			// Manually expire it
			await Listing.findByIdAndUpdate(listingId, {
				expiresAt: new Date(Date.now() - 86400000) // 1 day ago
			});

			// Should not appear in public listings
			const listingsRes = await request(app)
				.get("/api/listings")
				.set("Authorization", `Bearer ${token}`);
			
			expect(listingsRes.status).toBe(200);
			expect(listingsRes.body.listings.some(l => l._id === listingId)).toBe(false);
		});
	});

	describe("Image Processing", () => {
		test("Should handle listing creation with image URLs", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Image Test",
					description: "Test with images",
					price: 80,
					category: "electronics",
					condition: "new",
					location: "Test",
					images: [
						"https://example.com/image1.jpg",
						"https://example.com/image2.jpg",
						"https://example.com/image3.jpg"
					]
				});
			
			expect(res.status).toBe(201);
			expect(res.body.listing.images.length).toBeGreaterThan(0);
		});

		test("Should handle listing creation without images", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "No Image Test",
					description: "Test without images",
					price: 90,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect(res.status).toBe(201);
			expect(Array.isArray(res.body.listing.images)).toBe(true);
		});
	});

	describe("Edge Cases & Boundary Conditions", () => {
		test("Should handle very long titles", async () => {
			const longTitle = "A".repeat(200);
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: longTitle,
					description: "Test",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect([200, 201]).toContain(res.status);
		});

		test("Should handle special characters in description", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Special Chars",
					description: "Test with special chars: @#$%^&*()_+-=[]{}|;':\",./<>?",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect(res.status).toBe(201);
		});

		test("Should handle decimal prices", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Decimal Price",
					description: "Test",
					price: 19.99,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect(res.status).toBe(201);
			expect(res.body.listing.price).toBe(19.99);
		});

		test("Should handle very high prices", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Expensive Item",
					description: "Test",
					price: 999999.99,
					category: "vehicle",
					condition: "new",
					location: "Test"
				});
			
			expect(res.status).toBe(201);
		});

		test("Should handle Unicode characters", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Unicode Test 🔧⚙️",
					description: "Test with emoji and unicode: 中文 日本語 العربية",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect(res.status).toBe(201);
		});

		test("Should handle empty search gracefully", async () => {
			const res = await request(app)
				.get("/api/listings?search=")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
		});

		test("Should handle invalid MongoDB ObjectId", async () => {
			const res = await request(app)
				.get("/api/listings/invalid_id")
				.set("Authorization", `Bearer ${token}`);
			
			expect([400, 404, 500]).toContain(res.status);
		});

		test("Should handle missing optional fields", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Minimal Listing",
					description: "Test",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
					// No optional fields: locationCoords, images, contactInfo, specifications, compatibleVehicles
				});
			
			expect(res.status).toBe(201);
		});
	});
});
