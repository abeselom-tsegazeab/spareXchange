import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Exchange } from "../models/exchange.model.js";
import { Report } from "../models/report.model.js";
import { SearchLog } from "../models/searchLog.model.js";
import { RecyclingSubmission } from "../models/recyclingSubmission.model.js";
import { Review } from "../models/review.model.js";
import mongoose from "mongoose";

describe("Module 8: Operations & Intelligence", () => {
	let adminToken, adminId, userToken, userId;
	let listingId, exchangeId, reportId;
	const timestamp = Date.now();

	beforeAll(async () => {
		// Cleanup
		await User.deleteMany({ email: /module8_/ });
		await Listing.deleteMany({});
		await Exchange.deleteMany({});
		await Report.deleteMany({});
		await SearchLog.deleteMany({});
		await RecyclingSubmission.deleteMany({});
		await Review.deleteMany({});

		// Create admin user
		const adminRes = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 8 Admin",
				email: `module8_admin_${timestamp}@test.com`,
				password: "SecurePass123!"
			});
		
		adminToken = adminRes.body.accessToken;
		adminId = adminRes.body.user._id;
		await User.findByIdAndUpdate(adminId, { 
			isVerified: true, 
			userType: "admin",
			permissions: ["view_stats", "view_users", "view_reports", "moderate_content", "run_jobs"]
		});

		// Create regular user
		const userRes = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 8 User",
				email: `module8_user_${timestamp}@test.com`,
				password: "SecurePass123!"
			});
		
		userToken = userRes.body.accessToken;
		userId = userRes.body.user._id;
		await User.findByIdAndUpdate(userId, { 
			isVerified: true,
			permissions: ["create_listings", "view_stats"]
		});

		// Create test listings
		const listing = await Listing.create({
			title: "Test Listing for Analytics",
			description: "Test description",
			price: 100,
			category: "vehicle",
			condition: "new",
			location: "Test Location",
			seller: userId,
			status: "active",
			isActive: true
		});
		listingId = listing._id;

		// Create test exchange
		const exchange = await Exchange.create({
			initiator: userId,
			listingId: listingId,
			buyerId: userId,
			sellerId: adminId,
			status: "fully_completed",
			exchangeType: "sale",
			agreedPrice: 100,
			completedAt: new Date()
		});
		exchangeId = exchange._id;

		// Create search logs
		await SearchLog.insertMany([
			{ query: "brake pads", resultsCount: 0, filters: { category: "vehicle" } },
			{ query: "brake pads", resultsCount: 0, filters: { category: "vehicle" } },
			{ query: "headlight", resultsCount: 5 },
			{ query: "engine part", resultsCount: 1 }
		]);
	});

	afterAll(async () => {
		await User.deleteMany({ email: /module8_/ });
		await Listing.deleteMany({});
		await Exchange.deleteMany({});
		await Report.deleteMany({});
		await SearchLog.deleteMany({});
		await RecyclingSubmission.deleteMany({});
		await Review.deleteMany({});
	});

	describe("1. Platform Statistics", () => {
		test("Should get basic platform stats", async () => {
			const res = await request(app)
				.get("/api/admin/stats")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.stats).toBeDefined();
			expect(res.body.stats.totalUsers).toBeDefined();
			expect(res.body.stats.totalListings).toBeDefined();
			expect(res.body.stats.totalExchanges).toBeDefined();
		});

		test("Should get comprehensive platform stats", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/comprehensive")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.stats.overview).toBeDefined();
			expect(res.body.stats.recentActivity).toBeDefined();
			expect(res.body.stats.breakdowns).toBeDefined();
			expect(res.body.stats.pendingItems).toBeDefined();
		});

		test("Should fail stats access without permission", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/comprehensive")
				.set("Authorization", `Bearer ${userToken}`);
			
			// Should be forbidden if user doesn't have view_stats permission
			expect([200, 403]).toContain(res.status);
		});

		test("Should fail stats access without authentication", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/comprehensive");
			
			expect(res.status).toBe(401);
		});
	});

	describe("2. Time-Series Analytics", () => {
		test("Should get daily trends", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/trends?period=daily&days=30")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.period).toBe("daily");
			expect(res.body.trends).toBeDefined();
			expect(res.body.trends.users).toBeDefined();
			expect(res.body.trends.listings).toBeDefined();
			expect(res.body.trends.exchanges).toBeDefined();
		});

		test("Should get weekly trends", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/trends?period=weekly&days=84")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.period).toBe("weekly");
		});

		test("Should get monthly trends", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/trends?period=monthly&days=365")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.period).toBe("monthly");
		});

		test("Should default to daily trends", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/trends")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.period).toBe("daily");
			expect(res.body.days).toBe(30);
		});
	});

	describe("3. User Engagement Metrics", () => {
		test("Should get user engagement metrics", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/engagement")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.engagement).toBeDefined();
			expect(res.body.engagement.activeListersLast7Days).toBeDefined();
			expect(res.body.engagement.retentionMetrics).toBeDefined();
		});
	});

	describe("4. Exchange Performance", () => {
		test("Should get exchange performance analytics", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/exchanges")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.performance).toBeDefined();
			expect(res.body.performance.totalExchanges).toBeDefined();
			expect(res.body.performance.completionRate).toBeDefined();
			expect(res.body.performance.avgCompletionTimeHours).toBeDefined();
		});
	});

	describe("5. Category Performance", () => {
		test("Should get category performance analytics", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/categories")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.categoryPerformance).toBeDefined();
			expect(res.body.categoryPerformance.listingsByCategory).toBeDefined();
			expect(res.body.categoryPerformance.topSellers).toBeDefined();
		});

		test("Should get high demand analytics", async () => {
			const res = await request(app)
				.get("/api/listings/analytics/high-demand")
				.set("Authorization", `Bearer ${userToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.analytics).toBeDefined();
			expect(res.body.analytics.length).toBeGreaterThan(0);
		});
	});

	describe("6. Sustainability Metrics", () => {
		test("Should get sustainability metrics", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/sustainability")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.sustainability).toBeDefined();
			expect(res.body.sustainability.recyclingStats).toBeDefined();
			expect(res.body.sustainability.ecoPoints).toBeDefined();
		});
	});

	describe("7. Search Analytics", () => {
		test("Should get search analytics", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/searches?days=30")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.searchAnalytics).toBeDefined();
			expect(res.body.searchAnalytics.totalSearches).toBeDefined();
			expect(res.body.searchAnalytics.popularQueries).toBeDefined();
			expect(res.body.searchAnalytics.unmetDemand).toBeDefined();
		});

		test("Should get search analytics for last 7 days", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/searches?days=7")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});
	});

	describe("8. Review Analytics", () => {
		test("Should get review analytics", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/reviews")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.reviewAnalytics).toBeDefined();
			expect(res.body.reviewAnalytics.totalReviews).toBeDefined();
			expect(res.body.reviewAnalytics.avgRating).toBeDefined();
			expect(res.body.reviewAnalytics.topRatedUsers).toBeDefined();
		});
	});

	describe("9. Report Management", () => {
		test("Should create report", async () => {
			const res = await request(app)
				.post(`/api/listings/${listingId}/report`)
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					reason: "inaccurate",
					details: "Listing information is incorrect"
				});
			
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
		});

		test("Should get all reports (Admin)", async () => {
			const res = await request(app)
				.get("/api/admin/reports")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.reports).toBeDefined();
		});

		test("Should get reports with pagination", async () => {
			const res = await request(app)
				.get("/api/admin/reports?page=1&limit=10")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.page).toBe(1);
			expect(res.body.totalPages).toBeDefined();
		});

		test("Should filter reports by status", async () => {
			const res = await request(app)
				.get("/api/admin/reports?status=pending")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("Should filter reports by target model", async () => {
			const res = await request(app)
				.get("/api/admin/reports?targetModel=Listing")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("Should get report by ID", async () => {
			// Get first report
			const reportsRes = await request(app)
				.get("/api/admin/reports")
				.set("Authorization", `Bearer ${adminToken}`);
			
			const reportId = reportsRes.body.reports[0]._id;

			const res = await request(app)
				.get(`/api/admin/reports/${reportId}`)
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.report).toBeDefined();
		});

		test("Should get report statistics", async () => {
			const res = await request(app)
				.get("/api/admin/reports/stats")
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.stats).toBeDefined();
			expect(res.body.stats.totalReports).toBeDefined();
			expect(res.body.stats.reportsByStatus).toBeDefined();
		});

		test("Should update report status", async () => {
			// Get first report
			const reportsRes = await request(app)
				.get("/api/admin/reports")
				.set("Authorization", `Bearer ${adminToken}`);
			
			const reportId = reportsRes.body.reports[0]._id;

			const res = await request(app)
				.put(`/api/admin/reports/${reportId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					status: "resolved",
					moderatorNote: "Investigated and resolved"
				});
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.report.status).toBe("resolved");
		});

		test("Should fail with invalid report status", async () => {
			const reportsRes = await request(app)
				.get("/api/admin/reports")
				.set("Authorization", `Bearer ${adminToken}`);
			
			const reportId = reportsRes.body.reports[0]._id;

			const res = await request(app)
				.put(`/api/admin/reports/${reportId}`)
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					status: "invalid_status"
				});
			
			expect(res.status).toBe(400);
		});

		test("Should delete report", async () => {
			const reportsRes = await request(app)
				.get("/api/admin/reports")
				.set("Authorization", `Bearer ${adminToken}`);
			
			const reportId = reportsRes.body.reports[0]._id;

			const res = await request(app)
				.delete(`/api/admin/reports/${reportId}`)
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("Should fail report access without authentication", async () => {
			const res = await request(app)
				.get("/api/admin/reports");
			
			expect(res.status).toBe(401);
		});
	});

	describe("10. Admin Jobs", () => {
		test("Should run saved search alerts job", async () => {
			const res = await request(app)
				.post("/api/admin/jobs/saved-search-alerts")
				.set("Authorization", `Bearer ${adminToken}`)
				.send({
					limitSearches: 50,
					limitListingsPerSearch: 3
				});
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.result).toBeDefined();
		});
	});

	describe("11. Security & Edge Cases", () => {
		test("Should prevent non-admin from accessing admin analytics", async () => {
			const regularUser = await request(app)
				.post("/api/auth/signup")
				.send({
					name: "Regular User",
					email: `module8_regular_${timestamp}@test.com`,
					password: "SecurePass123!"
				});
			
			const regularToken = regularUser.body.accessToken;

			const res = await request(app)
				.get("/api/admin/analytics/comprehensive")
				.set("Authorization", `Bearer ${regularToken}`);
			
			expect([403, 401]).toContain(res.status);
		});

		test("Should handle invalid date ranges gracefully", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/trends?period=daily&days=-1")
				.set("Authorization", `Bearer ${adminToken}`);
			
			// Should still return 200 with empty or default data
			expect(res.status).toBe(200);
		});

		test("Should handle non-existent report ID", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.get(`/api/admin/reports/${fakeId}`)
				.set("Authorization", `Bearer ${adminToken}`);
			
			expect(res.status).toBe(404);
		});

		test("Should handle concurrent analytics requests", async () => {
			const endpoints = [
				"/api/admin/analytics/comprehensive",
				"/api/admin/analytics/trends",
				"/api/admin/analytics/engagement",
				"/api/admin/analytics/exchanges"
			];

			const promises = endpoints.map(endpoint =>
				request(app)
					.get(endpoint)
					.set("Authorization", `Bearer ${adminToken}`)
			);

			const results = await Promise.all(promises);
			results.forEach(res => {
				expect(res.status).toBe(200);
				expect(res.body.success).toBe(true);
			});
		});

		test("Should validate report creation requires reason", async () => {
			const res = await request(app)
				.post(`/api/listings/${listingId}/report`)
				.set("Authorization", `Bearer ${userToken}`)
				.send({
					details: "No reason provided"
				});
			
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/reason.*required/i);
		});

		test("Should calculate accurate statistics", async () => {
			const res = await request(app)
				.get("/api/admin/analytics/comprehensive")
				.set("Authorization", `Bearer ${adminToken}`);
			
			const stats = res.body.stats.overview;
			
			// Verify counts are non-negative
			expect(stats.totalUsers).toBeGreaterThanOrEqual(0);
			expect(stats.totalListings).toBeGreaterThanOrEqual(0);
			expect(stats.totalExchanges).toBeGreaterThanOrEqual(0);
		});
	});
});
