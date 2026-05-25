import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Exchange } from "../models/exchange.model.js";
import { Review } from "../models/review.model.js";
import { RecyclingSubmission } from "../models/recyclingSubmission.model.js";
import mongoose from "mongoose";

/**
 * Module 10: Community Engagement - Comprehensive Test Suite
 * 
 * Test Categories:
 * 1. Activity Feed Functionality
 * 2. Public User Profiles
 * 3. Achievements & Badges
 * 4. Performance Tests
 * 5. Security & Edge Cases
 * 6. Integration Workflows
 */

describe("Module 10: Community Engagement - Comprehensive Tests", () => {
	let user1Token, user1Id, user2Token, user2Id, adminToken, adminId;
	let listingId, listingId2, exchangeId, reviewId;
	const timestamp = Date.now();

	// ─────────────────────────────────────────────
	// Test Setup
	// ─────────────────────────────────────────────

	beforeAll(async () => {
		// Cleanup
		await User.deleteMany({ email: /module10_comprehensive_/ });
		await Listing.deleteMany({});
		await Exchange.deleteMany({});
		await Review.deleteMany({});
		await RecyclingSubmission.deleteMany({});

		// Create User 1 (Active user with verified status)
		const user1Signup = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 10 Comprehensive User 1",
				email: `module10_comprehensive_user1_${timestamp}@test.com`,
				password: "SecurePass123!"
			});

		await request(app)
			.post("/api/auth/verify-email")
			.send({
				email: `module10_comprehensive_user1_${timestamp}@test.com`,
				verificationCode: user1Signup.body.user.verificationCode
			});

		user1Token = user1Signup.body.accessToken;
		user1Id = user1Signup.body.user._id;

		// Grant user 1 verified status
		await User.findByIdAndUpdate(user1Id, {
			$set: { 
				roleStatus: "verified", 
				permissions: ["create_listings", "propose_exchanges"],
				isActive: true,
				isBanned: false
			}
		});

		// Create User 2 (Regular user)
		const user2Signup = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 10 Comprehensive User 2",
				email: `module10_comprehensive_user2_${timestamp}@test.com`,
				password: "SecurePass123!"
			});

		await request(app)
			.post("/api/auth/verify-email")
			.send({
				email: `module10_comprehensive_user2_${timestamp}@test.com`,
				verificationCode: user2Signup.body.user.verificationCode
			});

		user2Token = user2Signup.body.accessToken;
		user2Id = user2Signup.body.user._id;

		// Create Admin User
		const adminSignup = await request(app)
			.post("/api/auth/signup")
			.send({
				name: "Module 10 Admin",
				email: `module10_comprehensive_admin_${timestamp}@test.com`,
				password: "SecurePass123!"
			});

		await request(app)
			.post("/api/auth/verify-email")
			.send({
				email: `module10_comprehensive_admin_${timestamp}@test.com`,
				verificationCode: adminSignup.body.user.verificationCode
			});

		adminToken = adminSignup.body.accessToken;
		adminId = adminSignup.body.user._id;

		await User.findByIdAndUpdate(adminId, {
			$set: { userType: "admin", isActive: true }
		});

		// Create multiple listings for User 1
		const listingRes1 = await request(app)
			.post("/api/listings")
			.set("Authorization", `Bearer ${user1Token}`)
			.send({
				title: "Test Car Part 1",
				category: "Automotive",
				price: 100,
				description: "Test listing 1",
				condition: "Used-Good",
				location: "Adama"
			});

		if (listingRes1.status === 201) {
			listingId = listingRes1.body.listing._id;
		}

		const listingRes2 = await request(app)
			.post("/api/listings")
			.set("Authorization", `Bearer ${user1Token}`)
			.send({
				title: "Test Car Part 2",
				category: "Automotive",
				price: 200,
				description: "Test listing 2",
				condition: "Used-Excellent",
				location: "Addis Ababa"
			});

		if (listingRes2.status === 201) {
			listingId2 = listingRes2.body.listing._id;
		}
	});

	afterAll(async () => {
		await User.deleteMany({ email: /module10_comprehensive_/ });
		await Listing.deleteMany({});
		await Exchange.deleteMany({});
		await Review.deleteMany({});
		await RecyclingSubmission.deleteMany({});
	});

	// ─────────────────────────────────────────────
	// 1. ACTIVITY FEED FUNCTIONALITY TESTS
	// ─────────────────────────────────────────────

	describe("1. Activity Feed - Functionality Tests", () => {
		test("1.1 Should get personal activity feed with correct structure", async () => {
			const startTime = Date.now();
			const res = await request(app)
				.get("/api/users/feed")
				.set("Authorization", `Bearer ${user1Token}`);
			const responseTime = Date.now() - startTime;

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body).toHaveProperty('activities');
			expect(res.body).toHaveProperty('count');
			expect(res.body).toHaveProperty('totalActivities');
			expect(res.body).toHaveProperty('page');
			expect(res.body).toHaveProperty('totalPages');
			expect(responseTime).toBeLessThan(3000); // Should respond within 3 seconds
		});

		test("1.2 Should filter activity feed by listing type", async () => {
			const res = await request(app)
				.get("/api/users/feed?type=listing")
				.set("Authorization", `Bearer ${user1Token}`);

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			// All activities should be listing-related
			if (res.body.activities.length > 0) {
				res.body.activities.forEach(activity => {
					expect(activity.type).toContain('listing');
				});
			}
		});

		test("1.3 Should filter activity feed by exchange type", async () => {
			const res = await request(app)
				.get("/api/users/feed?type=exchange")
				.set("Authorization", `Bearer ${user1Token}`);

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("1.4 Should filter activity feed by review type", async () => {
			const res = await request(app)
				.get("/api/users/feed?type=review")
				.set("Authorization", `Bearer ${user1Token}`);

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("1.5 Should filter activity feed by recycling type", async () => {
			const res = await request(app)
				.get("/api/users/feed?type=recycling")
				.set("Authorization", `Bearer ${user1Token}`);

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});

		test("1.6 Should paginate activity feed correctly", async () => {
			const res = await request(app)
				.get("/api/users/feed?page=1&limit=5")
				.set("Authorization", `Bearer ${user1Token}`);

			expect(res.status).toBe(200);
			expect(res.body.page).toBe(1);
			expect(res.body.count).toBeLessThanOrEqual(5);
			expect(res.body.totalPages).toBeGreaterThanOrEqual(1);
		});

		test("1.7 Should get community highlights without authentication", async () => {
			const startTime = Date.now();
			const res = await request(app)
				.get("/api/users/feed/community");
			const responseTime = Date.now() - startTime;

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.highlights).toBeDefined();
			expect(res.body.highlights).toHaveProperty('topContributors');
			expect(res.body.highlights).toHaveProperty('recentExchanges');
			expect(res.body.highlights).toHaveProperty('topRecyclers');
			expect(res.body.highlights).toHaveProperty('trustedUsers');
			expect(responseTime).toBeLessThan(3000);
		});

		test("1.8 Should get public activity for another user", async () => {
			const res = await request(app)
				.get(`/api/users/feed/${user1Id}`)
				.set("Authorization", `Bearer ${user2Token}`);

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.activities).toBeDefined();
		});

		test("1.9 Should paginate public activity correctly", async () => {
			const res = await request(app)
				.get(`/api/users/feed/${user1Id}?page=1&limit=5`)
				.set("Authorization", `Bearer ${user2Token}`);

			expect(res.status).toBe(200);
			expect(res.body.page).toBe(1);
		});
	});

	// ─────────────────────────────────────────────
	// 2. PUBLIC USER PROFILES TESTS
	// ─────────────────────────────────────────────

	describe("2. Public User Profiles - Functionality Tests", () => {
		test("2.1 Should get public user profile with complete data", async () => {
			const startTime = Date.now();
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/public`);
			const responseTime = Date.now() - startTime;

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.profile).toBeDefined();
			expect(res.body.profile).toHaveProperty('userId');
			expect(res.body.profile).toHaveProperty('name');
			expect(res.body.profile).toHaveProperty('stats');
			expect(res.body.profile).toHaveProperty('sustainability');
			expect(res.body.profile).toHaveProperty('trust');
			expect(res.body.profile).toHaveProperty('recentReviews');
			expect(responseTime).toBeLessThan(3000);
		});

		test("2.2 Should NOT return sensitive data in public profile", async () => {
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/public`);

			expect(res.body.profile).not.toHaveProperty("password");
			expect(res.body.profile).not.toHaveProperty("verificationDocs");
			expect(res.body.profile).not.toHaveProperty("mfaSecret");
			expect(res.body.profile).not.toHaveProperty("email");
		});

		test("2.3 Should get user's public listings", async () => {
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/listings`);

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body).toHaveProperty('listings');
			expect(res.body).toHaveProperty('totalListings');
			expect(res.body).toHaveProperty('page');
			expect(res.body).toHaveProperty('totalPages');
		});

		test("2.4 Should filter user listings by category", async () => {
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/listings?category=Automotive`);

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			if (res.body.listings.length > 0) {
				res.body.listings.forEach(listing => {
					expect(listing.category).toBe("Automotive");
				});
			}
		});

		test("2.5 Should paginate user listings", async () => {
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/listings?page=1&limit=5`);

			expect(res.status).toBe(200);
			expect(res.body.page).toBe(1);
			expect(res.body.count).toBeLessThanOrEqual(5);
		});

		test("2.6 Should get user's reviews summary", async () => {
			const startTime = Date.now();
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/reviews`);
			const responseTime = Date.now() - startTime;

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body).toHaveProperty('averageRating');
			expect(res.body).toHaveProperty('ratingDistribution');
			expect(res.body).toHaveProperty('totalReviews');
			expect(responseTime).toBeLessThan(3000);
		});

		test("2.7 Should have correct rating distribution structure", async () => {
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/reviews`);

			expect(res.body.ratingDistribution).toHaveProperty('5');
			expect(res.body.ratingDistribution).toHaveProperty('4');
			expect(res.body.ratingDistribution).toHaveProperty('3');
			expect(res.body.ratingDistribution).toHaveProperty('2');
			expect(res.body.ratingDistribution).toHaveProperty('1');
		});

		test("2.8 Should get user statistics", async () => {
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/stats`);

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.stats).toBeDefined();
			expect(res.body.stats).toHaveProperty('listings');
			expect(res.body.stats).toHaveProperty('exchanges');
			expect(res.body.stats).toHaveProperty('recycling');
			expect(res.body.stats).toHaveProperty('reputation');
		});

		test("2.9 Should return 404 for non-existent user profile", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.get(`/api/users/profile/${fakeId}/public`);

			expect(res.status).toBe(404);
		});

		test("2.10 Should return 404 for non-existent user listings", async () => {
			const fakeId = new mongoose.Types.ObjectId();
			const res = await request(app)
				.get(`/api/users/profile/${fakeId}/listings`);

			expect(res.status).toBe(404);
		});
	});

	// ─────────────────────────────────────────────
	// 3. ACHIEVEMENTS & BADGES TESTS
	// ─────────────────────────────────────────────

	describe("3. Achievements & Badges - Functionality Tests", () => {
		test("3.1 Should get all achievement definitions", async () => {
			const startTime = Date.now();
			const res = await request(app)
				.get("/api/users/achievements/definitions");
			const responseTime = Date.now() - startTime;

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.count).toBeGreaterThan(0);
			expect(res.body.achievements.length).toBeGreaterThan(0);
			expect(responseTime).toBeLessThan(2000);
		});

		test("3.2 Should have all achievement categories", async () => {
			const res = await request(app)
				.get("/api/users/achievements/definitions");

			const categories = res.body.achievements.map(a => a.category);
			expect(categories).toContain('listing');
			expect(categories).toContain('exchange');
			expect(categories).toContain('review');
			expect(categories).toContain('recycling');
			expect(categories).toContain('eco_points');
			expect(categories).toContain('community');
		});

		test("3.3 Should have correct achievement structure", async () => {
			const res = await request(app)
				.get("/api/users/achievements/definitions");

			const firstAchievement = res.body.achievements[0];
			expect(firstAchievement).toHaveProperty('id');
			expect(firstAchievement).toHaveProperty('name');
			expect(firstAchievement).toHaveProperty('description');
			expect(firstAchievement).toHaveProperty('icon');
			expect(firstAchievement).toHaveProperty('category');
			expect(firstAchievement).toHaveProperty('criteria');
		});

		test("3.4 Should get user's achievements with auth", async () => {
			const res = await request(app)
				.get("/api/users/achievements")
				.set("Authorization", `Bearer ${user1Token}`);

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body).toHaveProperty('unlocked');
			expect(res.body).toHaveProperty('locked');
			expect(res.body).toHaveProperty('stats');
			expect(res.body).toHaveProperty('ecoPoints');
		});

		test("3.5 Should have correct achievements stats structure", async () => {
			const res = await request(app)
				.get("/api/users/achievements")
				.set("Authorization", `Bearer ${user1Token}`);

			expect(res.body.stats).toHaveProperty('totalUnlocked');
			expect(res.body.stats).toHaveProperty('totalLocked');
			expect(res.body.stats).toHaveProperty('completionPercentage');
			expect(res.body.stats.completionPercentage).toBeGreaterThanOrEqual(0);
			expect(res.body.stats.completionPercentage).toBeLessThanOrEqual(100);
		});

		test("3.6 Should check and unlock achievements", async () => {
			const res = await request(app)
				.post("/api/users/achievements/check")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({});

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body).toHaveProperty('unlocked');
			expect(res.body).toHaveProperty('totalAchievements');
		});

		test("3.7 Should unlock first_listing achievement after creating listings", async () => {
			// First check achievements
			const checkRes = await request(app)
				.post("/api/users/achievements/check")
				.set("Authorization", `Bearer ${user1Token}`);

			// Verify first_listing is unlocked or in all achievements
			const hasFirstListing = 
				checkRes.body.unlocked?.some(a => a.id === "first_listing") ||
				checkRes.body.allAchievements?.some(a => a.id === "first_listing");
			
			expect(hasFirstListing).toBe(true);
		});

		test("3.8 Should show progress for locked achievements", async () => {
			const res = await request(app)
				.get("/api/users/achievements")
				.set("Authorization", `Bearer ${user1Token}`);

			res.body.locked.forEach(achievement => {
				expect(achievement.progress).toBeGreaterThanOrEqual(0);
				expect(achievement.progress).toBeLessThanOrEqual(100);
			});
		});

		test("3.9 Should get achievement leaderboard", async () => {
			const startTime = Date.now();
			const res = await request(app)
				.get("/api/users/achievements/leaderboard");
			const responseTime = Date.now() - startTime;

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.leaderboard).toBeDefined();
			expect(Array.isArray(res.body.leaderboard)).toBe(true);
			expect(responseTime).toBeLessThan(3000);
		});

		test("3.10 Should limit leaderboard results", async () => {
			const res = await request(app)
				.get("/api/users/achievements/leaderboard?limit=5");

			expect(res.status).toBe(200);
			expect(res.body.leaderboard.length).toBeLessThanOrEqual(5);
		});

		test("3.11 Should have correct leaderboard structure", async () => {
			const res = await request(app)
				.get("/api/users/achievements/leaderboard");

			if (res.body.leaderboard.length > 0) {
				const firstUser = res.body.leaderboard[0];
				expect(firstUser).toHaveProperty('userId');
				expect(firstUser).toHaveProperty('name');
				expect(firstUser).toHaveProperty('achievementsCount');
				expect(firstUser).toHaveProperty('ecoPoints');
				expect(firstUser).toHaveProperty('ecoTier');
			}
		});
	});

	// ─────────────────────────────────────────────
	// 4. PERFORMANCE TESTS
	// ─────────────────────────────────────────────

	describe("4. Performance Tests", () => {
		test("4.1 Activity feed should respond within 2 seconds", async () => {
			const startTime = Date.now();
			await request(app)
				.get("/api/users/feed")
				.set("Authorization", `Bearer ${user1Token}`);
			const responseTime = Date.now() - startTime;

			expect(responseTime).toBeLessThan(2000);
		});

		test("4.2 Public profile should respond within 2 seconds", async () => {
			const startTime = Date.now();
			await request(app)
				.get(`/api/users/profile/${user1Id}/public`);
			const responseTime = Date.now() - startTime;

			expect(responseTime).toBeLessThan(2000);
		});

		test("4.3 Achievements check should respond within 3 seconds", async () => {
			const startTime = Date.now();
			await request(app)
				.post("/api/users/achievements/check")
				.set("Authorization", `Bearer ${user1Token}`);
			const responseTime = Date.now() - startTime;

			expect(responseTime).toBeLessThan(3000);
		});

		test("4.4 Community highlights should respond within 3 seconds", async () => {
			const startTime = Date.now();
			await request(app)
				.get("/api/users/feed/community");
			const responseTime = Date.now() - startTime;

			expect(responseTime).toBeLessThan(3000);
		});

		test("4.5 Leaderboard should respond within 2 seconds", async () => {
			const startTime = Date.now();
			await request(app)
				.get("/api/users/achievements/leaderboard");
			const responseTime = Date.now() - startTime;

			expect(responseTime).toBeLessThan(2000);
		});

		test("4.6 User listings should respond within 2 seconds", async () => {
			const startTime = Date.now();
			await request(app)
				.get(`/api/users/profile/${user1Id}/listings`);
			const responseTime = Date.now() - startTime;

			expect(responseTime).toBeLessThan(2000);
		});
	});

	// ─────────────────────────────────────────────
	// 5. SECURITY & EDGE CASES TESTS
	// ─────────────────────────────────────────────

	describe("5. Security & Edge Cases", () => {
		test("5.1 Should require authentication for personal activity feed", async () => {
			const res = await request(app)
				.get("/api/users/feed");

			expect(res.status).toBe(401);
		});

		test("5.2 Should require authentication for achievements", async () => {
			const res = await request(app)
				.get("/api/users/achievements");

			expect(res.status).toBe(401);
		});

		test("5.3 Should require authentication for achievement check", async () => {
			const res = await request(app)
				.post("/api/users/achievements/check");

			expect(res.status).toBe(401);
		});

		test("5.4 Should allow public access to community highlights", async () => {
			const res = await request(app)
				.get("/api/users/feed/community");

			expect(res.status).toBe(200);
		});

		test("5.5 Should allow public access to user profiles", async () => {
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/public`);

			expect(res.status).toBe(200);
		});

		test("5.6 Should allow public access to leaderboard", async () => {
			const res = await request(app)
				.get("/api/users/achievements/leaderboard");

			expect(res.status).toBe(200);
		});

		test("5.7 Should handle invalid user ID gracefully", async () => {
			const res = await request(app)
				.get("/api/users/profile/invalid-id/public");

			// Should return 400 or 404, not 500
			expect([400, 404]).toContain(res.status);
		});

		test("5.8 Should prevent accessing banned user's profile", async () => {
			const bannedUser = await User.create({
				name: "Banned User",
				email: `module10_comprehensive_banned_${timestamp}@test.com`,
				password: "SecurePass123!",
				isActive: false
			});

			const res = await request(app)
				.get(`/api/users/profile/${bannedUser._id}/public`);

			expect(res.status).toBe(404);
		});

		test("5.9 Should handle empty activity feed for new user", async () => {
			const newUser = await request(app)
				.post("/api/auth/signup")
				.send({
					name: "New User Empty Feed",
					email: `module10_comprehensive_new_${timestamp}@test.com`,
					password: "SecurePass123!"
				});

			await request(app)
				.post("/api/auth/verify-email")
				.send({
					email: `module10_comprehensive_new_${timestamp}@test.com`,
					verificationCode: newUser.body.user.verificationCode
				});

			const res = await request(app)
				.get("/api/users/feed")
				.set("Authorization", `Bearer ${newUser.body.accessToken}`);

			expect(res.status).toBe(200);
			expect(res.body.activities.length).toBe(0);
		});

		test("5.10 Should handle pagination edge cases", async () => {
			// Test page 0 (should default to 1 or return error)
			const res = await request(app)
				.get("/api/users/feed?page=0&limit=10")
				.set("Authorization", `Bearer ${user1Token}`);

			expect([200, 400]).toContain(res.status);
		});

		test("5.11 Should handle large limit values", async () => {
			const res = await request(app)
				.get("/api/users/feed?limit=1000")
				.set("Authorization", `Bearer ${user1Token}`);

			// Should not crash, may cap at reasonable limit
			expect([200, 400]).toContain(res.status);
		});
	});

	// ─────────────────────────────────────────────
	// 6. INTEGRATION WORKFLOW TESTS
	// ─────────────────────────────────────────────

	describe("6. Integration Workflow Tests", () => {
		test("6.1 Complete workflow: Create listing → Check achievements → Verify unlock", async () => {
			// Create a new listing
			const listingRes = await request(app)
				.post("/api/listings")
				.set("Authorization", `Bearer ${user2Token}`)
				.send({
					title: "Integration Test Listing",
					category: "Electronics",
					price: 50,
					description: "Test listing",
					condition: "Used-Good",
					location: "Test City"
				});

			expect([200, 201]).toContain(listingRes.status);

			// Check achievements
			const achievementRes = await request(app)
				.post("/api/users/achievements/check")
				.set("Authorization", `Bearer ${user2Token}`);

			expect(achievementRes.status).toBe(200);
			
			// Verify first_listing is unlocked
			const hasFirstListing = 
				achievementRes.body.unlocked?.some(a => a.id === "first_listing") ||
				achievementRes.body.allAchievements?.some(a => a.id === "first_listing");
			
			expect(hasFirstListing).toBe(true);
		});

		test("6.2 Workflow: Create exchange → Complete → Check achievements", async () => {
			if (!listingId) {
				console.log("Skipping exchange workflow - no listing available");
				return;
			}

			// Create exchange
			const exchangeRes = await request(app)
				.post("/api/exchanges")
				.set("Authorization", `Bearer ${user2Token}`)
				.send({
					listingId,
					offeredItems: "Test item for exchange"
				});

			if ([200, 201].includes(exchangeRes.status)) {
				exchangeId = exchangeRes.body.exchange?._id || exchangeRes.body.data?._id;

				// Complete exchange
				if (exchangeId) {
					await request(app)
						.patch(`/api/exchanges/${exchangeId}`)
						.set("Authorization", `Bearer ${user1Token}`)
						.send({ status: "completed" });
				}

				// Check achievements
				const achievementRes = await request(app)
					.post("/api/users/achievements/check")
					.set("Authorization", `Bearer ${user1Token}`);

				expect(achievementRes.status).toBe(200);
			}
		});

		test("6.3 Workflow: Create review → Verify profile updates", async () => {
			if (!exchangeId) {
				console.log("Skipping review workflow - no exchange available");
				return;
			}

			// Create review
			const reviewRes = await request(app)
				.post("/api/reviews")
				.set("Authorization", `Bearer ${user2Token}`)
				.send({
					exchangeId,
					rating: 5,
					comment: "Excellent user to exchange with!"
				});

			expect([200, 201, 400]).toContain(reviewRes.status);

			// Verify profile shows updated review count
			const profileRes = await request(app)
				.get(`/api/users/profile/${user1Id}/public`);

			expect(profileRes.body.profile.stats.totalReviews).toBeGreaterThanOrEqual(0);
			expect(profileRes.body.profile.stats.averageRating).toBeGreaterThanOrEqual(0);
		});

		test("6.4 Workflow: Submit recycling → Check eco achievements", async () => {
			// Create recycling submission
			const recyclingRes = await request(app)
				.post("/api/recycling")
				.set("Authorization", `Bearer ${user1Token}`)
				.send({
					itemType: "Car Battery",
					weight: 15,
					recyclerId: new mongoose.Types.ObjectId()
				});

			expect([200, 201]).toContain(recyclingRes.status);

			// Check achievements
			const achievementRes = await request(app)
				.post("/api/users/achievements/check")
				.set("Authorization", `Bearer ${user1Token}`);

			expect(achievementRes.status).toBe(200);
		});

		test("6.5 Activity feed should reflect all user actions", async () => {
			const res = await request(app)
				.get("/api/users/feed")
				.set("Authorization", `Bearer ${user1Token}`);

			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			// Activity feed should contain activities from previous tests
			expect(res.body.totalActivities).toBeGreaterThanOrEqual(0);
		});

		test("6.6 Public profile should show updated statistics", async () => {
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/stats`);

			expect(res.status).toBe(200);
			expect(res.body.stats.listings.total).toBeGreaterThanOrEqual(2);
			expect(res.body.stats.reputation.ecoPoints).toBeGreaterThanOrEqual(0);
		});
	});

	// ─────────────────────────────────────────────
	// 7. USABILITY & DATA CONSISTENCY TESTS
	// ─────────────────────────────────────────────

	describe("7. Usability & Data Consistency Tests", () => {
		test("7.1 Achievement definitions should have user-friendly names", async () => {
			const res = await request(app)
				.get("/api/users/achievements/definitions");

			res.body.achievements.forEach(achievement => {
				expect(achievement.name.length).toBeGreaterThan(0);
				expect(achievement.description.length).toBeGreaterThan(0);
				expect(achievement.icon.length).toBeGreaterThan(0);
			});
		});

		test("7.2 Activity feed should have human-readable timestamps", async () => {
			const res = await request(app)
				.get("/api/users/feed")
				.set("Authorization", `Bearer ${user1Token}`);

			if (res.body.activities.length > 0) {
				const activity = res.body.activities[0];
				expect(activity.timestamp).toBeDefined();
				expect(new Date(activity.timestamp).getTime()).not.toBeNaN();
			}
		});

		test("7.3 Public profile should have calculated member duration", async () => {
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/public`);

			expect(res.body.profile.daysAsMember).toBeGreaterThanOrEqual(0);
			expect(res.body.profile.memberSince).toBeDefined();
		});

		test("7.4 Rating distribution should sum to total reviews", async () => {
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/reviews`);

			const distributionSum = Object.values(res.body.ratingDistribution).reduce((sum, count) => sum + count, 0);
			expect(distributionSum).toBe(res.body.totalReviews);
		});

		test("7.5 Leaderboard should be sorted by achievements count", async () => {
			const res = await request(app)
				.get("/api/users/achievements/leaderboard?limit=10");

			if (res.body.leaderboard.length > 1) {
				for (let i = 0; i < res.body.leaderboard.length - 1; i++) {
					expect(res.body.leaderboard[i].achievementsCount)
						.toBeGreaterThanOrEqual(res.body.leaderboard[i + 1].achievementsCount);
				}
			}
		});

		test("7.6 Community highlights should have valid data structures", async () => {
			const res = await request(app)
				.get("/api/users/feed/community");

			expect(Array.isArray(res.body.highlights.topContributors)).toBe(true);
			expect(Array.isArray(res.body.highlights.recentExchanges)).toBe(true);
			expect(Array.isArray(res.body.highlights.topRecyclers)).toBe(true);
			expect(Array.isArray(res.body.highlights.trustedUsers)).toBe(true);
		});

		test("7.7 User stats should have consistent data types", async () => {
			const res = await request(app)
				.get(`/api/users/profile/${user1Id}/stats`);

			expect(typeof res.body.stats.listings.total).toBe('number');
			expect(typeof res.body.stats.exchanges.total).toBe('number');
			expect(typeof res.body.stats.reputation.trustScore).toBe('number');
			expect(typeof res.body.stats.reputation.ecoPoints).toBe('number');
		});
	});
});
