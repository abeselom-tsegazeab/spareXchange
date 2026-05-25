# Module 8: Operations & Intelligence - Manual Testing Guide

## 🚀 Pre-Requisites

### 1. Start Backend Server
```bash
cd backend
npm run dev
```
✅ Server should start on `http://localhost:5000`

### 2. Start Frontend Server
```bash
cd frontend
npm run dev
```
✅ Frontend should start on `http://localhost:5173`

### 3. Database Connection
- Ensure MongoDB is connected (check backend terminal for success message)
- You need at least one **admin user** in the database

---

## 📋 Test Scenarios

### **SCENARIO 1: Admin Authentication & Access Control**

#### Test 1.1: Admin Login
**Steps:**
1. Open browser to `http://localhost:5173`
2. Click "Login" in navbar
3. Enter admin credentials:
   - Email: (your admin email)
   - Password: (your admin password)
4. Click "Login"

**Expected Results:**
- ✅ Login successful
- ✅ Redirected to marketplace or dashboard
- ✅ User menu shows "Admin Panel" link

**Pass Criteria:** Admin can login and see Admin Panel link

---

#### Test 1.2: Non-Admin Access Restriction
**Steps:**
1. Login as regular user (non-admin)
2. Try to access `http://localhost:5173/admin` directly in browser

**Expected Results:**
- ✅ Redirected to `/dashboard`
- ✅ Cannot access admin pages
- ✅ "Admin Panel" link NOT visible in navbar

**Pass Criteria:** Non-admin users cannot access admin routes

---

#### Test 1.3: Admin Panel Navigation
**Steps:**
1. Login as admin
2. Click on user profile icon (top right)
3. Click "Admin Panel" from dropdown

**Expected Results:**
- ✅ Navigate to `/admin`
- ✅ Admin Dashboard loads successfully
- ✅ All metrics cards display

**Pass Criteria:** Admin can navigate to dashboard via navbar

---

### **SCENARIO 2: Admin Dashboard (`/admin`)**

#### Test 2.1: Dashboard Metrics Display
**Steps:**
1. Navigate to `/admin`
2. Observe the metrics cards at the top

**Expected Results:**
- ✅ "Total Users" card displays count + monthly growth
- ✅ "Active Listings" card displays count + monthly growth
- ✅ "Completed Exchanges" card displays count + monthly growth
- ✅ "Active Users" card displays count + banned count
- ✅ All numbers are realistic (not NaN or undefined)

**Pass Criteria:** All 4 metric cards display correct data

---

#### Test 2.2: Pending Items Alert Section
**Steps:**
1. Check if there are any pending items (reports, verifications, disputes)
2. If pending items exist, verify the alert section shows

**Expected Results:**
- ✅ Alert section appears only if pending items > 0
- ✅ Shows count for each pending item type
- ✅ "Pending Reports" is clickable link to `/admin/reports?status=pending`
- ✅ "Pending Verifications" is clickable link to `/admin/users`

**Pass Criteria:** Alert section displays correctly with working links

---

#### Test 2.3: Quick Actions Section
**Steps:**
1. Scroll to "Quick Actions" section
2. Verify 4 action cards are present:
   - Analytics Dashboard
   - Report Management
   - User Management
   - Run Alerts Job

**Expected Results:**
- ✅ All 4 cards display with icons and descriptions
- ✅ "Analytics Dashboard" link navigates to `/admin/analytics`
- ✅ "Report Management" link navigates to `/admin/reports`
- ✅ "User Management" link navigates to `/admin/users`
- ✅ Hover effects work on all cards

**Pass Criteria:** All quick action cards work correctly

---

#### Test 2.4: Platform Breakdown & Sustainability
**Steps:**
1. Scroll to bottom of dashboard
2. Check "Platform Breakdown" card
3. Check "Sustainability Impact" card

**Expected Results:**
- ✅ Platform Breakdown shows: Total Listings, Total Exchanges, Banned Users
- ✅ Sustainability Impact shows: Active Users, Completion Rate
- ✅ Completion Rate calculates correctly: (completed/total * 100)%
- ✅ "View Full Analytics →" link navigates to `/admin/analytics`

**Pass Criteria:** Bottom section displays accurate data

---

### **SCENARIO 3: Analytics Dashboard (`/admin/analytics`)**

#### Test 3.1: Analytics Page Load
**Steps:**
1. Navigate to `/admin/analytics`
2. Wait for all data to load

**Expected Results:**
- ✅ Page header displays "Analytics Dashboard"
- ✅ Trend controls appear (Daily/Weekly/Monthly buttons)
- ✅ Loading spinner shows during data fetch
- ✅ All charts render after loading completes

**Pass Criteria:** Analytics page loads without errors

---

#### Test 3.2: Trend Period Controls
**Steps:**
1. Click "Daily" button (default)
2. Wait for chart to update
3. Click "Weekly" button
4. Wait for chart to update
5. Click "Monthly" button
6. Wait for chart to update

**Expected Results:**
- ✅ Active button is highlighted in green
- ✅ Line chart updates with new data for each period
- ✅ Chart shows Users, Listings, and Exchanges lines
- ✅ X-axis labels change based on period (dates/weeks/months)
- ✅ Legend shows all three metrics

**Pass Criteria:** Trend controls work and update charts correctly

---

#### Test 3.3: Platform Trends Line Chart
**Steps:**
1. Observe the "Platform Trends" chart
2. Hover over different data points
3. Check tooltip information

**Expected Results:**
- ✅ Chart displays three lines (green=Users, blue=Listings, purple=Exchanges)
- ✅ Tooltip shows date and values for all three metrics on hover
- ✅ Lines are smooth and continuous
- ✅ Grid lines are visible
- ✅ Chart is responsive (resizes with window)

**Pass Criteria:** Line chart displays and interacts correctly

---

#### Test 3.4: Top Categories Bar Chart
**Steps:**
1. Scroll to "Top Categories" chart
2. Observe the bar chart

**Expected Results:**
- ✅ Bar chart shows up to 10 categories
- ✅ Bars are green colored
- ✅ Category names on X-axis (may be rotated if long)
- ✅ Counts on Y-axis
- ✅ Tooltip shows category name and count on hover

**Pass Criteria:** Bar chart displays category data correctly

---

#### Test 3.5: Rating Distribution Pie Chart
**Steps:**
1. Scroll to "Rating Distribution" chart
2. Observe the pie chart

**Expected Results:**
- ✅ Pie chart shows rating distribution (1-5 stars)
- ✅ Each slice has different color
- ✅ Labels show "X Stars: Y%"
- ✅ Tooltip shows rating and count on hover
- ✅ Legend may be present

**Pass Criteria:** Pie chart displays rating data correctly

---

#### Test 3.6: Exchange Status Distribution Pie Chart
**Steps:**
1. Scroll to "Exchange Status Distribution" chart
2. Observe the pie chart

**Expected Results:**
- ✅ Pie chart shows exchange statuses (pending, completed, cancelled, etc.)
- ✅ Each status has different color slice
- ✅ Labels show status name and percentage
- ✅ Tooltip shows details on hover

**Pass Criteria:** Pie chart displays exchange status data correctly

---

#### Test 3.7: Key Performance Metrics
**Steps:**
1. Scroll to "Key Performance Metrics" section
2. Check all 4 metrics

**Expected Results:**
- ✅ "User Retention Rate" displays percentage (e.g., "75.50%")
- ✅ "Exchange Completion Rate" displays percentage
- ✅ "Search Success Rate" displays percentage
- ✅ "Average Rating" displays decimal (e.g., "4.52")
- ✅ Each metric has corresponding icon

**Pass Criteria:** All KPI metrics display correctly

---

#### Test 3.8: Sustainability Impact Section
**Steps:**
1. Scroll to "Sustainability Impact" card
2. Check all metrics

**Expected Results:**
- ✅ "Total Recycling Submissions" shows count
- ✅ "Approved Submissions" shows count (green)
- ✅ "Total Eco-Points Awarded" shows count (emerald)
- ✅ "Total Weight Recycled (kg)" shows weight (blue)

**Pass Criteria:** Sustainability metrics display correctly

---

#### Test 3.9: Search Insights Section
**Steps:**
1. Scroll to "Search Insights" card
2. Check metrics and unmet demands

**Expected Results:**
- ✅ "Total Searches" shows count
- ✅ "Avg Results per Search" shows decimal
- ✅ "Top Unmet Demands" section shows (if data exists)
- ✅ Unmet demands show search query and count
- ✅ Queries are capitalized

**Pass Criteria:** Search insights display correctly

---

### **SCENARIO 4: Report Management (`/admin/reports`)**

#### Test 4.1: Reports Page Load
**Steps:**
1. Navigate to `/admin/reports`
2. Wait for data to load

**Expected Results:**
- ✅ Page header displays "Report Management"
- ✅ Stats overview shows 4 cards (Pending, Reviewed, Resolved, Avg Resolution)
- ✅ Filter controls appear
- ✅ Reports table loads
- ✅ Pagination appears if > 20 reports

**Pass Criteria:** Reports page loads without errors

---

#### Test 4.2: Report Statistics Cards
**Steps:**
1. Observe the stats cards at top

**Expected Results:**
- ✅ "Pending" card shows yellow count
- ✅ "Reviewed" card shows blue count
- ✅ "Resolved" card shows green count
- ✅ "Avg Resolution" shows time in hours (purple)
- ✅ Numbers match actual report counts

**Pass Criteria:** Stats cards display accurate data

---

#### Test 4.3: Filter by Status
**Steps:**
1. Click status filter dropdown
2. Select "Pending"
3. Wait for table to update
4. Select "Resolved"
5. Wait for table to update
6. Select "All Status"
7. Wait for table to update

**Expected Results:**
- ✅ Table filters to show only selected status
- ✅ Status badges show correct color:
  - Pending = Yellow
  - Reviewed = Blue
  - Resolved = Green
  - Dismissed = Gray
- ✅ "All Status" shows all reports
- ✅ Pagination updates based on filtered results

**Pass Criteria:** Status filter works correctly

---

#### Test 4.4: Filter by Target Type
**Steps:**
1. Click target type filter dropdown
2. Select "Listing"
3. Wait for table to update
4. Select "User"
5. Wait for table to update
6. Select "All Types"

**Expected Results:**
- ✅ Table filters to show only selected type
- ✅ "Type" column shows correct target model
- ✅ "All Types" shows all reports

**Pass Criteria:** Target type filter works correctly

---

#### Test 4.5: Reports Table Display
**Steps:**
1. Observe the reports table
2. Check all columns

**Expected Results:**
- ✅ Columns: Date, Type, Reason, Status, Reporter, Actions
- ✅ Date shows formatted date (MM/DD/YYYY)
- ✅ Type shows "Listing", "User", or "Exchange"
- ✅ Reason shows readable label (e.g., "Fraud/Scam")
- ✅ Status shows colored badge
- ✅ Reporter shows name
- ✅ Actions column has buttons

**Pass Criteria:** Table displays all information correctly

---

#### Test 4.6: View Report Details
**Steps:**
1. Find any report in the table
2. Click the blue "Eye" icon (View Details)

**Expected Results:**
- ✅ Navigate to report detail view
- ✅ Shows complete report information:
  - Status badge
  - Date and time
  - Target type
  - Reason
  - Reporter name and email
  - Details (if provided)
  - Target information (JSON format)
- ✅ "Back to Reports" button works

**Pass Criteria:** Report detail view displays correctly

---

#### Test 4.7: Resolve Report
**Steps:**
1. Find a "pending" report
2. Click green "CheckCircle" icon (Resolve)
3. Modal appears
4. Enter moderator note: "Test resolution"
5. Click "Confirm"

**Expected Results:**
- ✅ Modal appears with action name "resolve"
- ✅ Textarea for moderator note is required
- ✅ Success toast notification appears
- ✅ Report status changes to "resolved"
- ✅ Report removed from pending list
- ✅ Stats cards update

**Pass Criteria:** Report can be resolved successfully

---

#### Test 4.8: Dismiss Report
**Steps:**
1. Find a "pending" report
2. Click gray "XCircle" icon (Dismiss)
3. Modal appears
4. Enter moderator note: "Test dismissal"
5. Click "Confirm"

**Expected Results:**
- ✅ Modal appears with action name "dismiss"
- ✅ Success toast notification appears
- ✅ Report status changes to "dismissed"
- ✅ Stats cards update

**Pass Criteria:** Report can be dismissed successfully

---

#### Test 4.9: Remove Listing (from Report Detail)
**Steps:**
1. View details of a pending report targeting a Listing
2. Click "Remove" button (orange)
3. Modal appears
4. Enter moderator note: "Listing violates guidelines"
5. Click "Confirm"

**Expected Results:**
- ✅ Modal appears with action name "remove_listing"
- ✅ Success toast appears
- ✅ Report status changes to "resolved"
- ✅ Listing is suspended (isActive=false, status="suspended")
- ✅ Listing owner receives notification (if socket connected)

**Pass Criteria:** Listing can be removed via report

---

#### Test 4.10: Ban User (from Report Detail)
**Steps:**
1. View details of a pending report targeting a User
2. Click "Ban User" button (red)
3. Modal appears
4. Enter moderator note: "Multiple violations"
5. Click "Confirm"

**Expected Results:**
- ✅ Modal appears with action name "ban_user"
- ✅ Success toast appears
- ✅ Report status changes to "resolved"
- ✅ User is banned (isBanned=true)
- ✅ User receives notification (if socket connected)

**Pass Criteria:** User can be banned via report

---

#### Test 4.11: Warn User (from Report Detail)
**Steps:**
1. View details of a pending report targeting a User
2. Click "Warn" button (yellow)
3. Modal appears
4. Enter moderator note: "First warning"
5. Click "Confirm"

**Expected Results:**
- ✅ Modal appears with action name "warn"
- ✅ Success toast appears
- ✅ Report status changes to "reviewed"
- ✅ User receives warning notification

**Pass Criteria:** User can be warned via report

---

#### Test 4.12: Delete Report
**Steps:**
1. View details of any report
2. Scroll to bottom
3. Click "Delete Report" button (red)
4. Confirm deletion in dialog

**Expected Results:**
- ✅ Confirmation dialog appears
- ✅ On confirm, report is deleted
- ✅ Success toast appears
- ✅ Redirected back to reports list
- ✅ Report no longer appears in table

**Pass Criteria:** Report can be deleted

---

#### Test 4.13: Pagination
**Steps:**
1. Ensure there are more than 20 reports
2. Navigate to page 2 using arrow buttons
3. Navigate back to page 1

**Expected Results:**
- ✅ Pagination controls show current page and total pages
- ✅ "Previous" button disabled on page 1
- ✅ "Next" button disabled on last page
- ✅ Table updates with correct reports for each page
- ✅ Page count displays correctly

**Pass Criteria:** Pagination works correctly

---

### **SCENARIO 5: Responsive Design**

#### Test 5.1: Mobile View (< 768px)
**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar
3. Select mobile device (e.g., iPhone 12)
4. Visit `/admin`, `/admin/analytics`, `/admin/reports`

**Expected Results:**
- ✅ All pages are readable on mobile
- ✅ Charts resize properly
- ✅ Tables have horizontal scroll if needed
- ✅ Buttons are touch-friendly size
- ✅ Navbar collapses to hamburger menu
- ✅ "Admin Panel" link accessible in mobile menu

**Pass Criteria:** All admin pages work on mobile

---

#### Test 5.2: Tablet View (768px - 1024px)
**Steps:**
1. Resize browser to tablet size
2. Test all three admin pages

**Expected Results:**
- ✅ Grid layouts adjust (2 columns instead of 4)
- ✅ Charts remain readable
- ✅ Navigation works properly

**Pass Criteria:** Tablet view is functional

---

### **SCENARIO 6: Error Handling**

#### Test 6.1: Backend Server Down
**Steps:**
1. Stop backend server
2. Try to access `/admin`

**Expected Results:**
- ✅ Loading spinner appears
- ✅ Error toast notification: "Failed to load admin statistics"
- ✅ Graceful error handling (no crash)

**Pass Criteria:** Frontend handles backend errors gracefully

---

#### Test 6.2: Network Error
**Steps:**
1. Open DevTools > Network tab
2. Set throttling to "Offline"
3. Try to load analytics

**Expected Results:**
- ✅ Error toast appears
- ✅ Loading state clears
- ✅ User can retry

**Pass Criteria:** Network errors handled properly

---

#### Test 6.3: Invalid Moderator Note
**Steps:**
1. Try to resolve/dismiss report without entering note
2. Leave textarea empty
3. Click "Confirm"

**Expected Results:**
- ✅ Error toast: "Moderator note is required"
- ✅ Modal stays open
- ✅ Action not submitted

**Pass Criteria:** Validation prevents empty notes

---

### **SCENARIO 7: Performance**

#### Test 7.1: Page Load Time
**Steps:**
1. Open DevTools > Performance tab
2. Record while loading `/admin/analytics`
3. Stop recording

**Expected Results:**
- ✅ Initial load < 3 seconds
- ✅ No long tasks (> 50ms)
- ✅ Smooth animations (60fps)

**Pass Criteria:** Pages load within acceptable time

---

#### Test 7.2: Chart Rendering Performance
**Steps:**
1. Navigate to `/admin/analytics`
2. Switch between Daily/Weekly/Monthly rapidly

**Expected Results:**
- ✅ Charts update smoothly
- ✅ No freezing or lag
- ✅ Previous chart clears before new one renders

**Pass Criteria:** Charts perform well during updates

---

## 🐛 Known Issues to Watch For

1. **Empty State Handling:**
   - If no data exists, charts should show empty state
   - Tables should show "No reports found" message

2. **Date Formatting:**
   - All dates should be in local timezone
   - Format should be consistent (MM/DD/YYYY or DD/MM/YYYY)

3. **Color Consistency:**
   - Status badges should use same colors across all pages
   - Charts should use theme colors

4. **Data Refresh:**
   - After actions (resolve, dismiss), data should refresh automatically
   - No manual page refresh needed

---

## ✅ Test Completion Checklist

- [ ] SCENARIO 1: Admin Authentication (3 tests)
- [ ] SCENARIO 2: Admin Dashboard (4 tests)
- [ ] SCENARIO 3: Analytics Dashboard (9 tests)
- [ ] SCENARIO 4: Report Management (13 tests)
- [ ] SCENARIO 5: Responsive Design (2 tests)
- [ ] SCENARIO 6: Error Handling (3 tests)
- [ ] SCENARIO 7: Performance (2 tests)

**Total Tests: 36**

---

## 📊 Test Results Template

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Admin Login | ⬜ Pass / ⬜ Fail | |
| 1.2 | Non-Admin Access | ⬜ Pass / ⬜ Fail | |
| 1.3 | Admin Panel Nav | ⬜ Pass / ⬜ Fail | |
| 2.1 | Dashboard Metrics | ⬜ Pass / ⬜ Fail | |
| ... | ... | ... | |

---

## 🎯 Quick Smoke Test (5 Minutes)

If you're short on time, test these critical paths:

1. ✅ Login as admin → See "Admin Panel" link
2. ✅ Visit `/admin` → Metrics display
3. ✅ Visit `/admin/analytics` → Charts render
4. ✅ Visit `/admin/reports` → Table loads
5. ✅ View a report → Detail view works
6. ✅ Resolve a report → Success toast + status update

If all 6 pass, the module is fundamentally working!

---

## 📞 Support

If you encounter issues:
1. Check browser console for errors (F12 > Console)
2. Check backend terminal for API errors
3. Verify MongoDB connection
4. Ensure admin user exists in database
5. Check network tab for failed requests

---

**Last Updated:** 2026-05-14
**Module:** 8 - Operations & Intelligence
**Version:** 1.0.0
