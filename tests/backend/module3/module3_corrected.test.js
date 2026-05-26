import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Exchange } from "../models/exchange.model.js";

describe("Module 3: Exchange - Corrected Comprehensive Tests", () => {
	const ts = Date.now();
	
	// Test users
	const sellerUser = { name: "Seller", email: `seller_m3c_${ts}@test.com`, password: "Password123!" };
	const buyerUser = { name: "Buyer", email: `buyer_m3c_${ts}@test.com`, password: "Password123!" };
	const thirdUser = { name: "Third", email: `third_m3c_${ts}@test.com`, password: "Password123!" };
	const adminUser = { name: "Admin", email: `admin_m3c_${ts}@test.com`, password: "Password123!" };

	let sellerToken, buyerToken, thirdToken, adminToken;
	let sellerId, buyerId;

	// Create users once
	beforeAll(async () => {
		const [sRes, bRes, tRes, aRes] = await Promise.all([
			request(app).post("/api/auth/signup").send(sellerUser),
			request(app).post("/api/auth/signup").send(buyerUser),
			request(app).post("/api/auth/signup").send(thirdUser),
			request(app).post("/api/auth/signup").send(adminUser),
		]);

		sellerToken = sRes.body.accessToken;
		buyerToken = bRes.body.accessToken;
		thirdToken = tRes.body.accessToken;
		adminToken = aRes.body.accessToken;

		sellerId = sRes.body.user?._id || sRes.body._id;
		buyerId = bRes.body.user?._id || bRes.body._id;
		const adminId = aRes.body.user?._id || aRes.body._id;

		await User.findByIdAndUpdate(adminId, { permissions: ["admin"], userType: "admin" });
	});

	// Helper to create a fresh listing
	const createListing = async (sellerTok, title = "Test Item") => {
		const res = await request(app)
			.post("/api/listings")
			.set("Authorization", `Bearer ${sellerTok}`)
			.send({ title: `${title} ${Date.now()}`, description: "Test", price: 100, category: "vehicle", condition: "used-good", location: "Test" });
		return res.body.listing;
	};

	// Helper to create and accept an exchange
	const createAcceptedExchange = async (sellerTok, buyerTok, listing) => {
		const buyerListing = await createListing(buyerTok, "Buyer Item");
		
		const prop = await request(app)
			.post("/api/exchanges")
			.set("Authorization", `Bearer ${buyerTok}`)
			.send({ listingId: listing._id, offeredListingId: buyerListing._id, offeredItems: "Test offer" });

		await request(app)
			.put(`/api/exchanges/${prop.body.data._id}/status`)
			.set("Authorization", `Bearer ${sellerTok}`)
			.send({ status: "accepted" });

		return prop.body.data;
	};

	// ─────────────────────────────────────────────────────────────────────
	// DISPUTE SYSTEM TESTS
	// ─────────────────────────────────────────────────────────────────────
	describe("Dispute System", () => {
		test("Dispute requires reason", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			const res = await request(app)
				.post(`/api/exchanges/${exchange._id}/dispute`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({});

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/reason is required/i);
		});

		test("Participant can open dispute", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			const res = await request(app)
				.post(`/api/exchanges/${exchange._id}/dispute`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ reason: "Item not as described" });

			expect(res.status).toBe(201);
			expect(res.body.data.disputeStatus).toBe("open");
			expect(res.body.data.status).toBe("disputed");
		});

		test("Cannot open dispute if already open", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			await request(app)
				.post(`/api/exchanges/${exchange._id}/dispute`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ reason: "First dispute" });

			const res = await request(app)
				.post(`/api/exchanges/${exchange._id}/dispute`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ reason: "Second dispute" });

			expect(res.status).toBe(400);
			// Could be "already open" or "only on accepted/active" since status changed to disputed
			expect(res.body.message).toMatch(/already open|only be opened/i);
		});

		test("Non-participant cannot open dispute", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			const res = await request(app)
				.post(`/api/exchanges/${exchange._id}/dispute`)
				.set("Authorization", `Bearer ${thirdToken}`)
				.send({ reason: "Unauthorized" });

			expect(res.status).toBe(403);
		});

		test("Admin can resolve dispute", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			await request(app)
				.post(`/api/exchanges/${exchange._id}/dispute`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ reason: "Test dispute" });

			const res = await request(app)
				.put(`/api/exchanges/${exchange._id}/dispute/resolve`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ resolution: "Refund issued", outcome: "buyer_wins" });

			expect(res.status).toBe(200);
			expect(res.body.data.disputeStatus).toBe("resolved");
		});

		test("Cannot resolve non-existent dispute", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			const res = await request(app)
				.put(`/api/exchanges/${exchange._id}/dispute/resolve`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ resolution: "No dispute", outcome: "mutual" });

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/no open dispute/i);
		});

		test("Non-admin cannot resolve dispute", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			await request(app)
				.post(`/api/exchanges/${exchange._id}/dispute`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ reason: "Test" });

			const res = await request(app)
				.put(`/api/exchanges/${exchange._id}/dispute/resolve`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ resolution: "Unauthorized", outcome: "mutual" });

			expect(res.status).toBe(403);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// HANDOVER PHOTO UPLOAD TESTS
	// ─────────────────────────────────────────────────────────────────────
	describe("Handover Photo Upload", () => {
		test("Participant can upload handover photo", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			const res = await request(app)
				.put(`/api/exchanges/${exchange._id}/handover-photo`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ photoUrl: "https://example.com/photo1.jpg" });

			expect(res.status).toBe(200);
			expect(res.body.photos).toContain("https://example.com/photo1.jpg");
		});

		test("Multiple photos can be uploaded", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			await request(app)
				.put(`/api/exchanges/${exchange._id}/handover-photo`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ photoUrl: "https://example.com/photo1.jpg" });

			await request(app)
				.put(`/api/exchanges/${exchange._id}/handover-photo`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ photoUrl: "https://example.com/photo2.jpg" });

			const res = await request(app)
				.get(`/api/exchanges/${exchange._id}`)
				.set("Authorization", `Bearer ${sellerToken}`);

			expect(res.body.data.handoverPhotos.length).toBe(2);
		});

		test("Photo URL is required", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			const res = await request(app)
				.put(`/api/exchanges/${exchange._id}/handover-photo`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({});

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/photo url is required/i);
		});

		test("Non-participant cannot upload photo", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			const res = await request(app)
				.put(`/api/exchanges/${exchange._id}/handover-photo`)
				.set("Authorization", `Bearer ${thirdToken}`)
				.send({ photoUrl: "https://example.com/unauthorized.jpg" });

			expect(res.status).toBe(403);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// QR HANDSHAKE REGENERATION TESTS
	// ─────────────────────────────────────────────────────────────────────
	describe("QR Handshake Regeneration", () => {
		test("Rate limiting - Max 5 regenerations", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			// Generate initial token
			await request(app)
				.put(`/api/exchanges/${exchange._id}/handshake/generate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			// Regenerate 5 times
			for (let i = 0; i < 4; i++) { // 1 already done above + 4 more = 5 total
				await request(app)
					.put(`/api/exchanges/${exchange._id}/handshake/regenerate`)
					.set("Authorization", `Bearer ${sellerToken}`);
			}

			// 6th regeneration should fail
			const res = await request(app)
				.put(`/api/exchanges/${exchange._id}/handshake/regenerate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			expect(res.status).toBe(429);
			expect(res.body.message).toMatch(/maximum.*regenerations/i);
		});

		test("Regeneration tracking in history", async () => {
			const listing = await createListing(sellerToken);
			const exchange = await createAcceptedExchange(sellerToken, buyerToken, listing);

			await request(app)
				.put(`/api/exchanges/${exchange._id}/handshake/generate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			await request(app)
				.put(`/api/exchanges/${exchange._id}/handshake/regenerate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			const res = await request(app)
				.get(`/api/exchanges/${exchange._id}`)
				.set("Authorization", `Bearer ${sellerToken}`);

			const history = res.body.data.history;
			const regenEntries = history.filter(h => 
				h.action.includes("regenerate") || h.action.includes("invalidated")
			);
			
			expect(regenEntries.length).toBeGreaterThan(0);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// EDGE CASES
	// ─────────────────────────────────────────────────────────────────────
	describe("Edge Cases", () => {
		test("Missing authentication returns 401", async () => {
			const listing = await createListing(sellerToken);
			const res = await request(app)
				.post("/api/exchanges")
				.send({ listingId: listing._id, offeredItems: "No auth" });

			expect(res.status).toBe(401);
		});

		test("Concurrent status updates handled safely", async () => {
			const listing = await createListing(sellerToken);
			const prop = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing._id, offeredItems: "Concurrent test" });

			const exchangeId = prop.body.data._id;

			const [r1, r2] = await Promise.all([
				request(app)
					.put(`/api/exchanges/${exchangeId}/status`)
					.set("Authorization", `Bearer ${sellerToken}`)
					.send({ status: "accepted" }),
				request(app)
					.put(`/api/exchanges/${exchangeId}/status`)
					.set("Authorization", `Bearer ${sellerToken}`)
					.send({ status: "rejected" })
			]);

			expect(r1.status === 200 || r2.status === 200).toBe(true);
		});
	});

	// Cleanup
	afterAll(async () => {
		await Exchange.deleteMany({
			$or: [
				{ buyerId: buyerId },
				{ sellerId: sellerId }
			]
		});
	});
});
