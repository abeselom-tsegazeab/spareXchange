import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import mongoose from "mongoose";

/**
 * Module 2: Functional Requirements Test Suite
 * Tests all core marketplace & inventory functionalities
 */
describe("Module 2: Functional Requirements - Core Marketplace Operations", () => {
	let token, userId, listingId;
	const userEmail = `functional_${Date.now()}@test.com`;

	beforeAll(async () => {
		await User.deleteMany({ email: /functional_/ });
		
		const res = await request(app).post("/api/auth/signup").send({
			name: "Functional Tester",
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
		await User.deleteMany({ email: /functional_/ });
	});

	describe("Listing CRUD Operations", () => {
		test("CREATE: Should create a listing with all required fields", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Test Brake Pads",
					description: "High quality brake pads",
					price: 49.99,
					category: "vehicle",
					condition: "new",
					location: "New York, NY"
				});
			
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
			expect(res.body.listing.title).toBe("Test Brake Pads");
			expect(res.body.listing.price).toBe(49.99);
			expect(res.body.listing.seller).toBe(userId);
			listingId = res.body.listing._id;
		});

		test("CREATE: Should award 10 eco-points for listing creation", async () => {
			const user = await User.findById(userId);
			expect(user.ecoPoints).toBeGreaterThanOrEqual(10);
		});

		test("CREATE: Should fail without required fields", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Incomplete Listing",
					description: "Missing fields"
				});
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("READ: Should get single listing by ID", async () => {
			const res = await request(app)
				.get(`/api/listings/${listingId}`)
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.listing._id).toBe(listingId);
		});

		test("READ: Should increment view count when listing is viewed", async () => {
			const initialRes = await request(app)
				.get(`/api/listings/${listingId}`)
				.set("Authorization", `Bearer ${token}`);
			
			const initialViews = initialRes.body.listing.views;

			await request(app)
				.get(`/api/listings/${listingId}`)
				.set("Authorization", `Bearer ${token}`);

			const finalRes = await request(app)
				.get(`/api/listings/${listingId}`)
				.set("Authorization", `Bearer ${token}`);
			
			expect(finalRes.body.listing.views).toBeGreaterThan(initialViews);
		});

		test("READ: Should return 404 for non-existent listing", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.get(`/api/listings/${fakeId}`)
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(404);
		});

		test("READ: Should get all listings with filters", async () => {
			const res = await request(app)
				.get("/api/listings?category=vehicle&condition=new")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(Array.isArray(res.body.listings)).toBe(true);
		});

		test("READ: Should filter by price range", async () => {
			const res = await request(app)
				.get("/api/listings?minPrice=10&maxPrice=100")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			res.body.listings.forEach(listing => {
				expect(listing.price).toBeGreaterThanOrEqual(10);
				expect(listing.price).toBeLessThanOrEqual(100);
			});
		});

		test("READ: Should search by keyword", async () => {
			const res = await request(app)
				.get("/api/listings?search=brake")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.listings.length).toBeGreaterThan(0);
		});

		test("UPDATE: Should update listing as owner", async () => {
			const res = await request(app)
				.put(`/api/listings/${listingId}`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Updated Brake Pads",
					price: 59.99
				});
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.listing.title).toBe("Updated Brake Pads");
			expect(res.body.listing.price).toBe(59.99);
		});

		test("UPDATE: Should fail when non-owner tries to update", async () => {
			const otherUserRes = await request(app).post("/api/auth/signup").send({
				name: "Other User",
				email: `other_func_${Date.now()}@test.com`,
				password: "Password123!"
			});
			const otherToken = otherUserRes.body.accessToken;

			const res = await request(app)
				.put(`/api/listings/${listingId}`)
				.set("Authorization", `Bearer ${otherToken}`)
				.send({ title: "Hacked Title" });
			
			expect(res.status).toBe(403);
			expect(res.body.success).toBe(false);
		});

		test("DELETE: Should soft delete listing as owner", async () => {
			const res = await request(app)
				.delete(`/api/listings/${listingId}`)
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);

			// Verify listing is marked as inactive
			const deletedListing = await Listing.findById(listingId);
			expect(deletedListing.isActive).toBe(false);
		});

		test("DELETE: Should fail when non-owner tries to delete", async () => {
			const newListingRes = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Delete Test",
					description: "Test",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			const newListingId = newListingRes.body.listing._id;

			const otherUserRes = await request(app).post("/api/auth/signup").send({
				name: "Another User",
				email: `another_func_${Date.now()}@test.com`,
				password: "Password123!"
			});
			const otherToken = otherUserRes.body.accessToken;

			const res = await request(app)
				.delete(`/api/listings/${newListingId}`)
				.set("Authorization", `Bearer ${otherToken}`);
			
			expect(res.status).toBe(403);
		});
	});

	describe("User Listings Management", () => {
		test("Should get current user's listings", async () => {
			// Create a test listing
			await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "User Listing Test",
					description: "Test",
					price: 25,
					category: "electronics",
					condition: "new",
					location: "Test"
				});

			const res = await request(app)
				.get("/api/listings/my-listings")
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(Array.isArray(res.body.listings)).toBe(true);
			expect(res.body.listings.length).toBeGreaterThan(0);
		});

		test("Should toggle listing availability", async () => {
			const listingRes = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Toggle Test",
					description: "Test",
					price: 30,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			const toggleListingId = listingRes.body.listing._id;

			const res = await request(app)
				.put(`/api/listings/${toggleListingId}/toggle-availability`)
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(typeof res.body.available).toBe("boolean");
		});

		test("Should renew listing to extend expiration", async () => {
			const listingRes = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Renew Test",
					description: "Test",
					price: 40,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			const renewListingId = listingRes.body.listing._id;

			const res = await request(app)
				.put(`/api/listings/${renewListingId}/renew`)
				.set("Authorization", `Bearer ${token}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toContain("renewed");
			expect(res.body.expiresAt).toBeDefined();
		});
	});

	describe("Bulk Operations", () => {
		test("Should create multiple listings in bulk", async () => {
			const res = await request(app)
				.post("/api/listings/bulk")
				.set("Authorization", `Bearer ${token}`)
				.send({
					listings: [
						{ 
							title: "Bulk Item 1", 
							description: "Desc 1", 
							price: 15, 
							category: "electronics", 
							condition: "new", 
							location: "Location 1" 
						},
						{ 
							title: "Bulk Item 2", 
							description: "Desc 2", 
							price: 25, 
							category: "vehicle", 
							condition: "used", 
							location: "Location 2" 
						},
						{ 
							title: "Bulk Item 3", 
							description: "Desc 3", 
							price: 35, 
							category: "electronics", 
							condition: "new", 
							location: "Location 3" 
						}
					]
				});
			
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
			expect(res.body.count).toBe(3);
		});

		test("Should award eco-points for bulk listings (10 per item)", async () => {
			const user = await User.findById(userId);
			expect(user.ecoPoints).toBeGreaterThanOrEqual(30); // 3 items * 10 points
		});

		test("Should fail bulk creation with invalid data", async () => {
			const res = await request(app)
				.post("/api/listings/bulk")
				.set("Authorization", `Bearer ${token}`)
				.send({
					listings: [
						{ title: "Incomplete" }
					]
				});
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});
	});

	describe("Reporting System", () => {
		test("Should report a listing with reason", async () => {
			const listingRes = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${token}`)
				.send({
					title: "Report Test",
					description: "Test",
					price: 20,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			const reportListingId = listingRes.body.listing._id;

			const res = await request(app)
				.post(`/api/listings/${reportListingId}/report`)
				.set("Authorization", `Bearer ${token}`)
				.send({
					reason: "spam",
					details: "This is spam content"
				});
			
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
		});

		test("Should fail report without reason", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.post(`/api/listings/${fakeId}/report`)
				.set("Authorization", `Bearer ${token}`)
				.send({ details: "No reason provided" });
			
			expect(res.status).toBe(400);
		});
	});
});
