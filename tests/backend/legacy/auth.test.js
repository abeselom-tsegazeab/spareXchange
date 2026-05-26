import "dotenv/config";
import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { authenticator } from "otplib";

describe("Identity & Security Module (Module 1)", () => {
	let accessToken, refreshToken, mfaSecret, backupCodes;
	const testUser = {
		name: "Jest Security User",
		email: `jest_sec_${Date.now()}@test.com`,
		password: "Password123!"
	};

	test("Should signup successfully with default permissions", async () => {
		const res = await request(app)
			.post("/api/auth/signup")
			.send(testUser);
		
		expect(res.status).toBe(201);
		expect(res.body.user.permissions).toContain("create_listings");
		accessToken = res.body.accessToken;
	});

	test("Should fail login with wrong password", async () => {
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: testUser.email, password: "wrong_password" });
		
		expect(res.status).toBe(400);
	});

	test("Should login successfully and return access/refresh tokens in cookies", async () => {
		const res = await request(app)
			.post("/api/auth/login")
			.send({ email: testUser.email, password: testUser.password });
		
		expect(res.status).toBe(200);
		expect(res.header['set-cookie']).toBeDefined();
		accessToken = res.body.accessToken;
	});

	test("Should setup MFA and return QR code/secret", async () => {
		const res = await request(app)
			.post("/api/auth/mfa/setup")
			.set("Authorization", `Bearer ${accessToken}`);
		
		expect(res.status).toBe(200);
		expect(res.body.qrCodeUrl).toBeDefined();
		expect(res.body.secret).toBeDefined();
		expect(res.body.backupCodes).toHaveLength(5);
		
		mfaSecret = res.body.mfaSecret;
		backupCodes = res.body.backupCodes;
	});

	test("Should verify and enable MFA with correct TOTP", async () => {
		const token = authenticator.generate(mfaSecret);
		const res = await request(app)
			.post("/api/auth/mfa/verify")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({ token });
		
		expect(res.status).toBe(200);
		expect(res.body.message).toMatch(/enabled/i);
	});

	test("Should refresh access token using refresh token cookie", async () => {
		const refreshUser = { name: "Refresh User", email: `refresh_${Date.now()}@test.com`, password: "Password123!" };
		await request(app).post("/api/auth/signup").send(refreshUser);

		const loginRes = await request(app)
			.post("/api/auth/login")
			.send({ email: refreshUser.email, password: refreshUser.password });
		
		const cookies = loginRes.header['set-cookie'];
		expect(cookies).toBeDefined();
		
		const res = await request(app)
			.get("/api/auth/refresh-token")
			.set("Cookie", cookies);
		
		expect(res.status).toBe(200);
		expect(res.body.accessToken).toBeDefined();
	});

	test("Should logout and clear cookies", async () => {
		const res = await request(app).post("/api/auth/logout");
		expect(res.status).toBe(200);
		expect(res.header['set-cookie'][0]).toMatch(/token=;/);
	});
});
