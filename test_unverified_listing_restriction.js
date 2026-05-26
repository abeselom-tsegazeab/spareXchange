/**
 * Test: Unverified users cannot create listings
 * This test verifies that users must have isVerified=true to create listings
 */

import axios from 'axios';

const BASE_URL = process.env.BACKEND_URL || 'http://localhost:5000';

// Test colors
const PASS = '\x1b[32m✓\x1b[0m';
const FAIL = '\x1b[31m✗\x1b[0m';
const INFO = '\x1b[36mℹ\x1b[0m';

let unverifiedToken = null;
let verifiedToken = null;
let unverifiedUserId = null;
let verifiedUserId = null;

async function runTests() {
    console.log('\n🧪 Testing: Unverified User Listing Creation Restriction\n');
    console.log('='.repeat(60));

    try {
        // Test 1: Create unverified user
        console.log(`\n${INFO} Test 1: Creating unverified user...`);
        const unverifiedUserResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
            email: `unverified_test_${Date.now()}@test.com`,
            password: 'TestPass123!',
            name: 'Unverified Test User'
        });

        // Login to get token
        const unverifiedLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: unverifiedUserResponse.data.user.email,
            password: 'TestPass123!'
        });

        unverifiedToken = unverifiedLoginResponse.data.token;
        unverifiedUserId = unverifiedLoginResponse.data.user._id;

        // Verify user is NOT verified
        if (unverifiedLoginResponse.data.user.isVerified === false) {
            console.log(`${PASS} Unverified user created successfully (isVerified: false)`);
        } else {
            console.log(`${FAIL} User should not be verified by default`);
            process.exit(1);
        }

        // Test 2: Create verified user (manually set isVerified=true in DB for testing)
        console.log(`\n${INFO} Test 2: Creating verified user...`);
        const verifiedUserResponse = await axios.post(`${BASE_URL}/api/auth/signup`, {
            email: `verified_test_${Date.now()}@test.com`,
            password: 'TestPass123!',
            name: 'Verified Test User'
        });

        // Manually verify the user in database
        await axios.post(`${BASE_URL}/api/auth/verify-email`, {
            token: verifiedUserResponse.data.user.verificationToken
        });

        const verifiedLoginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: verifiedUserResponse.data.user.email,
            password: 'TestPass123!'
        });

        verifiedToken = verifiedLoginResponse.data.token;
        verifiedUserId = verifiedLoginResponse.data.user._id;

        if (verifiedLoginResponse.data.user.isVerified === true) {
            console.log(`${PASS} Verified user created successfully (isVerified: true)`);
        } else {
            console.log(`${FAIL} User should be verified after email verification`);
            process.exit(1);
        }

        // Test 3: Unverified user tries to create listing (should FAIL)
        console.log(`\n${INFO} Test 3: Unverified user attempts to create listing...`);
        try {
            await axios.post(
                `${BASE_URL}/api/listings`,
                {
                    title: 'Test Part from Unverified User',
                    description: 'This should not be allowed',
                    price: 100,
                    category: 'vehicle',
                    condition: 'used-good',
                    location: 'Test Location',
                    images: []
                },
                {
                    headers: {
                        Authorization: `Bearer ${unverifiedToken}`
                    }
                }
            );
            console.log(`${FAIL} Unverified user was able to create listing (should have been blocked)`);
            process.exit(1);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log(`${PASS} Unverified user correctly blocked from creating listing`);
                console.log(`   Error message: ${error.response.data.message}`);
            } else {
                console.log(`${FAIL} Unexpected error: ${error.response?.status} - ${error.response?.data?.message}`);
                process.exit(1);
            }
        }

        // Test 4: Verified user creates listing (should SUCCEED)
        console.log(`\n${INFO} Test 4: Verified user creates listing...`);
        try {
            const response = await axios.post(
                `${BASE_URL}/api/listings`,
                {
                    title: 'Test Part from Verified User',
                    description: 'This should be allowed',
                    price: 150,
                    category: 'vehicle',
                    condition: 'new',
                    location: 'Test Location',
                    images: []
                },
                {
                    headers: {
                        Authorization: `Bearer ${verifiedToken}`
                    }
                }
            );

            if (response.status === 201 && response.data.success) {
                console.log(`${PASS} Verified user successfully created listing`);
                console.log(`   Listing ID: ${response.data.listing._id}`);
            } else {
                console.log(`${FAIL} Unexpected response from verified user listing creation`);
                process.exit(1);
            }
        } catch (error) {
            console.log(`${FAIL} Verified user should be able to create listing`);
            console.log(`   Error: ${error.response?.status} - ${error.response?.data?.message}`);
            process.exit(1);
        }

        // Test 5: Unverified user tries bulk create (should FAIL)
        console.log(`\n${INFO} Test 5: Unverified user attempts bulk listing creation...`);
        try {
            await axios.post(
                `${BASE_URL}/api/listings/bulk`,
                {
                    listings: [
                        {
                            title: 'Bulk Test 1',
                            description: 'Should not be allowed',
                            price: 50,
                            category: 'vehicle',
                            condition: 'used-good',
                            location: 'Test'
                        }
                    ]
                },
                {
                    headers: {
                        Authorization: `Bearer ${unverifiedToken}`
                    }
                }
            );
            console.log(`${FAIL} Unverified user was able to bulk create listings (should have been blocked)`);
            process.exit(1);
        } catch (error) {
            if (error.response && error.response.status === 403) {
                console.log(`${PASS} Unverified user correctly blocked from bulk creating listings`);
                console.log(`   Error message: ${error.response.data.message}`);
            } else {
                console.log(`${FAIL} Unexpected error: ${error.response?.status} - ${error.response?.data?.message}`);
                process.exit(1);
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log(`${PASS} ALL TESTS PASSED!`);
        console.log('\nSummary:');
        console.log('  ✓ Unverified users cannot create listings');
        console.log('  ✓ Unverified users cannot bulk create listings');
        console.log('  ✓ Verified users can create listings');
        console.log('  ✓ Proper error messages are returned');
        console.log('\n');

    } catch (error) {
        console.error(`\n${FAIL} Test suite failed:`, error.message);
        if (error.response) {
            console.error('Response:', error.response.data);
        }
        process.exit(1);
    }
}

// Run tests
runTests();
