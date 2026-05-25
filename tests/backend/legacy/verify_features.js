import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { SearchLog } from "../models/searchLog.model.js";
import path from "path";
import fs from "fs";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";

const testUser = {
	name: "Verifier User",
	email: `verifier_${Date.now()}@example.com`,
	password: "Password123!",
};

const runVerification = async () => {
	try {
		console.log("--- Starting Feature Verification ---");

		// 1. Signup
		const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(testUser),
		});
		const signupData = await signupRes.json();
		console.log("Signup:", signupData.success ? "✓" : "✗");

		// 2. Direct DB Verification (Technician role for posting)
		await mongoose.connect(process.env.MONGO_URI);
		await User.findOneAndUpdate(
			{ email: testUser.email },
			{ isVerified: true, roleStatus: "verified", userType: "technician" }
		);
		console.log("DB Verification: ✓");

		// 3. Login
		const loginRes = await fetch(`${BASE_URL}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email: testUser.email, password: testUser.password }),
		});
		const loginData = await loginRes.json();
		const token = loginData.token;
		console.log("Login:", token ? "✓" : "✗");

		// 4. Create Listing with Compatibility
		const listingData = {
			title: "Brake Pads - Corolla",
			description: "High quality brake pads",
			price: 45,
			category: "vehicle",
			condition: "new",
			location: "San Francisco",
			compatibleVehicles: [
				{ brand: "Toyota", model: "Corolla", yearStart: 2010, yearEnd: 2020 }
			]
		};
		const listingRes = await fetch(`${BASE_URL}/listings`, {
			method: "POST",
			headers: { 
				"Content-Type": "application/json",
				"Authorization": `Bearer ${token}`
			},
			body: JSON.stringify(listingData),
		});
		const listingResult = await listingRes.json();
		console.log("Create Listing with Compatibility:", listingResult.success ? "✓" : "✗");
		const listingId = listingResult.listing._id;

		// 5. Search by Compatibility
		const searchRes = await fetch(`${BASE_URL}/listings?brand=Toyota&model=Corolla&year=2015`);
		const searchData = await searchRes.json();
		const found = searchData.listings.some(l => l._id === listingId);
		console.log("Search by Compatibility (2015):", found ? "✓" : "✗");

		// 6. Test Document Upload
		// Note: Using a dummy file path for simulation if possible, or just checking the endpoint logic
		// Since fetch in Node needs FormData for multi-part
		const formData = new FormData();
		formData.append("requestedType", "recycler");
		// Create a small buffer as a "file"
		const blob = new Blob(["test image content"], { type: "image/png" });
		formData.append("documents", blob, "test_id.png");

		const uploadRes = await fetch(`${BASE_URL}/users/verify-role`, {
			method: "POST",
			headers: { 
				"Authorization": `Bearer ${token}`
			},
			body: formData,
		});
		if (!uploadRes.ok) {
			const errorText = await uploadRes.text();
			console.log("Upload Failed Status:", uploadRes.status);
			console.log("Upload Error Body:", errorText.substring(0, 200));
		}
		const uploadData = await uploadRes.json();
		console.log("Role Verification Upload:", uploadData.success ? "✓" : "✗");

		// 7. Test Recommendations
		// Log a search first
		const log = new SearchLog({
			userId: loginData.user._id,
			query: "Brakes",
			filters: { category: "Brakes" }
		});
		await log.save();

		const recRes = await fetch(`${BASE_URL}/listings/recommendations`, {
			headers: { "Authorization": `Bearer ${token}` }
		});
		// Note: recommendations might return 404 if route is wrong or empty array
		const recData = await recRes.json();
		console.log("Recommendations:", recData.success ? "✓" : "✗");

		console.log("--- Verification Complete ---");
		process.exit(0);
	} catch (error) {
		console.error("Verification failed:", error);
		process.exit(1);
	}
};

runVerification();
