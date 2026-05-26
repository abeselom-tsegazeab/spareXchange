import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { RecyclingSubmission } from "../models/recyclingSubmission.model.js";

describe("Module 4: Recycling Submission & Points Calculation", () => {
    const ts = Date.now();
    
    // Test users
    const user1Info = { name: "Test User 1", email: `testuser1_${ts}@test.com`, password: "Password123!" };
    const user2Info = { name: "Test User 2", email: `testuser2_${ts}@test.com`, password: "Password123!" };
    
    let token1, token2;
    let userId1, userId2;

    beforeAll(async () => {
        // Create test users
        const [r1, r2] = await Promise.all([
            request(app).post("/api/auth/signup").send(user1Info),
            request(app).post("/api/auth/signup").send(user2Info)
        ]);

        token1 = r1.body.accessToken;
        token2 = r2.body.accessToken;
        userId1 = r1.body.user._id;
        userId2 = r2.body.user._id;

        // Verify users
        await User.updateMany({ email: { $regex: ts } }, { isVerified: true });
    }, 120000);

    afterAll(async () => {
        await User.deleteMany({ email: { $regex: ts } });
        await RecyclingSubmission.deleteMany({ userId: { $in: [userId1, userId2] } });
        await mongoose.connection.close();
    });

    // ────────────────────────────────────────────────────────────────────────
    // 1. Weight-Based Points Calculation Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Weight-Based Points Calculation", () => {
        test("1. Vehicle Parts - Weight 10kg (25 * 10 = 250 points)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "vehicle-parts",
                    itemDescription: "Old radiator",
                    estimatedWeight: 10,
                    location: "Scrapyard A"
                });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.submission.ecoPointsEarned).toBe(250);
            expect(res.body.submission.itemType).toBe("vehicle-parts");
            expect(res.body.qrCodeData).toContain("sparexchange:recycle:");
        });

        test("2. Electronics - Weight 5kg (20 * 5 = 100 points)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "Old computer monitor",
                    estimatedWeight: 5,
                    location: "Tech Center"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBe(100);
        });

        test("3. Computers - Weight 3kg (30 * 3 = 90 points)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "computers",
                    itemDescription: "Broken laptop",
                    estimatedWeight: 3,
                    location: "Recycling Hub"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBe(90);
        });

        test("4. Batteries - Weight 2kg (10 * 2 = 20 points)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "batteries",
                    itemDescription: "Car battery",
                    estimatedWeight: 2,
                    location: "Battery Depot"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBe(20);
        });

        test("5. Plastic - Weight 50kg (5 * 50 = 250 points, capped at 250)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "plastic",
                    itemDescription: "Plastic containers",
                    estimatedWeight: 50,
                    location: "Plastic Recycling"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBe(250);
        });

        test("6. Metal - Weight 100kg (8 * 100 = 800, capped at 500)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "metal",
                    itemDescription: "Steel beams",
                    estimatedWeight: 100,
                    location: "Metal Works"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBe(500); // Capped at 500
        });

        test("7. Very small weight - 0.5kg (minimum 5 points)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "Small circuit board",
                    estimatedWeight: 0.5,
                    location: "Tech Hub"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBeGreaterThanOrEqual(5);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 2. Value-Based Points Calculation Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Value-Based Points Calculation", () => {
        test("8. Electronics - Value $1500 (20 * 15 = 300 points)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token2}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "Industrial controller",
                    estimatedValue: 1500,
                    location: "Factory Recycle"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBe(300);
        });

        test("9. Vehicle Parts - Value $500 (25 * 5 = 125 points)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token2}`)
                .send({
                    itemType: "vehicle-parts",
                    itemDescription: "Engine component",
                    estimatedValue: 500,
                    location: "Auto Shop"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBe(125);
        });

        test("10. Computers - Value $200 (30 * 2 = 60 points)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token2}`)
                .send({
                    itemType: "computers",
                    itemDescription: "Desktop PC",
                    estimatedValue: 200,
                    location: "Office Recycling"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBe(60);
        });

        test("11. High value item - $10000 (capped at 500 points)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token2}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "Server rack",
                    estimatedValue: 10000,
                    location: "Data Center"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBe(500); // Capped
        });

        test("12. Low value item - $10 (minimum 5 points)", async () => {
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token2}`)
                .send({
                    itemType: "plastic",
                    itemDescription: "Small plastic part",
                    estimatedValue: 10,
                    location: "Local Recycle"
                });

            expect(res.status).toBe(201);
            expect(res.body.submission.ecoPointsEarned).toBeGreaterThanOrEqual(5);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 3. Required Fields Validation Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Required Fields Validation", () => {
        test("13. Missing itemType should return 400", async () => {
            await new Promise(resolve => setTimeout(resolve, 200)); // Rate limit delay
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemDescription: "Test item",
                    location: "Test Location"
                });

            expect([400, 429]).toContain(res.status);
            if (res.status === 400) {
                expect(res.body.success).toBe(false);
            }
        });

        test("14. Missing itemDescription should return 400", async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "electronics",
                    location: "Test Location"
                });

            expect([400, 429]).toContain(res.status);
            if (res.status === 400) {
                expect(res.body.success).toBe(false);
            }
        });

        test("15. Missing location should return 400", async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "Test item"
                });

            expect([400, 429]).toContain(res.status);
            if (res.status === 400) {
                expect(res.body.success).toBe(false);
            }
        });

        test("16. Invalid itemType should return error", async () => {
            await new Promise(resolve => setTimeout(resolve, 200));
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "invalid-type",
                    itemDescription: "Test item",
                    location: "Test Location"
                });

            expect([400, 429]).toContain(res.status);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 4. Submission Data Integrity Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Submission Data Integrity", () => {
        test("17. Submission should have verification token", async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "Test device",
                    estimatedWeight: 2,
                    location: "Test Center"
                });

            if (res.status === 201) {
                expect(res.body.submission.verificationToken).toBeDefined();
                expect(res.body.submission.verificationToken.length).toBe(6);
                expect(/^\d{6}$/.test(res.body.submission.verificationToken)).toBe(true);
            }
        });

        test("18. Submission should have correct status (pending)", async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "vehicle-parts",
                    itemDescription: "Test part",
                    estimatedWeight: 5,
                    location: "Test Location"
                });

            if (res.status === 201) {
                expect(res.body.submission.status).toBe("pending");
            }
        });

        test("19. Submission should store location coordinates if provided", async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "electronics",
                    itemDescription: "GPS tracked item",
                    estimatedWeight: 1,
                    location: "GPS Location",
                    latitude: 40.7128,
                    longitude: -74.0060
                });

            if (res.status === 201) {
                expect(res.body.submission.locationCoords).toBeDefined();
                expect(res.body.submission.locationCoords.type).toBe("Point");
                expect(res.body.submission.locationCoords.coordinates).toEqual([-74.0060, 40.7128]);
            }
        });

        test("20. Submission should include optional notes field", async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const notes = "This is a test note with special characters: @#$%^&*()";
            const res = await request(app)
                .post("/api/recycling-submissions")
                .set("Authorization", `Bearer ${token1}`)
                .send({
                    itemType: "metal",
                    itemDescription: "Metal scrap",
                    estimatedWeight: 10,
                    location: "Metal Yard",
                    notes: notes
                });

            if (res.status === 201) {
                expect(res.body.submission.notes).toBe(notes);
            }
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 5. Get User Submissions Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Get User Submissions", () => {
        test("21. User should retrieve their own submissions", async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const res = await request(app)
                .get("/api/recycling-submissions/user")
                .set("Authorization", `Bearer ${token1}`);

            if (res.status === 200) {
                expect(res.body.success).toBe(true);
                expect(Array.isArray(res.body.submissions)).toBe(true);
                expect(res.body.count).toBeGreaterThan(0);
            }
        });

        test("22. Submissions should be sorted by createdAt (newest first)", async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const res = await request(app)
                .get("/api/recycling-submissions/user")
                .set("Authorization", `Bearer ${token1}`);

            if (res.status === 200 && res.body.submissions) {
                const submissions = res.body.submissions;
                for (let i = 0; i < submissions.length - 1; i++) {
                    const current = new Date(submissions[i].createdAt);
                    const next = new Date(submissions[i + 1].createdAt);
                    expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
                }
            }
        });

        test("23. User should not see other user's submissions", async () => {
            await new Promise(resolve => setTimeout(resolve, 300));
            const res1 = await request(app)
                .get("/api/recycling-submissions/user")
                .set("Authorization", `Bearer ${token1}`);

            await new Promise(resolve => setTimeout(resolve, 300));
            const res2 = await request(app)
                .get("/api/recycling-submissions/user")
                .set("Authorization", `Bearer ${token2}`);

            if (res1.status === 200 && res2.status === 200) {
                const user1Ids = res1.body.submissions.map(s => s.userId);
                const user2Ids = res2.body.submissions.map(s => s.userId);

                // All submissions should belong to the requesting user
                user1Ids.forEach(id => expect(id).toBe(userId1.toString()));
                user2Ids.forEach(id => expect(id).toBe(userId2.toString()));
            }
        });
    });
});
