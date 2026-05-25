# Module 7: Manual Testing Guide

## ✅ Automated Test Results

**Backend API Tests:** ✅ **35/35 PASSED**
- Messaging System: 7/7 ✅
- Review System: 9/9 ✅
- Dispute Resolution: 8/8 ✅
- Notifications: 6/6 ✅
- Security & Edge Cases: 5/5 ✅

---

## 📋 Manual Testing Instructions

### Prerequisites

1. **Start Backend Server:**
   ```bash
   cd backend
   npm run dev
   ```
   Server should run on: `http://localhost:5000`

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend should run on: `http://localhost:5173`

3. **Create Test Accounts:**
   - Open browser and navigate to `http://localhost:5173`
   - Create **User 1** account (Buyer)
   - Create **User 2** account (Seller)
   - Verify both accounts via email (or manually set `isVerified: true` in database)

---

## 🧪 Test Scenarios

### **Test 1: Messaging System**

#### 1.1 Send Message
1. Login as **User 1**
2. Navigate to `/messages`
3. You should see empty inbox with "No messages yet"
4. To test messaging, you need to access a listing and click "Message Seller"
5. Alternatively, navigate directly to `/messages/{user2_id}` (get user2_id from database)
6. Type a message and click Send
7. ✅ **Verify:** Message appears in chat window

#### 1.2 Real-time Message Delivery
1. Open **two browser windows** (or incognito)
2. Login as **User 1** in Window 1
3. Login as **User 2** in Window 2
4. User 1 sends message to User 2
5. ✅ **Verify:** User 2 receives message instantly without refresh
6. ✅ **Verify:** Unread indicator appears (green dot)

#### 1.3 View Conversations List
1. Navigate to `/messages`
2. ✅ **Verify:** Shows list of all conversations
3. ✅ **Verify:** Shows last message preview
4. ✅ **Verify:** Shows timestamp
5. ✅ **Verify:** Unread conversations have green indicator

#### 1.4 Mark as Read
1. User 2 clicks on conversation with User 1
2. ✅ **Verify:** Green unread indicator disappears
3. Navigate back to conversations list
4. ✅ **Verify:** No unread indicator for that conversation

---

### **Test 2: Reviews & Trust Score**

#### 2.1 Create Completed Exchange
1. **User 2** creates a listing
2. **User 1** proposes exchange on that listing
3. **User 2** accepts the exchange
4. Both users mark exchange as complete (or use handshake verification)
5. ✅ **Verify:** Exchange status shows "fully_completed"

#### 2.2 Leave a Review
1. After exchange is completed, navigate to `/reviews/{user2_id}`
2. Click "Write a Review"
3. Enter the Exchange ID (from database or exchange detail page)
4. Select rating (1-5 stars)
5. Write a comment
6. Click "Submit Review"
7. ✅ **Verify:** Review appears in the list
8. ✅ **Verify:** Average rating updates
9. ✅ **Verify:** Trust score updates on user's profile

#### 2.3 View User Reviews
1. Navigate to `/reviews/{user2_id}`
2. ✅ **Verify:** Shows all reviews for that user
3. ✅ **Verify:** Shows average rating at top
4. ✅ **Verify:** Shows star ratings for each review
5. ✅ **Verify:** Shows reviewer names and dates

#### 2.4 Prevent Duplicate Reviews
1. Try to submit another review for the same exchange
2. ✅ **Verify:** Error message "You have already reviewed this exchange"

#### 2.5 Prevent Reviews for Incomplete Exchanges
1. Create a new exchange but don't complete it
2. Try to leave a review using that exchange ID
3. ✅ **Verify:** Error message "Exchange must be fully completed"

---

### **Test 3: Handshake Verification (QR Code)**

#### 3.1 Generate Handshake Token (Seller)
1. Create an exchange and get it to "accepted" status
2. Login as **Seller (User 2)**
3. Navigate to `/exchange/{exchange_id}`
4. Scroll to "Digital Handshake" section
5. Click "Generate QR Code for Buyer"
6. ✅ **Verify:** 6-digit code appears
7. ✅ **Verify:** QR code displays
8. ✅ **Verify:** Shows expiration time (30 minutes)

#### 3.2 Verify Handshake (Buyer)
1. Login as **Buyer (User 1)**
2. Navigate to same exchange page
3. ✅ **Verify:** Shows input field for 6-digit code
4. Enter the code shown by seller
5. Click "Verify & Complete Exchange"
6. ✅ **Verify:** Exchange status changes to "fully_completed"
7. ✅ **Verify:** Both users receive +50 EcoPoints
8. ✅ **Verify:** Success message displays

#### 3.3 Regenerate Token
1. As seller, click "Regenerate Token"
2. Confirm the warning dialog
3. ✅ **Verify:** New 6-digit code appears
4. ✅ **Verify:** Previous code is now invalid
5. ✅ **Verify:** Shows remaining attempts (max 5)

#### 3.4 Test Invalid Code
1. As buyer, enter wrong code (e.g., "000000")
2. Click verify
3. ✅ **Verify:** Error message "Invalid verification token"

#### 3.5 Test Expired Token
1. Generate token as seller
2. Wait 31 minutes (or manually change `handshakeExpiresAt` in database to past time)
3. Try to verify as buyer
4. ✅ **Verify:** Error message "Verification token has expired"

---

### **Test 4: Notifications System**

#### 4.1 View Notifications
1. Perform various actions (send message, create exchange, etc.)
2. Navigate to `/notifications`
3. ✅ **Verify:** Shows all notifications
4. ✅ **Verify:** Unread notifications have green indicator
5. ✅ **Verify:** Shows notification type icons
6. ✅ **Verify:** Shows timestamps

#### 4.2 Filter Notifications
1. Click "Unread" tab
2. ✅ **Verify:** Shows only unread notifications
3. Click "Read" tab
4. ✅ **Verify:** Shows only read notifications
5. Click "All" tab
6. ✅ **Verify:** Shows all notifications

#### 4.3 Mark as Read
1. Click on unread notification
2. ✅ **Verify:** Notification marked as read
3. ✅ **Verify:** Green indicator disappears
4. ✅ **Verify:** Unread count decreases

#### 4.4 Mark All as Read
1. Click "Mark all read" button
2. ✅ **Verify:** All notifications marked as read
3. ✅ **Verify:** Unread count becomes 0

#### 4.5 Delete Notification
1. Click trash icon on any notification
2. ✅ **Verify:** Notification is removed from list

---

### **Test 5: Dispute Resolution**

#### 5.1 Open Exchange Dispute
1. Create an exchange with "accepted" status
2. Login as either participant
3. Navigate to `/exchange/{exchange_id}`
4. Click "Open Dispute" button
5. Enter dispute reason
6. Click "Submit Dispute"
7. ✅ **Verify:** Exchange status changes to "disputed"
8. ✅ **Verify:** Success message displays

#### 5.2 File Platform Dispute Report
1. Navigate to `/disputes/report`
2. Enter User ID to report
3. Select reason from options:
   - Item not as described
   - User didn't show up
   - Harassment
   - Suspected scam
   - Other
4. Enter detailed description
5. (Optional) Enter Exchange ID
6. Click "Submit Report"
7. ✅ **Verify:** Success message displays
8. ✅ **Verify:** Redirected to My Exchanges page

#### 5.3 Admin View Disputes (Requires Admin Account)
1. Create admin user (set `userType: "admin"` in database)
2. Login as admin
3. Access disputes endpoint via Postman or API client:
   ```
   GET http://localhost:5000/api/disputes
   Authorization: Bearer {admin_token}
   ```
4. ✅ **Verify:** Shows all disputes
5. ✅ **Verify:** Can filter by status

#### 5.4 Admin Resolve Dispute
1. As admin, update dispute status via API:
   ```
   PATCH http://localhost:5000/api/disputes/{dispute_id}
   Authorization: Bearer {admin_token}
   Body: {
     "status": "resolved",
     "adminNote": "Investigation complete"
   }
   ```
2. ✅ **Verify:** Dispute status updated
3. ✅ **Verify:** Admin note saved

---

### **Test 6: Integration Workflows**

#### 6.1 Complete Exchange with Review Flow
1. User 1 proposes exchange on User 2's listing
2. User 2 accepts
3. Both negotiate meeting details
4. Seller generates handshake token
5. Buyer verifies token
6. Exchange completes automatically
7. Both users navigate to each other's review pages
8. Both leave reviews
9. ✅ **Verify:** Trust scores update for both users
10. ✅ **Verify:** Both receive +50 EcoPoints

#### 6.2 Message → Exchange → Review Flow
1. User 1 messages User 2 about a listing
2. User 1 proposes exchange
3. Complete the exchange
4. User 1 leaves review for User 2
5. ✅ **Verify:** Message history preserved
6. ✅ **Verify:** Review links to correct exchange
7. ✅ **Verify:** All notifications generated

#### 6.3 Dispute Resolution Flow
1. User 1 and User 2 have an active exchange
2. User 1 opens dispute
3. Admin reviews dispute (via database or admin panel)
4. Admin resolves dispute
5. ✅ **Verify:** Both users receive notifications
6. ✅ **Verify:** Exchange status updated based on outcome

---

### **Test 7: Security & Authorization**

#### 7.1 Authentication Required
1. Logout from all accounts
2. Try to access `/messages`
3. ✅ **Verify:** Redirected to login page
4. Try to access `/notifications`
5. ✅ **Verify:** Redirected to login page
6. Try to access `/reviews/{user_id}`
7. ✅ **Verify:** Redirected to login page

#### 7.2 Message Privacy
1. Login as User 1
2. Send message to User 2
3. Login as User 3 (create new account)
4. Try to access `/messages/{user2_id}`
5. ✅ **Verify:** Shows empty conversation (can't see User 1-2 messages)

#### 7.3 Review Authorization
1. Create exchange between User 1 and User 2
2. Login as User 3
3. Try to leave review for the exchange
4. ✅ **Verify:** Error "Not authorized to review this exchange"

#### 7.4 Admin-Only Features
1. Login as regular user
2. Try to access disputes list via API:
   ```
   GET http://localhost:5000/api/disputes
   Authorization: Bearer {user_token}
   ```
3. ✅ **Verify:** Returns 403 Forbidden

---

### **Test 8: Performance & UX**

#### 8.1 Load Testing Messages
1. Send 50+ messages in quick succession
2. ✅ **Verify:** All messages send successfully
3. ✅ **Verify:** No UI lag or freezing
4. ✅ **Verify:** Messages appear in correct order

#### 8.2 Large Conversation Performance
1. Create conversation with 100+ messages
2. Navigate to that conversation
3. ✅ **Verify:** Loads within 2 seconds
4. ✅ **Verify:** Can scroll smoothly
5. ✅ **Verify:** Auto-scrolls to latest message

#### 8.3 Notification Center Performance
1. Generate 50+ notifications (via various actions)
2. Navigate to `/notifications`
3. ✅ **Verify:** Loads within 1 second
4. ✅ **Verify:** Filtering works smoothly
5. ✅ **Verify:** "Mark all read" completes quickly

---

## 🐛 Common Issues & Troubleshooting

### Issue: Messages Not Appearing in Real-time
**Solution:**
- Check Socket.io connection in browser console
- Verify backend server is running
- Check for CORS errors in console
- Ensure both users are on different browsers/tabs

### Issue: Handshake Token Not Generating
**Solution:**
- Verify exchange status is "accepted" or "completed_by_*"
- Check that you're logged in as the seller
- Check browser console for errors
- Verify database has correct exchange data

### Issue: Review Submission Fails
**Solution:**
- Ensure exchange status is "fully_completed"
- Verify you're a participant in the exchange
- Check that you haven't already reviewed this exchange
- Verify Exchange ID is correct (24-character ObjectId)

### Issue: Notifications Not Appearing
**Solution:**
- Perform actions that trigger notifications (send message, create exchange)
- Check database `notifications` collection
- Verify user ID matches logged-in user
- Refresh page if needed

---

## ✅ Test Completion Checklist

- [ ] Messaging: Send/receive messages
- [ ] Messaging: Real-time delivery
- [ ] Messaging: Conversations list
- [ ] Messaging: Mark as read
- [ ] Reviews: Create review after completed exchange
- [ ] Reviews: View user reviews
- [ ] Reviews: Trust score calculation
- [ ] Reviews: Duplicate prevention
- [ ] Handshake: Generate token (seller)
- [ ] Handshake: Verify token (buyer)
- [ ] Handshake: Regenerate token
- [ ] Handshake: Invalid/expired token handling
- [ ] Notifications: View notifications
- [ ] Notifications: Filter notifications
- [ ] Notifications: Mark as read
- [ ] Notifications: Delete notifications
- [ ] Disputes: Open exchange dispute
- [ ] Disputes: File platform report
- [ ] Disputes: Admin view/resolve (if admin account)
- [ ] Security: Authentication required
- [ ] Security: Message privacy
- [ ] Security: Review authorization
- [ ] Performance: Load testing
- [ ] Performance: Large conversations
- [ ] Integration: Complete workflows

---

## 📊 Expected Results Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Messaging | ✅ Functional | Real-time via Socket.io |
| Reviews | ✅ Functional | Trust score updates automatically |
| Handshake | ✅ Functional | 6-digit code, 30-min expiry |
| Notifications | ✅ Functional | Multiple types supported |
| Disputes | ✅ Functional | Exchange + platform level |
| Security | ✅ Functional | Auth & authorization enforced |
| Performance | ✅ Good | Handles 50+ concurrent ops |

---

## 🎯 Success Criteria

Module 7 is considered **fully operational** when:

1. ✅ All 35 automated backend tests pass
2. ✅ All manual test scenarios complete successfully
3. ✅ Real-time messaging works without errors
4. ✅ Handshake verification completes exchanges
5. ✅ Trust scores update correctly after reviews
6. ✅ Notifications appear for all actions
7. ✅ Dispute reporting and resolution works
8. ✅ Security restrictions are enforced
9. ✅ No console errors in browser
10. ✅ Performance is acceptable (< 2s response times)

---

## 📝 Notes

- **Database:** MongoDB (local or Atlas)
- **Backend Port:** 5000
- **Frontend Port:** 5173
- **Test Duration:** Approximately 1-2 hours for full manual testing
- **Recommended Browser:** Chrome or Firefox (latest version)

For any issues or questions, check:
- Backend logs in terminal
- Browser console for frontend errors
- MongoDB collections for data verification
- Network tab in browser DevTools for API calls
