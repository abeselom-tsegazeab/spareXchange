import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";

async function testRefreshToken() {
	console.log("--- Testing Refresh Token Rotation ---");
	
	const testUser = {
		name: "Refresh Tester",
		email: `refresh_${Date.now()}@example.com`,
		password: "password123"
	};

	// 1. Signup & Get Initial Tokens
	const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(testUser),
	});
	const signupData = await signupRes.json();
	console.log("1. Signup Status:", signupRes.status, signupData.success ? "✓" : "✗");
	
	// Fetch cookies manually (since fetch doesn't store them automatically in node without a jar)
	const setCookie = signupRes.headers.get("set-cookie");
	console.log("Cookies received:", setCookie ? "✓" : "✗");

	// 2. Try to refresh
	// We need to pass the refreshToken cookie
	const rtCookie = setCookie.split(",").find(c => c.trim().startsWith("refreshToken="));
	
	const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
		headers: { "Cookie": rtCookie }
	});
	const refreshData = await refreshRes.json();
	console.log("2. Refresh Status:", refreshRes.status, refreshData.success ? "✓" : "✗");
	console.log("   - New Access Token received:", refreshData.accessToken ? "✓" : "✗");

	// 3. Verify Logout clears RT
	const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
		method: "POST",
		headers: { "Cookie": rtCookie }
	});
	console.log("3. Logout Status:", logoutRes.status, (await logoutRes.json()).success ? "✓" : "✗");

	// 4. Try to refresh again after logout (should fail)
	const refreshFailRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
		headers: { "Cookie": rtCookie }
	});
	console.log("4. Post-Logout Refresh (Check Failure):", refreshFailRes.status === 401 || refreshFailRes.status === 403 ? "✓" : "✗");

	console.log("--- Refresh Token Test Complete ---");
	process.exit(0);
}

testRefreshToken().catch(err => {
	console.error("Test Failed:", err);
	process.exit(1);
});
