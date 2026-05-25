import { io } from "socket.io-client";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcryptjs from "bcryptjs";
import { User } from "../models/user.model.js";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";
const SOCKET_URL = "http://localhost:5000";

async function runTest() {
	console.log("--- Starting Day 3 Backend Verification ---");

	// 1. Connect to DB to find an admin and a test user
	await mongoose.connect(process.env.MONGO_URI);
	console.log("DB Connected");

	const admin = await User.findOne({ userType: "admin" });
	if (!admin) {
		console.error("No admin user found for testing!");
		process.exit(1);
	}
	console.log("Admin found:", admin.email);

	// Ensure admin has the test password
	admin.password = await bcryptjs.hash("password123", 10);
	await admin.save();
	console.log("Admin password reset for testing.");

	// Create a fresh test user for verification
	const testEmail = `tech_test_${Date.now()}@example.com`;
	const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name: "Tech Tester", email: testEmail, password: "password123" }),
	});
	const signupData = await signupRes.json();
	const userToken = signupData.token;
	const userId = signupData.user._id;
	console.log("Test User created:", testEmail);

	// 2. Setup Socket Client for Test User
	const socket = io(SOCKET_URL, {
		transports: ["websocket"],
		autoConnect: true,
	});

	socket.on("connect", () => {
		console.log("Socket connected for user:", userId);
		socket.emit("join", userId);
	});

	const notificationPromise = new Promise((resolve) => {
		socket.on("role_verified", (data) => {
			console.log("Socket Notification Received! ✓", data);
			resolve(data);
		});
	});

	// 3. User submits verification request
	const formData = new FormData();
	formData.append("requestedType", "technician");
	const blob = new Blob(["test doc content"], { type: "image/png" });
	formData.append("documents", blob, "test_file.png");

	const verifRes = await fetch(`${BASE_URL}/users/verify-role`, {
		method: "POST",
		headers: { 
			"Authorization": `Bearer ${userToken}`
		},
		body: formData,
	});
	const verifData = await verifRes.json();
	console.log("Verification request submitted:", verifData.success ? "✓" : "✗");
	if (!verifData.success) console.log("Verif Error:", verifData.message);

	// 4. Admin lists pending verifications
	// We need admin token. Assuming login works (we'll skip full login and just use verifyToken bypass if possible, or just login)
	const loginRes = await fetch(`${BASE_URL}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email: admin.email, password: "password123" }), // Assuming password is 'password123'
	});
	const loginData = await loginRes.json();
	const adminToken = loginData.token;

	const pendingRes = await fetch(`${BASE_URL}/admin/verifications/pending`, {
		headers: { "Authorization": `Bearer ${adminToken}` }
	});
	const pendingData = await pendingRes.json();
	const isFound = pendingData.users.some(u => u._id.toString() === userId.toString());
	console.log("Pending verification found in Admin list:", isFound ? "✓" : "✗");

	// 5. Admin verifies the user
	const approveRes = await fetch(`${BASE_URL}/admin/users/${userId}/verify`, {
		method: "POST",
		headers: { 
			"Authorization": `Bearer ${adminToken}`,
			"Content-Type": "application/json"
		},
		body: JSON.stringify({ status: "verified" }),
	});
	console.log("Admin approved verification:", (await approveRes.json()).success ? "✓" : "✗");

	// 6. Wait for Socket Notification
	await Promise.race([
		notificationPromise,
		new Promise((_, reject) => setTimeout(() => reject(new Error("Socket timeout")), 5000))
	]);

	console.log("--- Day 3 Verification Complete ---");
	socket.disconnect();
	await mongoose.disconnect();
	process.exit(0);
}

runTest().catch(err => {
	console.error("Test Failed:", err);
	process.exit(1);
});
