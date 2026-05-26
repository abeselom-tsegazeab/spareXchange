import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";

async function testRBAC() {
	console.log("--- Testing Role-Based Access Control (RBAC) ---");
	
	// Ensure DB Connection for seeding test perms
	await mongoose.connect(process.env.MONGO_URI);
	
	const testUserEmail = `rbac_user_${Date.now()}@example.com`;
	const testAdminEmail = `rbac_admin_${Date.now()}@example.com`;

	// 1. Signup a standard user
	const userSignup = await fetch(`${BASE_URL}/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name: "RBAC User", email: testUserEmail, password: "password123" }),
	});
	const userData = await userSignup.json();
	const userToken = userData.accessToken;

	// 2. Try to access Admin Stats (Should Fail)
	const statsFailRes = await fetch(`${BASE_URL}/admin/stats`, {
		headers: { "Authorization": `Bearer ${userToken}` }
	});
	console.log("1. User access to Admin Stats (Check Failure):", statsFailRes.status === 403 ? "✓" : `✗ (Status: ${statsFailRes.status})`);

	// 3. Promote another user to Admin and Access Stats
	const adminSignup = await fetch(`${BASE_URL}/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name: "RBAC Admin", email: testAdminEmail, password: "password123" }),
	});
	const adminData = await adminSignup.json();
	const adminRecord = await User.findOne({ email: testAdminEmail });
	adminRecord.permissions = ["admin"]; // Give full admin perms
	await adminRecord.save();

	const adminToken = adminData.accessToken;
	const statsSuccessRes = await fetch(`${BASE_URL}/admin/stats`, {
		headers: { "Authorization": `Bearer ${adminToken}` }
	});
	console.log("2. Admin access to Admin Stats:", statsSuccessRes.status === 200 ? "✓" : `✗ (Status: ${statsSuccessRes.status})`);

	// 4. Test Granular Permission (view_stats but NOT view_users)
	adminRecord.permissions = ["view_stats"];
	await adminRecord.save();

	const statsGranularRes = await fetch(`${BASE_URL}/admin/stats`, {
		headers: { "Authorization": `Bearer ${adminToken}` }
	});
	console.log("3. Granular Permission (view_stats):", statsGranularRes.status === 200 ? "✓" : `✗ (Status: ${statsGranularRes.status})`);

	const usersFailRes = await fetch(`${BASE_URL}/admin/users`, {
		headers: { "Authorization": `Bearer ${adminToken}` }
	});
	console.log("4. Granular Permission Denied (view_users):", usersFailRes.status === 403 ? "✓" : `✗ (Status: ${usersFailRes.status})`);

	console.log("--- RBAC Test Complete ---");
	mongoose.disconnect();
	process.exit(0);
}

testRBAC().catch(err => {
	console.error("Test Failed:", err);
	mongoose.disconnect();
	process.exit(1);
});
