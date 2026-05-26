import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/auth';
const uniqueEmail = `test_${Date.now()}@example.com`;

async function testAuth() {
    console.log("1. Testing Signup...");
    let response;
    let cookies = [];
    try {
        response = await axios.post(`${BASE_URL}/signup`, {
            name: "Auth Tester",
            email: uniqueEmail,
            password: "Password123!"
        });
        console.log("Signup Response:", response.data);
        if (response.headers['set-cookie']) {
            cookies = response.headers['set-cookie'];
            console.log("Signup set cookies!");
        }
    } catch (e) {
        console.error("Signup failed:", e.response?.data || e.message);
        return;
    }

    console.log("\n2. Testing Login...");
    try {
        response = await axios.post(`${BASE_URL}/login`, {
            email: uniqueEmail,
            password: "Password123!"
        });
        console.log("Login Response:", response.data);
         if (response.headers['set-cookie']) {
            cookies = response.headers['set-cookie'];
            console.log("Login set cookies!");
        }
    } catch (e) {
        console.error("Login failed:", e.response?.data || e.message);
        return;
    }

    console.log("\n3. Testing Check Auth...");
    try {
        const config = {};
        if (cookies.length > 0) {
            config.headers = { Cookie: cookies.join('; ') };
        }
        
        response = await axios.get(`${BASE_URL}/check-auth`, config);
        console.log("Check Auth Response:", response.data);
    } catch (e) {
        console.error("Check Auth failed:", e.response?.data || e.message);
    }

    console.log("\n4. Testing Logout...");
    try {
        response = await axios.post(`${BASE_URL}/logout`);
        console.log("Logout Response:", response.data);
    } catch (e) {
        console.error("Logout failed:", e.response?.data || e.message);
    }
}

testAuth();
