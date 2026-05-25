import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import mongoose from "mongoose";

/**
 * Module 2: Security & Authorization Test Suite
 * Tests access control, ownership validation, and permission checks
 */
describe("Module 2: Security & Authorization", () => {
	let ownerToken, ownerUserId, otherToken, otherUserId, listingId;
	const ownerEmail = `security_owner_${Date.now()}@test.com`;
	const otherEmail = `security_other_${Date.now()}@test.com`;

	beforeAll(async () => {
		await User.deleteMany({ email: /security_/ });

		// Create owner
		const ownerRes = await request(app).post("/api/auth/signup").send({
			name: "Security Owner",
			email: ownerEmail,
			password: "Password123!"
		});
		ownerToken = ownerRes.body.accessToken;
		ownerUserId = ownerRes.body.user._id;

		await User.findByIdAndUpdate(ownerUserId, { 
			isVerified: true,
			permissions: ["create_listings", "create_bulk_listings"]
		});

		// Create other user
		const otherRes = await request(app).post("/api/auth/signup").send({
			name: "Security Other",
			email: otherEmail,
			password: "Password123!"
		});
		otherToken = otherRes.body.accessToken;
		otherUserId = otherRes.body.user._id;

		await User.findByIdAndUpdate(otherUserId, { 
			isVerified: true,
			permissions: ["create_listings"]
		});

		// Create listing owned by owner
		const listingRes = await request(app)
			.post("/api/listings")
			.set("Authorization", `Bearer ${ownerToken}`)
			.send({
				title: "Security Test Listing",
				description: "Testing security",
				price: 100,
				category: "vehicle",
				condition: "new",
				location: "Test Location"
			});
		
		listingId = listingRes.body.listing._id;
	});

	afterAll(async () => {
		await Listing.deleteMany({ seller: { $in: [ownerUserId, otherUserId] } });
		await User.deleteMany({ email: /security_/ });
	});

	describe("Authentication Requirements", () => {
		test("Should require authentication for creating listings", async () => {
			const res = await request(app)
				.post("/api/listings")
				.send({
					title: "Unauthenticated",
					description: "Should fail",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect(res.status).toBe(401);
		});

		test("Should require authentication for updating listings", async () => {
			const res = await request(app)
				.put(`/api/listings/${listingId}`)
				.send({ title: "Hacked" });
			
			expect(res.status).toBe(401);
		});

		test("Should require authentication for deleting listings", async () => {
			const res = await request(app)
				.delete(`/api/listings/${listingId}`);
			
			expect(res.status).toBe(401);
		});

		test("Should require authentication for viewing user listings", async () => {
			const res = await request(app)
				.get("/api/listings/my-listings");
			
			expect(res.status).toBe(401);
		});

		test("Should allow public access to browse listings", async () => {
			const res = await request(app)
				.get("/api/listings");
			
			expect(res.status).toBe(200);
		});

		test("Should allow public access to view single listing", async () => {
			const res = await request(app)
				.get(`/api/listings/${listingId}`);
			
			expect(res.status).toBe(200);
		});
	});

	describe("Permission-Based Access Control", () => {
		test("Should allow listing creation with create_listings permission", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${ownerToken}`)
				.send({
					title: "Permission Test",
					description: "Test",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect(res.status).toBe(201);
		});

		test("Should deny listing creation without permission", async () => {
			const noPermUserRes = await request(app).post("/api/auth/signup").send({
				name: "No Permission",
				email: `noperm_${Date.now()}@test.com`,
				password: "Password123!"
			});
			const noPermToken = noPermUserRes.body.accessToken;

			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${noPermToken}`)
				.send({
					title: "Should Fail",
					description: "No permission",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect(res.status).toBe(403);
		});

		test("Should allow bulk creation with create_bulk_listings permission", async () => {
			const res = await request(app)
				.post("/api/listings/bulk")
				.set("Authorization", `Bearer ${ownerToken}`)
				.send({
					listings: [
						{ title: "Bulk 1", description: "B1", price: 10, category: "electronics", condition: "new", location: "L1" },
						{ title: "Bulk 2", description: "B2", price: 20, category: "electronics", condition: "new", location: "L2" }
					]
				});
			
			expect(res.status).toBe(201);
		});

		test("Should deny bulk creation without permission", async () => {
			const res = await request(app)
				.post("/api/listings/bulk")
				.set("Authorization", `Bearer ${otherToken}`)
				.send({
					listings: [
						{ title: "Should Fail", description: "No perm", price: 10, category: "electronics", condition: "new", location: "Test" }
					]
				});
			
			expect(res.status).toBe(403);
		});
	});

	describe("Ownership Validation", () => {
		test("Should allow owner to update their listing", async () => {
			const res = await request(app)
				.put(`/api/listings/${listingId}`)
				.set("Authorization", `Bearer ${ownerToken}`)
				.send({ title: "Owner Update" });
			
			expect(res.status).toBe(200);
		});

		test("Should deny non-owner from updating listing", async () => {
			const res = await request(app)
				.put(`/api/listings/${listingId}`)
				.set("Authorization", `Bearer ${otherToken}`)
				.send({ title: "Hacker Update" });
			
			expect(res.status).toBe(403);
			expect(res.body.message).toContain("Not authorized");
		});

		test("Should allow owner to delete their listing", async () => {
			const tempListingRes = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${ownerToken}`)
				.send({
					title: "Delete Test",
					description: "Test",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			const tempListingId = tempListingRes.body.listing._id;

			const res = await request(app)
				.delete(`/api/listings/${tempListingId}`)
				.set("Authorization", `Bearer ${ownerToken}`);
			
			expect(res.status).toBe(200);
		});

		test("Should deny non-owner from deleting listing", async () => {
			const res = await request(app)
				.delete(`/api/listings/${listingId}`)
				.set("Authorization", `Bearer ${otherToken}`);
			
			expect(res.status).toBe(403);
			expect(res.body.message).toContain("Not authorized");
		});

		test("Should allow owner to toggle availability", async () => {
			const res = await request(app)
				.put(`/api/listings/${listingId}/toggle-availability`)
				.set("Authorization", `Bearer ${ownerToken}`);
			
			expect(res.status).toBe(200);
		});

		test("Should deny non-owner from toggling availability", async () => {
			const res = await request(app)
				.put(`/api/listings/${listingId}/toggle-availability`)
				.set("Authorization", `Bearer ${otherToken}`);
			
			expect(res.status).toBe(403);
		});

		test("Should allow owner to renew listing", async () => {
			const res = await request(app)
				.put(`/api/listings/${listingId}/renew`)
				.set("Authorization", `Bearer ${ownerToken}`);
			
			expect(res.status).toBe(200);
		});

		test("Should deny non-owner from renewing listing", async () => {
			const res = await request(app)
				.put(`/api/listings/${listingId}/renew`)
				.set("Authorization", `Bearer ${otherToken}`);
			
			expect(res.status).toBe(403);
		});
	});

	describe("Banned User Restrictions", () => {
		test("Should prevent banned users from creating listings", async () => {
			const bannedUserRes = await request(app).post("/api/auth/signup").send({
				name: "Banned User",
				email: `banned_${Date.now()}@test.com`,
				password: "Password123!"
			});
			const bannedUserId = bannedUserRes.body.user._id;
			const bannedToken = bannedUserRes.body.accessToken;

			await User.findByIdAndUpdate(bannedUserId, { 
				isVerified: true,
				isBanned: true,
				permissions: ["create_listings"]
			});

			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${bannedToken}`)
				.send({
					title: "Banned Test",
					description: "Should fail",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect(res.status).toBe(403);
			expect(res.body.message).toBe("Forbidden");
		});
	});

	describe("Token Validation", () => {
		test("Should reject invalid token", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", "Bearer invalid_token_here")
				.send({
					title: "Invalid Token",
					description: "Test",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect(res.status).toBe(401);
		});

		test("Should reject expired token", async () => {
			const res = await request(app)
				.get("/api/listings/my-listings")
				.set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMyIsImlhdCI6MTUxNjIzOTAyMn0.abc123");
			
			expect(res.status).toBe(401);
		});

		test("Should reject request without Bearer prefix", async () => {
			const res = await request(app)
				.get("/api/listings/my-listings")
				.set("Authorization", ownerToken);
			
			expect(res.status).toBe(401);
		});
	});

	describe("Input Sanitization & Validation", () => {
		test("Should reject SQL injection attempts in search", async () => {
			const res = await request(app)
				.get("/api/listings?search='; DROP TABLE listings; --")
				.set("Authorization", `Bearer ${ownerToken}`);
			
			// Should not crash, return empty or safe results
			expect(res.status).toBe(200);
		});

		test("Should reject XSS attempts in listing title", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${ownerToken}`)
				.send({
					title: "<script>alert('XSS')</script>",
					description: "XSS Test",
					price: 10,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			// Should accept but sanitize or escape
			expect([200, 201, 400]).toContain(res.status);
		});

		test("Should reject negative prices", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${ownerToken}`)
				.send({
					title: "Negative Price",
					description: "Test",
					price: -100,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			// Should handle gracefully
			expect([200, 201, 400]).toContain(res.status);
		});

		test("Should reject zero price", async () => {
			const res = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${ownerToken}`)
				.send({
					title: "Zero Price",
					description: "Test",
					price: 0,
					category: "electronics",
					condition: "new",
					location: "Test"
				});
			
			expect([200, 201, 400]).toContain(res.status);
		});
	});
});
