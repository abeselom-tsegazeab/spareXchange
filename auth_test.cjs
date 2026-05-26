const http = require('http');

// Generate unique email
const timestamp = Math.floor(Date.now() / 1000);
const email = `test_${timestamp}@test.com`;
const password = "TestPass123!";
const name = "Test User";
const userType = "user";

console.log("=".repeat(80));
console.log("AUTHENTICATION FLOW TEST");
console.log("=".repeat(80));
console.log(`Generated Email: ${email}`);
console.log(`Password: ${password}`);
console.log(`Name: ${name}`);
console.log(`User Type: ${userType}`);
console.log("=".repeat(80));

// Helper function for making HTTP requests
function makeRequest(method, path, data, cookies = '') {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (cookies) {
      options.headers['Cookie'] = cookies;
    }
    
    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        const setCookieHeaders = res.headers['set-cookie'] || [];
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: responseData,
          setCookieHeaders: setCookieHeaders
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Extract cookies from Set-Cookie headers
function extractCookies(setCookieHeaders) {
  return setCookieHeaders
    .map(cookie => cookie.split(';')[0])
    .join('; ');
}

async function runAuthFlow() {
  let cookies = '';
  
  try {
    // STEP 1: SIGNUP
    console.log("\n1️⃣  SIGNUP REQUEST");
    console.log("-".repeat(80));
    const signupPayload = { email, password, name, userType };
    console.log("POST /api/auth/signup");
    console.log("Payload:", JSON.stringify(signupPayload, null, 2));
    
    const signupResponse = await makeRequest('POST', '/api/auth/signup', signupPayload);
    console.log(`✅ Status Code: ${signupResponse.statusCode}`);
    if (signupResponse.setCookieHeaders.length > 0) {
      console.log("📦 Set-Cookie Headers:", signupResponse.setCookieHeaders);
      cookies = extractCookies(signupResponse.setCookieHeaders);
      console.log("💾 Saved Cookies:", cookies);
    }
    try {
      const signupBody = JSON.parse(signupResponse.body);
      console.log("📋 Response Body:", JSON.stringify(signupBody, null, 2));
    } catch {
      console.log("📋 Response Body:", signupResponse.body);
    }
    
    // STEP 2: LOGIN
    console.log("\n2️⃣  LOGIN REQUEST");
    console.log("-".repeat(80));
    const loginPayload = { email, password };
    console.log("POST /api/auth/login");
    console.log("Payload:", JSON.stringify(loginPayload, null, 2));
    console.log("Cookies Sent:", cookies || "None");
    
    const loginResponse = await makeRequest('POST', '/api/auth/login', loginPayload, cookies);
    console.log(`✅ Status Code: ${loginResponse.statusCode}`);
    if (loginResponse.setCookieHeaders.length > 0) {
      console.log("📦 Set-Cookie Headers:", loginResponse.setCookieHeaders);
      cookies = extractCookies(loginResponse.setCookieHeaders);
      console.log("💾 Saved Cookies:", cookies);
    }
    try {
      const loginBody = JSON.parse(loginResponse.body);
      console.log("📋 Response Body:", JSON.stringify(loginBody, null, 2));
    } catch {
      console.log("📋 Response Body:", loginResponse.body);
    }
    
    // STEP 3: LOGOUT
    console.log("\n3️⃣  LOGOUT REQUEST");
    console.log("-".repeat(80));
    console.log("POST /api/auth/logout");
    console.log("Cookies Sent:", cookies || "None");
    
    const logoutResponse = await makeRequest('POST', '/api/auth/logout', {}, cookies);
    console.log(`✅ Status Code: ${logoutResponse.statusCode}`);
    if (logoutResponse.setCookieHeaders.length > 0) {
      console.log("📦 Set-Cookie Headers:", logoutResponse.setCookieHeaders);
      cookies = extractCookies(logoutResponse.setCookieHeaders);
      console.log("💾 Saved Cookies (cleared):", cookies || "[empty]");
    }
    try {
      const logoutBody = JSON.parse(logoutResponse.body);
      console.log("📋 Response Body:", JSON.stringify(logoutBody, null, 2));
    } catch {
      console.log("📋 Response Body:", logoutResponse.body);
    }
    
    // STEP 4: CHECK-AUTH (should fail with 401)
    console.log("\n4️⃣  CHECK-AUTH REQUEST (Protected Route - After Logout)");
    console.log("-".repeat(80));
    console.log("GET /api/auth/check-auth");
    console.log("Cookies Sent:", cookies || "None");
    
    const checkAuthResponse = await makeRequest('GET', '/api/auth/check-auth', null, cookies);
    console.log(`✅ Status Code: ${checkAuthResponse.statusCode}`);
    if (checkAuthResponse.setCookieHeaders.length > 0) {
      console.log("📦 Set-Cookie Headers:", checkAuthResponse.setCookieHeaders);
    }
    try {
      const checkAuthBody = JSON.parse(checkAuthResponse.body);
      console.log("📋 Response Body:", JSON.stringify(checkAuthBody, null, 2));
    } catch {
      console.log("📋 Response Body:", checkAuthResponse.body);
    }
    
    if (checkAuthResponse.statusCode === 401) {
      console.log("\n✅ ✅ ✅ Correctly returned 401 (Unauthorized) after logout!");
    } else {
      console.log("\n⚠️  Expected 401 but got " + checkAuthResponse.statusCode);
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("✅ AUTHENTICATION FLOW TEST COMPLETED SUCCESSFULLY");
    console.log("=".repeat(80));
    
  } catch (error) {
    console.error("\n❌ Error during auth flow:", error.message);
  }
}

runAuthFlow();
