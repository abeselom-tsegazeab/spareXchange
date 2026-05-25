import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test user data
const testUser = {
  name: 'Test User',
  email: 'testuser@example.com',
  password: 'TestPassword123!'
};

// Test listing data
const testListing = {
  title: 'Test Laptop Parts',
  description: 'Used laptop parts for sale',
  price: 50,
  category: 'Electronics',
  condition: 'Used',
  location: 'Test Location'
};

// Test technician request data
const testTechRequest = {
  serviceType: 'Electronics Repair',
  description: 'Need technician for laptop repair',
  location: 'Test Location',
  priority: 'medium',
  contactInfo: 'test@example.com'
};

// Test recycling submission data
const testRecycling = {
  itemType: 'electronics',
  itemDescription: 'Old laptop parts',
  estimatedWeight: 2,
  estimatedValue: 50,
  location: 'Test Location'
};

let authToken = null;
let userId = null;

async function testUserRegistration() {
  try {
    console.log('Testing user registration...');
    const response = await axios.post(`${BASE_URL}/auth/signup`, testUser);
    console.log('Registration response:', response.data);
    if (response.data.success) {
      console.log('✓ User registration successful');
      return response.data;
    } else {
      console.log('✗ User registration failed');
      return null;
    }
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    return null;
  }
}

async function testUserLogin() {
  try {
    console.log('Testing user login...');
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login response:', response.data);
    if (response.data.token) {
      authToken = response.data.token;
      userId = response.data.user._id;
      console.log('✓ User login successful');
      console.log('Token:', authToken.substring(0, 20) + '...');
      return response.data;
    } else {
      console.log('✗ User login failed');
      return null;
    }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateListing() {
  try {
    console.log('Testing listing creation...');
    const response = await axios.post(`${BASE_URL}/listings`, testListing, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Listing creation response:', response.data);
    if (response.data.success) {
      console.log('✓ Listing creation successful');
      return response.data;
    } else {
      console.log('✗ Listing creation failed');
      return null;
    }
  } catch (error) {
    console.error('Listing creation error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetListings() {
  try {
    console.log('Testing listing retrieval...');
    const response = await axios.get(`${BASE_URL}/listings`);
    console.log('Listings retrieval response:', response.data);
    if (response.data.listings) {
      console.log(`✓ Retrieved ${response.data.listings.length} listings`);
      return response.data;
    } else {
      console.log('✗ Listing retrieval failed');
      return null;
    }
  } catch (error) {
    console.error('Listing retrieval error:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateTechRequest() {
  try {
    console.log('Testing technician request creation...');
    const response = await axios.post(`${BASE_URL}/technician-requests`, testTechRequest, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Technician request response:', response.data);
    if (response.data.success) {
      console.log('✓ Technician request creation successful');
      return response.data;
    } else {
      console.log('✗ Technician request creation failed');
      return null;
    }
  } catch (error) {
    console.error('Technician request error:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateRecyclingSubmission() {
  try {
    console.log('Testing recycling submission...');
    const response = await axios.post(`${BASE_URL}/recycling-submissions`, testRecycling, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    console.log('Recycling submission response:', response.data);
    if (response.data.success) {
      console.log('✓ Recycling submission successful');
      return response.data;
    } else {
      console.log('✗ Recycling submission failed');
      return null;
    }
  } catch (error) {
    console.error('Recycling submission error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetNotifications() {
  try {
    console.log('Testing notification retrieval...');
    const response = await axios.get(`${BASE_URL}/notifications/get`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    console.log('Notifications response:', response.data);
    console.log(`✓ Retrieved ${response.data.notifications?.length || 0} notifications`);
    return response.data;
  } catch (error) {
    console.error('Notifications retrieval error:', error.response?.data || error.message);
    return null;
  }
}

async function runAllTests() {
  console.log('Starting SpareXChange API tests...\n');

  // Test user registration
  const registrationResult = await testUserRegistration();
  if (!registrationResult) {
    console.log('Stopping tests due to registration failure');
    return;
  }

  // Wait a bit for email verification process (simulated)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Test user login
  const loginResult = await testUserLogin();
  if (!loginResult) {
    console.log('Stopping tests due to login failure');
    return;
  }

  // Test listing functionality
  await testCreateListing();
  await testGetListings();

  // Test technician request
  await testCreateTechRequest();

  // Test recycling submission
  await testCreateRecyclingSubmission();

  // Test notifications
  await testGetNotifications();

  console.log('\nAll API tests completed!');
}

// Run the tests
runAllTests().catch(console.error);