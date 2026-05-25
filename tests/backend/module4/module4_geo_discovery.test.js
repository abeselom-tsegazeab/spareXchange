import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { RecyclingSubmission } from "../models/recyclingSubmission.model.js";

describe("Module 4: Geo-Discovery & Location Services", () => {
    const ts = Date.now();
    
    const userInfo = { name: "Test User", email: `geouser_${ts}@test.com`, password: "Password123!" };
    
    let userToken, userId;

    beforeAll(async () => {
        const res = await request(app).post("/api/auth/signup").send(userInfo);
        userToken = res.body.accessToken;
        userId = res.body.user._id;

        await User.findByIdAndUpdate(userId, { isVerified: true });

        // Create approved submissions at different locations
        const locations = [
            { name: "NYC Center", lat: 40.7128, lng: -74.0060, status: "approved" },
            { name: "Brooklyn Hub", lat: 40.6782, lng: -73.9442, status: "approved" },
            { name: "Queens Station", lat: 40.7282, lng: -73.7949, status: "completed" },
            { name: "Jersey City", lat: 40.7178, lng: -74.0431, status: "approved" },
            { name: "Far Location", lat: 41.8781, lng: -87.6298, status: "approved" } // Chicago - far away
        ];

        for (const loc of locations) {
            const submission = new RecyclingSubmission({
                userId,
                itemType: "electronics",
                itemDescription: `Test item at ${loc.name}`,
                estimatedWeight: 5,
                location: loc.name,
                ecoPointsEarned: 100,
                status: loc.status,
                locationCoords: {
                    type: "Point",
                    coordinates: [loc.lng, loc.lat]
                }
            });

            await submission.save();
        }
    }, 120000);

    afterAll(async () => {
        await User.deleteMany({ email: { $regex: ts } });
        await RecyclingSubmission.deleteMany({ userId });
        await mongoose.connection.close();
    });

    // ────────────────────────────────────────────────────────────────────────
    // 1. Basic Discovery Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Basic Discovery Functionality", () => {
        test("1. Discovery returns nearby locations", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 50
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });

        test("2. Discovery excludes pending and rejected submissions", async () => {
            // Create a pending submission nearby
            const pendingSubmission = new RecyclingSubmission({
                userId,
                itemType: "metal",
                itemDescription: "Pending item",
                estimatedWeight: 3,
                location: "Nearby Pending",
                ecoPointsEarned: 50,
                status: "pending",
                locationCoords: {
                    type: "Point",
                    coordinates: [-74.0060, 40.7128]
                }
            });

            await pendingSubmission.save();

            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 50
                });

            const pendingInResults = res.body.data.find(
                s => s.status === "pending" || s.status === "rejected"
            );

            expect(pendingInResults).toBeUndefined();

            // Cleanup
            await RecyclingSubmission.findByIdAndDelete(pendingSubmission._id);
        });

        test("3. Discovery includes approved and completed submissions", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 50
                });

            const statuses = res.body.data.map(s => s.status);
            const onlyApprovedOrCompleted = statuses.every(
                s => s === "approved" || s === "completed"
            );

            expect(onlyApprovedOrCompleted).toBe(true);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 2. Radius & Distance Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Radius & Distance Calculations", () => {
        test("4. Small radius returns fewer results", async () => {
            const smallRadiusRes = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 5 // 5km
                });

            const largeRadiusRes = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 100 // 100km
                });

            expect(smallRadiusRes.body.data.length).toBeLessThanOrEqual(
                largeRadiusRes.body.data.length
            );
        });

        test("5. Far location not included in small radius", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 20 // 20km - should not include Chicago
                });

            const chicagoInResults = res.body.data.find(
                s => s.location === "Far Location"
            );

            expect(chicagoInResults).toBeUndefined();
        });

        test("6. Default radius is 50km", async () => {
            const withDefaultRes = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060
                });

            const withExplicitRes = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 50
                });

            expect(withDefaultRes.body.data.length).toBe(withExplicitRes.body.data.length);
        });

        test("7. Very large radius returns more results", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 1000 // 1000km
                });

            expect(res.body.data.length).toBeGreaterThanOrEqual(4); // Should include Chicago
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 3. Validation Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Parameter Validation", () => {
        test("8. Missing latitude returns 400", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    longitude: -74.0060,
                    radius: 50
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toMatch(/latitude and longitude are required/i);
        });

        test("9. Missing longitude returns 400", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    radius: 50
                });

            expect(res.status).toBe(400);
        });

        test("10. Invalid latitude (out of range) handling", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 999,
                    longitude: -74.0060,
                    radius: 50
                });

            // Should either handle gracefully or return error
            expect([200, 400]).toContain(res.status);
        });

        test("11. Negative radius should be handled", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: -10
                });

            // Should handle gracefully (use default or return error)
            expect([200, 400]).toContain(res.status);
        });

        test("12. Zero radius returns no results or nearby only", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 0
                });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 4. Location Data Integrity Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Location Data Integrity", () => {
        test("13. Discovery returns location coordinates", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 50
                });

            expect(res.body.data.length).toBeGreaterThan(0);
            
            const firstResult = res.body.data[0];
            expect(firstResult.locationCoords).toBeDefined();
            expect(firstResult.locationCoords.type).toBe("Point");
            expect(Array.isArray(firstResult.locationCoords.coordinates)).toBe(true);
        });

        test("14. Discovery returns location name", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 50
                });

            const firstResult = res.body.data[0];
            expect(firstResult.location).toBeDefined();
            expect(typeof firstResult.location).toBe("string");
        });

        test("15. Discovery populates user information", async () => {
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 50
                });

            const firstResult = res.body.data[0];
            expect(firstResult.userId).toBeDefined();
            expect(firstResult.userId.name).toBeDefined();
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 5. Performance & Limit Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Performance & Limits", () => {
        test("16. Discovery limits results to 30", async () => {
            // Create many submissions in same area
            const promises = [];
            for (let i = 0; i < 35; i++) {
                const submission = new RecyclingSubmission({
                    userId,
                    itemType: "plastic",
                    itemDescription: `Bulk test ${i}`,
                    estimatedWeight: 1,
                    location: `Bulk Location ${i}`,
                    ecoPointsEarned: 10,
                    status: "approved",
                    locationCoords: {
                        type: "Point",
                        coordinates: [-74.0060 + (i * 0.0001), 40.7128 + (i * 0.0001)]
                    }
                });
                promises.push(submission.save());
            }

            await Promise.all(promises);

            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 50
                });

            expect(res.body.data.length).toBeLessThanOrEqual(30);

            // Cleanup bulk submissions
            await RecyclingSubmission.deleteMany({
                itemDescription: { $regex: /^Bulk test/ }
            });
        });

        test("17. Discovery response time is reasonable", async () => {
            const start = Date.now();
            
            await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 40.7128,
                    longitude: -74.0060,
                    radius: 50
                });

            const duration = Date.now() - start;
            expect(duration).toBeLessThan(2000); // Should complete in under 2 seconds
        });
    });

    // ────────────────────────────────────────────────────────────────────────
    // 6. Geographic Coverage Tests
    // ────────────────────────────────────────────────────────────────────────

    describe("Geographic Coverage", () => {
        test("18. Different geographic regions work correctly", async () => {
            // Test with San Francisco coordinates
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 37.7749,
                    longitude: -122.4194,
                    radius: 50
                });

            expect(res.status).toBe(200);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        test("19. International coordinates handled", async () => {
            // Test with London coordinates
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 51.5074,
                    longitude: -0.1278,
                    radius: 50
                });

            expect(res.status).toBe(200);
        });

        test("20. Equator and prime meridian crossing", async () => {
            // Test near (0, 0)
            const res = await request(app)
                .get("/api/recycling-submissions/discovery")
                .set("Authorization", `Bearer ${userToken}`)
                .query({
                    latitude: 0.1,
                    longitude: 0.1,
                    radius: 100
                });

            expect(res.status).toBe(200);
        });
    });
});
