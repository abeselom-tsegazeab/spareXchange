import dotenv from "dotenv";
import { generate } from "otplib";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";

async function testMFAModule() {
	console.log("--- Testing Multi-Factor Authentication (MFA) ---");
	
	const testUser = {
		name: "MFA Tester",
		email: `mfa_${Date.now()}@example.com`,
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
	const authToken = signupData.accessToken;

	// 2. Setup MFA
	const setupRes = await fetch(`${BASE_URL}/auth/mfa/setup`, {
		method: "POST",
		headers: { "Authorization": `Bearer ${authToken}` }
	});
	const setupData = await setupRes.json();
	console.log("2. MFA Setup Status:", setupRes.status, setupData.success ? "✓" : "✗");
	const secret = setupData.secret;

	// 3. Verify MFA (Enable it)
	const code = await generate({ secret });
	const verifyRes = await fetch(`${BASE_URL}/auth/mfa/verify`, {
		method: "POST",
		headers: { 
			"Authorization": `Bearer ${authToken}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ code }),
	});
	console.log("3. MFA Verify Status:", verifyRes.status, (await verifyRes.json()).success ? "✓" : "✗");

	// 4. Logout & Login again (MFA should be required)
	const loginRes = await fetch(`${BASE_URL}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: testUser.email, password: testUser.password }),
	});
	const loginData = await loginRes.json();
	console.log("4. Login Status (MFA Required):", loginRes.status, loginData.mfaRequired ? "✓" : "✗");

	// 5. Provide MFA code to finalize login
	const codeAfterLogin = await generate({ secret });
	const validateRes = await fetch(`${BASE_URL}/auth/mfa/validate`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: testUser.email, code: codeAfterLogin }),
	});
	const validateData = await validateRes.json();
	console.log("5. MFA Validate Status:", validateRes.status, validateData.success ? "✓" : "✗");
	console.log("   - Access Token received:", validateData.accessToken ? "✓" : "✗");

	console.log("--- MFA Test Complete ---");
	process.exit(0);
}

testMFAModule().catch(err => {
	console.error("Test Failed:", err);
	process.exit(1);
});
