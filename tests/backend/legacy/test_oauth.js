import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";

async function testOAuth2() {
	console.log("--- Testing Mock OAuth2 (Google Login) ---");
	
	const mockEmail = `google_${Date.now()}@gmail.com`;
	const mockCredential = JSON.stringify({
		email: mockEmail,
		name: "Google User",
		sub: "google12345"
	});

	// 1. First time login (Signup + Login)
	const firstLoginRes = await fetch(`${BASE_URL}/auth/oauth/google`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ credential: mockCredential }),
	});
	const firstLoginData = await firstLoginRes.json();
	console.log("1. First OAuth Login (Auto-signup) Status:", firstLoginRes.status, firstLoginData.success ? "✓" : "✗");
	console.log("   - User email matches:", firstLoginData.user.email === mockEmail ? "✓" : "✗");
	console.log("   - Access Token received:", firstLoginData.accessToken ? "✓" : "✗");

	// 2. Second time login (Just Login)
	const secondLoginRes = await fetch(`${BASE_URL}/auth/oauth/google`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ credential: mockCredential }),
	});
	const secondLoginData = await secondLoginRes.json();
	console.log("2. Subsequent OAuth Login Status:", secondLoginRes.status, secondLoginData.success ? "✓" : "✗");
	console.log("   - Logged in as same user:", secondLoginData.user.email === mockEmail ? "✓" : "✗");

	console.log("--- OAuth2 Test Complete ---");
	process.exit(0);
}

testOAuth2().catch(err => {
	console.error("Test Failed:", err);
	process.exit(1);
});
