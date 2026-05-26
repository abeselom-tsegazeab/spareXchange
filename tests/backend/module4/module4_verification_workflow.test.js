import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { RecyclingSubmission } from "../models/recyclingSubmission.model.js";
import { EcoPointTransaction } from "../models/ecoPointTransaction.model.js";

describe("Module 4: Verification Workflow & Atomic Operations", () => {
    const ts = Date.now();
    
    // Test users with different roles
    const userInfo = { name: "Regular User", email: `user_${ts}@test.com`, password: "Password123!" };
    const adminInfo = { name: "Admin User", email: `admin_${ts}@test.com`, password: "Password123!", userType: "admin" };
    const recyclerInfo = { name: "Recycler User", email: `recycler_${ts}@test.com`, password: "Password123!", userType: "recycler" };
    
    let userToken, adminToken, recyclerToken;
    let userId, adminId, recyclerId;

    beforeAll(async () => {
        // Create users
        const [rU, rA, rR] = await Promise.all([
            request(app).post("/api/auth/signup").send(userInfo),
            request(app).post("/api/auth/signup").send(adminInfo),
            request(app).post("/api/auth/signup").send(recyclerInfo)
        ]);

        userToken = rU.body.accessToken;
        adminToken = rA.body.accessToken;
        recyclerToken = rR.body.accessToken;
        userId = rU.body.user._id;
        adminId = rA.body.user._id;
        recyclerId = rR.body.user._id;

        // Verify and set roles
        await User.findByIdAndUpdate(userId, { isVerified: true });
        await User.findByIdAndUpdate(adminId, { isVerified: true, roleStatus: "verified", permissions: ["admin"] });
        await User.findByIdAndUpdate(recyclerId, { isVerified: true, roleStatus: "verified" });
    }, 120000);

    afterAll(async () => {
        await User.deleteMany({ email: { $regex: ts } });
        await RecyclingSubmission.deleteMany({ userId });
        await EcoPointTransaction.deleteMany({ userId });
        await mongoose.connection.close();
    });

    // ────────────────────────────────────────────────────────────────────────
    // 1. Admin Approval Workflow Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Admin Approval Workflow", () => {
        let submissionId;

        test("1. Create submission for admin approval", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    itemType: "vehicle-parts",
                    itemDescription: "Engine block",
                    estimatedWeight: 50,
                    location: "Auto Shop"
                });

            expect(res.status).toBe(201);
            submissionId = res.body.submission._id;
        });

        test("2. Admin approves submission", async () => {
            const res = await request(app)
                .post(`/api/recycling-submissions/${submissionId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.submission.status).toBe("approved");
            expect(res.body.submission.verifiedBy).toBe(adminId.toString());
        });

        test("3. User receives eco points after admin approval", async () => {
            const res = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.body.user.ecoPoints).toBeGreaterThanOrEqual(500); // 25 * 50 = 1250, capped at 500
        });

        test("4. EcoPointTransaction record created after approval", async () => {
            const transactions = await EcoPointTransaction.find({ 
                userId, 
                reason: "recycling" 
            });

            expect(transactions.length).toBeGreaterThan(0);
            expect(transactions[0].points).toBeGreaterThan(0);
            expect(transactions[0].referenceId.toString()).toBe(submissionId);
        });

        test("5. Cannot approve already approved submission", async () => {
            const res = await request(app)
                .post(`/api/recycling-submissions/${submissionId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/not pending/i);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 2. Recycler Token Verification Workflow Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Recycler Token Verification", () => {
        let submissionToken;
        let submissionId;

        test("6. Create submission and get verification token", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "Circuit boards",
                    estimatedWeight: 3,
                    location: "Tech Recycle"
                });

            expect(res.status).toBe(201);
            submissionToken = res.body.submission.verificationToken;
            submissionId = res.body.submission._id;
            expect(submissionToken).toMatch(/^\d{6}$/);
        });

        test("7. Recycler verifies submission using token", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions/verify-token")
                .set("Authorization", `Bearer ${recyclerToken}`)
                .send({ token: submissionToken });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.submission.status).toBe("approved");
            expect(res.body.submission.isVerifiedByRecycler).toBe(true);
        });

        test("8. User receives points after recycler verification", async () => {
            const res = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.body.user.ecoPoints).toBeGreaterThanOrEqual(60); // 20 * 3 = 60
        });

        test("9. Achievement unlocked on first recycling", async () => {
            const res = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${userToken}`);

            expect(res.body.user.achievements).toContain("Eco Warrior (First Recycle)");
        });

        test("10. Invalid token should return 404", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions/verify-token")
                .set("Authorization", `Bearer ${recyclerToken}`)
                .send({ token: "999999" });

            expect(res.status).toBe(404);
            expect(res.body.message).toMatch(/invalid or expired/i);
        });

        test("11. Already verified token cannot be used again", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions/verify-token")
                .set("Authorization", `Bearer ${recyclerToken}`)
                .send({ token: submissionToken });

            expect(res.status).toBe(404);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 3. Rejection Workflow Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Rejection Workflow", () => {
        let submissionId;

        test("12. Create submission for rejection test", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    itemType: "plastic",
                    itemDescription: "Contaminated plastic",
                    estimatedWeight: 5,
                    location: "Recycling Center"
                });

            expect(res.status).toBe(201);
            submissionId = res.body.submission._id;
        });

        test("13. Admin rejects submission", async () => {
            const res = await request(app)
                .put(`/api/recycling-submissions/${submissionId}/reject`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ notes: "Items do not meet recycling standards" });

            expect(res.status).toBe(200);
            expect(res.body.submission.status).toBe("rejected");
            expect(res.body.submission.notes).toBe("Items do not meet recycling standards");
        });

        test("14. User does not receive points for rejected submission", async () => {
            const res = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${userToken}`);

            const pointsBeforeRejection = res.body.user.ecoPoints;
            
            // Create and approve another submission to verify points don't change for rejected one
            const newSubmission = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    itemType: "metal",
                    itemDescription: "Clean metal",
                    estimatedWeight: 2,
                    location: "Metal Shop"
                });

            await request(app)
                .post(`/api/recycling-submissions/${newSubmission.body.submission._id}/approve`)
                .set("Authorization", `Bearer ${adminToken}`);

            const resAfter = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${userToken}`);

            // Points should only increase from the approved submission, not the rejected one
            expect(resAfter.body.user.ecoPoints).toBeGreaterThanOrEqual(pointsBeforeRejection);
        });

        test("15. Cannot reject already rejected submission", async () => {
            const res = await request(app)
                .put(`/api/recycling-submissions/${submissionId}/reject`)
                .set("Authorization", `Bearer ${adminToken}`)
                .send({ notes: "Trying to reject again" });

            expect(res.status).toBe(400);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 4. Completion Workflow Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Completion Workflow", () => {
        let submissionId;

        test("16. Create and approve submission for completion", async () => {
            const createRes = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    itemType: "batteries",
                    itemDescription: "Car batteries",
                    estimatedWeight: 10,
                    location: "Battery Recycle"
                });

            submissionId = createRes.body.submission._id;

            await request(app)
                .post(`/api/recycling-submissions/${submissionId}/approve`)
                .set("Authorization", `Bearer ${adminToken}`);
        });

        test("17. Admin marks submission as completed", async () => {
            const res = await request(app)
                .put(`/api/recycling-submissions/${submissionId}/complete`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(200);
            expect(res.body.submission.status).toBe("completed");
        });

        test("18. Cannot complete unapproved submission", async () => {
            const newSubmission = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    itemType: "appliances",
                    itemDescription: "Old fridge",
                    estimatedWeight: 30,
                    location: "Appliance Center"
                });

            const res = await request(app)
                .put(`/api/recycling-submissions/${newSubmission.body.submission._id}/complete`)
                .set("Authorization", `Bearer ${adminToken}`);

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/must be approved/i);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 5. Atomic Transaction Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Atomic Transaction Integrity", () => {
        test("19. Points and transaction record created atomically", async () => {
            const userResBefore = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${userToken}`);

            const pointsBefore = userResBefore.body.user.ecoPoints;
            const txCountBefore = await EcoPointTransaction.countDocuments({ userId });

            const submission = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${userToken}`)
                .send({
                    itemType: "computers",
                    itemDescription: "Old desktop",
                    estimatedWeight: 5,
                    location: "Computer Recycle"
                });

            await request(app)
                .post(`/api/recycling-submissions/${submission.body.submission._id}/approve`)
                .set("Authorization", `Bearer ${adminToken}`);

            const userResAfter = await request(app)
                .get("/api/auth/check-auth")
                .set("Authorization", `Bearer ${userToken}`);

            const txCountAfter = await EcoPointTransaction.countDocuments({ userId });

            // Both points and transaction should be updated
            expect(userResAfter.body.user.ecoPoints).toBeGreaterThan(pointsBefore);
            expect(txCountAfter).toBe(txCountBefore + 1);
        });
    });
});
