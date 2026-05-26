#!/bin/bash

echo "=== STEP 1: Kill existing node processes ==="
powershell -Command "Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue" 2>/dev/null || true
sleep 2
echo "Processes killed"

echo ""
echo "=== STEP 2: Clear old logs ==="
rm -f backend/logs/*.log
echo "Logs cleared"

echo ""
echo "=== STEP 3: Start backend server ==="
cd backend
npm run dev > ../backend_startup.log 2>&1 &
BACKEND_PID=$!
echo "Backend process started (PID: $BACKEND_PID)"

# Wait for server to be ready
echo "Waiting for server to start..."
for i in {1..30}; do
  if curl -s http://localhost:5000/api/health 2>/dev/null | grep -q "."; then
    echo "✓ Server is running on port 5000"
    break
  fi
  sleep 1
done

cd ..
sleep 2

echo ""
echo "=== STEP 4: Test authentication flow ==="

# Generate unique email with timestamp
TIMESTAMP=$(date +%s)
TEST_EMAIL="testuser_${TIMESTAMP}@test.com"
TEST_PASSWORD="TestPassword123!"

echo "Using email: $TEST_EMAIL"
echo ""

# Test 1: SIGNUP
echo "--- SIGNUP ---"
SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\",\"name\":\"Test User\"}")

SIGNUP_STATUS=$(echo "$SIGNUP_RESPONSE" | tail -1)
SIGNUP_BODY=$(echo "$SIGNUP_RESPONSE" | head -n -1)
echo "Status: $SIGNUP_STATUS"
echo "Response: $SIGNUP_BODY" | head -c 200
echo ""
echo ""

# Test 2: LOGIN
echo "--- LOGIN ---"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | tail -1)
LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)
echo "Status: $LOGIN_STATUS"
echo "Response: $LOGIN_BODY" | head -c 200
echo ""

# Extract token if available
TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token extracted: ${TOKEN:0:20}..."
echo ""

# Test 3: LOGOUT
echo "--- LOGOUT ---"
LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN")

LOGOUT_STATUS=$(echo "$LOGOUT_RESPONSE" | tail -1)
LOGOUT_BODY=$(echo "$LOGOUT_RESPONSE" | head -n -1)
echo "Status: $LOGOUT_STATUS"
echo "Response: $LOGOUT_BODY" | head -c 200
echo ""
echo ""

# Test 4: CHECK-AUTH (should get 401)
echo "--- CHECK-AUTH (without token - should be 401) ---"
CHECKAUTH_RESPONSE=$(curl -s -w "\n%{http_code}" -X GET http://localhost:5000/api/auth/check \
  -H "Content-Type: application/json")

CHECKAUTH_STATUS=$(echo "$CHECKAUTH_RESPONSE" | tail -1)
CHECKAUTH_BODY=$(echo "$CHECKAUTH_RESPONSE" | head -n -1)
echo "Status: $CHECKAUTH_STATUS"
echo "Response: $CHECKAUTH_BODY" | head -c 200
echo ""
echo ""

# Test 5: LOGIN AGAIN (should work)
echo "--- LOGIN AGAIN ---"
LOGIN2_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

LOGIN2_STATUS=$(echo "$LOGIN2_RESPONSE" | tail -1)
LOGIN2_BODY=$(echo "$LOGIN2_RESPONSE" | head -n -1)
echo "Status: $LOGIN2_STATUS"
echo "Response: $LOGIN2_BODY" | head -c 200
echo ""
echo ""

# Wait 5 seconds
echo "Waiting 5 seconds before checking logs..."
sleep 5

echo ""
echo "=== STEP 5: Log Analysis ==="
echo ""
echo "--- Last 30 lines from backend/logs/http.log (looking for 401/429 errors) ---"
if [[ -f backend/logs/http.log ]]; then
  echo "✓ http.log exists"
  tail -30 backend/logs/http.log | grep -E "401|429|GET|POST" || echo "No matches found or file empty"
else
  echo "✗ http.log not found"
fi

echo ""
echo "--- Last 20 lines from backend/logs/error.log ---"
if [[ -f backend/logs/error.log ]]; then
  echo "✓ error.log exists"
  tail -20 backend/logs/error.log || echo "File empty"
else
  echo "✗ error.log not found"
fi

echo ""
echo "=== FLOW COMPLETE ==="

