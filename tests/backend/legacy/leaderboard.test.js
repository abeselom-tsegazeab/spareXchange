import request from "supertest";
import { app } from "../index.js";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

describe("Eco-Leaderboard & Tier Verification", () => {
    const ts = Date.now();
    const user1Info = { name: "Leaf User", email: `leaf_${ts}@test.com`, password: "Password123!", ecoPoints: 50 };
    const user2Info = { name: "Oak User", email: `oak_${ts}@test.com`, password: "Password123!", ecoPoints: 2000 };

    let token1, token2;
    let userId1, userId2;

    beforeAll(async () => {
        // Setup Users
        const [r1, r2] = await Promise.all([
            request(app).post("/api/auth/signup").send(user1Info),
            request(app).post("/api/auth/signup").send(user2Info)
        ]);

        token1 = r1.body.accessToken;
        token2 = r2.body.accessToken;
        userId1 = r1.body.user._id;
        userId2 = r2.body.user._id;

        // Activate and set points manually for test
        await User.findByIdAndUpdate(userId1, { isVerified: true, ecoPoints: 50 });
        await User.findByIdAndUpdate(userId2, { isVerified: true, ecoPoints: 2000 });
    }, 120000);

    afterAll(async () => {
        await User.deleteMany({ email: { $regex: ts } });
        await mongoose.connection.close();
    });

    test("1. Verify ecoTier virtual calculation", async () => {
        const u1 = await User.findById(userId1);
        const u2 = await User.findById(userId2);

        expect(u1.ecoTier).toBe("Seed");
        expect(u2.ecoTier).toBe("Oak");
    });

    test("2. Fetch Leaderboard (Ordering & Limit)", async () => {
        const res = await request(app)
            .get("/api/users/leaderboard")
            .set("Authorization", `Bearer ${token1}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.leaderboard.length).toBeGreaterThanOrEqual(2);
        
        // Check order
        const scores = res.body.leaderboard.map(u => u.ecoPoints);
        const sortedScores = [...scores].sort((a, b) => b - a);
        expect(scores).toEqual(sortedScores);

        // Check virtual field presence in response (requires toJSON/toObject virtuals: true)
        expect(res.body.leaderboard[0]).toHaveProperty("ecoTier");
    });

    test("3. Leaderboard Privacy (Requires Auth)", async () => {
        const res = await request(app).get("/api/users/leaderboard");
        expect(res.status).toBe(401); // Unauthorized without token
    });
});
