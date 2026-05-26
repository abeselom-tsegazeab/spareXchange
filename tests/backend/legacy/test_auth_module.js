import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";

async function testAuthModule() {
	console.log("--- Module 1: Identity & Security Test ---");
	
	await mongoose.connect(process.env.MONGO_URI);
	console.log("DB Connected");

	const testUser = {
		name: "Test Auth User",
		email: `auth_test_${Date.now()}@example.com`,
		password: "password123"
	};

	// 1. Signup
	const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(testUser),
	});
	const signupData = await signupRes.json();
	console.log("1. Signup Status:", signupRes.status, signupData.success ? "✓" : "✗");
	let authToken = signupData.token || signupData.accessToken;

	// 2. Login
	const loginRes = await fetch(`${BASE_URL}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: testUser.email, password: testUser.password }),
	});
	const loginData = await loginRes.json();
	console.log("2. Login Status:", loginRes.status, loginData.success ? "✓" : "✗");
	if (loginData.accessToken) authToken = loginData.accessToken;

	// 3. Profile Access (verifyToken)
	const profileRes = await fetch(`${BASE_URL}/auth/check-auth`, {
		headers: { "Authorization": `Bearer ${authToken}` }
	});
	const profileData = await profileRes.json();
	console.log("3. Profile Fetch Status:", profileRes.status, profileData.success ? "✓" : "✗");

	// 4. Update Profile (user.controller)
	const updateRes = await fetch(`${BASE_URL}/users/profile`, {
		method: "PUT",
		headers: { 
			"Authorization": `Bearer ${authToken}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ phone: "123456789", location: "New Location" }),
	});
	const updateData = await updateRes.json();
	console.log("4. Profile Update Status:", updateRes.status, updateData.success ? "✓" : "✗");
	console.log("   - Location updated to:", updateData.user?.location);

	// 5. Logout (Clear Cookie)
	const logoutRes = await fetch(`${BASE_URL}/auth/logout`, { method: "POST" });
	console.log("5. Logout Status:", logoutRes.status, (await logoutRes.json()).success ? "✓" : "✗");

	console.log("--- Module 1 Test Complete ---");
	await mongoose.disconnect();
	process.exit(signupData.success && loginData.success && profileData.success ? 0 : 1);
}

testAuthModule().catch(err => {
	console.error("Test Failed:", err);
	process.exit(1);
});
