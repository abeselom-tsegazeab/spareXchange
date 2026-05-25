import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";

describe("Exchange & Transaction Module (Module 3 — Enhanced)", () => {
	const ts = Date.now();
	const userA = { name: "Seller A", email: `sellerA_${ts}@test.com`, password: "Password123!" };
	const userB = { name: "Buyer B",  email: `buyerB_${ts}@test.com`,  password: "Password123!" };
	const userC = { name: "Third Party", email: `third_${ts}@test.com`, password: "Password123!" };

	let tokenA, tokenB, tokenC;
	let userAId, userBId;
	let listingId, listingBId;
	let exchangeId, disputeExchangeId, counterExchangeId;

	// ── Setup ─────────────────────────────────────────────────────────────
	beforeAll(async () => {
		const [rA, rB, rC] = await Promise.all([
			request(app).post("/api/auth/signup").send(userA),
			request(app).post("/api/auth/signup").send(userB),
			request(app).post("/api/auth/signup").send(userC),
		]);
		tokenA  = rA.body.accessToken;
		tokenB  = rB.body.accessToken;
		tokenC  = rC.body.accessToken;
		userAId = rA.body.user?._id || rA.body._id;
		userBId = rB.body.user?._id || rB.body._id;
		await User.findByIdAndUpdate(userAId, { permissions: ["admin"] });

		// User A posts a listing
		const lA = await request(app)
			.post("/api/listings")
			.set("Authorization", `Bearer ${tokenA}`)
			.send({ title: "OEM Headlight", description: "Genuine", price: 200, category: "vehicle", condition: "like-new", location: "Addis" });
		listingId = lA.body.listing._id;

		// User B posts a listing (to offer in exchange)
		const lB = await request(app)
			.post("/api/listings")
			.set("Authorization", `Bearer ${tokenB}`)
			.send({ title: "Alternator", description: "Works great", price: 90, category: "vehicle", condition: "used-good", location: "Bole" });
		listingBId = lB.body.listing._id;
	});

	// ─────────────────────────────────────────────────────────────────────
	// 1. Self-proposal guard
	// ─────────────────────────────────────────────────────────────────────
	test("1. Cannot propose an exchange on your own listing", async () => {
		const res = await request(app)
			.post("/api/exchanges")
			.set("Authorization", `Bearer ${tokenA}`)
			.send({ listingId, offeredItems: "self-deal" });

		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/own listing/i);
	});

	// ─────────────────────────────────────────────────────────────────────
	// 2. offeredListingId ownership validation
	// ─────────────────────────────────────────────────────────────────────
	test("2. Cannot offer a listing you do not own", async () => {
		const res = await request(app)
			.post("/api/exchanges")
			.set("Authorization", `Bearer ${tokenB}`)
			.send({ listingId, offeredListingId: listingId }); // offering User A's listing

		expect(res.status).toBe(403);
		expect(res.body.message).toMatch(/own/i);
	});

	// ─────────────────────────────────────────────────────────────────────
	// 3. Propose with a valid offeredListingId
	// ─────────────────────────────────────────────────────────────────────
	test("3. Buyer can propose offering their own listing", async () => {
		const res = await request(app)
			.post("/api/exchanges")
			.set("Authorization", `Bearer ${tokenB}`)
			.send({ listingId, offeredListingId: listingBId, offeredItems: "Alternator + €10" });

		expect(res.status).toBe(201);
		expect(res.body.data.offeredListingId).toBeDefined();
		exchangeId = res.body.data._id;
	});

	// ─────────────────────────────────────────────────────────────────────
	// 4. Fetch exchange by ID — 403 for non-participant
	// ─────────────────────────────────────────────────────────────────────
	test("4. Non-participant cannot fetch exchange by ID", async () => {
		const res = await request(app)
			.get(`/api/exchanges/${exchangeId}`)
			.set("Authorization", `Bearer ${tokenC}`);
		expect(res.status).toBe(403);
	});

	test("4b. Participant can fetch exchange by ID with populated data", async () => {
		const res = await request(app)
			.get(`/api/exchanges/${exchangeId}`)
			.set("Authorization", `Bearer ${tokenA}`);
		expect(res.status).toBe(200);
		expect(res.body.data._id).toBe(exchangeId);
		expect(res.body.data.listingId).toBeDefined();
	});

	// ─────────────────────────────────────────────────────────────────────
	// 5. Counter-offer flow
	// ─────────────────────────────────────────────────────────────────────
	test("5. Seller can make a counter-offer", async () => {
		const res = await request(app)
			.put(`/api/exchanges/${exchangeId}/counter-offer`)
			.set("Authorization", `Bearer ${tokenA}`)
			.send({ offeredItems: "I'll accept if you add €20 more", note: "Price is firm" });

		expect(res.status).toBe(200);
		expect(res.body.data.status).toBe("counter_offered");
		expect(res.body.data.counterOffers[0].proposedBy).toBeDefined();
	});

	// ─────────────────────────────────────────────────────────────────────
	// 6. Buyer cannot accept (only seller can)
	// ─────────────────────────────────────────────────────────────────────
	test("6. Buyer cannot accept — role-enforced", async () => {
		const res = await request(app)
			.put(`/api/exchanges/${exchangeId}/status`)
			.set("Authorization", `Bearer ${tokenB}`)
			.send({ status: "accepted" });
		expect(res.status).toBe(403);
	});

	// ─────────────────────────────────────────────────────────────────────
	// 7. Seller accepts the exchange (from counter_offered)
	// ─────────────────────────────────────────────────────────────────────
	test("7. Seller accepts exchange → history log updated", async () => {
		const res = await request(app)
			.put(`/api/exchanges/${exchangeId}/status`)
			.set("Authorization", `Bearer ${tokenA}`)
			.send({ status: "accepted" });

		expect(res.status).toBe(200);
		expect(res.body.data.status).toBe("accepted");
		// History should have: proposed, counter_offered, accepted
		expect(res.body.data.history.length).toBeGreaterThanOrEqual(2);
	});

	// ─────────────────────────────────────────────────────────────────────
	// 8. Dispute flow
	// ─────────────────────────────────────────────────────────────────────
	test("8a. Dispute requires a reason", async () => {
		const res = await request(app)
			.post(`/api/exchanges/${exchangeId}/dispute`)
			.set("Authorization", `Bearer ${tokenB}`)
			.send({});
		expect(res.status).toBe(400);
	});

	test("8b. Buyer can open a dispute on accepted exchange", async () => {
		// Create & accept a fresh exchange for dispute test
		const prop = await request(app)
			.post("/api/exchanges")
			.set("Authorization", `Bearer ${tokenB}`)
			.send({ listingId, offeredItems: "dispute-test item" });
		disputeExchangeId = prop.body.data?._id;

		await request(app)
			.put(`/api/exchanges/${disputeExchangeId}/status`)
			.set("Authorization", `Bearer ${tokenA}`)
			.send({ status: "accepted" });

		const res = await request(app)
			.post(`/api/exchanges/${disputeExchangeId}/dispute`)
			.set("Authorization", `Bearer ${tokenB}`)
			.send({ reason: "Item was misrepresented" });

		expect(res.status).toBe(201);
		expect(res.body.data.disputeStatus).toBe("open");
		expect(res.body.data.status).toBe("disputed");
	});

	test("8c. Admin can resolve the dispute", async () => {
		const res = await request(app)
			.put(`/api/exchanges/${disputeExchangeId}/dispute/resolve`)
			.set("Authorization", `Bearer ${tokenA}`) // simulating admin token
			.send({ resolution: "Both parties agreed on a refund", outcome: "mutual" });

		expect(res.status).toBe(200);
		expect(res.body.data.disputeStatus).toBe("resolved");
		expect(res.body.data.status).toBe("cancelled");
	});

	// ─────────────────────────────────────────────────────────────────────
	// 9. Cancellation requires reason
	// ─────────────────────────────────────────────────────────────────────
	test("9. Cancelling without reason → 400", async () => {
		const prop = await request(app)
			.post("/api/exchanges")
			.set("Authorization", `Bearer ${tokenB}`)
			.send({ listingId, offeredItems: "cancel-test" });
		const cancelId = prop.body.data?._id;

		const res = await request(app)
			.put(`/api/exchanges/${cancelId}/status`)
			.set("Authorization", `Bearer ${tokenB}`)
			.send({ status: "cancelled" });
		expect(res.status).toBe(400);
		expect(res.body.message).toMatch(/reason/i);
	});

	// ─────────────────────────────────────────────────────────────────────
	// 10. Dual-confirmation → fully_completed
	// ─────────────────────────────────────────────────────────────────────
	test("10. Dual-confirmation completes exchange atomically", async () => {
		const rA = await request(app)
			.put(`/api/exchanges/${exchangeId}/complete`)
			.set("Authorization", `Bearer ${tokenA}`);
		expect(rA.status).toBe(200);
		expect(rA.body.data.status).toBe("completed_by_seller");

		const rB = await request(app)
			.put(`/api/exchanges/${exchangeId}/complete`)
			.set("Authorization", `Bearer ${tokenB}`);
		expect(rB.status).toBe(200);
		expect(rB.body.data.status).toBe("fully_completed");
	});


	// 12. Pagination on getUserExchanges
	// ─────────────────────────────────────────────────────────────────────
	test("12. getUserExchanges returns paginated results", async () => {
		const res = await request(app)
			.get("/api/exchanges?page=1&limit=2")
			.set("Authorization", `Bearer ${tokenB}`);

		expect(res.status).toBe(200);
		expect(res.body.data.length).toBeLessThanOrEqual(2);
		expect(res.body.total).toBeDefined();
		expect(res.body.totalPages).toBeDefined();
	});
});
