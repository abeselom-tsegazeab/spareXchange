import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { SearchLog } from "../models/searchLog.model.js";
import mongoose from "mongoose";

describe("Exhaustive Module 2: Marketplace & Inventory Verification", () => {
	let token, userId, listingId, vehicleId;
	const userEmail = `exhaustive_${Date.now()}@test.com`;

	beforeAll(async () => {
		// Cleanup previous test users if any
		await User.deleteMany({ email: /exhaustive_/ });
		
		const res = await request(app).post("/api/auth/signup").send({
			name: "Exhaustive Tester",
			email: userEmail,
			password: "Password123!"
		});
		token = res.body.accessToken;
		userId = res.body.user._id;

		// Verify email and GRANT PERMISSIONS for creating listings
		await User.findByIdAndUpdate(userId, { 
			isVerified: true,
			permissions: ["create_listings", "create_bulk_listings"]
		});
	});

	test("1. Comprehensive Listing Creation (with Geolocation & Multi-Fitment)", async () => {
		const res = await request(app)
			.post("/api/listings")
			.set("Authorization", `Bearer ${token}`)
			.send({
				title: "Performance Brake Rotors",
				description: "Premium rotors for high-performance braking.",
				price: 299.99,
				category: "vehicle",
				condition: "new",
				location: "San Francisco, CA",
				locationCoords: { type: "Point", coordinates: [-122.4194, 37.7749] },
				compatibleVehicles: [
					{ brand: "Tesla", model: "Model 3", yearStart: 2017, yearEnd: 2024 },
					{ brand: "BMW", model: "M3", yearStart: 2015, yearEnd: 2020 }
				],
				specifications: { "Material": "Carbon Ceramic", "Size": "380mm" }
			});
		
		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
		listingId = res.body.listing._id;
		vehicleId = res.body.listing.compatibleVehicles[0]._id;

		// Verify Eco-Points awarded (10 points for posting)
		const user = await User.findById(userId);
		expect(user.ecoPoints).toBeGreaterThanOrEqual(10);
	});

	test("2. Proximity Search Verification", async () => {
		// Search within 10km of SF
		const res = await request(app)
			.get("/api/listings?latitude=37.7749&longitude=-122.4194&radius=10")
			.set("Authorization", `Bearer ${token}`);
		
		expect(res.status).toBe(200);
		expect(res.body.listings.some(l => l._id === listingId)).toBe(true);

		// Search far away (NYC) - should not find it
		const farRes = await request(app)
			.get("/api/listings?latitude=40.7128&longitude=-74.0060&radius=10")
			.set("Authorization", `Bearer ${token}`);
		
		expect(farRes.body.listings.some(l => l._id === listingId)).toBe(false);
	});

	test("3. Advanced Fitment Filter (Year Range)", async () => {
		// Search for 2018 Tesla Model 3
		const res = await request(app)
			.get("/api/listings?brand=Tesla&model=Model 3&year=2018")
			.set("Authorization", `Bearer ${token}`);
		
		expect(res.status).toBe(200);
		expect(res.body.listings.some(l => l._id === listingId)).toBe(true);

		// Search for 2010 BMW (Out of range)
		const failRes = await request(app)
			.get("/api/listings?brand=BMW&model=M3&year=2010")
			.set("Authorization", `Bearer ${token}`);
		
		expect(failRes.body.listings.some(l => l._id === listingId)).toBe(false);
	});

	test("4. Community Compatibility Voting Logic", async () => {
		// Upvote - Corrected method and URL
		const upRes = await request(app)
			.put(`/api/listings/${listingId}/compatibility/${vehicleId}/vote`)
			.set("Authorization", `Bearer ${token}`)
			.send({ voteType: "up" });
		
		expect(upRes.status).toBe(200);
		expect(upRes.body.vehicle.upvotes).toBe(1);

		// Switch to Downvote
		const downRes = await request(app)
			.put(`/api/listings/${listingId}/compatibility/${vehicleId}/vote`)
			.set("Authorization", `Bearer ${token}`)
			.send({ voteType: "down" });
		
		expect(downRes.status).toBe(200);
		expect(downRes.body.vehicle.upvotes).toBe(0);
		expect(downRes.body.vehicle.downvotes).toBe(1);
	});

	test("5. Search Logging & Demand Analytics", async () => {
		// Create some "low supply" searches
		await request(app).get("/api/listings?search=ObscurePartABC").set("Authorization", `Bearer ${token}`);
		await request(app).get("/api/listings?search=ObscurePartABC").set("Authorization", `Bearer ${token}`);

		// Check analytics
		const anaRes = await request(app)
			.get("/api/listings/analytics/high-demand")
			.set("Authorization", `Bearer ${token}`);
		
		expect(anaRes.status).toBe(200);
		expect(anaRes.body.analytics.some(a => a._id === "obscurepartabc")).toBe(true);
		expect(anaRes.body.analytics.find(a => a._id === "obscurepartabc").searchCount).toBeGreaterThanOrEqual(2);
	});

	test("6. Ownership Security & Authorization", async () => {
		// Create secondary user
		const otherUserRes = await request(app).post("/api/auth/signup").send({
			name: "Other User",
			email: `other_${Date.now()}@test.com`,
			password: "Password123!"
		});
		const otherToken = otherUserRes.body.accessToken;

		// Attempt to delete first user's listing
		const delRes = await request(app)
			.delete(`/api/listings/${listingId}`)
			.set("Authorization", `Bearer ${otherToken}`);
		
		expect(delRes.status).toBe(403);
		expect(delRes.body.success).toBe(false);

		// Successfully delete as owner
		const ownDelRes = await request(app)
			.delete(`/api/listings/${listingId}`)
			.set("Authorization", `Bearer ${token}`);
		
		expect(ownDelRes.status).toBe(200);
		expect(ownDelRes.body.success).toBe(true);
	});

	test("7. Bulk Listing Verification", async () => {
		const res = await request(app)
			.post("/api/listings/bulk")
			.set("Authorization", `Bearer ${token}`)
			.send({
				listings: [
					{ title: "Bulk 1", description: "B1", price: 10, category: "electronics", condition: "new", location: "L1" },
					{ title: "Bulk 2", description: "B2", price: 20, category: "electronics", condition: "new", location: "L2" }
				]
			});
		
		expect(res.status).toBe(201);
		expect(res.body.count).toBe(2);
	});
});
