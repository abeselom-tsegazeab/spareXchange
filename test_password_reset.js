/**
 * Password Reset Debug Test
 * Run this to test the password reset flow
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/auth';

// Test credentials - UPDATE THESE WITH YOUR TEST USER
const TEST_EMAIL = 'test@example.com'; // Replace with your test email

async function testPasswordReset() {
  console.log('=== Password Reset Debug Test ===\n');

  try {
    // Step 1: Request password reset
    console.log('Step 1: Requesting password reset...');
    console.log(`Email: ${TEST_EMAIL}`);
    
    const forgotResponse = await axios.post(`${API_URL}/forgot-password`, {
      email: TEST_EMAIL
    });

    console.log('✅ Forgot password response:', forgotResponse.data);
    console.log('\n📧 Check your email for the reset link!\n');

    // Note: You need to manually get the token from the email or database
    console.log('⚠️  Next steps:');
    console.log('1. Check your email inbox for the reset link');
    console.log('2. Copy the token from the URL (after /reset-password/)');
    console.log('3. Run Step 2 with that token\n');

    // Step 2: Reset password (you'll need to run this manually with the token)
    console.log('=== Step 2: Reset Password (Run Manually) ===');
    console.log('Use this code after getting the token from email:\n');
    console.log(`
const RESET_TOKEN = 'YOUR_TOKEN_FROM_EMAIL'; // Replace with actual token
const NEW_PASSWORD = 'NewSecurePass123!'; // Your new password

const resetResponse = await axios.post(\`${API_URL}/reset-password/\${RESET_TOKEN}\`, {
  password: NEW_PASSWORD
});

console.log('✅ Password reset response:', resetResponse.data);
    `);

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run the test
testPasswordReset();
