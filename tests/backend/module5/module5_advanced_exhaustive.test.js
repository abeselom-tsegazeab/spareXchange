import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { TechnicianRequest } from "../models/technicianRequest.model.js";
import { Notification } from "../models/notification.model.js";

describe("Exhaustive Module 5: Advanced Professional Services Verification", () => {
	const ts = Date.now();
	const customerInfo = { name: "M5 Customer", email: `m5customer_${ts}@test.com`, password: "Password123!" };
	const techAInfo = { name: "M5 Tech A", email: `m5techa_${ts}@test.com`, password: "Password123!" };
	const techBInfo = { name: "M5 Tech B", email: `m5techb_${ts}@test.com`, password: "Password123!" };

	let tokenC, tokenA, tokenB;
	let customerId, techAId, techBId;
	let requestId;

	beforeAll(async () => {
		// 1. Setup Users
		const [rC, rA, rB] = await Promise.all([
			request(app).post("/api/auth/signup").send(customerInfo),
			request(app).post("/api/auth/signup").send(techAInfo),
			request(app).post("/api/auth/signup").send(techBInfo)
		]);

		tokenC = rC.body.accessToken;
		tokenA = rA.body.accessToken;
		tokenB = rB.body.accessToken;

		customerId = rC.body.user._id;
		techAId = rA.body.user._id;
		techBId = rB.body.user._id;

		// 2. Setup Technicians (Expertise & Verification)
		await User.findByIdAndUpdate(techAId, { 
			userType: "technician", 
			roleStatus: "verified", 
			expertise: "Engine Repair",
			locationCoords: { type: "Point", coordinates: [0, 0] }
		});
		await User.findByIdAndUpdate(techBId, { 
			userType: "technician", 
			roleStatus: "verified", 
			expertise: "Engine Repair",
			locationCoords: { type: "Point", coordinates: [0.1, 0.1] } // Close by
		});
		await User.findByIdAndUpdate(customerId, {
			locationCoords: { type: "Point", coordinates: [0.01, 0.01] }
		});
	}, 120000);

	afterAll(async () => {
		await User.deleteMany({ email: { $regex: ts } });
		await TechnicianRequest.deleteMany({ userId: customerId });
		await Notification.deleteMany({ userId: { $in: [techAId, techBId] } });
		await mongoose.connection.close();
	});

	// ────────────────────────────────────────────────────────────────────────
	// 1. Creation & Matching
	// ────────────────────────────────────────────────────────────────────────

	test("1. Create Technician Request & Trigger Matching", async () => {
		const res = await request(app)
			.post("/api/technician-requests")
			.set("Authorization", `Bearer ${tokenC}`)
			.send({
				serviceType: "Engine Repair",
				description: "Engine overheating problems.",
				location: "Test Workshop",
				latitude: 0,
				longitude: 0,
				budgetMin: 100,
				budgetMax: 500
			});

		expect(res.status).toBe(201);
		expect(res.body.request.status).toBe("pending");
		requestId = res.body.request._id;

		// Allow time for background matching
		await new Promise(resolve => setTimeout(resolve, 1000));

		// Check if Technicians got notifications
		const notifications = await Notification.find({ relatedId: requestId });
		expect(notifications.length).toBeGreaterThanOrEqual(1);
		expect(notifications[0].type).toBe("technician-request");
	});

	// ────────────────────────────────────────────────────────────────────────
	// 2. Bidding Flow
	// ────────────────────────────────────────────────────────────────────────

	test("2. Technicians Submit Quotes (Bids)", async () => {
		// Tech A Quote
		const resA = await request(app)
			.post(`/api/technician-requests/${requestId}/quote`)
			.set("Authorization", `Bearer ${tokenA}`)
			.send({ estimatedCost: 350, additionalNotes: "I can fix it tomorrow." });
		
		expect(resA.status).toBe(200);

		// Tech B Quote
		const resB = await request(app)
			.post(`/api/technician-requests/${requestId}/quote`)
			.set("Authorization", `Bearer ${tokenB}`)
			.send({ estimatedCost: 300, additionalNotes: "I am available now." });
		
		expect(resB.status).toBe(200);

		// Verify request updated to 'quoted'
		const checkRes = await request(app)
			.get(`/api/technician-requests/${requestId}`)
			.set("Authorization", `Bearer ${tokenC}`);
		
		expect(checkRes.body.request.status).toBe("quoted");
		expect(checkRes.body.request.quotes.length).toBe(2);
	});

	// ────────────────────────────────────────────────────────────────────────
	// 3. Hiring & Execution
	// ────────────────────────────────────────────────────────────────────────

	test("3. Customer Accepts Tech B's Quote (Hire)", async () => {
		const res = await request(app)
			.post(`/api/technician-requests/${requestId}/accept-quote/${techBId}`)
			.set("Authorization", `Bearer ${tokenC}`);

		expect(res.status).toBe(200);
		
		const checkRes = await request(app)
			.get(`/api/technician-requests/${requestId}`)
			.set("Authorization", `Bearer ${tokenC}`);
		
		expect(checkRes.body.request.status).toBe("accepted");
		expect(checkRes.body.request.assignedTechnician._id).toBe(techBId);
		expect(checkRes.body.request.estimatedCost).toBe(300);
	});

	test("4. Secure Handshake: Generate Token (Tech B)", async () => {
		const res = await request(app)
			.post(`/api/technician-requests/${requestId}/handshake-token`)
			.set("Authorization", `Bearer ${tokenB}`);

		expect(res.status).toBe(200);
		expect(res.body.token).toBeDefined();
		expect(res.body.token).toHaveLength(6);
	});

	test("5. Secure Handshake: Verify & Complete (Customer)", async () => {
		// Get the token first
		const genRes = await request(app)
			.post(`/api/technician-requests/${requestId}/handshake-token`)
			.set("Authorization", `Bearer ${tokenB}`);
		const token = genRes.body.token;

		const res = await request(app)
			.post(`/api/technician-requests/${requestId}/complete-handshake`)
			.set("Authorization", `Bearer ${tokenC}`)
			.send({ token });

		expect(res.status).toBe(200);
		expect(res.body.message).toMatch(/verified/i);

		// Verify Tech B stats improved
		const techB = await User.findById(techBId);
		expect(techB.totalReviews).toBeGreaterThan(0);
		expect(techB.trustScore).toBeGreaterThan(80); // Default was 80
		expect(techB.achievements).toContain("Pro Service (First Job)");
	});

	// ────────────────────────────────────────────────────────────────────────
	// 4. Security Checks
	// ────────────────────────────────────────────────────────────────────────

	test("6. Security: Unauthorized User cannot Accept Quote", async () => {
		const ts2 = Date.now();
		const hackerInfo = { name: "Hacker", email: `hacker_${ts2}@test.com`, password: "Password123!" };
		const rH = await request(app).post("/api/auth/signup").send(hackerInfo);
		const tokenH = rH.body.accessToken;

		const res = await request(app)
			.post(`/api/technician-requests/${requestId}/accept-quote/${techAId}`)
			.set("Authorization", `Bearer ${tokenH}`);

		expect(res.status).toBe(403);
	});

	test("7. Security: Invalid Token Fails Completion", async () => {
		const res = await request(app)
			.post(`/api/technician-requests/${requestId}/complete-handshake`)
			.set("Authorization", `Bearer ${tokenC}`)
			.send({ token: "000000" });

		expect(res.status).toBe(400);
	});
});
