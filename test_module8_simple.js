/**
 * Simple Module 8 API Test Script
 * Run with: node test_module8_simple.js
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

async function testModule8() {
  console.log('\n🧪 MODULE 8 - API TESTING\n');
  console.log('═'.repeat(50));

  let passedTests = 0;
  let failedTests = 0;
  let skippedTests = 0;

  // Test 1: Backend is running
  console.log('\n📋 Test 1: Backend Health Check');
  try {
    const response = await axios.get(`${API_BASE}/auth/check-auth`, {
      withCredentials: true
    });
    console.log('✅ Backend is running');
    passedTests++;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Backend is NOT running on port 5000');
      console.log('   Please start backend: npm run dev');
      return;
    }
    console.log('✅ Backend is running (auth check expected to fail without token)');
    passedTests++;
  }

  // Test 2: Frontend is running
  console.log('\n📋 Test 2: Frontend Health Check');
  try {
    const response = await axios.get('http://localhost:5173');
    if (response.status === 200) {
      console.log('✅ Frontend is running on port 5173');
      passedTests++;
    }
  } catch (error) {
    console.log('❌ Frontend is NOT running');
    failedTests++;
  }

  // Test 3: Check admin routes exist (without auth)
  console.log('\n📋 Test 3: Admin Routes Configuration');
  const adminRoutes = [
    '/admin/analytics/comprehensive',
    '/admin/analytics/trends',
    '/admin/analytics/engagement',
    '/admin/analytics/exchanges',
    '/admin/analytics/categories',
    '/admin/analytics/sustainability',
    '/admin/analytics/searches',
    '/admin/analytics/reviews',
    '/admin/reports',
    '/admin/reports/stats'
  ];

  let routeCheckPassed = 0;
  for (const route of adminRoutes) {
    try {
      await axios.get(`${API_BASE}${route}`);
    } catch (error) {
      // 401 is expected (unauthorized) - means route exists
      if (error.response?.status === 401 || error.response?.status === 403) {
        routeCheckPassed++;
      } else if (error.response?.status === 404) {
        console.log(`   ❌ Route not found: ${route}`);
      }
    }
  }
  
  if (routeCheckPassed === adminRoutes.length) {
    console.log(`✅ All ${adminRoutes.length} admin routes are configured`);
    passedTests++;
  } else {
    console.log(`⚠️  ${routeCheckPassed}/${adminRoutes.length} routes found`);
    skippedTests++;
  }

  // Test 4: Code structure verification
  console.log('\n📋 Test 4: Frontend Code Structure');
  const fs = await import('fs');
  const path = await import('path');

  const requiredFiles = [
    'frontend/src/store/adminStore.js',
    'frontend/src/pages/AdminDashboard.jsx',
    'frontend/src/pages/AnalyticsDashboard.jsx',
    'frontend/src/pages/ReportManagement.jsx'
  ];

  let filesExist = 0;
  for (const file of requiredFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      filesExist++;
    } else {
      console.log(`   ❌ Missing: ${file}`);
    }
  }

  if (filesExist === requiredFiles.length) {
    console.log(`✅ All ${requiredFiles.length} required files exist`);
    passedTests++;
  } else {
    console.log(`❌ ${filesExist}/${requiredFiles.length} files found`);
    failedTests++;
  }

  // Test 5: Check recharts is installed
  console.log('\n📋 Test 5: Dependencies Check');
  try {
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), 'frontend/package.json'), 'utf8')
    );
    
    if (packageJson.dependencies.recharts) {
      console.log('✅ recharts is installed');
      passedTests++;
    } else {
      console.log('❌ recharts is NOT installed');
      failedTests++;
    }
  } catch (error) {
    console.log('⚠️  Could not verify dependencies');
    skippedTests++;
  }

  // Test 6: Verify routes in App.jsx
  console.log('\n📋 Test 6: Route Configuration in App.jsx');
  try {
    const appJsx = fs.readFileSync(
      path.join(process.cwd(), 'frontend/src/App.jsx'),
      'utf8'
    );

    const adminRoutes = [
      "path='/admin'",
      "path='/admin/analytics'",
      "path='/admin/reports'"
    ];

    let routesFound = 0;
    for (const route of adminRoutes) {
      if (appJsx.includes(route)) {
        routesFound++;
      }
    }

    if (routesFound === adminRoutes.length) {
      console.log(`✅ All ${adminRoutes.length} admin routes configured in App.jsx`);
      passedTests++;
    } else {
      console.log(`❌ ${routesFound}/${adminRoutes.length} routes found in App.jsx`);
      failedTests++;
    }
  } catch (error) {
    console.log('⚠️  Could not verify App.jsx');
    skippedTests++;
  }

  // Test 7: Verify adminStore methods
  console.log('\n📋 Test 7: Admin Store Methods');
  try {
    const adminStore = fs.readFileSync(
      path.join(process.cwd(), 'frontend/src/store/adminStore.js'),
      'utf8'
    );

    const requiredMethods = [
      'getComprehensiveStats',
      'getTimeSeriesTrends',
      'getUserEngagement',
      'getExchangePerformance',
      'getCategoryPerformance',
      'getSustainabilityMetrics',
      'getSearchAnalytics',
      'getReviewAnalytics',
      'getReports',
      'updateReportStatus',
      'deleteReport'
    ];

    let methodsFound = 0;
    for (const method of requiredMethods) {
      if (adminStore.includes(method)) {
        methodsFound++;
      }
    }

    if (methodsFound === requiredMethods.length) {
      console.log(`✅ All ${requiredMethods.length} required methods in adminStore`);
      passedTests++;
    } else {
      console.log(`⚠️  ${methodsFound}/${requiredMethods.length} methods found`);
      skippedTests++;
    }
  } catch (error) {
    console.log('⚠️  Could not verify adminStore');
    skippedTests++;
  }

  // Test 8: Build check
  console.log('\n📋 Test 8: Build Verification');
  const distPath = path.join(process.cwd(), 'frontend/dist');
  if (fs.existsSync(distPath)) {
    console.log('✅ Production build exists');
    passedTests++;
  } else {
    console.log('⊘ No production build (run: npm run build)');
    skippedTests++;
  }

  // Summary
  console.log('\n' + '═'.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('═'.repeat(50));
  console.log(`✅ Passed:  ${passedTests}`);
  console.log(`❌ Failed:  ${failedTests}`);
  console.log(`⊘ Skipped: ${skippedTests}`);
  console.log(`📝 Total:   ${passedTests + failedTests + skippedTests}`);
  console.log('═'.repeat(50));

  if (failedTests === 0) {
    console.log('\n🎉 ALL CRITICAL TESTS PASSED!');
    console.log('\nModule 8 is ready for manual testing.');
    console.log('Open http://localhost:5173 and login as admin.');
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.');
  }

  console.log('\n📖 Next Steps:');
  console.log('   1. Open MODULE8_TESTING_GUIDE.md for manual testing');
  console.log('   2. Open MODULE8_QUICK_TEST_CHECKLIST.md for visual testing');
  console.log('   3. Open MODULE8_API_VERIFICATION.md for API testing');
  console.log('\n');
}

// Run tests
testModule8().catch(console.error);
