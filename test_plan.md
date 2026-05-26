# SpareXChange Application - Comprehensive Test Plan

## Overview
This document outlines the comprehensive test plan for the SpareXChange application, covering all major functionality including user registration, verification, listing management, technician requests, recycling submissions, and notifications.

## Test Environment Setup
- Backend server running on localhost:3000
- Frontend running on localhost:5173
- Database connection established
- Email service configured (for verification emails)

## Test Scenarios

### 1. User Registration & Login (Basic)

#### 1.1 User Registration
**Test ID**: T001
**Objective**: Verify that new users can register successfully
**Preconditions**: 
- User is on the signup page
- Valid email and password provided

**Steps**:
1. Navigate to `/signup` page
2. Fill in registration form with valid details (name, email, password)
3. Click "Sign Up" button
4. Verify account creation and redirect to dashboard/login

**Expected Results**:
- Account is created successfully
- User receives verification email
- User is redirected appropriately
- Error handling for duplicate emails works

#### 1.2 User Login
**Test ID**: T002
**Objective**: Verify that registered users can log in
**Preconditions**: 
- User has valid account credentials
- User is on the login page

**Steps**:
1. Navigate to `/login` page
2. Enter valid email and password
3. Click "Login" button
4. Verify successful authentication

**Expected Results**:
- User is logged in successfully
- Authentication token is stored
- User is redirected to dashboard
- Error handling for invalid credentials works

### 2. User Verification (Admin or Simulated)

#### 2.1 Email Verification
**Test ID**: T003
**Objective**: Verify that users can verify their email address
**Preconditions**: 
- User has registered and received verification email

**Steps**:
1. Open verification email
2. Click verification link
3. Verify verification status in system

**Expected Results**:
- User account is marked as verified
- User gains access to verified features
- Success message is displayed

#### 2.2 Admin Verification (if applicable)
**Test ID**: T004
**Objective**: Verify admin can verify user accounts
**Preconditions**: 
- Admin user is logged in
- Pending verification users exist

**Steps**:
1. Navigate to admin panel
2. View pending verification requests
3. Approve/verify user account
4. Confirm verification status update

**Expected Results**:
- User verification status is updated
- User gains appropriate access level
- Notification is sent to user

### 3. Posting a Spare Listing (Verified User)

#### 3.1 Creating a New Listing
**Test ID**: T005
**Objective**: Verify verified users can create spare listings
**Preconditions**: 
- User is logged in and verified
- User is on the listing creation page

**Steps**:
1. Navigate to listing creation page
2. Fill in listing details (title, description, category, condition, location)
3. Upload images if applicable
4. Submit listing
5. Verify listing appears in system

**Expected Results**:
- Listing is created successfully
- Listing appears in user's dashboard
- Listing is visible to other users
- Validation works for required fields

#### 3.2 Listing Validation
**Test ID**: T006
**Objective**: Verify proper validation for listing creation
**Preconditions**: 
- Verified user is on listing creation page

**Steps**:
1. Attempt to create listing with missing required fields
2. Attempt to create listing with invalid data
3. Verify validation messages appear

**Expected Results**:
- Proper validation errors are displayed
- Listing is not created with invalid data
- User is guided to correct input

### 4. Viewing Spare Listings

#### 4.1 Browse Listings
**Test ID**: T007
**Objective**: Verify users can browse available spare listings
**Preconditions**: 
- User is on marketplace page
- Listings exist in the system

**Steps**:
1. Navigate to `/marketplace` page
2. Browse available listings
3. Filter listings by various criteria
4. Sort listings by different options

**Expected Results**:
- All listings are displayed properly
- Filtering works as expected
- Sorting functions correctly
- Pagination works if needed

#### 4.2 Listing Details
**Test ID**: T008
**Objective**: Verify users can view detailed listing information
**Preconditions**: 
- User is viewing a list of listings

**Steps**:
1. Click on a specific listing
2. View detailed information
3. Check images, description, and contact information
4. Verify back navigation works

**Expected Results**:
- Detailed listing page loads correctly
- All listing information is displayed properly
- User can contact the seller
- Navigation back to listings works

### 5. Requesting a Technician

#### 5.1 Submit Technician Request
**Test ID**: T009
**Objective**: Verify users can submit technician requests
**Preconditions**: 
- User is logged in
- User is on technician request page

**Steps**:
1. Navigate to technician request form
2. Fill in request details (issue description, location, urgency, contact info)
3. Submit request
4. Verify request is processed

**Expected Results**:
- Request is submitted successfully
- Confirmation message is displayed
- Request appears in admin/technician queue
- User receives confirmation notification

#### 5.2 Technician Request Validation
**Test ID**: T010
**Objective**: Verify proper validation for technician requests
**Preconditions**: 
- User is on technician request form

**Steps**:
1. Attempt to submit request with missing required fields
2. Attempt to submit request with invalid data
3. Verify validation messages appear

**Expected Results**:
- Proper validation errors are displayed
- Request is not submitted with invalid data
- User is guided to correct input

### 6. Recycling Submission & Eco-Points Update

#### 6.1 Submit Recycling Request
**Test ID**: T011
**Objective**: Verify users can submit recycling requests
**Preconditions**: 
- User is logged in
- User is on recycling submission page

**Steps**:
1. Navigate to recycling submission form
2. Fill in recycling details (item type, quantity, condition, location)
3. Submit recycling request
4. Verify request is processed

**Expected Results**:
- Recycling request is submitted successfully
- Confirmation message is displayed
- Request appears in processing queue
- User receives confirmation notification

#### 6.2 Eco-Points Update
**Test ID**: T012
**Objective**: Verify eco-points are updated after recycling validation
**Preconditions**: 
- User has submitted recycling request
- Admin has processed the request

**Steps**:
1. Admin processes recycling request
2. Approve request and award eco-points
3. Verify user's eco-points balance updates
4. Check user dashboard for updated points

**Expected Results**:
- User's eco-points balance increases
- Points update is reflected in user profile
- Notification is sent to user
- Points history is maintained

### 7. Notification Trigger (Simple)

#### 7.1 System Notifications
**Test ID**: T013
**Objective**: Verify system sends appropriate notifications
**Preconditions**: 
- User has performed actions that trigger notifications

**Steps**:
1. Perform actions that should trigger notifications (new message, listing update, etc.)
2. Check notification system
3. Verify notification delivery

**Expected Results**:
- Notifications are generated appropriately
- Users receive notifications via preferred method
- Notification history is maintained
- Users can manage notification preferences

#### 7.2 Email Notifications
**Test ID**: T014
**Objective**: Verify email notifications are sent correctly
**Preconditions**: 
- User has valid email and notification preferences set

**Steps**:
1. Trigger notification events
2. Check user's email
3. Verify email content and format

**Expected Results**:
- Email notifications are sent promptly
- Email content is properly formatted
- Links in emails work correctly
- Unsubscribe options are available

### 8. Premium Marketplace Features (Modernization)

#### 8.1 Proximity-Based Discovery
**Test ID**: T015
**Objective**: Verify listings can be filtered by geo-proximity (2dsphere)
**Preconditions**: Listing exists with `locationCoords`
**Steps**:
1. Query `/api/listings` with `latitude`, `longitude`, and `radius`
2. Verify listings within range are returned
3. Verify listings out of range are excluded
**Status**: **Verified** (via `module2_exhaustive.test.js`)

#### 8.2 Community Fitment Verification
**Test ID**: T016
**Objective**: Verify crowdsourced voting on vehicle compatibility
**Preconditions**: Listing has `compatibleVehicles` entries
**Steps**:
1. PUT vote as "up" to `/api/listings/:id/compatibility/:vehicleId/vote`
2. Verify increment in `upvotes`
3. Change vote to "down" and verify logic handles the switch correctly
**Status**: **Verified** (via `module2_exhaustive.test.js`)

#### 8.3 Market Intelligence (High Demand Analytics)
**Test ID**: T017
**Objective**: Verify system tracks low-result searches to inform sellers
**Preconditions**: Users perform searches that yield zero or few results
**Steps**:
1. Perform unique searches like "ObscurePartABC"
2. Query `/api/listings/analytics/high-demand`
3. Verify the search term appears in the "High Demand" leaderboard
**Status**: **Verified** (via `module2_exhaustive.test.js`)

### 9. Modernized Exchange Lifecycle (Transactional Integrity)

#### 9.1 Atomic Dual-Confirmation
**Test ID**: T018
**Objective**: Verify deal completion only occurs when both parties confirm
**Preconditions**: Exchange is in `accepted` status
**Steps**:
1. Seller marks as complete (`completed_by_seller`)
2. Verify status is not yet `fully_completed`
3. Buyer marks as complete
**Results**: **Verified** (via `module3_exhaustive.test.js`)

#### 9.2 QR-Based Handshake Verification
**Test ID**: T019
**Objective**: Verify cryptographic 6-digit handshake completes deal instantly
**Preconditions**: Exchange in `accepted` state
**Steps**:
1. Seller generates handshake token
2. Buyer verifies token via PUT request
3. Verify status moves to `fully_completed` and eco-points are awarded
**Results**: **Verified** (via `module3_exhaustive.test.js`)

#### 9.3 Safe Zone & Negotiation Lock
**Test ID**: T020
**Objective**: Verify meeting details can be locked at unchangeable Safe Zones
**Preconditions**: Exchange is `accepted`
**Steps**:
1. Fetch `/api/exchanges/info/safe-zones`
2. Update meeting location to a Safe Zone and set `isLocked: true`
3. Attempt to change location after lock
**Results**: **Verified** (via `module3_exhaustive.test.js`)

#### 9.4 Conflict Resolution (Admin Arbitration)
**Test ID**: T021
**Objective**: Verify Admin can force resolution of disputed exchanges
**Preconditions**: Exchange is in `disputed` status
**Steps**:
1. Admin resolves with outcome `mutual`
2. Verify exchange status becomes `cancelled`
**Results**: **Verified** (via `module3_exhaustive.test.js`)

### 10. Sustainability & Incentives (Module 4)

#### 10.1 Precision Eco-Point Calculation
**Test ID**: T022
**Objective**: Verify points are calculated correctly based on item type and weight/value
**Preconditions**: User is logged in
**Steps**:
1. Submit `vehicle-parts` with 10kg weight (expected points: 250)
2. Submit `electronics` with $1500 value (expected points: 300)
**Results**: **Verified** (via `module4_exhaustive.test.js`)

#### 10.2 Multi-Channel Verification Handshakes
**Test ID**: T023
**Objective**: Verify both Admin approval and Recycler token verification award points atomically
**Preconditions**: Submission in `pending` status
**Steps**:
1. Admin approves via `/api/recycling-submissions/:id/approve`
2. Recycler verifies via 6-digit token
3. Verify `EcoPointTransaction` ledger and user profile `ecoPoints`
**Results**: **Verified** (via `module4_exhaustive.test.js`)

#### 10.3 Geo-Proximity Discoverability
**Test ID**: T024
**Objective**: Verify nearby recycling points are findable within target radius
**Preconditions**: Submissions exist in approved status at specific coordinates
**Steps**:
1. Query `/api/recycling-submissions/discovery` with lat/lng
2. Verify nearest submission is returned
**Results**: **Verified** (via `module4_exhaustive.test.js`)

#### 10.4 Achievement & Gamification Trigger
**Test ID**: T025
**Objective**: Verify first recycle awards "Eco Warrior" achievement
**Preconditions**: New user with 0 recycles
**Steps**:
1. Complete first recycle verification
2. Check user profile `achievements` array
**Results**: **Verified** (via `module4_exhaustive.test.js`)

## Test Data Requirements

### User Test Data
- Valid user accounts (verified and unverified)
- Admin account
- Test email addresses
- User profiles with images

### Listing Test Data
- Sample spare listings with images
- Various categories and conditions
- Active and inactive listings

### Technician Request Data
- Sample service requests
- Different urgency levels
- Various issue types

### Recycling Submission Data
- Different item types for recycling
- Various quantities and conditions
- Processing status examples

## Success Criteria
- All test scenarios pass successfully
- Error handling works as expected
- User experience is smooth and intuitive
- Security measures are in place
- Performance meets requirements
- All notifications are delivered correctly

## Post-Test Verification
- Database integrity maintained
- User data remains secure
- System performance unaffected
- All test data cleaned up appropriately

## Risk Assessment
- Ensure test data doesn't interfere with production
- Verify all security measures remain intact
- Confirm that test notifications don't spam real users
- Monitor system performance during testing