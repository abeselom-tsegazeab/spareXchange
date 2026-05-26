import "dotenv/config";
import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { OAuth2Client } from "google-auth-library";

// Mock the google-auth-library
jest.mock("google-auth-library", () => {
    return {
        OAuth2Client: jest.fn().mockImplementation(() => {
            return {
                verifyIdToken: jest.fn().mockImplementation(({ idToken }) => {
                    if (idToken === "valid-mock-token") {
                        return Promise.resolve({
                            getPayload: () => ({
                                email: "google_user@test.com",
                                name: "Google User",
                                picture: "http://example.com/pic.jpg",
                                sub: "google-12345"
                            })
                        });
                    }
                    return Promise.reject(new Error("Invalid token"));
                })
            };
        })
    };
});

describe("Google OAuth Implementation", () => {
    const testEmail = "google_user@test.com";

    beforeEach(async () => {
        await User.deleteMany({ email: testEmail });
    });

    test("Should successfully signup a new user via Google", async () => {
        const res = await request(app)
            .post("/api/auth/oauth/google")
            .send({ credential: "valid-mock-token" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/Signed up successfully/i);
        expect(res.body.user.email).toBe(testEmail);
        expect(res.body.user.authProvider).toBe("google");
        expect(res.body.user.googleId).toBe("google-12345");
        
        const user = await User.findOne({ email: testEmail });
        expect(user).toBeDefined();
        expect(user.isVerified).toBe(true);
    });

    test("Should successfully login an existing Google user", async () => {
        // First signup
        await request(app)
            .post("/api/auth/oauth/google")
            .send({ credential: "valid-mock-token" });

        // Then login
        const res = await request(app)
            .post("/api/auth/oauth/google")
            .send({ credential: "valid-mock-token" });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toMatch(/Logged in successfully/i);
    });

    test("Should fail with an invalid token", async () => {
        const res = await request(app)
            .post("/api/auth/oauth/google")
            .send({ credential: "invalid-token" });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Invalid Google token/i);
    });
});
