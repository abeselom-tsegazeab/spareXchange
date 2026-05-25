import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/user.model.js";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";

async function testMarketplaceFinal() {
	console.log("--- Module 2: Comprehensive Marketplace Test ---");
	
	// Ensure DB Connection for seeding test perms
	await mongoose.connect(process.env.MONGO_URI);
	
	const testEmail = `market_pro_${Date.now()}@example.com`;

	// 1. Signup & Authorize
	const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name: "Market Pro", email: testEmail, password: "password123" }),
	});
	const signupData = await signupRes.json();
	const token = signupData.accessToken;
	
	const user = await User.findOne({ email: testEmail });
	user.permissions.push("create_bulk_listings");
	await user.save();
	console.log("1. User created & authorized for bulk: ✓");

	// 2. Create Listing with Base64 Image
	const base64Image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
	const createRes = await fetch(`${BASE_URL}/listings`, {
		method: "POST",
		headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
		body: JSON.stringify({
			title: "Image Test Item", description: "Testing image upload", price: 10,
			category: "electronics", condition: "new", location: "Test Lab",
			images: [base64Image]
		}),
	});
	const createData = await createRes.json();
	console.log("2. Image Upload Status:", createRes.status, createData.success ? "✓" : "✗");
	console.log("   - Image URL:", createData.listing?.images[0]);
	const mainListingId = createData.listing?._id;

	// 3. Bulk Upload
	const bulkRes = await fetch(`${BASE_URL}/listings/bulk`, {
		method: "POST",
		headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
		body: JSON.stringify({
			listings: [
				{ title: "Bulk 1", description: "Desc 1", price: 5, category: "other", condition: "used-good", location: "Warehouse" },
				{ title: "Bulk 2", description: "Desc 2", price: 15, category: "other", condition: "used-fair", location: "Warehouse" }
			]
		}),
	});
	const bulkData = await bulkRes.json();
	console.log("3. Bulk Upload Status:", bulkRes.status, bulkData.success ? "✓" : "✗");
	console.log("   - Count:", bulkData.count);

	// 5. Fuzzy Search Test
	const fuzzyRes = await fetch(`${BASE_URL}/listings?search=Test Item`);
	const fuzzyData = await fuzzyRes.json();
	const found = fuzzyData.listings?.some(l => l._id === mainListingId);
	console.log("5. Fuzzy Search Status:", fuzzyRes.status, found ? "✓" : "✗");

	// 6. Report Listing
	const reportRes = await fetch(`${BASE_URL}/listings/${mainListingId}/report`, {
		method: "POST",
		headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
		body: JSON.stringify({ reason: "inaccurate", details: "Price is too low for this item" }),
	});
	const reportData = await reportRes.json();
	console.log("6. Report Listing Status:", reportRes.status, reportData.success ? "✓" : "✗");

	console.log("--- Marketplace Final Test Complete ---");
	mongoose.disconnect();
	process.exit(0);
}

testMarketplaceFinal().catch(err => {
	console.error("Test Failed:", err);
	mongoose.disconnect();
	process.exit(1);
});
