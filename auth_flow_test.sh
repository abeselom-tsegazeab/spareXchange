#!/bin/bash

# Generate unique email with timestamp
TIMESTAMP=$(date +%s)
EMAIL="test_${TIMESTAMP}@test.com"
PASSWORD="TestPass123!"
NAME="Test User"
USER_TYPE="user"

echo "================================================================================"
echo "AUTHENTICATION FLOW TEST WITH CURL"
echo "================================================================================"
echo "Generated Email: $EMAIL"
echo "Password: $PASSWORD"
echo "Timestamp: $TIMESTAMP"
echo "================================================================================"
echo ""

# Clean up old cookies file
rm -f cookies.txt

# STEP 1: SIGNUP
echo "1️⃣  SIGNUP REQUEST"
echo "================================================================================";
echo "POST http://localhost:5000/api/auth/signup"
echo "Payload: {\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\",\"userType\":\"$USER_TYPE\"}"
echo "--------------------------------------------------------------------------------"
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\",\"userType\":\"$USER_TYPE\"}" \
  -c cookies.txt \
  -v 2>&1 | head -60
echo ""
echo ""

# STEP 2: LOGIN
echo "2️⃣  LOGIN REQUEST"
echo "================================================================================";
echo "POST http://localhost:5000/api/auth/login"
echo "Payload: {\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
echo "Cookies File: cookies.txt"
echo "--------------------------------------------------------------------------------"
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -b cookies.txt \
  -c cookies.txt \
  -v 2>&1 | head -60
echo ""
echo ""

# STEP 3: LOGOUT
echo "3️⃣  LOGOUT REQUEST"
echo "================================================================================";
echo "POST http://localhost:5000/api/auth/logout"
echo "Cookies File: cookies.txt"
echo "--------------------------------------------------------------------------------"
curl -X POST http://localhost:5000/api/auth/logout \
  -b cookies.txt \
  -c cookies.txt \
  -v 2>&1 | head -60
echo ""
echo ""

# STEP 4: CHECK-AUTH (should fail with 401)
echo "4️⃣  CHECK-AUTH REQUEST (Protected Route - After Logout)"
echo "================================================================================";
echo "GET http://localhost:5000/api/auth/check-auth"
echo "Cookies File: cookies.txt"
echo "--------------------------------------------------------------------------------"
curl -X GET http://localhost:5000/api/auth/check-auth \
  -b cookies.txt \
  -v 2>&1 | head -60
echo ""
echo ""

# STEP 5: LOGIN AGAIN
echo "5️⃣  LOGIN AGAIN"
echo "================================================================================";
echo "POST http://localhost:5000/api/auth/login"
echo "Payload: {\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
echo "Cookies File: cookies.txt"
echo "--------------------------------------------------------------------------------"
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}" \
  -b cookies.txt \
  -c cookies.txt \
  -v 2>&1 | head -60
echo ""
echo ""

echo "================================================================================"
echo "TEST COMPLETED"
echo "================================================================================"
echo ""
echo "Cookies file content at the end:"
echo "--------------------------------------------------------------------------------"
cat cookies.txt

