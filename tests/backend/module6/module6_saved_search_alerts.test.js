import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Notification } from "../models/notification.model.js";
import { SavedSearch } from "../models/savedSearch.model.js";
import { processSavedSearchAlerts } from "../services/savedSearchAlerts.service.js";

describe("Module 6: Saved search alerts (backend)", () => {
	const ts = Date.now();
	const userInfo = { name: "M6 User", email: `m6_${ts}@test.com`, password: "Password123!" };
	let token;
	let userId;
	let adminToken;
	let adminId;

	beforeAll(async () => {
		const res = await request(app).post("/api/auth/signup").send(userInfo);
		token = res.body.accessToken;
		userId = res.body.user._id;
		await User.findByIdAndUpdate(userId, { isVerified: true });

		const admin = await request(app).post("/api/auth/signup").send({
			name: "M6 Admin",
			email: `m6admin_${ts}@test.com`,
			password: "Password123!",
		});
		adminToken = admin.body.accessToken;
		adminId = admin.body.user._id;
		await User.findByIdAndUpdate(adminId, { permissions: ["admin", "run_jobs", "view_stats", "view_users", "verify_roles"] });
	});

	afterAll(async () => {
		await Notification.deleteMany({ "data.savedSearchId": { $exists: true } });
		await SavedSearch.deleteMany({ userId });
		await SavedSearch.deleteMany({ userId: adminId });
		await Listing.deleteMany({ seller: userId });
		await Listing.deleteMany({ seller: adminId });
		await User.deleteMany({ email: { $regex: ts } });
		await mongoose.connection.close();
	});

	test("creates a match notification from saved search and dedupes", async () => {
		// Create saved search
		const saved = await SavedSearch.create({
			userId,
			name: "Brake pads near me",
			query: "brake pads",
			filters: { category: "vehicle" },
			geo: { latitude: 8.9806, longitude: 38.7578, radiusKm: 50 },
			notify: true,
		});

		// Create a listing that should match (as a different seller)
		const other = await request(app).post("/api/auth/signup").send({
			name: "M6 Seller",
			email: `m6seller_${ts}@test.com`,
			password: "Password123!",
		});
		const otherToken = other.body.accessToken;
		const otherId = other.body.user._id;
		await User.findByIdAndUpdate(otherId, { isVerified: true, permissions: ["create_listings"] });

		const createRes = await request(app)
			.post("/api/listings")
			.set("Authorization", `Bearer ${otherToken}`)
			.send({
				title: "Brake pads set",
				description: "High quality brake pads for Toyota",
				price: 100,
				category: "vehicle",
				condition: "new",
				location: "Addis Ababa",
				locationCoords: { type: "Point", coordinates: [38.7578, 8.9806] },
				images: [],
			});
		expect(createRes.status).toBe(201);
		const createdListingId = createRes.body.listing._id;

		// Run processor twice (should not duplicate)
		const r1 = await processSavedSearchAlerts({ limitSearches: 50, limitListingsPerSearch: 10 });
		const r2 = await processSavedSearchAlerts({ limitSearches: 50, limitListingsPerSearch: 10 });

		expect(r1.searchesProcessed).toBeGreaterThanOrEqual(1);
		expect(r2.searchesProcessed).toBeGreaterThanOrEqual(1);

		const notifs = await Notification.find({ userId, "data.savedSearchId": saved._id, type: "match", relatedId: createdListingId });
		expect(notifs.length).toBe(1);
		expect(notifs[0].data.source).toBe("saved_search");
		expect(notifs[0].data.score).toBeGreaterThanOrEqual(25);
	});

	test("admin can run saved-search alerts job endpoint", async () => {
		const res = await request(app)
			.post("/api/admin/jobs/saved-search-alerts")
			.set("Authorization", `Bearer ${adminToken}`)
			.send({ limitSearches: 20, limitListingsPerSearch: 5 });

		expect(res.status).toBe(200);
		expect(res.body.success).toBe(true);
		expect(res.body.result).toBeDefined();
		expect(typeof res.body.result.searchesProcessed).toBe("number");
		expect(typeof res.body.result.notificationsCreated).toBe("number");
	});
});

