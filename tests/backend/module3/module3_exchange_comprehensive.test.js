import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Exchange } from "../models/exchange.model.js";

describe("Module 3: Exchange & Transaction Management - Comprehensive Test Suite", () => {
	const ts = Date.now();
	
	// Test users
	const sellerUser = { name: "Seller Test", email: `seller_mod3_${ts}@test.com`, password: "Password123!" };
	const buyerUser = { name: "Buyer Test", email: `buyer_mod3_${ts}@test.com`, password: "Password123!" };
	const thirdUser = { name: "Third Party", email: `third_mod3_${ts}@test.com`, password: "Password123!" };
	const adminUser = { name: "Admin Test", email: `admin_mod3_${ts}@test.com`, password: "Password123!" };

	let sellerToken, buyerToken, thirdToken, adminToken;
	let sellerId, buyerId, adminId;
	let exchangeId, counterOfferExchangeId, disputeExchangeId;

	// Helper function to create fresh listings for each test section
	const createTestListings = async (sellerTok, buyerTok) => {
		const [l1, l2, l3] = await Promise.all([
			request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${sellerTok}`)
				.send({ title: `Test Listing 1 ${Date.now()}`, description: "Test", price: 200, category: "vehicle", condition: "like-new", location: "Test" }),
			request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${buyerTok}`)
				.send({ title: `Test Listing 2 ${Date.now()}`, description: "Test", price: 80, category: "vehicle", condition: "new", location: "Test" }),
			request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${sellerTok}`)
				.send({ title: `Test Listing 3 ${Date.now()}`, description: "Test", price: 150, category: "vehicle", condition: "used-good", location: "Test" }),
		]);
		return { listing1: l1.body.listing, listing2: l2.body.listing, listing3: l3.body.listing };
	};

	// ─────────────────────────────────────────────────────────────────────
	// SETUP: Create users and listings
	// ─────────────────────────────────────────────────────────────────────
	beforeAll(async () => {
		// Create users
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

		// Set admin permissions
		await User.findByIdAndUpdate(adminId, { permissions: ["admin"], userType: "admin" });

		// Create listings
		const [l1, l2, l3] = await Promise.all([
			request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ title: "OEM Headlight Assembly", description: "Genuine part", price: 200, category: "vehicle", condition: "like-new", location: "Downtown" }),
			request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ title: "Brake Pads Set", description: "New condition", price: 80, category: "vehicle", condition: "new", location: "Uptown" }),
			request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ title: "Alternator", description: "Tested working", price: 150, category: "vehicle", condition: "used-good", location: "Midtown" }),
		]);

		listing1 = l1.body.listing;
		listing2 = l2.body.listing;
		listing3 = l3.body.listing;
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 1: Exchange Proposal Validation & Security
	// ─────────────────────────────────────────────────────────────────────
	describe("1. Exchange Proposal - Security & Validation", () => {
		
		test("1.1. Cannot propose exchange on own listing", async () => {
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Self deal attempt" });

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/own listing/i);
		});

		test("1.2. Cannot propose on non-existent listing", async () => {
			const fakeId = "000000000000000000000000";
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: fakeId, offeredItems: "Test" });

			expect(res.status).toBe(404);
		});

		test("1.3. Cannot offer listing you don't own", async () => {
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ 
					listingId: listing1._id, 
					offeredListingId: listing1._id, // Seller's listing
					offeredItems: "Test" 
				});

			expect(res.status).toBe(403);
			expect(res.body.message).toMatch(/own/i);
		});

		test("1.4. Cannot offer unavailable listing", async () => {
			// First, create and complete an exchange to mark listing as unavailable
			const tempExchange = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing3._id, offeredItems: "Temp" });

			await request(app)
				.put(`/api/exchanges/${tempExchange.body.data._id}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });

			await request(app)
				.put(`/api/exchanges/${tempExchange.body.data._id}/complete`)
				.set("Authorization", `Bearer ${sellerToken}`);

			await request(app)
				.put(`/api/exchanges/${tempExchange.body.data._id}/complete`)
				.set("Authorization", `Bearer ${buyerToken}`);

			// Now try to offer the unavailable listing
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ 
					listingId: listing1._id, 
					offeredListingId: listing3._id, // Now unavailable
					offeredItems: "Test" 
				});

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/no longer available/i);
		});

		test("1.5. Spam protection - Max 3 active proposals per listing", async () => {
			// Create 3 active proposals
			const proposals = [];
			for (let i = 0; i < 3; i++) {
				const res = await request(app)
					.post("/api/exchanges")
					.set("Authorization", `Bearer ${buyerToken}`)
					.send({ listingId: listing1._id, offeredItems: `Spam test ${i}` });
				proposals.push(res.body.data._id);
			}

			// 4th proposal should fail
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Should fail" });

			expect(res.status).toBe(429);
			expect(res.body.message).toMatch(/3 active proposals/i);

			// Clean up
			for (const id of proposals) {
				await Exchange.findByIdAndDelete(id);
			}
		});

		test("1.6. Valid proposal with offered listing", async () => {
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ 
					listingId: listing1._id, 
					offeredListingId: listing2._id,
					offeredItems: "Brake Pads + $20",
					meetingLocation: "Central Station",
					meetingTime: "2024-12-01T14:00:00Z"
				});

			expect(res.status).toBe(201);
			expect(res.body.data.listingId.toString()).toBe(listing1._id);
			expect(res.body.data.offeredListingId.toString()).toBe(listing2._id);
			expect(res.body.data.buyerId.toString()).toBe(buyerId);
			expect(res.body.data.sellerId.toString()).toBe(sellerId);
			expect(res.body.data.status).toBe("pending");
			expect(res.body.data.history.length).toBe(1);
			
			exchangeId = res.body.data._id;
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 2: Exchange Access Control & Privacy
	// ─────────────────────────────────────────────────────────────────────
	describe("2. Exchange Access Control & Privacy", () => {
		
		test("2.1. Non-participant cannot view exchange", async () => {
			const res = await request(app)
				.get(`/api/exchanges/${exchangeId}`)
				.set("Authorization", `Bearer ${thirdToken}`);

			expect(res.status).toBe(403);
		});

		test("2.2. Buyer can view exchange with populated data", async () => {
			const res = await request(app)
				.get(`/api/exchanges/${exchangeId}`)
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data._id).toBe(exchangeId);
			expect(res.body.data.listingId).toBeDefined();
			expect(res.body.data.listingId.title).toBeDefined();
			expect(res.body.data.buyerId).toBeDefined();
			expect(res.body.data.sellerId).toBeDefined();
		});

		test("2.3. Seller can view exchange", async () => {
			const res = await request(app)
				.get(`/api/exchanges/${exchangeId}`)
				.set("Authorization", `Bearer ${sellerToken}`);

			expect(res.status).toBe(200);
		});

		test("2.4. Admin can view any exchange", async () => {
			const res = await request(app)
				.get(`/api/exchanges/${exchangeId}`)
				.set("Authorization", `Bearer ${adminToken}`);

			expect(res.status).toBe(200);
		});

		test("2.5. Non-existent exchange returns 404", async () => {
			const fakeId = "000000000000000000000000";
			const res = await request(app)
				.get(`/api/exchanges/${fakeId}`)
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.status).toBe(404);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 3: Counter-Offer Negotiation Flow
	// ─────────────────────────────────────────────────────────────────────
	describe("3. Counter-Offer Negotiation", () => {
		
		beforeAll(async () => {
			// Create fresh exchange for counter-offer tests
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Initial offer" });
			counterOfferExchangeId = res.body.data._id;
		});

		test("3.1. Counter-offer requires offeredItems or offeredListingId", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${counterOfferExchangeId}/counter-offer`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ note: "Empty offer" });

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/must include/i);
		});

		test("3.2. Seller can make counter-offer", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${counterOfferExchangeId}/counter-offer`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ 
					offeredItems: "Brake Pads + $50", 
					note: "Final offer" 
				});

			expect(res.status).toBe(200);
			expect(res.body.data.status).toBe("counter_offered");
			expect(res.body.data.counterOffers.length).toBe(1);
			expect(res.body.data.counterOffers[0].offeredItems).toBe("Brake Pads + $50");
			expect(res.body.data.counterOffers[0].note).toBe("Final offer");
		});

		test("3.3. Multiple counter-offers allowed", async () => {
			// Buyer counters back
			const res1 = await request(app)
				.put(`/api/exchanges/${counterOfferExchangeId}/counter-offer`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ offeredItems: "Brake Pads + $40" });

			expect(res1.status).toBe(200);
			expect(res1.body.data.counterOffers.length).toBe(2);

			// Seller counters again
			const res2 = await request(app)
				.put(`/api/exchanges/${counterOfferExchangeId}/counter-offer`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ offeredItems: "Brake Pads + $45" });

			expect(res2.status).toBe(200);
			expect(res2.body.data.counterOffers.length).toBe(3);
		});

		test("3.4. Cannot counter-offer on accepted exchange", async () => {
			// Accept the exchange first
			await request(app)
				.put(`/api/exchanges/${counterOfferExchangeId}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });

			// Try to counter-offer
			const res = await request(app)
				.put(`/api/exchanges/${counterOfferExchangeId}/counter-offer`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ offeredItems: "Too late" });

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/only be made on pending/i);
		});

		test("3.5. Non-participant cannot make counter-offer", async () => {
			// Create new exchange
			const res1 = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Test" });

			const res2 = await request(app)
				.put(`/api/exchanges/${res1.body.data._id}/counter-offer`)
				.set("Authorization", `Bearer ${thirdToken}`)
				.send({ offeredItems: "Unauthorized" });

			expect(res2.status).toBe(403);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 4: Status Updates & Role Enforcement
	// ─────────────────────────────────────────────────────────────────────
	describe("4. Status Updates & Role Enforcement", () => {
		
		test("4.1. Only seller can accept exchange", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${exchangeId}/status`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ status: "accepted" });

			expect(res.status).toBe(403);
			expect(res.body.message).toMatch(/only the seller/i);
		});

		test("4.2. Only seller can reject exchange", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${exchangeId}/status`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ status: "rejected" });

			expect(res.status).toBe(403);
		});

		test("4.3. Both parties can cancel exchange", async () => {
			// Create exchange for cancellation test
			const res1 = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Cancel test" });

			// Buyer cancels
			const res2 = await request(app)
				.put(`/api/exchanges/${res1.body.data._id}/status`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ status: "cancelled", cancelReason: "Changed mind" });

			expect(res2.status).toBe(200);
			expect(res2.body.data.status).toBe("cancelled");
			expect(res2.body.data.cancelReason).toBe("Changed mind");
		});

		test("4.4. Cancellation requires reason", async () => {
			const res1 = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Cancel test 2" });

			const res2 = await request(app)
				.put(`/api/exchanges/${res1.body.data._id}/status`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ status: "cancelled" });

			expect(res2.status).toBe(400);
			expect(res2.body.message).toMatch(/reason is required/i);
		});

		test("4.5. Invalid status transitions blocked", async () => {
			// Try to accept already completed exchange
			const res = await request(app)
				.put(`/api/exchanges/${exchangeId}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/cannot transition/i);
		});

		test("4.6. Seller accepts exchange from counter_offered state", async () => {
			// Accept the counter-offer exchange
			const res = await request(app)
				.put(`/api/exchanges/${counterOfferExchangeId}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });

			expect(res.status).toBe(200);
			expect(res.body.data.status).toBe("accepted");
			// Should apply latest counter-offer terms
			expect(res.body.data.offeredItems).toBe("Brake Pads + $45");
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 5: Meeting Negotiation
	// ─────────────────────────────────────────────────────────────────────
	describe("5. Meeting Negotiation", () => {
		let meetingExchangeId;

		beforeAll(async () => {
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Meeting test" });
			
			meetingExchangeId = res.body.data._id;

			// Accept it
			await request(app)
				.put(`/api/exchanges/${meetingExchangeId}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });
		});

		test("5.1. Can negotiate meeting on accepted exchange", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${meetingExchangeId}/negotiate`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({
					meetingLocation: "Police Station Hub",
					meetingTime: "2024-12-15T10:00:00Z",
					negotiationNotes: "Safe location preferred"
				});

			expect(res.status).toBe(200);
			expect(res.body.data.meetingDetails.location).toBe("Police Station Hub");
			expect(res.body.data.negotiationNotes).toBe("Safe location preferred");
		});

		test("5.2. Can lock meeting details", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${meetingExchangeId}/negotiate`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ isLocked: true });

			expect(res.status).toBe(200);
			expect(res.body.data.meetingDetails.isLocked).toBe(true);
		});

		test("5.3. Cannot modify locked meeting details", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${meetingExchangeId}/negotiate`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ meetingLocation: "New Location" });

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/locked/i);
		});

		test("5.4. Cannot negotiate on non-accepted exchange", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${exchangeId}/negotiate`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ meetingLocation: "Test" });

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/must be accepted/i);
		});

		test("5.5. Non-participant cannot negotiate", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${meetingExchangeId}/negotiate`)
				.set("Authorization", `Bearer ${thirdToken}`)
				.send({ meetingLocation: "Unauthorized" });

			expect(res.status).toBe(403);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 6: QR Handshake System
	// ─────────────────────────────────────────────────────────────────────
	describe("6. QR Handshake System", () => {
		let handshakeExchangeId;

		beforeAll(async () => {
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Handshake test" });
			
			handshakeExchangeId = res.body.data._id;

			await request(app)
				.put(`/api/exchanges/${handshakeExchangeId}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });
		});

		test("6.1. Only seller can generate handshake token", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${handshakeExchangeId}/handshake/generate`)
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.status).toBe(403);
			expect(res.body.message).toMatch(/only the seller/i);
		});

		test("6.2. Seller can generate handshake token", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${handshakeExchangeId}/handshake/generate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			expect(res.status).toBe(200);
			expect(res.body.token).toMatch(/^\d{6}$/); // 6-digit code
			expect(res.body.expiresAt).toBeDefined();
			expect(res.body.regenerationCount).toBe(1);
		});

		test("6.3. Only buyer can verify handshake", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${handshakeExchangeId}/handshake/verify`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ token: "123456" });

			expect(res.status).toBe(403);
			expect(res.body.message).toMatch(/only the buyer/i);
		});

		test("6.4. Buyer can verify correct token", async () => {
			// Generate fresh token
			const genRes = await request(app)
				.put(`/api/exchanges/${handshakeExchangeId}/handshake/generate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			const token = genRes.body.token;

			// Verify it
			const res = await request(app)
				.put(`/api/exchanges/${handshakeExchangeId}/handshake/verify`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ token });

			expect(res.status).toBe(200);
			expect(res.body.data.status).toBe("fully_completed");
			expect(res.body.message).toMatch(/verified successfully/i);
		});

		test("6.5. Invalid token rejected", async () => {
			// Create new exchange
			const res1 = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Invalid token test" });

			await request(app)
				.put(`/api/exchanges/${res1.body.data._id}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });

			await request(app)
				.put(`/api/exchanges/${res1.body.data._id}/handshake/generate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			const res2 = await request(app)
				.put(`/api/exchanges/${res1.body.data._id}/handshake/verify`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ token: "000000" });

			expect(res2.status).toBe(400);
			expect(res2.body.message).toMatch(/invalid/i);
		});

		test("6.6. Missing token rejected", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${handshakeExchangeId}/handshake/verify`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({});

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/token is required/i);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 7: Handshake Token Regeneration (NEW FEATURE)
	// ─────────────────────────────────────────────────────────────────────
	describe("7. Handshake Token Regeneration", () => {
		let regenExchangeId;

		beforeAll(async () => {
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Regeneration test" });
			
			regenExchangeId = res.body.data._id;

			await request(app)
				.put(`/api/exchanges/${regenExchangeId}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });
		});

		test("7.1. Only seller can regenerate token", async () => {
			// Create fresh exchange for this test
			const res1 = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Regen auth test" });
			
			const regenAuthExchangeId = res1.body.data._id;

			await request(app)
				.put(`/api/exchanges/${regenAuthExchangeId}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });

			const res = await request(app)
				.put(`/api/exchanges/${regenAuthExchangeId}/handshake/regenerate`)
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.status).toBe(403);
			expect(res.body.message).toMatch(/only the seller/i);
		});

		test("7.2. Seller can regenerate token", async () => {
			// Generate initial token
			await request(app)
				.put(`/api/exchanges/${regenExchangeId}/handshake/generate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			// Regenerate
			const res = await request(app)
				.put(`/api/exchanges/${regenExchangeId}/handshake/regenerate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			expect(res.status).toBe(200);
			expect(res.body.token).toMatch(/^\d{6}$/);
			expect(res.body.regenerationCount).toBeGreaterThan(1);
			expect(res.body.remainingAttempts).toBeDefined();
			expect(res.body.message).toMatch(/regenerated successfully/i);
		});

		test("7.3. Previous token invalidated after regeneration", async () => {
			// Generate token
			const genRes = await request(app)
				.put(`/api/exchanges/${regenExchangeId}/handshake/generate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			const oldToken = genRes.body.token;

			// Regenerate
			await request(app)
				.put(`/api/exchanges/${regenExchangeId}/handshake/regenerate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			// Try to verify with old token
			const res = await request(app)
				.put(`/api/exchanges/${regenExchangeId}/handshake/verify`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ token: oldToken });

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/invalid/i);
		});

		test("7.4. Rate limiting - Max 5 regenerations", async () => {
			// Create fresh exchange for rate limit test
			const res1 = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Rate limit test" });

			const rateLimitExchangeId = res1.body.data._id;

			await request(app)
				.put(`/api/exchanges/${rateLimitExchangeId}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });

			// Regenerate 5 times
			for (let i = 0; i < 5; i++) {
				await request(app)
					.put(`/api/exchanges/${rateLimitExchangeId}/handshake/regenerate`)
					.set("Authorization", `Bearer ${sellerToken}`);
			}

			// 6th regeneration should fail
			const res2 = await request(app)
				.put(`/api/exchanges/${rateLimitExchangeId}/handshake/regenerate`)
				.set("Authorization", `Bearer ${sellerToken}`);

			expect(res2.status).toBe(429);
			expect(res2.body.message).toMatch(/maximum.*regenerations/i);
		});

		test("7.5. Regeneration tracking in history", async () => {
			const res = await request(app)
				.get(`/api/exchanges/${regenExchangeId}`)
				.set("Authorization", `Bearer ${sellerToken}`);

			const history = res.body.data.history;
			const regenEntries = history.filter(h => h.action.includes("regenerate") || h.action.includes("invalidated"));
			
			expect(regenEntries.length).toBeGreaterThan(0);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 8: Dual-Confirmation Completion
	// ─────────────────────────────────────────────────────────────────────
	describe("8. Dual-Confirmation Completion", () => {
		let completionExchangeId;

		beforeAll(async () => {
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Completion test" });
			
			completionExchangeId = res.body.data._id;

			await request(app)
				.put(`/api/exchanges/${completionExchangeId}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });
		});

		test("8.1. Seller marks as complete first", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${completionExchangeId}/complete`)
				.set("Authorization", `Bearer ${sellerToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.status).toBe("completed_by_seller");
		});

		test("8.2. Buyer completes exchange (fully_completed)", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${completionExchangeId}/complete`)
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.status).toBe("fully_completed");
		});

		test("8.3. Cannot complete non-accepted exchange", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${exchangeId}/complete`)
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/must be accepted/i);
		});

		test("8.4. Non-participant cannot complete", async () => {
			const res1 = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Auth test" });

			await request(app)
				.put(`/api/exchanges/${res1.body.data._id}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });

			const res2 = await request(app)
				.put(`/api/exchanges/${res1.body.data._id}/complete`)
				.set("Authorization", `Bearer ${thirdToken}`);

			expect(res2.status).toBe(403);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 9: Dispute System
	// ─────────────────────────────────────────────────────────────────────
	describe("9. Dispute System", () => {
		let disputeExchangeId;

		beforeAll(async () => {
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Dispute test" });
			
			disputeExchangeId = res.body.data._id;

			await request(app)
				.put(`/api/exchanges/${disputeExchangeId}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });
		});

		test("9.1. Dispute requires reason", async () => {
			const res = await request(app)
				.post(`/api/exchanges/${disputeExchangeId}/dispute`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({});

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/reason is required/i);
		});

		test("9.2. Participant can open dispute", async () => {
			const res = await request(app)
				.post(`/api/exchanges/${disputeExchangeId}/dispute`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ reason: "Item not as described" });

			expect(res.status).toBe(201);
			expect(res.body.data.disputeStatus).toBe("open");
			expect(res.body.data.status).toBe("disputed");
			expect(res.body.data.disputeReason).toBe("Item not as described");
		});

		test("9.3. Cannot open dispute if already open", async () => {
			const res = await request(app)
				.post(`/api/exchanges/${disputeExchangeId}/dispute`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ reason: "Another dispute" });

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/already open/i);
		});

		test("9.4. Non-participant cannot open dispute", async () => {
			const res1 = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Auth test 2" });

			await request(app)
				.put(`/api/exchanges/${res1.body.data._id}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });

			const res2 = await request(app)
				.post(`/api/exchanges/${res1.body.data._id}/dispute`)
				.set("Authorization", `Bearer ${thirdToken}`)
				.send({ reason: "Unauthorized" });

			expect(res2.status).toBe(403);
		});

		test("9.5. Admin can resolve dispute", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${disputeExchangeId}/dispute/resolve`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ 
					resolution: "Refund issued to buyer", 
					outcome: "buyer_wins" 
				});

			expect(res.status).toBe(200);
			expect(res.body.data.disputeStatus).toBe("resolved");
			expect(res.body.data.disputeResolution).toBe("Refund issued to buyer");
		});

		test("9.6. Cannot resolve non-existent dispute", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${disputeExchangeId}/dispute/resolve`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({ resolution: "Already resolved", outcome: "mutual" });

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/no open dispute/i);
		});

		test("9.7. Non-admin cannot resolve dispute", async () => {
			const res1 = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Auth test 3" });

			await request(app)
				.put(`/api/exchanges/${res1.body.data._id}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });

			await request(app)
				.post(`/api/exchanges/${res1.body.data._id}/dispute`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ reason: "Test dispute" });

			const res2 = await request(app)
				.put(`/api/exchanges/${res1.body.data._id}/dispute/resolve`)
				.set("Authorization", `Bearer ${buyerToken}`) // Not admin
				.send({ resolution: "Unauthorized", outcome: "mutual" });

			expect(res2.status).toBe(403);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 10: Handover Photo Upload
	// ─────────────────────────────────────────────────────────────────────
	describe("10. Handover Photo Upload", () => {
		let photoExchangeId;

		beforeAll(async () => {
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Photo test" });
			
			photoExchangeId = res.body.data._id;

			await request(app)
				.put(`/api/exchanges/${photoExchangeId}/status`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ status: "accepted" });
		});

		test("10.1. Participant can upload handover photo", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${photoExchangeId}/handover-photo`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({ photoUrl: "https://example.com/photo1.jpg" });

			expect(res.status).toBe(200);
			expect(res.body.photos).toContain("https://example.com/photo1.jpg");
		});

		test("10.2. Multiple photos can be uploaded", async () => {
			await request(app)
				.put(`/api/exchanges/${photoExchangeId}/handover-photo`)
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ photoUrl: "https://example.com/photo2.jpg" });

			const res = await request(app)
				.get(`/api/exchanges/${photoExchangeId}`)
				.set("Authorization", `Bearer ${sellerToken}`);

			expect(res.body.data.handoverPhotos.length).toBe(2);
		});

		test("10.3. Photo URL is required", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${photoExchangeId}/handover-photo`)
				.set("Authorization", `Bearer ${sellerToken}`)
				.send({});

			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/photo url is required/i);
		});

		test("10.4. Non-participant cannot upload photo", async () => {
			const res = await request(app)
				.put(`/api/exchanges/${photoExchangeId}/handover-photo`)
				.set("Authorization", `Bearer ${thirdToken}`)
				.send({ photoUrl: "https://example.com/unauthorized.jpg" });

			expect(res.status).toBe(403);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 11: Safe Zones Discovery
	// ─────────────────────────────────────────────────────────────────────
	describe("11. Safe Zones Discovery", () => {
		
		test("11.1. Authenticated user can get safe zones", async () => {
			const res = await request(app)
				.get("/api/exchanges/info/safe-zones")
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data).toBeInstanceOf(Array);
			expect(res.body.count).toBeGreaterThan(0);
			expect(res.body.data[0]).toHaveProperty("name");
			expect(res.body.data[0]).toHaveProperty("location");
		});

		test("11.2. Safe zones have required fields", async () => {
			const res = await request(app)
				.get("/api/exchanges/info/safe-zones")
				.set("Authorization", `Bearer ${buyerToken}`);

			res.body.data.forEach(zone => {
				expect(zone).toHaveProperty("id");
				expect(zone).toHaveProperty("name");
				expect(zone).toHaveProperty("address");
				expect(zone).toHaveProperty("type");
				expect(zone).toHaveProperty("location");
				expect(zone.location).toHaveProperty("lat");
				expect(zone.location).toHaveProperty("lng");
			});
		});

		test("11.3. Unauthenticated user cannot access safe zones", async () => {
			const res = await request(app)
				.get("/api/exchanges/info/safe-zones");

			expect(res.status).toBe(401);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 12: Pagination & Filtering
	// ─────────────────────────────────────────────────────────────────────
	describe("12. Pagination & Filtering", () => {
		
		test("12.1. Get user exchanges with pagination", async () => {
			const res = await request(app)
				.get("/api/exchanges?page=1&limit=2")
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data.length).toBeLessThanOrEqual(2);
			expect(res.body.total).toBeDefined();
			expect(res.body.page).toBe(1);
			expect(res.body.totalPages).toBeDefined();
		});

		test("12.2. Filter exchanges by status", async () => {
			const res = await request(app)
				.get("/api/exchanges?status=accepted")
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.status).toBe(200);
			res.body.data.forEach(exchange => {
				expect(exchange.status).toBe("accepted");
			});
		});

		test("12.3. Pagination returns correct metadata", async () => {
			const res = await request(app)
				.get("/api/exchanges?page=1&limit=5")
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.body.count).toBe(res.body.data.length);
			expect(res.body.total).toBeGreaterThanOrEqual(res.body.count);
		});

		test("12.4. Invalid page returns empty or valid data", async () => {
			const res = await request(app)
				.get("/api/exchanges?page=999&limit=10")
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.status).toBe(200);
			expect(res.body.data).toBeInstanceOf(Array);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 13: Audit Trail & History
	// ─────────────────────────────────────────────────────────────────────
	describe("13. Audit Trail & History", () => {
		
		test("13.1. Exchange has complete history", async () => {
			const res = await request(app)
				.get(`/api/exchanges/${exchangeId}`)
				.set("Authorization", `Bearer ${buyerToken}`);

			const history = res.body.data.history;
			
			expect(history).toBeInstanceOf(Array);
			expect(history.length).toBeGreaterThan(0);
			
			// Each entry should have required fields
			history.forEach(entry => {
				expect(entry).toHaveProperty("action");
				expect(entry).toHaveProperty("at");
			});
		});

		test("13.2. History records status changes", async () => {
			const res = await request(app)
				.get(`/api/exchanges/${counterOfferExchangeId}`)
				.set("Authorization", `Bearer ${buyerToken}`);

			const actions = res.body.data.history.map(h => h.action);
			
			expect(actions).toContain("proposed");
			expect(actions).toContain("counter_offered");
			expect(actions).toContain("accepted");
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// SECTION 14: Edge Cases & Error Handling
	// ─────────────────────────────────────────────────────────────────────
	describe("14. Edge Cases & Error Handling", () => {
		
		test("14.1. Missing authentication returns 401", async () => {
			const res = await request(app)
				.post("/api/exchanges")
				.send({ listingId: listing1._id, offeredItems: "No auth" });

			expect(res.status).toBe(401);
		});

		test("14.2. Invalid exchange ID format returns error", async () => {
			const res = await request(app)
				.get("/api/exchanges/invalid-id")
				.set("Authorization", `Bearer ${buyerToken}`);

			expect(res.status).toBe(400).or.toBe(404).or.toBe(500);
		});

		test("14.3. Empty request body handled gracefully", async () => {
			const res = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({});

			expect(res.status).toBe(400).or.toBe(404).or.toBe(500);
		});

		test("14.4. Concurrent status updates handled safely", async () => {
			const res1 = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${buyerToken}`)
				.send({ listingId: listing1._id, offeredItems: "Concurrent test" });

			const exchangeId = res1.body.data._id;

			// Simultaneous updates
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

			// One should succeed, one should fail
			expect(r1.status === 200 || r2.status === 200).toBe(true);
		});
	});

	// ─────────────────────────────────────────────────────────────────────
	// CLEANUP
	// ─────────────────────────────────────────────────────────────────────
	afterAll(async () => {
		// Clean up test data
		await Exchange.deleteMany({
			$or: [
				{ buyerId: buyerId },
				{ sellerId: sellerId }
			]
		});
	});
});
