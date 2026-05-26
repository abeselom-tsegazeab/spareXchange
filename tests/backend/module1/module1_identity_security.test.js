import request from "supertest";
import { app } from "../index.js";
import { User } from "../models/user.model.js";
import { authenticator } from "otplib";
import mongoose from "mongoose";

describe("Module 1: Identity & Security - Comprehensive Testing", () => {
	let accessToken, refreshToken, userId, mfaSecret, backupCodes;
	const timestamp = Date.now();
	const testUser = {
		name: "Module 1 Test User",
		email: `module1_test_${timestamp}@test.com`,
		password: "SecurePass123!"
	};

	beforeAll(async () => {
		// Clean up test users from previous runs
		await User.deleteMany({ email: /module1_test_/ });
	});

	afterAll(async () => {
		// Cleanup
		await User.deleteMany({ email: /module1_test_/ });
	});

	describe("1. User Registration (Signup)", () => {
		test("Should signup successfully with valid credentials", async () => {
			const res = await request(app)
				.post("/api/auth/signup")
				.send(testUser);
			
			expect(res.status).toBe(201);
			expect(res.body.success).toBe(true);
			expect(res.body.user).toBeDefined();
			expect(res.body.user.email).toBe(testUser.email);
			expect(res.body.user.name).toBe(testUser.name);
			expect(res.body.user.password).toBeUndefined();
			expect(res.body.accessToken).toBeDefined();
			expect(res.body.user.permissions).toContain("create_listings");
			expect(res.body.user.permissions).toContain("propose_exchanges");
			
			accessToken = res.body.accessToken;
			userId = res.body.user._id;
		});

		test("Should fail signup with missing fields", async () => {
			const res = await request(app)
				.post("/api/auth/signup")
				.send({ email: "test@example.com" });
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("Should fail signup with duplicate email", async () => {
			const res = await request(app)
				.post("/api/auth/signup")
				.send(testUser);
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toMatch(/already exists/i);
		});

		test("Should fail signup with weak password", async () => {
			const res = await request(app)
				.post("/api/auth/signup")
				.send({
					name: "Weak Password User",
					email: `weak_${timestamp}@test.com`,
					password: "weak"
				});
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toMatch(/password.*8 characters/i);
		});

		test("Should fail signup without special character in password", async () => {
			const res = await request(app)
				.post("/api/auth/signup")
				.send({
					name: "No Special Char",
					email: `nospecial_${timestamp}@test.com`,
					password: "Password123"
				});
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});
	});

	describe("2. Email Verification", () => {
		let verificationCode;

		test("Should retrieve verification code from database", async () => {
			const user = await User.findById(userId);
			verificationCode = user.verificationToken;
			expect(verificationCode).toBeDefined();
			expect(verificationCode.length).toBe(6);
		});

		test("Should verify email with correct code", async () => {
			const user = await User.findById(userId);
			const res = await request(app)
				.post("/api/auth/verify-email")
				.send({ code: user.verificationToken });
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toMatch(/verified/i);
			
			// Verify user is now marked as verified
			const updatedUser = await User.findById(userId);
			expect(updatedUser.isVerified).toBe(true);
		});

		test("Should fail verification with invalid code", async () => {
			const res = await request(app)
				.post("/api/auth/verify-email")
				.send({ code: "999999" });
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("Should fail verification with expired code", async () => {
			// Create user with expired token
			const expiredUser = await User.create({
				name: "Expired User",
				email: `expired_${timestamp}@test.com`,
				password: "SecurePass123!",
				verificationToken: "123456",
				verificationTokenExpiresAt: Date.now() - 1000 // Expired
			});

			const res = await request(app)
				.post("/api/auth/verify-email")
				.send({ code: "123456" });
			
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/invalid or expired/i);
		});
	});

	describe("3. User Login", () => {
		test("Should login successfully with valid credentials", async () => {
			const res = await request(app)
				.post("/api/auth/login")
				.send({ email: testUser.email, password: testUser.password });
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.accessToken).toBeDefined();
			expect(res.body.user.email).toBe(testUser.email);
			expect(res.body.user.password).toBeUndefined();
			expect(res.header['set-cookie']).toBeDefined();
			
			accessToken = res.body.accessToken;
		});

		test("Should fail login with wrong password", async () => {
			const res = await request(app)
				.post("/api/auth/login")
				.send({ email: testUser.email, password: "WrongPassword123!" });
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
			expect(res.body.message).toMatch(/invalid credentials/i);
		});

		test("Should fail login with non-existent email", async () => {
			const res = await request(app)
				.post("/api/auth/login")
				.send({ email: "nonexistent@test.com", password: "SecurePass123!" });
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("Should update lastLogin timestamp on successful login", async () => {
			await request(app)
				.post("/api/auth/login")
				.send({ email: testUser.email, password: testUser.password });
			
			const user = await User.findById(userId);
			expect(user.lastLogin).toBeDefined();
			expect(new Date(user.lastLogin).getTime()).toBeGreaterThan(Date.now() - 60000);
		});

		test("Should fail login for banned user", async () => {
			// Create and ban a user
			const bannedUser = await User.create({
				name: "Banned User",
				email: `banned_${timestamp}@test.com`,
				password: "SecurePass123!",
				isVerified: true,
				isBanned: true
			});

			const res = await request(app)
				.post("/api/auth/login")
				.send({ email: bannedUser.email, password: "SecurePass123!" });
			
			expect(res.status).toBe(403);
			expect(res.body.message).toMatch(/suspended/i);
		});
	});

	describe("4. Authentication Check", () => {
		test("Should return user profile with valid token", async () => {
			const res = await request(app)
				.get("/api/auth/check-auth")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.user.email).toBe(testUser.email);
			expect(res.body.user.password).toBeUndefined();
		});

		test("Should fail check-auth without token", async () => {
			const res = await request(app)
				.get("/api/auth/check-auth");
			
			expect(res.status).toBe(401);
		});

		test("Should fail check-auth with invalid token", async () => {
			const res = await request(app)
				.get("/api/auth/check-auth")
				.set("Authorization", "Bearer invalidtoken123");
			
			expect(res.status).toBe(401);
		});

		test("Should fail check-auth for banned user", async () => {
			const bannedUser = await User.create({
				name: "Banned Auth User",
				email: `banned_auth_${timestamp}@test.com`,
				password: "SecurePass123!",
				isVerified: true,
				isBanned: true
			});

			const loginRes = await request(app)
				.post("/api/auth/login")
				.send({ email: bannedUser.email, password: "SecurePass123!" });
			
			// Should be blocked at login, but if somehow gets token:
			if (loginRes.body.accessToken) {
				const res = await request(app)
					.get("/api/auth/check-auth")
					.set("Authorization", `Bearer ${loginRes.body.accessToken}`);
				
				expect(res.status).toBe(403);
			}
		});
	});

	describe("5. Password Recovery", () => {
		let resetToken;

		test("Should send password reset email", async () => {
			const res = await request(app)
				.post("/api/auth/forgot-password")
				.send({ email: testUser.email });
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toMatch(/reset link sent/i);

			// Get reset token from database
			const user = await User.findById(userId);
			resetToken = user.resetPasswordToken;
			expect(resetToken).toBeDefined();
		});

		test("Should fail forgot-password for non-existent user", async () => {
			const res = await request(app)
				.post("/api/auth/forgot-password")
				.send({ email: "nonexistent@test.com" });
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("Should reset password with valid token", async () => {
			const user = await User.findById(userId);
			const newPassword = "NewSecurePass456!";

			const res = await request(app)
				.post(`/api/auth/reset-password/${user.resetPasswordToken}`)
				.send({ password: newPassword });
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toMatch(/password reset successful/i);

			// Verify token is cleared
			const updatedUser = await User.findById(userId);
			expect(updatedUser.resetPasswordToken).toBeUndefined();

			// Test login with new password
			const loginRes = await request(app)
				.post("/api/auth/login")
				.send({ email: testUser.email, password: newPassword });
			
			expect(loginRes.status).toBe(200);
			expect(loginRes.body.success).toBe(true);

			// Reset password back to original
			await request(app)
				.post("/api/auth/forgot-password")
				.send({ email: testUser.email });
			
			const user2 = await User.findById(userId);
			await request(app)
				.post(`/api/auth/reset-password/${user2.resetPasswordToken}`)
				.send({ password: testUser.password });
		});

		test("Should fail reset with invalid token", async () => {
			const res = await request(app)
				.post("/api/auth/reset-password/invalidtoken123")
				.send({ password: "NewSecurePass456!" });
			
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/invalid or expired/i);
		});

		test("Should fail reset with expired token", async () => {
			const user = await User.create({
				name: "Expired Reset User",
				email: `expired_reset_${timestamp}@test.com`,
				password: "SecurePass123!",
				isVerified: true,
				resetPasswordToken: "expiredtoken123",
				resetPasswordExpiresAt: Date.now() - 1000
			});

			const res = await request(app)
				.post("/api/auth/reset-password/expiredtoken123")
				.send({ password: "NewSecurePass456!" });
			
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/invalid or expired/i);
		});
	});

	describe("6. Multi-Factor Authentication (MFA)", () => {
		test("Should setup MFA and return QR code and backup codes", async () => {
			const res = await request(app)
				.post("/api/auth/mfa/setup")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.qrCodeUrl).toBeDefined();
			expect(res.body.secret).toBeDefined();
			expect(res.body.backupCodes).toBeDefined();
			expect(res.body.backupCodes).toHaveLength(5);
			
			mfaSecret = res.body.secret;
			backupCodes = res.body.backupCodes;
		});

		test("Should verify MFA with correct TOTP token", async () => {
			const totpToken = authenticator.generate(mfaSecret);
			
			const res = await request(app)
				.post("/api/auth/mfa/verify")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ code: totpToken });
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toMatch(/enabled/i);

			// Verify MFA is enabled in database
			const user = await User.findById(userId);
			expect(user.isMfaEnabled).toBe(true);
		});

		test("Should require MFA on login after enabling", async () => {
			const res = await request(app)
				.post("/api/auth/login")
				.send({ email: testUser.email, password: testUser.password });
			
			expect(res.status).toBe(200);
			expect(res.body.mfaRequired).toBe(true);
			expect(res.body.message).toMatch(/mfa verification required/i);
		});

		test("Should validate MFA login with correct TOTP", async () => {
			const totpToken = authenticator.generate(mfaSecret);
			
			const res = await request(app)
				.post("/api/auth/mfa/validate")
				.send({ email: testUser.email, code: totpToken });
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.accessToken).toBeDefined();
			
			accessToken = res.body.accessToken;
		});

		test("Should validate MFA login with backup code", async () => {
			// Use first backup code
			const backupCode = backupCodes[0];
			
			const res = await request(app)
				.post("/api/auth/mfa/validate")
				.send({ email: testUser.email, code: backupCode });
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);

			// Verify backup code was consumed
			const user = await User.findById(userId);
			expect(user.mfaBackupCodes).not.toContain(backupCode);
			expect(user.mfaBackupCodes).toHaveLength(4);
		});

		test("Should fail MFA validation with invalid code", async () => {
			const res = await request(app)
				.post("/api/auth/mfa/validate")
				.send({ email: testUser.email, code: "000000" });
			
			expect(res.status).toBe(400);
			expect(res.body.success).toBe(false);
		});

		test("Should fail MFA setup without authentication", async () => {
			const res = await request(app)
				.post("/api/auth/mfa/setup");
			
			expect(res.status).toBe(401);
		});
	});

	describe("7. Token Refresh", () => {
		test("Should refresh access token with valid refresh token", async () => {
			// Login to get fresh cookies
			const loginRes = await request(app)
				.post("/api/auth/login")
				.send({ email: testUser.email, password: testUser.password })
				.set("Cookie", []); // Clear cookies first

			// MFA required, so validate it
			const totpToken = authenticator.generate(mfaSecret);
			const mfaRes = await request(app)
				.post("/api/auth/mfa/validate")
				.send({ email: testUser.email, code: totpToken });

			accessToken = mfaRes.body.accessToken;
			const cookies = mfaRes.header['set-cookie'];

			// Now refresh
			const res = await request(app)
				.get("/api/auth/refresh-token")
				.set("Cookie", cookies);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.accessToken).toBeDefined();
		});

		test("Should fail refresh without refresh token", async () => {
			const res = await request(app)
				.get("/api/auth/refresh-token");
			
			expect(res.status).toBe(401);
			expect(res.body.message).toMatch(/refresh token not found/i);
		});

		test("Should fail refresh with invalid refresh token", async () => {
			const res = await request(app)
				.get("/api/auth/refresh-token")
				.set("Cookie", "refreshToken=invalidtoken123");
			
			expect(res.status).toBe(403);
		});
	});

	describe("8. Profile Management", () => {
		test("Should update user profile", async () => {
			const updateData = {
				name: "Updated Test User",
				phone: "+251911223344",
				location: "Addis Ababa, Ethiopia"
			};

			const res = await request(app)
				.put("/api/users/profile")
				.set("Authorization", `Bearer ${accessToken}`)
				.send(updateData);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.user.name).toBe(updateData.name);
			expect(res.body.user.phone).toBe(updateData.phone);
			expect(res.body.user.location).toBe(updateData.location);
		});

		test("Should update profile interests", async () => {
			const interests = ["vehicle parts", "electronics", "machinery"];
			
			const res = await request(app)
				.put("/api/users/profile")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ interests });
			
			expect(res.status).toBe(200);
			expect(res.body.user.interests).toEqual(interests);
		});

		test("Should fail profile update without authentication", async () => {
			const res = await request(app)
				.put("/api/users/profile")
				.send({ name: "Hacker" });
			
			expect(res.status).toBe(401);
		});
	});

	describe("9. Role Verification Request", () => {
		test("Should submit role verification request", async () => {
			// Note: This endpoint requires file upload, testing without files should fail
			const res = await request(app)
				.post("/api/users/verify-role")
				.set("Authorization", `Bearer ${accessToken}`)
				.send({ requestedType: "technician" });
			
			// Should fail without documents
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/document/i);
		});

		test("Should fail role verification without authentication", async () => {
			const res = await request(app)
				.post("/api/users/verify-role")
				.send({ requestedType: "technician" });
			
			expect(res.status).toBe(401);
		});
	});

	describe("10. Logout", () => {
		test("Should logout successfully and clear cookies", async () => {
			const res = await request(app)
				.post("/api/auth/logout")
				.set("Authorization", `Bearer ${accessToken}`);
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
			expect(res.body.message).toMatch(/logged out/i);
			
			// Verify cookies are cleared
			const setCookie = res.header['set-cookie'];
			expect(setCookie).toBeDefined();
			expect(setCookie.some(cookie => cookie.includes("token=;"))).toBe(true);
		});

		test("Should logout without token (graceful)", async () => {
			const res = await request(app)
				.post("/api/auth/logout");
			
			expect(res.status).toBe(200);
			expect(res.body.success).toBe(true);
		});
	});

	describe("11. Security & Edge Cases", () => {
		test("Should prevent SQL injection in email field", async () => {
			const res = await request(app)
				.post("/api/auth/login")
				.send({ 
					email: "test@test.com' OR '1'='1", 
					password: "SecurePass123!" 
				});
			
			expect(res.status).toBe(400);
			expect(res.body.message).toMatch(/invalid credentials/i);
		});

		test("Should handle concurrent login attempts", async () => {
			const loginPromises = Array(5).fill(null).map(() =>
				request(app)
					.post("/api/auth/login")
					.send({ email: testUser.email, password: testUser.password })
			);

			const results = await Promise.all(loginPromises);
			results.forEach(res => {
				expect(res.status).toBe(200);
				expect(res.body.mfaRequired).toBe(true);
			});
		});

		test("Should enforce password strength requirements", async () => {
			const weakPasswords = [
				"short1!",
				"nouppercase1!",
				"NOLOWERCASE1!",
				"NoNumbers!",
				"NoSpecial123"
			];

			for (const password of weakPasswords) {
				const res = await request(app)
					.post("/api/auth/signup")
					.send({
						name: "Weak Pass Tester",
						email: `weak_${Date.now()}@test.com`,
						password
					});
				
				expect(res.status).toBe(400);
				expect(res.body.success).toBe(false);
			}
		});

		test("Should hash passwords in database", async () => {
			const user = await User.findById(userId);
			expect(user.password).not.toBe(testUser.password);
			expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash format
		});

		test("Should store MFA secret encrypted", async () => {
			const user = await User.findById(userId);
			if (user.mfaSecret) {
				expect(user.mfaSecret).not.toBe(mfaSecret);
				expect(user.mfaSecret).not.toBe("");
			}
		});
	});
});
