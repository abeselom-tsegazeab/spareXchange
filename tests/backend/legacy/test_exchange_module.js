import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://localhost:5000/api";

async function testExchange() {
	console.log("--- Module 3: Exchange & Transaction Test ---");
	
	const userA = { name: "User A (Owner)", email: `a_${Date.now()}@example.com`, password: "password123" };
	const userB = { name: "User B (Proposer)", email: `b_${Date.now()}@example.com`, password: "password123" };

	// 1. Setup Users
	const signupA = await (await fetch(`${BASE_URL}/auth/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userA) })).json();
	const signupB = await (await fetch(`${BASE_URL}/auth/signup`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(userB) })).json();
	
	const tokenA = signupA.accessToken;
	const tokenB = signupB.accessToken;
	console.log("1. Users created: ✓");

	// 2. User A creates a listing
	const listingRes = await fetch(`${BASE_URL}/listings`, {
		method: "POST",
		headers: { "Authorization": `Bearer ${tokenA}`, "Content-Type": "application/json" },
		body: JSON.stringify({
			title: "Exchange Item", description: "Test item for exchange", price: 100,
			category: "vehicle", condition: "used-good", location: "Global"
		}),
	});
	const listingData = await listingRes.json();
	const listingId = listingData.listing?._id;
	console.log("2. Listing created by User A:", listingId ? "✓" : "✗");

	// 3. User B proposes an exchange
	const proposeRes = await fetch(`${BASE_URL}/exchanges`, {
		method: "POST",
		headers: { "Authorization": `Bearer ${tokenB}`, "Content-Type": "application/json" },
		body: JSON.stringify({
			listingId,
			proposedItems: "Old battery + $20",
			message: "Hey, I want to swap!"
		}),
	});
	const proposeData = await proposeRes.json();
	const exchangeId = proposeData.exchange?._id;
	console.log("3. Exchange proposed by User B:", proposeRes.status === 201 ? "✓" : `✗ (Status: ${proposeRes.status}, Error: ${proposeData.message})`);
	console.log("   - Exchange ID:", exchangeId);

	// 4. User A accepts the exchange
	if (exchangeId) {
		const acceptRes = await fetch(`${BASE_URL}/exchanges/${exchangeId}/status`, {
			method: "PUT",
			headers: { "Authorization": `Bearer ${tokenA}`, "Content-Type": "application/json" },
			body: JSON.stringify({ status: "accepted" }),
		});
		const acceptData = await acceptRes.json();
		console.log("4. User A accepted exchange:", acceptRes.status === 200 ? "✓" : `✗ (Status: ${acceptRes.status}, Error: ${acceptData.message})`);
	} else {
		console.log("4. User A accepted exchange: SKIP (No ID)");
	}

	// 5. User B completes the exchange (finalizes)
	if (exchangeId) {
		const completeRes = await fetch(`${BASE_URL}/exchanges/${exchangeId}/complete`, {
			method: "PUT",
			headers: { "Authorization": `Bearer ${tokenB}`, "Content-Type": "application/json" },
			body: JSON.stringify({ status: "fully_completed" }),
		});
		const completeData = await completeRes.json();
		console.log("5. User B finalized exchange:", completeRes.status === 200 ? "✓" : `✗ (Status: ${completeRes.status}, Error: ${completeData.message})`);
	} else {
		console.log("5. User B finalized exchange: SKIP (No ID)");
	}

	// 6. Check Eco-Points for both
	const checkA = await (await fetch(`${BASE_URL}/auth/check-auth`, { headers: { "Authorization": `Bearer ${tokenA}` } })).json();
	const checkB = await (await fetch(`${BASE_URL}/auth/check-auth`, { headers: { "Authorization": `Bearer ${tokenB}` } })).json();
	console.log("6. Final Eco-Points - User A:", checkA.user.ecoPoints, "User B:", checkB.user.ecoPoints);

	console.log("--- Module 3 Test Complete ---");
	process.exit(0);
}

testExchange().catch(err => {
	console.error("Test Failed:", err);
	process.exit(1);
});
