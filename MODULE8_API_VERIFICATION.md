# Module 8 - API Endpoints Verification

## 🔍 Backend API Testing with Postman/Thunder Client

### Base URL: `http://localhost:5000`

---

## 📊 Analytics Endpoints

### 1. Get Comprehensive Stats
```http
GET /api/admin/analytics/comprehensive
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "overview": {
      "totalUsers": 150,
      "activeUsers": 120,
      "bannedUsers": 5,
      "totalListings": 500,
      "activeListings": 350,
      "totalExchanges": 200,
      "completedExchanges": 180
    },
    "recentActivity": {
      "last30Days": {
        "newUsers": 25,
        "newListings": 80,
        "newExchanges": 40
      }
    },
    "breakdowns": {
      "usersByType": [...],
      "listingsByStatus": [...],
      "exchangesByStatus": [...]
    },
    "pendingItems": {
      "verifications": 3,
      "reports": 7,
      "disputes": 2
    }
  }
}
```

**Test Checklist:**
- [ ] Returns 200 status
- [ ] Success: true
- [ ] All overview fields present
- [ ] Numbers are realistic
- [ ] No null/undefined values

---

### 2. Get Time-Series Trends
```http
GET /api/admin/analytics/trends?period=daily&days=30
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `period`: daily | weekly | monthly
- `days`: 30 | 84 | 365

**Expected Response:**
```json
{
  "success": true,
  "period": "daily",
  "days": 30,
  "trends": {
    "users": [
      { "_id": "2026-05-01", "count": 5 },
      { "_id": "2026-05-02", "count": 3 }
    ],
    "listings": [...],
    "exchanges": [...]
  }
}
```

**Test Checklist:**
- [ ] Returns 200 status
- [ ] Trends arrays populated
- [ ] Dates are formatted correctly
- [ ] Counts are numbers

---

### 3. Get User Engagement
```http
GET /api/admin/analytics/engagement
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "engagement": {
    "activeListersLast7Days": 45,
    "activeExchangersLast30Days": 80,
    "avgListingsPerUser": 3.5,
    "retentionMetrics": {
      "retainedUsers": 35,
      "totalActiveUsers": 50,
      "retentionRate": "70.00%"
    }
  }
}
```

---

### 4. Get Exchange Performance
```http
GET /api/admin/analytics/exchanges
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "performance": {
    "totalExchanges": 200,
    "completedExchanges": 180,
    "cancelledExchanges": 15,
    "completionRate": "90.00%",
    "avgCompletionTimeHours": "24.50",
    "statusDistribution": [...],
    "typeDistribution": [...],
    "recentExchangesLast30Days": 40
  }
}
```

---

### 5. Get Category Performance
```http
GET /api/admin/analytics/categories
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "categoryPerformance": {
    "listingsByCategory": [
      { "_id": "Electronics", "count": 120 },
      { "_id": "Auto Parts", "count": 85 }
    ],
    "activeListingsByCategory": [...],
    "avgPriceByCategory": [...],
    "conditionDistribution": [...],
    "topSellers": [...]
  }
}
```

---

### 6. Get Sustainability Metrics
```http
GET /api/admin/analytics/sustainability
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "sustainability": {
    "recyclingStats": {
      "totalSubmissions": 100,
      "approvedSubmissions": 85,
      "pendingSubmissions": 15,
      "recyclingByMaterial": [...],
      "totalWeightRecycled": 500
    },
    "ecoPoints": {
      "totalEcoPoints": 5000,
      "avgEcoPoints": 50,
      "maxEcoPoints": 200,
      "topEarners": [...]
    }
  }
}
```

---

### 7. Get Search Analytics
```http
GET /api/admin/analytics/searches?days=30
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "searchAnalytics": {
    "totalSearches": 1500,
    "searchSuccessRate": "85.50%",
    "avgResultsPerSearch": 12.5,
    "popularQueries": [
      { "_id": "brake pads", "count": 50, "avgResults": 8 },
      { "_id": "oil filter", "count": 45, "avgResults": 12 }
    ],
    "unmetDemand": [
      { "_id": "transmission", "count": 30 },
      { "_id": "alternator", "count": 25 }
    ]
  }
}
```

---

### 8. Get Review Analytics
```http
GET /api/admin/analytics/reviews
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "reviewAnalytics": {
    "totalReviews": 300,
    "avgRating": 4.5,
    "ratingDistribution": [
      { "_id": 5, "count": 180 },
      { "_id": 4, "count": 80 },
      { "_id": 3, "count": 30 }
    ],
    "recentReviewsLast30Days": 45,
    "topRatedUsers": [...]
  }
}
```

---

## 🚨 Report Management Endpoints

### 9. Get All Reports (Paginated)
```http
GET /api/admin/reports?page=1&limit=20
Authorization: Bearer <admin_token>
```

**Optional Query Params:**
- `status`: pending | reviewed | resolved | dismissed
- `targetModel`: Listing | User | Exchange
- `reason`: inaccurate | fraud | repost | offensive | other

**Expected Response:**
```json
{
  "success": true,
  "count": 20,
  "totalReports": 85,
  "page": 1,
  "totalPages": 5,
  "reports": [
    {
      "_id": "...",
      "reporter": { "name": "...", "email": "..." },
      "targetModel": "Listing",
      "reason": "fraud",
      "status": "pending",
      "createdAt": "2026-05-14T10:30:00.000Z"
    }
  ]
}
```

---

### 10. Get Report Statistics
```http
GET /api/admin/reports/stats
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "stats": {
    "totalReports": 85,
    "recentReportsLast30Days": 25,
    "reportsByStatus": [
      { "_id": "pending", "count": 15 },
      { "_id": "resolved", "count": 50 },
      { "_id": "dismissed", "count": 20 }
    ],
    "reportsByTarget": [...],
    "reportsByReason": [...],
    "avgResolutionTimeHours": "12.50"
  }
}
```

---

### 11. Get Report by ID
```http
GET /api/admin/reports/:id
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "report": {
    "_id": "...",
    "reporter": { "name": "...", "email": "...", "userType": "..." },
    "targetId": "...",
    "targetModel": "Listing",
    "reason": "fraud",
    "details": "This listing is fake...",
    "status": "pending",
    "createdAt": "...",
    "updatedAt": "...",
    "targetDetails": {
      // Full listing/user/exchange object
    }
  }
}
```

---

### 12. Update Report Status
```http
PUT /api/admin/reports/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "resolved",
  "moderatorNote": "Investigated and confirmed violation",
  "action": "remove_listing"
}
```

**Available Actions:**
- `null` - Just update status
- `"remove_listing"` - Suspend the reported listing
- `"ban_user"` - Ban the reported user
- `"warn_user"` - Send warning to user

**Expected Response:**
```json
{
  "success": true,
  "message": "Report status updated to resolved",
  "report": {
    // Updated report object
  }
}
```

---

### 13. Delete Report
```http
DELETE /api/admin/reports/:id
Authorization: Bearer <admin_token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

---

## 🛠️ Admin Jobs Endpoints

### 14. Run Saved Search Alerts Job
```http
POST /api/admin/jobs/saved-search-alerts
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "limitSearches": 100,
  "limitListingsPerSearch": 5
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Saved-search alerts job executed.",
  "result": {
    "searchesProcessed": 50,
    "alertsSent": 120,
    "errors": 0
  }
}
```

---

## 🧪 Manual API Testing Steps

### Using Postman:

1. **Import Collection:**
   - File: `Module8_Operations_Intelligence_Postman_Collection.json`
   - Already exists in project root

2. **Set Environment Variables:**
   ```
   base_url: http://localhost:5000
   token: <your_admin_jwt_token>
   report_id: <test_report_id>
   ```

3. **Get Admin Token:**
   ```http
   POST http://localhost:5000/api/auth/login
   Content-Type: application/json
   
   {
     "email": "admin@example.com",
     "password": "your_password"
   }
   ```
   
   Copy the token from response and set in environment

4. **Run Tests in Order:**
   - [ ] Test 1: Get Comprehensive Stats
   - [ ] Test 2: Get Daily Trends
   - [ ] Test 3: Get Weekly Trends
   - [ ] Test 4: Get Monthly Trends
   - [ ] Test 5: Get User Engagement
   - [ ] Test 6: Get Exchange Performance
   - [ ] Test 7: Get Category Performance
   - [ ] Test 8: Get Sustainability Metrics
   - [ ] Test 9: Get Search Analytics
   - [ ] Test 10: Get Review Analytics
   - [ ] Test 11: Get All Reports
   - [ ] Test 12: Get Report Stats
   - [ ] Test 13: Get Report by ID
   - [ ] Test 14: Update Report Status
   - [ ] Test 15: Delete Report

---

## ✅ API Response Validation Checklist

### Common Checks for All Endpoints:

- [ ] Returns correct HTTP status (200, 400, 404, 500)
- [ ] Response has `success: true/false`
- [ ] Error messages are descriptive
- [ ] Data types are correct (numbers, strings, arrays)
- [ ] No null/undefined in required fields
- [ ] Dates are in ISO format
- [ ] Pagination info is accurate
- [ ] Authorization required (returns 401 without token)
- [ ] Admin role required (returns 403 for non-admin)

---

## 🐛 Common API Issues & Solutions

### Issue 1: 401 Unauthorized
**Cause:** Missing or expired token
**Solution:** Login again and update token

### Issue 2: 403 Forbidden
**Cause:** User is not admin
**Solution:** Update user type in database:
```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { userType: "admin" } }
)
```

### Issue 3: 500 Server Error
**Cause:** Database connection issue or bug
**Solution:** 
- Check backend terminal for error logs
- Verify MongoDB connection
- Check if required collections exist

### Issue 4: Empty Data
**Cause:** No data in database
**Solution:** Create test data using Postman or seed script

---

## 📊 Performance Benchmarks

### Expected Response Times:
- Stats endpoints: < 500ms
- Analytics endpoints: < 1000ms
- Reports list: < 800ms
- Report detail: < 400ms
- Update report: < 600ms

### If responses are slow:
1. Check MongoDB query performance
2. Add indexes to frequently queried fields
3. Implement caching for stats
4. Optimize aggregation pipelines

---

## 🔐 Security Checks

- [ ] All endpoints require authentication
- [ ] All endpoints require admin authorization
- [ ] No sensitive data exposed (passwords, etc.)
- [ ] Rate limiting enabled
- [ ] Input validation on report updates
- [ ] SQL injection protection (using Mongoose)
- [ ] XSS protection (helmet middleware)

---

## 📝 Test Data Creation

### Create Test Reports via MongoDB:

```javascript
// Create a test report targeting a listing
db.reports.insertOne({
  reporter: ObjectId("YOUR_USER_ID"),
  targetId: ObjectId("YOUR_LISTING_ID"),
  targetModel: "Listing",
  reason: "fraud",
  details: "This is a test report",
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date()
});

// Create a test report targeting a user
db.reports.insertOne({
  reporter: ObjectId("YOUR_USER_ID"),
  targetId: ObjectId("TARGET_USER_ID"),
  targetModel: "User",
  reason: "offensive",
  details: "Test user report",
  status: "pending",
  createdAt: new Date(),
  updatedAt: new Date()
});
```

---

## 🎯 API Testing Success Criteria

**All endpoints must:**
- ✅ Return correct status codes
- ✅ Provide meaningful error messages
- ✅ Handle missing parameters gracefully
- ✅ Enforce authentication and authorization
- ✅ Return data in expected format
- ✅ Complete within acceptable time limits

---

**Ready to test! 🚀**
