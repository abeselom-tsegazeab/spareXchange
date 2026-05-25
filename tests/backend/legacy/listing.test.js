import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";

describe("Marketplace & Inventory Module (Module 2)", () => {
	let token, listingId;
	const user = { name: "Listing User", email: `listing_${Date.now()}@test.com`, password: "Password123!" };

	beforeAll(async () => {
		const res = await request(app).post("/api/auth/signup").send(user);
		token = res.body.accessToken;
	});

	test("Should create a listing with an image (mocked)", async () => {
		const res = await request(app)
			.post("/api/listings")
			.set("Authorization", `Bearer ${token}`)
			.send({
				title: "Jest Test Part",
				description: "A high-quality part tested with Jest",
				price: 150,
				category: "vehicle",
				condition: "new",
				location: "Addis Ababa",
				images: ["data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="]
			});
		
		expect(res.status).toBe(201);
		expect(res.body.listing.images[0]).toMatch(/\/uploads\//);
		listingId = res.body.listing._id;
	});

	test("Should search listings using fuzzy logic", async () => {
		const res = await request(app).get("/api/listings?search=Jest Part");
		expect(res.status).toBe(200);
		expect(res.body.listings.some(l => l._id === listingId)).toBe(true);
	});

	test("Should perform bulk upload (authorized pro user)", async () => {
		const proUser = { name: "Pro Shop", email: `pro_${Date.now()}@test.com`, password: "Password123!", role: "garage" };
		const signupRes = await request(app).post("/api/auth/signup").send(proUser);
		const proToken = signupRes.body.accessToken;
		const proUserId = signupRes.body.user._id;

		// Elevate permission manually in DB for testing logic
		await User.findByIdAndUpdate(proUserId, { $push: { permissions: "create_bulk_listings" } });

		const res = await request(app)
			.post("/api/listings/bulk")
			.set("Authorization", `Bearer ${proToken}`)
			.send({
				listings: [
					{ title: "Bulk Part 1", description: "Desc 1", price: 50, category: "electronics", condition: "used-good", location: "Loc 1" },
					{ title: "Bulk Part 2", description: "Desc 2", price: 75, category: "electronics", condition: "used-good", location: "Loc 2" }
				]
			});
		
		expect(res.status).toBe(201);
		expect(res.body.count).toBe(2);
	});

	test("Should report a listing", async () => {
		const res = await request(app)
			.post(`/api/listings/${listingId}/report`)
			.set("Authorization", `Bearer ${token}`)
			.send({
				reason: "inaccurate",
				details: "Listing contains mock data"
			});
		
		expect(res.status).toBe(201);
		expect(res.body.success).toBe(true);
	});

	test("Should renew an expiring listing", async () => {
		const res = await request(app)
			.put(`/api/listings/${listingId}/renew`)
			.set("Authorization", `Bearer ${token}`);
		
		expect(res.status).toBe(200);
		expect(res.body.expiresAt).toBeDefined();
	});
});
