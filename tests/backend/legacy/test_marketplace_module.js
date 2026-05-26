import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";

async function testMarketplace() {
	console.log("--- Module 2: Marketplace & Inventory Test ---");
	
	const testUser = {
		name: "Seller User",
		email: `seller_${Date.now()}@example.com`,
		password: "password123"
	};

	// 1. Signup & Login
	const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(testUser),
	});
	const signupData = await signupRes.json();
	const token = signupData.accessToken;
	console.log("1. Auth Success:", token ? "✓" : "✗");

	// 2. Create a Listing
	const listingData = {
		title: "Civic Brake Pads",
		description: "Brand new high performance brake pads",
		price: 50,
		category: "vehicle",
		condition: "new",
		brand: "Brembo",
		model: "Honda Civic",
		year: 2020,
		location: "New York, NY",
		compatibleVehicles: [
			{ brand: "Honda", model: "Civic", yearStart: 2016, yearEnd: 2021 }
		]
	};

	const createRes = await fetch(`${BASE_URL}/listings`, {
		method: "POST",
		headers: { 
			"Authorization": `Bearer ${token}`,
			"Content-Type": "application/json" 
		},
		body: JSON.stringify(listingData),
	});
	const createData = await createRes.json();
	console.log("2. Create Listing Status:", createRes.status, createData.success ? "✓" : "✗");
	const listingId = createData.listing?._id;

	// 3. Search Listings (Basic)
	const searchRes = await fetch(`${BASE_URL}/listings?search=Brake`);
	const searchData = await searchRes.json();
	console.log("3. Search Listings Status:", searchRes.status, searchData.listings?.length > 0 ? "✓" : "✗");

	// 4. Filter by Fitment
	const fitmentRes = await fetch(`${BASE_URL}/listings?brand=Honda&model=Civic&year=2018`);
	const fitmentData = await fitmentRes.json();
	console.log("4. Fitment Filter Status:", fitmentRes.status, fitmentData.listings?.length > 0 ? "✓" : "✗");

	// 5. Get Single Listing
	if (listingId) {
		const singleRes = await fetch(`${BASE_URL}/listings/${listingId}`);
		const singleData = await singleRes.json();
		console.log("5. Get Single Listing Status:", singleRes.status, singleData.success ? "✓" : "✗");
	}

	// 6. Eco-Points Awarded?
	const profileRes = await fetch(`${BASE_URL}/auth/check-auth`, {
		headers: { "Authorization": `Bearer ${token}` }
	});
	const profileData = await profileRes.json();
	console.log("6. Eco-Points Balance:", profileData.user.ecoPoints, profileData.user.ecoPoints > 0 ? "✓" : "✗");

	console.log("--- Module 2 Test Complete ---");
	process.exit(0);
}

testMarketplace().catch(err => {
	console.error("Test Failed:", err);
	process.exit(1);
});
