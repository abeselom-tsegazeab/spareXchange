const BASE_URL = 'http://localhost:5000/api/auth';
const uniqueEmail = `test_verification_${Date.now()}@example.com`;

async function testVerification() {
    console.log("1. Creating User (Signup)...");
    let verificationToken = null;

    try {
        const res = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Verification Tester",
                email: uniqueEmail,
                password: "Password123!"
            })
        });
        const data = await res.json();
        console.log("Signup Response:", data.message);
        
        if (data.success && data.user && data.user.verificationToken) {
            verificationToken = data.user.verificationToken;
            console.log("=> Extracted Verification Token:", verificationToken);
        } else {
            console.error("=> Failed to extract verification token. Full Response:", data);
            return;
        }
    } catch (e) {
        console.error("Signup failed:", e.message);
        return;
    }

    console.log("\n2. Testing Email Verification...");
    try {
        const res = await fetch(`${BASE_URL}/verify-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: verificationToken
            })
        });
        const data = await res.json();
        
        if (data.success) {
            console.log("Verify Response:", data.message);
            console.log("User Status Updated:", "isVerified =", data.user.isVerified);
        } else {
            console.error("Verify Failed:", data.message);
        }
    } catch (e) {
        console.error("Verify request failed:", e.message);
    }
}

testVerification();
