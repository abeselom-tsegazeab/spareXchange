# Module 6: Saved Search & Alerts - Manual Testing Instructions

## 🎯 Testing Overview

This guide provides comprehensive manual testing instructions for Module 6 (Saved Search & Alerts) to verify all features work correctly in a real-world scenario.

---

## 📋 Prerequisites

### 1. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 2. Verify Services Running
- Backend: http://localhost:5000
- Frontend: http://localhost:5173 (or your configured port)
- MongoDB: Running on default port 27017

### 3. Test Accounts Needed
Create at least 2 user accounts:
- **Buyer Account** - For creating saved searches
- **Seller Account** - For creating listings

---

## 🧪 Test Suite 1: Basic CRUD Operations

### Test 1.1: Create Saved Search
**Steps:**
1. Login with Buyer account
2. Navigate to http://localhost:5173/saved-searches
3. Click "Create New Search" button
4. Fill in the form:
   - Name: "Toyota Brake Pads"
   - Query: "brake pads toyota"
   - Category: Vehicle
   - Condition: New
   - Min Price: 50
   - Max Price: 500
5. Click "Save Search"

**Expected Results:**
✅ Success toast appears: "Saved search created successfully!"
✅ New search appears in the list
✅ All fields displayed correctly
✅ Modal closes automatically

**Verification:**
- Check database: `db.savedsearches.find()` should show the new document
- Verify UI shows the search card with all details

---

### Test 1.2: View Saved Searches List
**Steps:**
1. Stay on /saved-searches page
2. Observe the list of saved searches

**Expected Results:**
✅ All saved searches displayed in cards
✅ Each card shows:
   - Search name
   - Query text
   - Filter tags (category, condition, price range)
   - Geo information (if set)
   - Creation/update dates
✅ Notification bell icon shows status

---

### Test 1.3: Edit Saved Search
**Steps:**
1. Click "Edit" button on any saved search
2. Modify the name to "Updated Toyota Brake Pads"
3. Change max price to 600
4. Click "Update Search"

**Expected Results:**
✅ Success toast: "Saved search updated successfully!"
✅ Card reflects updated name and price
✅ Modal closes

**Verification:**
- Database document updated
- UI shows new values immediately

---

### Test 1.4: Toggle Notifications
**Steps:**
1. Find a saved search in the list
2. Click the bell icon (should be green if notifications enabled)
3. Observe the icon changes to gray
4. Click again to re-enable

**Expected Results:**
✅ First click: Bell turns gray, toast "Notifications disabled"
✅ Second click: Bell turns green, toast "Notifications enabled"
✅ State persists after page refresh

---

### Test 1.5: Delete Saved Search
**Steps:**
1. Click "Delete" button on a saved search
2. Confirm the deletion in the prompt
3. Observe the list

**Expected Results:**
✅ Confirmation dialog appears
✅ After confirming, search removed from list
✅ Toast: "Saved search deleted"
✅ Database document deleted

---

## 🧪 Test Suite 2: Marketplace Integration

### Test 2.1: Save Search from Marketplace
**Steps:**
1. Navigate to /marketplace
2. Enter search term: "brake pads"
3. Select category: "Vehicle Parts"
4. Click "Search" button
5. Observe the "Save This Search" banner appears
6. Click "Save This Search" button

**Expected Results:**
✅ Banner appears only when search/category filters are active
✅ Modal opens with pre-filled data:
   - Query: "brake pads"
   - Category: "vehicle" (or selected category)
✅ Can add more filters before saving
✅ Success toast after saving

---

### Test 2.2: Verify Context Preservation
**Steps:**
1. On marketplace, search for "engine oil" without selecting category
2. Click "Save This Search"
3. Check modal pre-fills

**Expected Results:**
✅ Query field contains "engine oil"
✅ Category dropdown shows "All Categories" (not pre-selected)
✅ User can manually add category if desired

---

## 🧪 Test Suite 3: Geolocation Features

### Test 3.1: Use Current Location
**Steps:**
1. Create a new saved search
2. In the Location section, click "Use My Current Location"
3. Allow browser location access when prompted
4. Observe latitude/longitude fields populate

**Expected Results:**
✅ Browser asks for location permission
✅ Fields populate with actual coordinates
✅ Toast: "Location detected successfully!"
✅ Radius defaults to 50km

**Expected Values (Addis Ababa):**
- Latitude: ~8.9806
- Longitude: ~38.7578

---

### Test 3.2: Manual Location Entry
**Steps:**
1. Create/edit saved search
2. Manually enter:
   - Latitude: 40.7128 (New York)
   - Longitude: -74.0060
   - Radius: 100 km
3. Save the search

**Expected Results:**
✅ Coordinates accepted
✅ Shows "Location: 40.7128, -74.0060 (100km radius)"
✅ Negative coordinates handled correctly

---

### Test 3.3: Location Validation
**Steps:**
1. Try entering invalid coordinates:
   - Latitude: 95 (invalid, max is 90)
   - Longitude: 200 (invalid, max is 180)
2. Attempt to save

**Expected Results:**
✅ Error toast: "Invalid latitude. Must be between -90 and 90"
✅ Form doesn't submit
✅ User can correct the values

---

## 🧪 Test Suite 4: Form Validation

### Test 4.1: Minimum Requirements
**Steps:**
1. Create saved search with:
   - Name: "Test"
   - Query: (leave empty)
   - All filters empty
2. Click "Save Search"

**Expected Results:**
✅ Error toast: "Please enter search keywords or select at least one filter"
✅ Form doesn't submit
✅ User must provide at least query OR one filter

---

### Test 4.2: Price Range Validation
**Steps:**
1. Create saved search
2. Enter:
   - Min Price: 500
   - Max Price: 100
3. Try to save

**Expected Results:**
✅ Error toast: "Minimum price cannot be greater than maximum price"
✅ Form validation prevents submission

---

### Test 4.3: Year Validation
**Steps:**
1. Create saved search
2. Enter Year: 3000
3. Try to save

**Expected Results:**
✅ Error toast: "Invalid year. Must be between 1900 and [current year + 2]"
✅ Prevents unrealistic year values

---

## 🧪 Test Suite 5: Notification Matching

### Test 5.1: Create Matching Scenario
**Setup:**
1. Login as Buyer, create saved search:
   - Query: "toyota engine"
   - Category: Vehicle
   - Notifications: Enabled

2. Logout and login as Seller

**Steps:**
1. As Seller, create listing:
   - Title: "Toyota Engine Part"
   - Description: "Genuine toyota engine component for sale"
   - Category: Vehicle
   - Price: 200
   - Condition: Used
2. Submit the listing

**Expected Results:**
✅ Listing created successfully
✅ Backend matching service runs automatically
✅ Notification created for Buyer

---

### Test 5.2: Verify Notification Delivery
**Steps:**
1. Login as Buyer
2. Check notification center (bell icon in navbar)
3. Look for match notification

**Expected Results:**
✅ Notification appears: "A new listing matches your saved search: Toyota Brake Pads"
✅ Notification has link to the listing
✅ Clicking notification opens the listing detail page

**Database Verification:**
```javascript
db.notifications.find({ userId: buyerUserId, type: "match" })
```
Should show notification with:
- `type: "match"`
- `data.source: "saved_search"`
- `data.savedSearchId: [saved search ID]`
- `data.score: >= 25`
- `data.reasons: ["keywords", "category_filter"]`

---

### Test 5.3: Test Deduplication
**Steps:**
1. Keep the same saved search active
2. Run the admin job multiple times (see Test 6.1)
3. Check notifications

**Expected Results:**
✅ Only ONE notification per matching listing
✅ No duplicates created even after multiple job runs
✅ `lastNotifiedAt` field updated in saved search

---

## 🧪 Test Suite 6: Admin Features

### Test 6.1: Trigger Alert Job via Postman
**Setup:**
1. Get admin access token (login as admin or promote user)
2. Open Postman

**Request:**
```
POST http://localhost:5000/api/admin/jobs/saved-search-alerts
Headers:
  Authorization: Bearer [ADMIN_TOKEN]
  Content-Type: application/json

Body:
{
  "limitSearches": 20,
  "limitListingsPerSearch": 5
}
```

**Expected Results:**
✅ Response 200 OK
```json
{
  "success": true,
  "message": "Saved-search alerts job executed.",
  "result": {
    "searchesProcessed": 5,
    "notificationsCreated": 3
  }
}
```
✅ Numbers reflect actual processing

---

### Test 6.2: Non-Admin Access Denied
**Request:**
```
POST http://localhost:5000/api/admin/jobs/saved-search-alerts
Headers:
  Authorization: Bearer [REGULAR_USER_TOKEN]
```

**Expected Results:**
✅ Response 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden"
}
```

---

## 🧪 Test Suite 7: Dashboard Integration

### Test 7.1: Saved Searches Widget
**Steps:**
1. Login and navigate to /dashboard
2. Look for "Saved Searches" section

**Expected Results:**
✅ Stat card shows correct count
✅ Widget displays up to 3 recent saved searches
✅ Each shows:
   - Search name
   - Query preview
   - Filter tags (category, radius)
   - Bell icon if notifications enabled
✅ "Manage" link navigates to /saved-searches
✅ If > 3 searches, shows "View X more" link

---

### Test 7.2: Quick Actions
**Steps:**
1. On dashboard, check Quick Actions grid
2. Find "Saved Searches" action

**Expected Results:**
✅ "Saved Searches" appears in quick actions
✅ Teal/purple background color
✅ Click navigates to /saved-searches
✅ Search icon displayed

---

## 🧪 Test Suite 8: Navigation

### Test 8.1: Desktop Navigation
**Steps:**
1. On any page, check navbar
2. Click "Listings" dropdown

**Expected Results:**
✅ "Saved Searches" option appears in dropdown
✅ Search icon next to text
✅ Clicking navigates to /saved-searches

---

### Test 8.2: User Menu
**Steps:**
1. Click user avatar/name in navbar
2. Check dropdown menu

**Expected Results:**
✅ "Saved Searches" link present
✅ Appears between "Create Listing" and "Logout"
✅ Clicking navigates correctly

---

### Test 8.3: Mobile Navigation
**Steps:**
1. Resize browser to mobile width (< 820px)
2. Open mobile menu
3. Check "Listings" dropdown

**Expected Results:**
✅ "Saved Searches" appears in mobile listings menu
✅ Properly styled for mobile
✅ Tap navigates correctly

---

## 🧪 Test Suite 9: Edge Cases & Error Handling

### Test 9.1: Empty State
**Steps:**
1. Create new account or delete all saved searches
2. Navigate to /saved-searches

**Expected Results:**
✅ Beautiful empty state displayed
✅ Shows search icon
✅ Message: "No Saved Searches Yet"
✅ Helpful description
✅ "Create Your First Saved Search" button works

---

### Test 9.2: Loading States
**Steps:**
1. Slow down network in browser DevTools (to "Slow 3G")
2. Navigate to /saved-searches
3. Create new search

**Expected Results:**
✅ Loading spinner appears during fetch
✅ Button shows loading state during submission
✅ UI doesn't freeze
✅ Proper error handling if request fails

---

### Test 9.3: Concurrent Operations
**Steps:**
1. Open two browser tabs
2. Login with same account in both
3. In Tab 1: Create a saved search
4. In Tab 2: Refresh the page immediately

**Expected Results:**
✅ Tab 2 shows the new search after refresh
✅ No conflicts or errors
✅ State stays synchronized

---

### Test 9.4: Special Characters
**Steps:**
1. Create saved search with:
   - Name: "Search & Find <test>"
   - Query: "Toyota & Honda parts"
   - Brand: "BMW (Germany)"
2. Save

**Expected Results:**
✅ Special characters (&, <, >, ()) handled correctly
✅ Displayed properly in UI
✅ No XSS or injection issues

---

### Test 9.5: Unicode/International Characters
**Steps:**
1. Create saved search with:
   - Name: "テスト検索" (Japanese)
   - Query: "自動車部品" (Japanese)
2. Save

**Expected Results:**
✅ Unicode characters accepted
✅ Displayed correctly
✅ No encoding issues

---

## 🧪 Test Suite 10: Performance

### Test 10.1: Large Dataset
**Steps:**
1. Use Postman or script to create 50+ saved searches
2. Navigate to /saved-searches

**Expected Results:**
✅ Page loads within 2 seconds
✅ Scrolling is smooth
✅ No UI lag
✅ All searches displayed correctly

---

### Test 10.2: Search Responsiveness
**Steps:**
1. Create saved search
2. Edit it multiple times rapidly
3. Observe UI response

**Expected Results:**
✅ Updates reflect immediately
✅ No race conditions
✅ State remains consistent

---

## 📊 Test Results Checklist

Use this checklist to track your testing progress:

### CRUD Operations
- [ ] Create saved search (all fields)
- [ ] Create saved search (minimal fields)
- [ ] View list of saved searches
- [ ] Edit saved search
- [ ] Toggle notifications
- [ ] Delete saved search

### Marketplace Integration
- [ ] Save search from marketplace
- [ ] Context preservation
- [ ] Modal pre-filling

### Geolocation
- [ ] Use current location
- [ ] Manual location entry
- [ ] Location validation

### Form Validation
- [ ] Minimum requirements
- [ ] Price range validation
- [ ] Year validation

### Notification Matching
- [ ] Create matching scenario
- [ ] Verify notification delivery
- [ ] Test deduplication

### Admin Features
- [ ] Trigger alert job
- [ ] Non-admin access denied

### Dashboard Integration
- [ ] Saved searches widget
- [ ] Quick actions

### Navigation
- [ ] Desktop navigation
- [ ] User menu
- [ ] Mobile navigation

### Edge Cases
- [ ] Empty state
- [ ] Loading states
- [ ] Concurrent operations
- [ ] Special characters
- [ ] Unicode characters

### Performance
- [ ] Large dataset handling
- [ ] Search responsiveness

---

## 🔍 Debugging Tips

### If notifications aren't being created:
1. Check backend logs for matching service output
2. Verify saved search has `notify: true`
3. Ensure listing matches search criteria (keywords, category)
4. Check score is >= 25
5. Run admin job manually via Postman

### If modal doesn't open:
1. Check browser console for JavaScript errors
2. Verify React component is imported correctly
3. Check state management (showModal state)

### If geolocation fails:
1. Ensure browser has location permissions
2. Check if HTTPS is enabled (required for geolocation)
3. Try manual coordinate entry as fallback

### If tests fail:
1. Check MongoDB connection
2. Verify backend is running
3. Check authentication tokens
4. Review backend logs for errors

---

## 📝 Database Queries for Verification

### Check saved searches:
```javascript
db.savedsearches.find().pretty()
```

### Check notifications:
```javascript
db.notifications.find({ type: "match" }).pretty()
```

### Check a specific user's searches:
```javascript
db.savedsearches.find({ userId: ObjectId("USER_ID_HERE") }).pretty()
```

### Count notifications per user:
```javascript
db.notifications.aggregate([
  { $match: { type: "match" } },
  { $group: { _id: "$userId", count: { $sum: 1 } } }
])
```

---

## ✅ Success Criteria

Module 6 is considered fully functional when:
- ✅ All CRUD operations work correctly
- ✅ Marketplace integration preserves search context
- ✅ Geolocation features work (both auto and manual)
- ✅ Form validation prevents invalid data
- ✅ Notification matching creates alerts for relevant listings
- ✅ Deduplication prevents duplicate notifications
- ✅ Admin job processes searches correctly
- ✅ Dashboard shows saved searches widget
- ✅ Navigation links work on all screen sizes
- ✅ Edge cases handled gracefully
- ✅ Performance is acceptable with large datasets
- ✅ No console errors or warnings

---

## 🎉 Testing Complete!

Once all tests pass, Module 6 is ready for production deployment!

**Next Steps:**
1. Run automated test suites: `npm test -- module6_*.test.js`
2. Perform user acceptance testing (UAT)
3. Deploy to staging environment
4. Monitor production logs for any issues
