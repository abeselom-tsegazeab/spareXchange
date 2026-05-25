# Module 10: Community Engagement - Manual Testing Guide

## 📋 Overview
This guide provides step-by-step instructions for manually testing all Module-10 features including Activity Feed, Public User Profiles, and Achievements & Badges.

---

## 🚀 Prerequisites

1. **Backend Running**: `http://localhost:5000`
2. **Frontend Running**: `http://localhost:5175`
3. **Database**: MongoDB connected
4. **Test Accounts**: At least 2 user accounts created and verified

---

## 🧪 Test Execution Sequence

### **Phase 1: Quick Smoke Test (5-10 minutes)**
Verify basic functionality before deep testing.

### **Phase 2: Comprehensive Functional Testing (30-40 minutes)**
Test all features thoroughly.

### **Phase 3: Integration Testing (15-20 minutes)**
Test workflows across modules.

### **Phase 4: Performance & Usability (10-15 minutes)**
Test performance and user experience.

---

## 📝 PHASE 1: QUICK SMOKE TEST

### **Test 1.1: Activity Feed Basic Access**
**Steps:**
1. Login to the application
2. Navigate to: `http://localhost:5175/activity-feed`
3. Verify page loads without errors
4. Check if activity feed displays (may be empty for new users)

**Expected Result:** ✅ Page loads, shows "My Activity" tab with activity list or empty state

**Pass/Fail:** _______

---

### **Test 1.2: Community Highlights Access**
**Steps:**
1. On Activity Feed page, click "Community Highlights" button
2. Verify community data displays

**Expected Result:** ✅ Shows Top Contributors, Recent Exchanges, Top Recyclers, Trusted Users

**Pass/Fail:** _______

---

### **Test 1.3: Public Profile Access**
**Steps:**
1. Navigate to: `http://localhost:5175/profile/{your-user-id}`
   - Get your user ID from browser localStorage or database
2. Verify profile loads

**Expected Result:** ✅ Shows profile with stats, achievements, trust score

**Pass/Fail:** _______

---

### **Test 1.4: Achievements Page Access**
**Steps:**
1. Navigate to: `http://localhost:5175/achievements`
2. Verify achievements load

**Expected Result:** ✅ Shows unlocked/locked achievements, progress bars, leaderboard

**Pass/Fail:** _______

---

### **Test 1.5: Navigation Dropdown**
**Steps:**
1. Check Navbar for "Community" dropdown
2. Click dropdown
3. Verify links: Activity Feed, Achievements, Leaderboard

**Expected Result:** ✅ Dropdown appears with all 3 links working

**Pass/Fail:** _______

---

## 📝 PHASE 2: COMPREHENSIVE FUNCTIONAL TESTING

### **Section A: Activity Feed Features**

#### **Test 2.1: Activity Feed Filtering**
**Steps:**
1. Go to Activity Feed page
2. Click each tab:
   - All Activity
   - Listings
   - Exchanges
   - Reviews
   - Recycling
3. Verify content changes based on filter

**Expected Result:** ✅ Each filter shows relevant activities only

**Test Data:** Create at least 1 listing, 1 exchange, 1 review, 1 recycling submission

**Pass/Fail:** _______

---

#### **Test 2.2: Activity Feed Pagination**
**Steps:**
1. Create 25+ activities (listings, exchanges, etc.)
2. Go to Activity Feed
3. Verify pagination controls appear
4. Click "Next" button
5. Verify page number updates
6. Click "Previous" button
7. Verify navigation works correctly

**Expected Result:** ✅ Pagination works, shows correct page numbers, loads different activities

**Pass/Fail:** _______

---

#### **Test 2.3: Activity Feed Empty State**
**Steps:**
1. Create a new user account
2. Login with new user
3. Navigate to Activity Feed
4. Verify empty state message displays

**Expected Result:** ✅ Shows "No activities yet" message with "Browse Marketplace" button

**Pass/Fail:** _______

---

#### **Test 2.4: Community Highlights - Top Contributors**
**Steps:**
1. Go to Community Highlights
2. Check "Top Contributors This Week" section
3. Verify shows up to 5 users with:
   - Username
   - Profile picture (if available)
   - Listing count
   - Eco tier badge
4. Click on a user card

**Expected Result:** ✅ Displays top contributors, clicking navigates to their profile

**Pass/Fail:** _______

---

#### **Test 2.5: Community Highlights - Recent Exchanges**
**Steps:**
1. Complete at least 3 exchanges between test users
2. Go to Community Highlights
3. Check "Recent Successful Exchanges" section
4. Verify shows:
   - Requester and receiver names
   - Item name
   - Completion timestamp

**Expected Result:** ✅ Shows recent exchanges with correct data

**Pass/Fail:** _______

---

#### **Test 2.6: Community Highlights - Top Recyclers**
**Steps:**
1. Submit at least 3 recycling submissions
2. Go to Community Highlights
3. Check "Top Recyclers This Month" section
4. Verify shows:
   - Username
   - Recycling count
   - Total weight
5. Click on a recycler

**Expected Result:** ✅ Shows top recyclers, clicking navigates to profile

**Pass/Fail:** _______

---

#### **Test 2.7: Community Highlights - Trusted Users**
**Steps:**
1. Ensure some users have 5+ reviews
2. Go to Community Highlights
3. Check "Most Trusted Community Members" section
4. Verify shows:
   - Username
   - Trust score
   - Review count
   - Eco tier

**Expected Result:** ✅ Shows trusted users sorted by trust score

**Pass/Fail:** _______

---

### **Section B: Public User Profiles**

#### **Test 2.8: Profile Overview Tab**
**Steps:**
1. Navigate to any user's profile: `/profile/{userId}`
2. Verify Overview tab shows:
   - Profile picture or avatar
   - Username
   - Verification badge (if verified)
   - Location
   - Member duration
   - Quick stats (listings, exchanges, rating, eco points)
3. Check Trust & Reputation section
4. Check Sustainability section
5. Check Recent Reviews section (if any)

**Expected Result:** ✅ All sections display correctly with accurate data

**Pass/Fail:** _______

---

#### **Test 2.9: Profile - Trust Score Visualization**
**Steps:**
1. Go to user profile
2. Check trust score progress bar
3. Verify:
   - Score displays as X/100
   - Progress bar width matches score percentage
   - Verification status shows correctly

**Expected Result:** ✅ Trust score visualized accurately

**Pass/Fail:** _______

---

#### **Test 2.10: Profile - Listings Tab**
**Steps:**
1. Go to user profile
2. Click "Listings" tab
3. Verify shows user's active listings
4. Check pagination if more than 10 listings
5. Click on a listing

**Expected Result:** ✅ Shows listings with images, prices, conditions. Clicking navigates to listing detail

**Pass/Fail:** _______

---

#### **Test 2.11: Profile - Reviews Tab**
**Steps:**
1. Go to user profile
2. Click "Reviews" tab
3. Verify shows:
   - Average rating (large display)
   - Star rating visualization
   - Rating distribution (5★, 4★, 3★, 2★, 1★ bars)
   - Individual reviews with:
     - Reviewer name
     - Rating stars
     - Comment
     - Date
4. Check pagination

**Expected Result:** ✅ Reviews display correctly with all details

**Pass/Fail:** _______

---

#### **Test 2.12: Profile - Statistics Tab**
**Steps:**
1. Go to user profile
2. Click "Statistics" tab
3. Verify shows 4 stat cards:
   - **Listings Statistics**: Total, by status
   - **Exchange Statistics**: Total, avg response time, by status
   - **Recycling Statistics**: Total submissions
   - **Reputation**: Trust score, reviews, eco points, eco tier

**Expected Result:** ✅ All statistics display accurately

**Pass/Fail:** _______

---

#### **Test 2.13: Profile - Action Buttons**
**Steps:**
1. Go to another user's profile (not your own)
2. Verify two buttons appear:
   - "Send Message"
   - "Write Review"
3. Click "Send Message"
4. Click "Write Review"

**Expected Result:** ✅ "Send Message" navigates to chat, "Write Review" navigates to review form

**Pass/Fail:** _______

---

#### **Test 2.14: Profile - Security (No Sensitive Data)**
**Steps:**
1. Go to any user's public profile
2. Open browser DevTools (F12)
3. Check Network tab response for profile API
4. Verify response does NOT contain:
   - Password
   - Email
   - MFA secret
   - Verification documents
   - Any sensitive fields

**Expected Result:** ✅ No sensitive data exposed in API response

**Pass/Fail:** _______

---

#### **Test 2.15: Profile - Non-Existent User**
**Steps:**
1. Navigate to: `/profile/000000000000000000000000`
2. Verify error handling

**Expected Result:** ✅ Shows "User Not Found" message with "Go Back" button

**Pass/Fail:** _______

---

### **Section C: Achievements & Badges**

#### **Test 2.16: Achievements - Overview Stats**
**Steps:**
1. Go to Achievements page
2. Check top stats section:
   - Unlocked count
   - Locked count
   - Completion percentage with progress bar

**Expected Result:** ✅ Stats display correctly, percentages accurate

**Pass/Fail:** _______

---

#### **Test 2.17: Achievements - Unlocked Section**
**Steps:**
1. Go to Achievements page
2. Check "Unlocked Achievements" section
3. Verify each achievement shows:
   - Icon (emoji)
   - Name
   - Description
   - Category badge
   - "Unlocked" indicator
4. Verify beautiful card design with border

**Expected Result:** ✅ Unlocked achievements display with all details

**Pass/Fail:** _______

---

#### **Test 2.18: Achievements - Locked Section**
**Steps:**
1. Go to Achievements page
2. Check "Locked Achievements" section
3. Verify each locked achievement shows:
   - Grayscale icon
   - Name
   - Description
   - Progress bar with percentage
4. Verify opacity effect (semi-transparent)

**Expected Result:** ✅ Locked achievements show progress towards unlock

**Pass/Fail:** _______

---

#### **Test 2.19: Achievements - Category Filtering**
**Steps:**
1. Go to Achievements page
2. Click each category filter:
   - All
   - Listings
   - Exchanges
   - Reviews
   - Recycling
   - Eco Points
   - Community
3. Verify achievements filter correctly

**Expected Result:** ✅ Each filter shows only achievements from that category

**Pass/Fail:** _______

---

#### **Test 2.20: Achievements - Check Button**
**Steps:**
1. Go to Achievements page
2. Click "Check Achievements" button
3. Verify loading state
4. Check for toast notification
5. Verify achievements update if new ones unlocked

**Expected Result:** ✅ Button triggers check, shows notification, updates achievements

**Pass/Fail:** _______

---

#### **Test 2.21: Achievements - Leaderboard Tab**
**Steps:**
1. Go to Achievements page
2. Click "Leaderboard" tab
3. Verify shows:
   - Rank numbers (#1, #2, #3...)
   - User names
   - Achievement counts
   - Eco points
   - Eco tier badges
4. Check top 3 have special styling (gold, silver, bronze)
5. Verify sorted by achievement count (descending)

**Expected Result:** ✅ Leaderboard displays correctly with proper sorting

**Pass/Fail:** _______

---

#### **Test 2.22: Achievements - All 17 Definitions**
**Steps:**
1. Check all achievement categories exist:
   - **Listing** (3): First Listing, Pro Seller, Power Seller
   - **Exchange** (3): First Exchange, Exchange Master, Exchange Legend
   - **Review** (3): First Review, Trusted Seller, 5-Star Champion
   - **Recycling** (3): Eco Warrior, Green Champion, Planet Saver
   - **Eco Points** (3): Points Starter, Points Collector, Points Magnate
   - **Community** (2): Community Helper, Veteran Member

**Expected Result:** ✅ All 17 achievements defined with correct criteria

**Pass/Fail:** _______

---

## 📝 PHASE 3: INTEGRATION TESTING

### **Test 3.1: Complete Workflow - Listing Creation → Achievement**
**Steps:**
1. Create a new user account
2. Login
3. Go to Achievements page
4. Note current unlocked count
5. Create a new listing
6. Go back to Achievements page
7. Click "Check Achievements"
8. Verify "First Listing" achievement unlocked
9. Check toast notification

**Expected Result:** ✅ Achievement unlocks automatically after listing creation

**Pass/Fail:** _______

---

### **Test 3.2: Complete Workflow - Exchange → Achievement**
**Steps:**
1. User A creates a listing
2. User B requests exchange
3. User A accepts exchange
4. Both users complete exchange
5. Both users check achievements
6. Verify "First Exchange" unlocks for both

**Expected Result:** ✅ Exchange achievement unlocks for both parties

**Pass/Fail:** _______

---

### **Test 3.3: Complete Workflow - Recycling → Eco Achievement**
**Steps:**
1. Submit 5 recycling submissions
2. Check achievements
3. Verify "Eco Warrior" unlocks
4. Submit 20 more (total 25)
5. Check achievements
6. Verify "Green Champion" unlocks

**Expected Result:** ✅ Eco achievements unlock at correct thresholds

**Pass/Fail:** _______

---

### **Test 3.4: Activity Feed Updates After Actions**
**Steps:**
1. Go to Activity Feed
2. Note current activities
3. Create a new listing
4. Refresh Activity Feed
5. Verify new listing activity appears
6. Complete an exchange
7. Refresh Activity Feed
8. Verify exchange activity appears

**Expected Result:** ✅ Activity feed reflects all user actions

**Pass/Fail:** _______

---

### **Test 3.5: Public Profile Updates After Reviews**
**Steps:**
1. Complete an exchange
2. Write a review (5 stars)
3. Go to reviewed user's profile
4. Check Reviews tab
5. Verify:
   - Review appears
   - Average rating updated
   - Rating distribution updated
   - Total reviews count incremented

**Expected Result:** ✅ Profile reflects new review immediately

**Pass/Fail:** _______

---

### **Test 3.6: Navigation Integration**
**Steps:**
1. From Activity Feed, click on a user profile link
2. Verify navigates to that user's profile
3. From Profile, click "View All Achievements" link
4. Verify navigates to Achievements page
5. From Navbar Community dropdown, click each link
6. Verify all navigate correctly

**Expected Result:** ✅ All navigation links work seamlessly

**Pass/Fail:** _______

---

## 📝 PHASE 4: PERFORMANCE & USABILITY TESTING

### **Test 4.1: Page Load Times**
**Steps:**
1. Open browser DevTools (F12) → Network tab
2. Navigate to Activity Feed
3. Note load time (should be < 2 seconds)
4. Navigate to Public Profile
5. Note load time (< 2 seconds)
6. Navigate to Achievements
7. Note load time (< 2 seconds)

**Expected Result:** ✅ All pages load within 2 seconds

**Pass/Fail:** _______

---

### **Test 4.2: Responsive Design - Mobile**
**Steps:**
1. Open browser DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select mobile device (iPhone 12, Pixel 5)
4. Test all pages:
   - Activity Feed
   - Public Profile
   - Achievements
5. Verify:
   - No horizontal scrolling
   - Touch targets large enough
   - Text readable
   - Navigation accessible

**Expected Result:** ✅ All pages work well on mobile

**Pass/Fail:** _______

---

### **Test 4.3: Responsive Design - Tablet**
**Steps:**
1. Use DevTools device toolbar
2. Select tablet (iPad)
3. Test all pages
4. Verify layout adjusts correctly

**Expected Result:** ✅ Tablet layout optimized

**Pass/Fail:** _______

---

### **Test 4.4: Animations & Transitions**
**Steps:**
1. Navigate between tabs in Activity Feed
2. Verify smooth transitions
3. Switch tabs in Achievements
4. Verify animations
5. Hover over cards
6. Verify hover effects

**Expected Result:** ✅ Smooth animations, no jank

**Pass/Fail:** _______

---

### **Test 4.5: Error Handling**
**Steps:**
1. Turn off backend server
2. Try to load Activity Feed
3. Verify error message displays
4. Turn backend back on
5. Verify recovery

**Expected Result:** ✅ Graceful error handling, no crashes

**Pass/Fail:** _______

---

### **Test 4.6: Loading States**
**Steps:**
1. Clear browser cache
2. Navigate to Activity Feed
3. Verify loading spinner appears
4. Wait for content to load
5. Verify spinner disappears

**Expected Result:** ✅ Loading states shown during data fetch

**Pass/Fail:** _______

---

### **Test 4.7: Accessibility**
**Steps:**
1. Use keyboard navigation (Tab key)
2. Verify all interactive elements accessible
3. Check focus indicators visible
4. Use screen reader (optional)
5. Verify alt text on images

**Expected Result:** ✅ Basic accessibility standards met

**Pass/Fail:** _______

---

### **Test 4.8: Browser Compatibility**
**Steps:**
1. Test in Chrome
2. Test in Firefox
3. Test in Edge
4. Test in Safari (if available)
5. Verify consistent behavior

**Expected Result:** ✅ Works across major browsers

**Pass/Fail:** _______

---

## 📊 Test Results Summary

| Phase | Total Tests | Passed | Failed | Blocked |
|-------|------------|--------|--------|---------|
| Phase 1: Smoke Test | 5 | ___ | ___ | ___ |
| Phase 2: Functional | 22 | ___ | ___ | ___ |
| Phase 3: Integration | 6 | ___ | ___ | ___ |
| Phase 4: Performance | 8 | ___ | ___ | ___ |
| **TOTAL** | **41** | ___ | ___ | ___ |

---

## 🐛 Bug Report Template

If you find any issues, use this template:

```
**Bug Title:** [Brief description]
**Test Case:** [e.g., Test 2.5]
**Severity:** [Critical/High/Medium/Low]
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Result:** 
**Actual Result:** 
**Screenshots:** [Attach if applicable]
**Browser:** [Chrome/Firefox/etc.]
**Device:** [Desktop/Mobile/Tablet]
```

---

## ✅ Sign-Off

**Tested By:** ________________  
**Date:** ________________  
**Overall Status:** [ ] PASS  [ ] FAIL  [ ] CONDITIONAL PASS  

**Comments:**  
_____________________________________________  
_____________________________________________  
_____________________________________________  

---

## 📌 Additional Testing Notes

### **Performance Benchmarks:**
- Activity Feed API: < 2s response time
- Public Profile API: < 2s response time
- Achievements API: < 2s response time
- Community Highlights API: < 3s response time
- Frontend page load: < 2s

### **Security Checklist:**
- [ ] No sensitive data in public APIs
- [ ] Authentication required for private endpoints
- [ ] Banned users' profiles inaccessible
- [ ] Invalid IDs handled gracefully
- [ ] XSS protection on user inputs

### **Data Consistency Checks:**
- [ ] Rating distribution sums to total reviews
- [ ] Achievement progress percentages accurate (0-100%)
- [ ] Leaderboard sorted correctly
- [ ] Pagination counts match actual data
- [ ] Stats calculations accurate

---

## 🎯 Testing Completion Criteria

Module 10 is considered **READY FOR PRODUCTION** when:
1. ✅ All Phase 1 smoke tests pass
2. ✅ All Phase 2 functional tests pass (critical features)
3. ✅ All Phase 3 integration tests pass
4. ✅ At least 90% of Phase 4 performance tests pass
5. ✅ No critical or high-severity bugs open
6. ✅ Performance benchmarks met
7. ✅ Security checklist complete
