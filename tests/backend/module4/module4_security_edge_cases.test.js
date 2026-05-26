import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { RecyclingSubmission } from "../models/recyclingSubmission.model.js";

describe("Module 4: Security & Edge Cases", () => {
    const ts = Date.now();
    
    // Test users
    const regularUserInfo = { name: "Regular User", email: `regular_${ts}@test.com`, password: "Password123!" };
    const adminUserInfo = { name: "Admin", email: `admin_${ts}@test.com`, password: "Password123!", userType: "admin" };
    const recyclerUserInfo = { name: "Recycler", email: `recycler_${ts}@test.com`, password: "Password123!", userType: "recycler" };
    const unauthenticatedEmail = `unauth_${ts}@test.com`;
    
    let regularToken, adminToken, recyclerToken;
    let regularUserId, adminId, recyclerId;

    beforeAll(async () => {
        const [rR, rA, rC] = await Promise.all([
            request(app).post("/api/auth/signup").send(regularUserInfo),
            request(app).post("/api/auth/signup").send(adminUserInfo),
            request(app).post("/api/auth/signup").send(recyclerUserInfo)
        ]);

        regularToken = rR.body.accessToken;
        adminToken = rA.body.accessToken;
        recyclerToken = rC.body.accessToken;
        regularUserId = rR.body.user._id;
        adminId = rA.body.user._id;
        recyclerId = rC.body.user._id;

        await User.findByIdAndUpdate(regularUserId, { isVerified: true });
        await User.findByIdAndUpdate(adminId, { isVerified: true, roleStatus: "verified", permissions: ["admin"] });
        await User.findByIdAndUpdate(recyclerId, { isVerified: true, roleStatus: "verified" });
    }, 120000);

    afterAll(async () => {
        await User.deleteMany({ email: { $regex: ts } });
        await RecyclingSubmission.deleteMany({ userId: regularUserId });
        await mongoose.connection.close();
    });

    // ────────────────────────────────────────────────────────────────────────
    // 1. Authentication & Authorization Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Authentication Requirements", () => {
        test("1. Create submission without token returns 401", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .send({
                    itemType: "electronics",
                    itemDescription: "Test",
                    location: "Test"
                });

            expect(res.status).toBe(401);
        });

        test("2. Get submissions without token returns 401", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/user");

            expect(res.status).toBe(401);
        });

        test("3. Verify token without authentication returns 401", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions/verify-token")
                .send({ token: "123456" });

            expect(res.status).toBe(401);
        });

        test("4. Redeem points without token returns 401", async () => {
            const res = await request(app)
                .post("/api/users/redeem-points")
                .send({ points: 100, rewardDescription: "Test" });

            expect(res.status).toBe(401);
        });

        test("5. Get leaderboard without token returns 401", async () => {
            const res = await request(app)
                .get("/api/users/leaderboard");

            expect(res.status).toBe(401);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 2. Role-Based Access Control Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Role-Based Access Control", () => {
        let submissionId;

        beforeAll(async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "Test item",
                    estimatedWeight: 2,
                    location: "Test Location"
                });

            submissionId = res.body.submission._id;
        });

        test("6. Regular user cannot approve submissions", async () => {
            const res = await request(app)
                .post(`/api/recycling-submissions/${submissionId}/approve`)
                .set("Authorization", `Bearer ${regularToken}`);

            expect(res.status).toBe(403);
        });

        test("7. Regular user cannot reject submissions", async () => {
            const res = await request(app)
                .put(`/api/recycling-submissions/${submissionId}/reject`)
                .set("Authorization", `Bearer ${regularToken}`)
                .send({ notes: "Test rejection" });

            expect(res.status).toBe(403);
        });

        test("8. Regular user cannot complete submissions", async () => {
            const res = await request(app)
                .put(`/api/recycling-submissions/${submissionId}/complete`)
                .set("Authorization", `Bearer ${regularToken}`);

            expect(res.status).toBe(403);
        });

        test("9. Regular user cannot verify tokens", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions/verify-token")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({ token: "123456" });

            expect(res.status).toBe(403);
        });

        test("10. Recycler can approve submissions", async () => {
            const res = await request(app)
                .post(`/api/recycling-submissions/${submissionId}/approve`)
                .set("Authorization", `Bearer ${recyclerToken}`);

            expect([200, 400]).toContain(res.status); // 400 if already approved
        });

        test("11. Admin can access all submissions", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions")
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
        });

        test("12. Regular user cannot access all submissions (admin only)", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`);

            expect([403, 401]).toContain(res.status);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 3. Data Validation & Injection Prevention
    // ────────────────────────────────────────────────────────────────────────

    describe("Data Validation & Injection Prevention", () => {
        test("13. SQL/NoSQL injection in item description", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "'; drop collection; //",
                    location: "Test Location"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.itemDescription).toBe("'; drop collection; //");
        });

        test("14. XSS attempt in notes field", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({
                    itemType: "metal",
                    itemDescription: "Metal scrap",
                    location: "Test",
                    notes: "<script>alert('XSS')</script>"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.notes).toBe("<script>alert('XSS')</script>");
        });

        test("15. Invalid coordinates should be handled", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({
                    itemType: "plastic",
                    itemDescription: "Plastic waste",
                    location: "Test",
                    latitude: "invalid",
                    longitude: "invalid"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.locationCoords.coordinates).toEqual([0, 0]);
        });

        test("16. Extremely long description should be accepted", async () => {
            const longDescription = "A".repeat(1000);
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({
                    itemType: "other",
                    itemDescription: longDescription,
                    location: "Test"
                });

            expect(res.status).toBe(201);
        });

        test("17. Negative weight should be handled", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "Test",
                    estimatedWeight: -10,
                    location: "Test"
                });

            // Should either reject or handle gracefully
            expect([201, 400]).toContain(res.status);
        });

        test("18. Zero weight should result in minimum points", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "Test",
                    estimatedWeight: 0,
                    location: "Test"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBeGreaterThanOrEqual(5);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 4. State Machine Enforcement Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("State Machine Enforcement", () => {
        let pendingSubmissionId;
        let approvedSubmissionId;

        beforeAll(async () => {
            // Create pending submission
            const pendingRes = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "Pending item",
                    estimatedWeight: 1,
                    location: "Test"
                });
            pendingSubmissionId = pendingRes.body.submission._id;

            // Create and approve submission
            const approvedRes = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({
                    itemType: "metal",
                    itemDescription: "Approved item",
                    estimatedWeight: 2,
                    location: "Test"
                });
            approvedSubmissionId = approvedRes.body.submission._id;

            await request(app)
                .post(`/api/recycling-submissions/${approvedSubmissionId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`);
        });

        test("19. Cannot complete pending submission", async () => {
            const res = await request(app)
                .put(`/api/recycling-submissions/${pendingSubmissionId}/complete`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(400);
        });

        test("20. Cannot approve completed submission", async () => {
            // First complete it
            await request(app)
                .put(`/api/recycling-submissions/${approvedSubmissionId}/complete`)
                .set("Authorization", `Bearer ${adminToken}`);

            // Try to approve
            const res = await request(app)
                .post(`/api/recycling-submissions/${approvedSubmissionId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(400);
        });

        test("21. Cannot reject completed submission", async () => {
            const res = await request(app)
                .put(`/api/recycling-submissions/${approvedSubmissionId}/reject`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ notes: "Test" });

            expect(res.status).toBe(400);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 5. Concurrent Operations Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Concurrent Operations", () => {
        test("22. Multiple users can create submissions simultaneously", async () => {
            const promises = [];
            
            for (let i = 0; i < 5; i++) {
                promises.push(
                    request(app)
                        .post("/api/recycling-submissions")
                        .set("Authorization", `Bearer ${regularToken}`)
                        .send({
                            itemType: "electronics",
                            itemDescription: `Concurrent test ${i}`,
                            estimatedWeight: i + 1,
                            location: "Test Location"
                        })
                );
            }

            const results = await Promise.all(promises);
            
            results.forEach(res => {
                expect(res.status).toBe(201);
            });
        });

        test("23. Duplicate verification tokens should not exist", async () => {
            const tokens = [];
            
            // Create multiple submissions and collect tokens
            for (let i = 0; i < 10; i++) {
                const res = await request(app)
                    .post("/api/recycling-submissions")
                    .set("Authorization", `Bearer ${regularToken}`)
                    .send({
                        itemType: "metal",
                        itemDescription: `Token test ${i}`,
                        estimatedWeight: 1,
                        location: "Test"
                    });

                tokens.push(res.body.submission.verificationToken);
            }

            // Check for duplicates
            const uniqueTokens = new Set(tokens);
            expect(uniqueTokens.size).toBe(tokens.length);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 6. Edge Cases
    // ────────────────────────────────────────────────────────────────────────

    describe("Edge Cases", () => {
        test("24. Get submissions for user with no submissions", async () => {
            const newUser = { 
                name: "New User", 
                email: `newuser_${ts}@test.com`, 
                password: "Password123!" 
            };

            const res = await request(app).post("/api/auth/signup").send(newUser);
            await User.findByIdAndUpdate(res.body.user._id, { isVerified: true });

            const submissions = await request(app)
                .get("/api/recycling-submissions/user")
                .set("Authorization", `Bearer ${res.body.accessToken}`);

            expect(submissions.status).toBe(200);
            expect(submissions.body.submissions).toEqual([]);
            expect(submissions.body.count).toBe(0);

            // Cleanup
            await User.deleteOne({ email: `newuser_${ts}@test.com` });
        });

        test("25. Redemption with exact balance", async () => {
            const exactUser = { 
                name: "Exact User", 
                email: `exact_${ts}@test.com`, 
                password: "Password123!" 
            };

            const res = await request(app).post("/api/auth/signup").send(exactUser);
            await User.findByIdAndUpdate(res.body.user._id, { 
                isVerified: true, 
                roleStatus: "verified",
                ecoPoints: 100 
            });

            const redeemRes = await request(app)
                .post("/api/users/redeem-points")
                .set("Authorization", `Bearer ${res.body.accessToken}`)
                .send({
                    points: 100,
                    rewardDescription: "Exact redemption"
                });

            expect(redeemRes.status).toBe(200);
            expect(redeemRes.body.currentPoints).toBe(0);

            // Cleanup
            await User.deleteOne({ email: `exact_${ts}@test.com` });
        });

        test("26. Special characters in location", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({
                    itemType: "plastic",
                    itemDescription: "Test",
                    location: "Recycling Center & Co. @ NYC #123"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.location).toBe("Recycling Center & Co. @ NYC #123");
        });

        test("27. Unicode characters in description", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${regularToken}`)
                .send({
                    itemType: "other",
                    itemDescription: "测试物品 🔧⚙️🔩",
                    location: "Test"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.itemDescription).toBe("测试物品 🔧⚙️🔩");
        });
    });
});
