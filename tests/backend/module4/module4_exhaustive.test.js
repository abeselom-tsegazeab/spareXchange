import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { RecyclingSubmission } from "../models/recyclingSubmission.model.js";

describe("Exhaustive Module 4: Recycling & Sustainability Verification", () => {
    const ts = Date.now();
    const userInfo = { name: "Module4 User", email: `m4user_${ts}@test.com`, password: "Password123!" };
    const adminInfo = { name: "Module4 Admin", email: `m4admin_${ts}@test.com`, password: "Password123!", userType: "admin" };

    let tokenU, tokenA;
    let userId, adminId;
    let submissionId;

    beforeAll(async () => {
        // Setup Users
        const [rU, rA] = await Promise.all([
            request(app).post("/api/auth/signup").send(userInfo),
            request(app).post("/api/auth/signup").send(adminInfo)
        ]);

        tokenU = rU.body.accessToken;
        tokenA = rA.body.accessToken;
        userId = rU.body.user._id;
        adminId = rA.body.user._id;

        // Activate and grant permissions
        await User.updateMany({ email: { $regex: ts } }, { isVerified: true });
        await User.findByIdAndUpdate(adminId, { permissions: ["admin"] });
    }, 120000);

    afterAll(async () => {
        await User.deleteMany({ email: { $regex: ts } });
        await RecyclingSubmission.deleteMany({ userId });
        await mongoose.connection.close();
    });

    // ────────────────────────────────────────────────────────────────────────
    // 1. Submission & Scoring Flow
    // ────────────────────────────────────────────────────────────────────────

    test("1. Create Recycling Submission (Vehicle Parts - Weight Based)", async () => {
        const res = await request(app)
            .post("/api/recycling-submissions")
            .set("Authorization", `Bearer ${tokenU}`)
            .send({
                itemType: "vehicle-parts",
                itemDescription: "Old radiator and hoses",
                estimatedWeight: 10, // points = 25 * 10 = 250
                location: "Main Street Scrapyard",
                latitude: 40.7128,
                longitude: -74.0060,
                notes: "Aluminum core"
            });

        expect(res.status).toBe(201);
        expect(res.body.submission.ecoPointsEarned).toBe(250);
        expect(res.body.qrCodeData).toContain("sparexchange:recycle:");
        submissionId = res.body.submission._id;
    });

    test("2. Create Recycling Submission (Electronics - Value Based)", async () => {
        const res = await request(app)
            .post("/api/recycling-submissions")
            .set("Authorization", `Bearer ${tokenU}`)
            .send({
                itemType: "electronics",
                itemDescription: "Broken ECU unit",
                estimatedValue: 1500, // points = 20 * (1500/100) = 300
                location: "Tech Hub"
            });

        expect(res.status).toBe(201);
        expect(res.body.submission.ecoPointsEarned).toBe(300);
    });

    // ────────────────────────────────────────────────────────────────────────
    // 2. Verification Flow (Admin & Recycler)
    // ────────────────────────────────────────────────────────────────────────

    test("3. Admin Approval & Atomic Point Awarding", async () => {
        const res = await request(app)
            .post(`/api/recycling-submissions/${submissionId}/approve`)
            .set("Authorization", `Bearer ${tokenA}`);

        expect(res.status).toBe(200);
        expect(res.body.submission.status).toBe("approved");

        // Verify User Points
        const userRes = await request(app).get("/api/auth/check-auth").set("Authorization", `Bearer ${tokenU}`);
        expect(userRes.body.user.ecoPoints).toBeGreaterThanOrEqual(250);
    });

    test("4. Token-Based Verification (Recycler Role)", async () => {
        // Create fresh submission
        const fresh = await request(app)
            .post("/api/recycling-submissions")
            .set("Authorization", `Bearer ${tokenU}`)
            .send({
                itemType: "batteries",
                itemDescription: "Lead-acid core",
                location: "Battery Center"
            });
        
        const token = fresh.body.submission.verificationToken;

        // Verify by token
        const res = await request(app)
            .post("/api/recycling-submissions/verify-token")
            .set("Authorization", `Bearer ${tokenA}`)
            .send({ token });

        expect(res.status).toBe(200);
        expect(res.body.submission.status).toBe("approved");
        expect(res.body.submission.isVerifiedByRecycler).toBe(true);

        // Check Achievements
        const userRes = await request(app).get("/api/auth/check-auth").set("Authorization", `Bearer ${tokenU}`);
        expect(userRes.body.user.achievements).toContain("Eco Warrior (First Recycle)");
    });

    // ────────────────────────────────────────────────────────────────────────
    // 3. Discovery & Filtering
    // ────────────────────────────────────────────────────────────────────────

    test("5. Nearby Recycler Discovery (Geo-Proximity)", async () => {
        const res = await request(app)
            .get("/api/recycling-submissions/discovery")
            .set("Authorization", `Bearer ${tokenU}`)
            .query({
                latitude: 40.7128,
                longitude: -74.0060,
                radius: 50
            });

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeGreaterThan(0);
        expect(res.body.data[0].location).toBe("Main Street Scrapyard");
    });

    test("6. Admin Filtering (Get All Submissions)", async () => {
        const res = await request(app)
            .get("/api/recycling-submissions")
            .set("Authorization", `Bearer ${tokenA}`)
            .query({ itemType: "vehicle-parts" });

        expect(res.status).toBe(200);
        expect(res.body.submissions.every(s => s.itemType === "vehicle-parts")).toBe(true);
    });

    // ────────────────────────────────────────────────────────────────────────
    // 4. Protection & state Machine
    // ────────────────────────────────────────────────────────────────────────

    test("7. Security: Non-Admin cannot approve", async () => {
        const res = await request(app)
            .post(`/api/recycling-submissions/${submissionId}/approve`)
            .set("Authorization", `Bearer ${tokenU}`);
        
        expect(res.status).toBe(403);
    });

    test("8. State Guard: Cannot approve already approved", async () => {
        const res = await request(app)
            .post(`/api/recycling-submissions/${submissionId}/approve`)
            .set("Authorization", `Bearer ${tokenA}`);
        
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/not pending/i);
    });
});
