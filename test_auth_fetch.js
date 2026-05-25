const BASE_URL = 'http://localhost:5000/api/auth';
const uniqueEmail = `test_${Date.now()}@example.com`;

async function testAuth() {
    console.log("1. Testing Signup...");
    let cookies = [];
    try {
        const res = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Auth Tester",
                email: uniqueEmail,
                password: "Password123!"
            })
        });
        const data = await res.json();
        console.log("Signup Response:", data);
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
            cookies.push(setCookie);
            console.log("Signup set cookies!");
        }
    } catch (e) {
        console.error("Signup failed:", e.message);
        return;
    }

    console.log("\n2. Testing Login...");
    try {
        const res = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: uniqueEmail,
                password: "Password123!"
            })
        });
        const data = await res.json();
        console.log("Login Response:", data);
        const setCookie = res.headers.get('set-cookie');
        if (setCookie) {
            cookies = [setCookie]; // overwrite with new session
            console.log("Login set cookies!");
        }
    } catch (e) {
        console.error("Login failed:", e.message);
        return;
    }

    console.log("\n3. Testing Check Auth...");
    try {
        const headers = {};
        if (cookies.length > 0) {
            // extract just the key=value part of the cookie
            const rawCookie = cookies[0].split(';')[0];
            headers['Cookie'] = rawCookie;
        }
        
        const res = await fetch(`${BASE_URL}/check-auth`, { headers });
        const data = await res.json();
        console.log("Check Auth Response:", data);
    } catch (e) {
        console.error("Check Auth failed:", e.message);
    }

    console.log("\n4. Testing Logout...");
    try {
        const res = await fetch(`${BASE_URL}/logout`, { method: 'POST' });
        const data = await res.json();
        console.log("Logout Response:", data);
    } catch (e) {
        console.error("Logout failed:", e.message);
    }
}

testAuth();
