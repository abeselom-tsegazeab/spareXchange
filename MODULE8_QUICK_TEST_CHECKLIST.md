# Module 8 - Quick Testing Checklist

## 🖥️ Application Status
- ✅ Backend: `http://localhost:5000` (RUNNING)
- ✅ Frontend: `http://localhost:5173` (RUNNING)
- ✅ Database: MongoDB Connected

---

## 🎯 Visual Testing Checklist

### ✅ PRE-TESTING: Verify Admin Account

**Before testing, ensure you have an admin user:**

```javascript
// Check in MongoDB or use this query:
db.users.findOne({ userType: "admin" })
```

**If no admin exists, create one:**
1. Sign up a new user
2. Manually update in MongoDB:
```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { userType: "admin" } }
)
```

---

## 📝 Step-by-Step Visual Tests

### TEST 1: Admin Dashboard Access
**URL:** `http://localhost:5173/admin`

**What to look for:**
- [ ] Green gradient background
- [ ] Header: "Admin Dashboard" with Activity icon
- [ ] 4 metric cards at top (Users, Listings, Exchanges, Active Users)
- [ ] Numbers displayed (not NaN or undefined)
- [ ] "Items Requiring Attention" section (if pending items exist)
- [ ] "Quick Actions" section with 4 colorful cards
- [ ] "Platform Breakdown" card
- [ ] "Sustainability Impact" card

**Screenshot this page for documentation**

---

### TEST 2: Analytics Dashboard
**URL:** `http://localhost:5173/admin/analytics`

**What to look for:**
- [ ] Header: "Analytics Dashboard" with BarChart icon
- [ ] Trend controls: Daily/Weekly/Monthly buttons
- [ ] "Platform Trends" line chart (3 colored lines)
- [ ] "Top Categories" bar chart (green bars)
- [ ] "Rating Distribution" pie chart
- [ ] "Exchange Status Distribution" pie chart
- [ ] "Key Performance Metrics" section (4 metrics)
- [ ] "Sustainability Impact" card
- [ ] "Search Insights" card

**Interactions to test:**
- [ ] Click "Daily" → Chart updates
- [ ] Click "Weekly" → Chart updates
- [ ] Click "Monthly" → Chart updates
- [ ] Hover over line chart → Tooltip appears
- [ ] Hover over pie chart → Tooltip appears

**Screenshot this page for documentation**

---

### TEST 3: Report Management
**URL:** `http://localhost:5173/admin/reports`

**What to look for:**
- [ ] Header: "Report Management" with AlertTriangle icon
- [ ] 4 stats cards (Pending, Reviewed, Resolved, Avg Resolution)
- [ ] Filter dropdowns (Status, Target Type)
- [ ] Reports table with columns
- [ ] Pagination (if > 20 reports)

**Table columns to verify:**
- [ ] Date (formatted)
- [ ] Type (Listing/User/Exchange)
- [ ] Reason (readable text)
- [ ] Status (colored badge)
- [ ] Reporter (name)
- [ ] Actions (buttons)

**Screenshot this page for documentation**

---

### TEST 4: Report Detail View
**How to access:** Click blue "Eye" icon on any report

**What to look for:**
- [ ] "Back to Reports" button
- [ ] Header: "Report Details" with FileText icon
- [ ] Status badge (colored)
- [ ] Date and time
- [ ] Target type
- [ ] Reason (capitalized)
- [ ] Reporter name and email
- [ ] Details section (if exists)
- [ ] Target Information (JSON format)
- [ ] Action buttons (if status = "pending")

**Action buttons to check (for pending reports):**
- [ ] Resolve (green)
- [ ] Dismiss (gray)
- [ ] Remove (orange, for listings only)
- [ ] Ban User (red, for users only)
- [ ] Warn (yellow, for users only)
- [ ] Delete Report (red, at bottom)

**Screenshot this page for documentation**

---

### TEST 5: Moderator Modal
**How to trigger:** Click any action button on pending report

**What to look for:**
- [ ] Modal overlay (dark background)
- [ ] Title: "Moderator Action"
- [ ] Action name displayed (e.g., "resolve", "dismiss")
- [ ] Textarea for moderator note
- [ ] Placeholder text: "Enter moderator note..."
- [ ] Cancel button (gray)
- [ ] Confirm button (green)

**Interactions to test:**
- [ ] Click "Confirm" without note → Error toast appears
- [ ] Enter note + Click "Confirm" → Success toast
- [ ] Click "Cancel" → Modal closes

**Screenshot the modal for documentation**

---

### TEST 6: Navbar Admin Link
**How to access:** Login as admin → Click user icon

**What to look for:**
- [ ] Dropdown menu appears
- [ ] "Admin Panel" link with Shield icon (red)
- [ ] Link positioned after "Saved Searches"
- [ ] Click navigates to `/admin`

**For non-admin user:**
- [ ] "Admin Panel" link NOT visible

**Screenshot the dropdown for documentation**

---

## 🎨 Visual Quality Checks

### Colors & Styling
- [ ] Green/emerald gradient backgrounds
- [ ] Glass-morphism effects (translucent cards)
- [ ] Status badges use correct colors:
  - Pending = Yellow
  - Reviewed = Blue
  - Resolved = Green
  - Dismissed = Gray
- [ ] Hover effects on buttons and cards
- [ ] Smooth animations (Framer Motion)

### Typography
- [ ] Headers are bold and large
- [ ] Numbers are prominent in cards
- [ ] Labels are readable (not too small)
- [ ] Text doesn't overflow containers

### Spacing & Layout
- [ ] Cards have proper padding
- [ ] Grid gaps are consistent
- [ ] No overlapping elements
- [ ] Responsive on different screen sizes

---

## ⚡ Performance Checks

### Load Times
- [ ] Admin Dashboard loads in < 2 seconds
- [ ] Analytics Dashboard loads in < 3 seconds
- [ ] Reports page loads in < 2 seconds
- [ ] Charts render smoothly (no lag)

### Interactions
- [ ] Button clicks respond immediately
- [ ] Filter dropdowns update quickly
- [ ] Modal opens/closes smoothly
- [ ] Page transitions are smooth

---

## 🐛 Error Handling Tests

### Test 1: Backend Down
1. Stop backend server
2. Visit `/admin`
3. **Expected:** Error toast, no crash

### Test 2: Invalid Route
1. Visit `/admin/nonexistent`
2. **Expected:** Redirect to `/` or 404 page

### Test 3: Non-Admin Access
1. Login as regular user
2. Visit `/admin`
3. **Expected:** Redirect to `/dashboard`

---

## 📱 Mobile Testing

### How to test:
1. Open DevTools (F12)
2. Click device toggle icon (Ctrl+Shift+M)
3. Select mobile device (iPhone 12, Pixel 5, etc.)

### What to check:
- [ ] Navbar collapses to hamburger menu
- [ ] "Admin Panel" in mobile menu
- [ ] Cards stack vertically
- [ ] Charts resize properly
- [ ] Tables have horizontal scroll
- [ ] Buttons are touch-friendly
- [ ] Text is readable

---

## ✅ Quick Pass/Fail Summary

| Page | Status | Notes |
|------|--------|-------|
| Admin Dashboard | ⬜ PASS / ⬜ FAIL | |
| Analytics Dashboard | ⬜ PASS / ⬜ FAIL | |
| Report Management | ⬜ PASS / ⬜ FAIL | |
| Report Detail View | ⬜ PASS / ⬜ FAIL | |
| Moderator Modal | ⬜ PASS / ⬜ FAIL | |
| Navbar Integration | ⬜ PASS / ⬜ FAIL | |
| Mobile Responsive | ⬜ PASS / ⬜ FAIL | |
| Error Handling | ⬜ PASS / ⬜ FAIL | |

---

## 📸 Screenshot Checklist

Capture screenshots of:
1. [ ] Admin Dashboard (full page)
2. [ ] Analytics Dashboard with charts
3. [ ] Analytics Dashboard - Trend controls
4. [ ] Report Management table
5. [ ] Report Detail View
6. [ ] Moderator Modal
7. [ ] Navbar dropdown (showing Admin Panel)
8. [ ] Mobile view of Admin Dashboard
9. [ ] Mobile view of Analytics Dashboard
10. [ ] Error state (backend down)

---

## 🎯 Success Criteria

**Module 8 is considered FULLY FUNCTIONAL if:**
- ✅ All 3 main pages load without errors
- ✅ All charts render with data
- ✅ Report CRUD operations work
- ✅ Moderator actions execute correctly
- ✅ Navigation works properly
- ✅ Admin access control works
- ✅ Mobile responsive
- ✅ Error handling works

---

## 📞 Debugging Tips

### If pages don't load:
1. Check browser console (F12 > Console)
2. Check Network tab for failed requests
3. Verify backend is running on port 5000
4. Check MongoDB connection

### If charts don't render:
1. Check if data exists in database
2. Look for console errors
3. Verify recharts is installed: `npm list recharts`

### If reports don't show:
1. Check if reports exist: `db.reports.find()`
2. Verify API endpoint: `GET http://localhost:5000/api/admin/reports`
3. Check authorization headers

---

## 🚀 Next Steps After Testing

1. **Document any bugs found**
2. **Take screenshots for portfolio/documentation**
3. **Test with real data (create test reports)**
4. **Performance optimization if needed**
5. **Deploy to production**

---

**Happy Testing! 🎉**
