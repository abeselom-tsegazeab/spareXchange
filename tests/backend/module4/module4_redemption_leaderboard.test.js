import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { EcoPointTransaction } from "../models/ecoPointTransaction.model.js";

describe("Module 4: Points Redemption & Leaderboard", () => {
    const ts = Date.now();
    
    // Test users with different eco points
    const verifiedUserInfo = { 
        name: "Verified User", 
        email: `verified_${ts}@test.com`, 
        password: "Password123!" 
    };
    const unverifiedUserInfo = { 
        name: "Unverified User", 
        email: `unverified_${ts}@test.com`, 
        password: "Password123!" 
    };
    const highPointsUserInfo = { 
        name: "High Points User", 
        email: `highpoints_${ts}@test.com`, 
        password: "Password123!" 
    };
    
    let verifiedToken, unverifiedToken, highPointsToken;
    let verifiedUserId, unverifiedUserId, highPointsUserId;

    beforeAll(async () => {
        // Create users
        const [rV, rU, rH] = await Promise.all([
            request(app).post("/api/auth/signup").send(verifiedUserInfo),
            request(app).post("/api/auth/signup").send(unverifiedUserInfo),
            request(app).post("/api/auth/signup").send(highPointsUserInfo)
        ]);

        verifiedToken = rV.body.accessToken;
        unverifiedToken = rU.body.accessToken;
        highPointsToken = rH.body.accessToken;
        verifiedUserId = rV.body.user._id;
        unverifiedUserId = rU.body.user._id;
        highPointsUserId = rH.body.user._id;

        // Set verification status and eco points
        await User.findByIdAndUpdate(verifiedUserId, { 
            isVerified: true, 
            roleStatus: "verified",
            ecoPoints: 500 
        });
        
        await User.findByIdAndUpdate(unverifiedUserId, { 
            isVerified: true, 
            roleStatus: "pending", // Not verified
            ecoPoints: 300 
        });
        
        await User.findByIdAndUpdate(highPointsUserId, { 
            isVerified: true, 
            roleStatus: "verified",
            ecoPoints: 2000 
        });
    }, 120000);

    afterAll(async () => {
        await User.deleteMany({ email: { $regex: ts } });
        await EcoPointTransaction.deleteMany({ 
            userId: { $in: [verifiedUserId, unverifiedUserId, highPointsUserId] } 
        });
        await mongoose.connection.close();
    });

    // ────────────────────────────────────────────────────────────────────────
    // 1. Points Redemption Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Points Redemption", () => {
        test("1. Verified user can redeem points", async () => {
            const res = await request(app)
                .post("/api/users/redeem-points")
                .set("Authorization", `Bearer ${verifiedToken}`)
                .send({
                    points: 100,
                    rewardDescription: "10% Discount on Technician Fee"
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.currentPoints).toBe(400); // 500 - 100
        });

        test("2. EcoPointTransaction created for redemption (negative points)", async () => {
            const transactions = await EcoPointTransaction.find({ 
                userId: verifiedUserId, 
                reason: "redemption" 
            });

            expect(transactions.length).toBeGreaterThan(0);
            expect(transactions[0].points).toBe(-100);
            expect(transactions[0].description).toBe("10% Discount on Technician Fee");
        });

        test("3. Unverified user cannot redeem points", async () => {
            const res = await request(app)
                .post("/api/users/redeem-points")
                .set("Authorization", `Bearer ${unverifiedToken}`)
                .send({
                    points: 50,
                    rewardDescription: "Test reward"
                });

            expect(res.status).toBe(403);
            expect(res.body.message).toMatch(/only verified/i);
        });

        test("4. Cannot redeem more points than available", async () => {
            const res = await request(app)
                .post("/api/users/redeem-points")
                .set("Authorization", `Bearer ${verifiedToken}`)
                .send({
                    points: 9999,
                    rewardDescription: "Impossible reward"
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/insufficient/i);
        });

        test("5. Cannot redeem zero or negative points", async () => {
            const resZero = await request(app)
                .post("/api/users/redeem-points")
                .set("Authorization", `Bearer ${verifiedToken}`)
                .send({
                    points: 0,
                    rewardDescription: "Zero points"
                });

            expect(resZero.status).toBe(400);

            const resNegative = await request(app)
                .post("/api/users/redeem-points")
                .set("Authorization", `Bearer ${verifiedToken}`)
                .send({
                    points: -50,
                    rewardDescription: "Negative points"
                });

            expect(resNegative.status).toBe(400);
        });

        test("6. Missing points field should return 400", async () => {
            const res = await request(app)
                .post("/api/users/redeem-points")
                .set("Authorization", `Bearer ${verifiedToken}`)
                .send({
                    rewardDescription: "No points specified"
                });

            expect(res.status).toBe(400);
        });

        test("7. High points user can redeem large amount", async () => {
            const res = await request(app)
                .post("/api/users/redeem-points")
                .set("Authorization", `Bearer ${highPointsToken}`)
                .send({
                    points: 500,
                    rewardDescription: "Premium Listing Boost"
                });

            expect(res.status).toBe(200);
            expect(res.body.currentPoints).toBe(1500); // 2000 - 500
        });

        test("8. Multiple redemptions track correctly", async () => {
            // First redemption
            await request(app)
                .post("/api/users/redeem-points")
                .set("Authorization", `Bearer ${highPointsToken}`)
                .send({
                    points: 200,
                    rewardDescription: "Second reward"
                });

            // Second redemption
            await request(app)
                .post("/api/users/redeem-points")
                .set("Authorization", `Bearer ${highPointsToken}`)
                .send({
                    points: 100,
                    rewardDescription: "Third reward"
                });

            const transactions = await EcoPointTransaction.find({ 
                userId: highPointsUserId, 
                reason: "redemption" 
            }).sort({ createdAt: -1 });

            expect(transactions.length).toBeGreaterThanOrEqual(3);
            expect(transactions[0].points).toBe(-100);
            expect(transactions[1].points).toBe(-200);
            expect(transactions[2].points).toBe(-500);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 2. Leaderboard Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Eco-Leaderboard", () => {
        test("9. Get leaderboard returns sorted users by ecoPoints", async () => {
            const res = await request(app)
                .get("/api/users/leaderboard")
                .set("Authorization", `Bearer ${verifiedToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.leaderboard)).toBe(true);

            // Verify sorting (descending order)
            const leaderboard = res.body.leaderboard;
            for (let i = 0; i < leaderboard.length - 1; i++) {
                expect(leaderboard[i].ecoPoints).toBeGreaterThanOrEqual(leaderboard[i + 1].ecoPoints);
            }
        });

        test("10. Leaderboard excludes banned users", async () => {
            // Create a banned user with high points
            const bannedUserInfo = { 
                name: "Banned User", 
                email: `banned_${ts}@test.com`, 
                password: "Password123!" 
            };

            const bannedRes = await request(app).post("/api/auth/signup").send(bannedUserInfo);
            await User.findByIdAndUpdate(bannedRes.body.user._id, { 
                isBanned: true, 
                ecoPoints: 9999 
            });

            const leaderboard = await request(app)
                .get("/api/users/leaderboard")
                .set("Authorization", `Bearer ${verifiedToken}`);

            const bannedUserInList = leaderboard.body.leaderboard.find(
                u => u._id === bannedRes.body.user._id
            );

            expect(bannedUserInList).toBeUndefined();
            
            // Cleanup
            await User.deleteOne({ email: `banned_${ts}@test.com` });
        });

        test("11. Leaderboard returns correct user fields", async () => {
            const res = await request(app)
                .get("/api/users/leaderboard")
                .set("Authorization", `Bearer ${verifiedToken}`);

            const user = res.body.leaderboard[0];
            expect(user).toHaveProperty('name');
            expect(user).toHaveProperty('ecoPoints');
            expect(user).toHaveProperty('ecoTier');
            expect(user).toHaveProperty('achievements');
            expect(user).toHaveProperty('profilePicture');
        });

        test("12. Leaderboard limited to 20 users", async () => {
            const res = await request(app)
                .get("/api/users/leaderboard")
                .set("Authorization", `Bearer ${verifiedToken}`);

            expect(res.body.leaderboard.length).toBeLessThanOrEqual(20);
        });

        test("13. High points user appears in leaderboard", async () => {
            const res = await request(app)
                .get("/api/users/leaderboard")
                .set("Authorization", `Bearer ${verifiedToken}`);

            const highPointsUser = res.body.leaderboard.find(
                u => u._id === highPointsUserId.toString()
            );

            expect(highPointsUser).toBeDefined();
            expect(highPointsUser.ecoPoints).toBe(1300); // 2000 - 500 - 200
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 3. Eco-Tier Calculation Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Eco-Tier Virtual Calculation", () => {
        test("14. Seed tier (0-100 points)", async () => {
            const lowPointsUser = { 
                name: "Low Points", 
                email: `low_${ts}@test.com`, 
                password: "Password123!" 
            };

            const res = await request(app).post("/api/auth/signup").send(lowPointsUser);
            await User.findByIdAndUpdate(res.body.user._id, { 
                isVerified: true, 
                ecoPoints: 50 
            });

            const userRes = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${res.body.accessToken}`);

            expect(userRes.body.user.ecoTier).toBe("Seed");

            // Cleanup
            await User.deleteOne({ email: `low_${ts}@test.com` });
        });

        test("15. Sprout tier (101-500 points)", async () => {
            const res = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${verifiedToken}`);

            expect(res.body.user.ecoTier).toBe("Sprout"); // 400 points
        });

        test("16. Sapling tier (501-1500 points)", async () => {
            const res = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${highPointsToken}`);

            expect(res.body.user.ecoTier).toBe("Sapling"); // 1300 points
        });

        test("17. Oak tier (1501-5000 points)", async () => {
            const oakUser = { 
                name: "Oak User", 
                email: `oak_${ts}@test.com`, 
                password: "Password123!" 
            };

            const res = await request(app).post("/api/auth/signup").send(oakUser);
            await User.findByIdAndUpdate(res.body.user._id, { 
                isVerified: true, 
                ecoPoints: 2000 
            });

            const userRes = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${res.body.accessToken}`);

            expect(userRes.body.user.ecoTier).toBe("Oak");

            // Cleanup
            await User.deleteOne({ email: `oak_${ts}@test.com` });
        });

        test("18. Gaia tier (5000+ points)", async () => {
            const gaiaUser = { 
                name: "Gaia User", 
                email: `gaia_${ts}@test.com`, 
                password: "Password123!" 
            };

            const res = await request(app).post("/api/auth/signup").send(gaiaUser);
            await User.findByIdAndUpdate(res.body.user._id, { 
                isVerified: true, 
                ecoPoints: 6000 
            });

            const userRes = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${res.body.accessToken}`);

            expect(userRes.body.user.ecoTier).toBe("Gaia");

            // Cleanup
            await User.deleteOne({ email: `gaia_${ts}@test.com` });
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 4. Points Balance Accuracy Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Points Balance Accuracy", () => {
        test("19. User balance reflects all transactions", async () => {
            const userRes = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${verifiedToken}`);

            const transactions = await EcoPointTransaction.find({ userId: verifiedUserId });
            
            const totalFromTransactions = transactions.reduce((sum, tx) => sum + tx.points, 0);
            
            // User's ecoPoints should match transaction sum
            expect(userRes.body.user.ecoPoints).toBe(totalFromTransactions);
        });

        test("20. Redemption updates user model immediately", async () => {
            const beforeRes = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${verifiedToken}`);

            const pointsBefore = beforeRes.body.user.ecoPoints;

            await request(app)
                .post("/api/users/redeem-points")
                .set("Authorization", `Bearer ${verifiedToken}`)
                .send({
                    points: 50,
                    rewardDescription: "Quick test"
                });

            const afterRes = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${verifiedToken}`);

            expect(afterRes.body.user.ecoPoints).toBe(pointsBefore - 50);
        });
    });
});
