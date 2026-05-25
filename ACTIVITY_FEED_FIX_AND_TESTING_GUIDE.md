# Activity Feed Page - Fix & Testing Guide

## 🔧 Issue Fixed

**Problem:** ActivityFeedPage was not loading user activities from the backend, even when users had listings.

**Root Cause:** The backend controller (`activityFeed.controller.js`) was querying the Listing model with the wrong field name:
- ❌ **Wrong:** `{ owner: userId }`
- ✅ **Correct:** `{ seller: userId }`

The Listing model uses `seller` as the field name, not `owner`.

## 📝 Changes Made

### Backend Changes

**File:** `backend/controllers/activityFeed.controller.js`

1. **Line 18** - Fixed user's activity feed query:
   ```javascript
   // BEFORE
   const listings = await Listing.find({ owner: userId })
   
   // AFTER
   const listings = await Listing.find({ seller: userId })
   ```

2. **Line 160** - Fixed public activity feed query:
   ```javascript
   // BEFORE
   const listings = await Listing.find({ 
     owner: targetUserId,
     status: { $in: ['active', 'exchanged'] }
   })
   
   // AFTER
   const listings = await Listing.find({ 
     seller: targetUserId,
     status: { $in: ['active', 'exchanged'] }
   })
   ```

3. **Line 231** - Fixed community highlights aggregation:
   ```javascript
   // BEFORE
   { $group: { _id: "$owner", count: { $sum: 1 } } }
   
   // AFTER
   { $group: { _id: "$seller", count: { $sum: 1 } } }
   ```

### Frontend Changes

**File:** `frontend/src/pages/ActivityFeedPage.jsx`

1. **Added error handling and debugging:**
   - Added `activityError` state display with retry button
   - Added console logging for debugging API calls
   - Fixed empty state heading text color for light mode
   - Added `showHighlights` to useEffect dependencies

2. **Enhanced error display:**
   ```jsx
   {activityError && (
     <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-6 mb-6 text-center">
       <p className="text-red-700 dark:text-red-400 font-semibold">{activityError}</p>
       <button onClick={loadData} className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition">
         Retry
       </button>
     </div>
   )}
   ```

**File:** `frontend/src/store/communityStore.js`

1. **Added comprehensive console logging:**
   - Logs API request parameters
   - Logs API response data
   - Logs errors with full error response details

---

## 🧪 Testing Guide

### Quick Smoke Test (5 minutes)

#### Test 1: Verify Backend Server is Running
```bash
# In backend directory
cd backend
node index.js
# Should see: "Server running on port 5000"
```

#### Test 2: Verify Frontend Server is Running
```bash
# In frontend directory
cd frontend
npm run dev
# Should see: "Local: http://localhost:5173/"
```

#### Test 3: Login and Navigate to Activity Feed
1. Open browser: `http://localhost:5173`
2. Login with a user account that has:
   - At least 1 listing created
   - OR completed exchanges
   - OR received reviews
   - OR recycling submissions
3. Navigate to Activity Feed page (usually in navigation menu)
4. **Expected Result:** Page loads without errors

#### Test 4: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for these log messages:
   ```
   Loading activity feed with filters: {page: 1, limit: 20, type: undefined}
   Fetching activity feed from API with params: {page: 1, limit: 20, type: undefined}
   Activity feed API response: {success: true, count: X, activities: [...]}
   Rendering activities: X items
   ```
4. **Expected Result:** No error messages, activities array should have items

#### Test 5: Verify Activities Display
1. Check if you see activity cards on the page
2. Each card should show:
   - Icon (package, handshake, star, or recycle)
   - Activity title (e.g., "New Listing Created")
   - Description (e.g., "You listed 'iPhone Battery'")
   - Timestamp (e.g., "2h ago")
3. **Expected Result:** Activities are displayed with proper formatting

---

### Comprehensive Testing (20 minutes)

#### Test Suite 1: Activity Types

**Test 1.1: Listing Activities**
1. Create a new listing:
   - Navigate to "Create Listing" page
   - Fill in required fields (title, description, price, category, condition, location)
   - Upload at least 1 image
   - Click "Create Listing"
2. Navigate to Activity Feed
3. **Expected:** See "New Listing Created" activity with:
   - Package icon (blue)
   - Your listing title in description
   - Recent timestamp
   - Listing image (if uploaded)

**Test 1.2: Exchange Activities**
1. Prerequisites: Need 2 user accounts
2. User A: Create a listing
3. User B: Propose exchange or buy the listing
4. Complete the exchange (both users confirm)
5. Check User A's Activity Feed
6. **Expected:** See "Exchange Completed" activity with:
   - Handshake icon (green)
   - Other user's name in description
   - "View Profile" button

**Test 1.3: Review Activities**
1. Prerequisites: Completed exchange
2. After exchange, other user leaves you a review
3. Check your Activity Feed
4. **Expected:** See "New Review Received" activity with:
   - Star icon (yellow)
   - Reviewer name and rating in description
   - Example: "John gave you 5 stars"

**Test 1.4: Recycling Activities**
1. Navigate to "Recycling Submission" page
2. Fill in recycling form:
   - Select item type
   - Add description
   - Enter weight or value
   - Add location
3. Submit recycling
4. Check Activity Feed
5. **Expected:** See "Recycling Submitted" activity with:
   - Recycle icon (purple)
   - Item type in description

#### Test Suite 2: Filtering

**Test 2.1: Filter by Listings**
1. Go to Activity Feed
2. Click "Listings" tab
3. **Expected:** Only listing activities shown

**Test 2.2: Filter by Exchanges**
1. Click "Exchanges" tab
2. **Expected:** Only exchange activities shown

**Test 2.3: Filter by Reviews**
1. Click "Reviews" tab
2. **Expected:** Only review activities shown

**Test 2.4: Filter by Recycling**
1. Click "Recycling" tab
2. **Expected:** Only recycling activities shown

**Test 2.5: All Activities**
1. Click "All Activity" tab
2. **Expected:** All activity types shown, sorted by timestamp (newest first)

#### Test Suite 3: Pagination

**Test 3.1: Multiple Pages**
1. Create 25+ activities (multiple listings, exchanges, etc.)
2. Go to Activity Feed
3. **Expected:** 
   - Shows first 20 activities
   - Pagination controls visible at bottom
   - "Page 1 of 2" displayed

**Test 3.2: Navigate to Next Page**
1. Click "Next" button
2. **Expected:**
   - Shows activities 21-40
   - Page indicator updates to "Page 2 of 2"
   - "Previous" button enabled
   - "Next" button disabled (if only 2 pages)

**Test 3.3: Navigate to Previous Page**
1. Click "Previous" button
2. **Expected:**
   - Shows activities 1-20 again
   - Page indicator updates to "Page 1 of 2"

#### Test Suite 4: Community Highlights

**Test 4.1: View Community Highlights**
1. Go to Activity Feed
2. Click "Community Highlights" button
3. **Expected:** Shows 4 sections:
   - Top Contributors This Week
   - Recent Successful Exchanges
   - Top Recyclers This Month
   - Most Trusted Community Members

**Test 4.2: Top Contributors**
1. Check "Top Contributors This Week" section
2. **Expected:**
   - Shows up to 5 users
   - Each shows: Rank (#1, #2, etc.), Name, Listing count, Eco tier badge
   - Clicking opens user profile

**Test 4.3: Recent Exchanges**
1. Check "Recent Successful Exchanges" section
2. **Expected:**
   - Shows up to 5 recent completed exchanges
   - Each shows: Requester ↔ Receiver, Item name, Timestamp

**Test 4.4: Top Recyclers**
1. Check "Top Recyclers This Month" section
2. **Expected:**
   - Shows up to 5 users
   - Each shows: Rank, Name, Items recycled, Total weight

**Test 4.5: Trusted Users**
1. Check "Most Trusted Community Members" section
2. **Expected:**
   - Shows up to 5 users
   - Each shows: Crown icon, Name, Trust score, Review count, Eco tier

#### Test Suite 5: Error Handling

**Test 5.1: Network Error**
1. Stop backend server
2. Refresh Activity Feed page
3. **Expected:**
   - Red error box displayed
   - Error message: "Failed to fetch activity feed"
   - "Retry" button visible
4. Click "Retry" button
5. **Expected:** Same error shown (backend still down)

**Test 5.2: Backend Restart Recovery**
1. Start backend server again
2. Click "Retry" button
3. **Expected:** Activities load successfully

**Test 5.3: No Activities**
1. Use a brand new user account with no activities
2. Navigate to Activity Feed
3. **Expected:**
   - Empty state displayed
   - Calendar icon (gray)
   - "No activities yet" heading
   - "Start engaging with the community..." description
   - "Browse Marketplace" button

#### Test Suite 6: Theme Support

**Test 6.1: Light Mode**
1. Ensure light theme is active
2. Navigate to Activity Feed
3. **Expected:**
   - White background
   - Dark text (gray-900)
   - Activity cards with proper contrast
   - All icons visible and colored correctly
   - Error messages in red with good contrast

**Test 6.2: Dark Mode**
1. Switch to dark theme
2. Navigate to Activity Feed
3. **Expected:**
   - Gradient background (gray-900 → green-900 → emerald-900)
   - Light text (white/gray-300)
   - Activity cards with dark backgrounds
   - All icons visible and colored correctly
   - Error messages visible with proper contrast

**Test 6.3: Theme Toggle**
1. Toggle between light and dark modes multiple times
2. **Expected:** All elements maintain proper contrast and readability

---

## 🐛 Debugging Guide

### Issue: No activities showing

**Step 1: Check Console Logs**
```javascript
// Look for these logs in browser console:
console.log('Loading activity feed with filters:', filters);
console.log('Activity feed API response:', response.data);
console.log('Rendering activities:', activities.length, 'items');
```

**Step 2: Check Network Tab**
1. Open DevTools → Network tab
2. Filter by "XHR"
3. Look for request to: `http://localhost:5000/api/users/feed`
4. Check response:
   ```json
   {
     "success": true,
     "count": 5,
     "totalActivities": 5,
     "page": 1,
     "totalPages": 1,
     "activities": [...]
   }
   ```

**Step 3: Check Backend Console**
Look for errors in backend terminal:
```
Error in getActivityFeed: ...
```

**Step 4: Verify Database**
```javascript
// In MongoDB or backend console:
// Check if user has listings
db.listings.find({ seller: ObjectId("USER_ID_HERE") })

// Check if user has exchanges
db.exchanges.find({ 
  $or: [
    { requester: ObjectId("USER_ID_HERE") },
    { receiver: ObjectId("USER_ID_HERE") }
  ]
})

// Check if user has reviews
db.reviews.find({ reviewedUser: ObjectId("USER_ID_HERE") })

// Check if user has recycling submissions
db.recyclingsubmissions.find({ userId: ObjectId("USER_ID_HERE") })
```

### Issue: Error message displayed

**Common Errors:**

1. **"Failed to fetch activity feed"**
   - Cause: Backend not running or network error
   - Fix: Start backend server, check network connection

2. **"Unauthorized" or "Not authenticated"**
   - Cause: User not logged in or token expired
   - Fix: Logout and login again

3. **"Server error"**
   - Cause: Backend crash or database error
   - Fix: Check backend console for specific error

---

## ✅ Success Criteria

The Activity Feed page is working correctly if:

- ✅ Users see their listing activities
- ✅ Users see their exchange activities
- ✅ Users see their review activities
- ✅ Users see their recycling activities
- ✅ Filtering by activity type works
- ✅ Pagination works correctly
- ✅ Community highlights display properly
- ✅ Error handling shows helpful messages
- ✅ Page works in both light and dark modes
- ✅ No console errors (except debug logs)
- ✅ Activities sorted by timestamp (newest first)
- ✅ All icons and colors display correctly

---

## 📊 API Reference

### Endpoint: Get User Activity Feed
```
GET /api/users/feed
Headers: Authorization: Bearer <token>
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - type: string (optional: 'listing', 'exchange', 'review', 'recycling')

Response:
{
  "success": true,
  "count": 5,
  "totalActivities": 25,
  "page": 1,
  "totalPages": 2,
  "activities": [
    {
      "type": "listing_created",
      "title": "New Listing Created",
      "description": "You listed 'iPhone Battery'",
      "timestamp": "2024-01-15T10:30:00.000Z",
      "data": {
        "listingId": "...",
        "title": "iPhone Battery",
        "category": "mobile",
        "condition": "used-good",
        "status": "active",
        "image": "https://..."
      }
    }
  ]
}
```

### Endpoint: Get Community Highlights
```
GET /api/users/feed/community
No authentication required

Response:
{
  "success": true,
  "highlights": {
    "topContributors": [...],
    "recentExchanges": [...],
    "topRecyclers": [...],
    "trustedUsers": [...]
  }
}
```

---

## 🎯 Performance Notes

- Activity feed aggregates from 4 different sources (listings, exchanges, reviews, recycling)
- All activities are sorted by timestamp in-memory
- Pagination is applied after sorting
- For large datasets (1000+ activities), consider adding database-level optimization
- Current implementation is efficient for typical usage (< 100 activities per user)

---

## 🔐 Security Notes

- Activity feed requires authentication (`verifyToken` middleware)
- Users can only see their own activities
- Community highlights are public (no authentication required)
- Public user activity endpoint exists but is separate (`/api/users/feed/:userId`)

---

**Last Updated:** 2026-05-19
**Status:** ✅ Fixed and Ready for Testing
