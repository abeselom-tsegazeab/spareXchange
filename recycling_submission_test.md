# Recycling Submission and Eco-Points Update Test

## Overview
This document details the recycling submission process and eco-points update functionality in the SpareXChange application based on code analysis.

## Recycling Submission Flow

### 1. Creating a Recycling Submission
When a user creates a recycling submission via `POST /api/recycling-submissions`:
- User must be authenticated (verifiedToken middleware required)
- Request body must contain: `itemType`, `itemDescription`, `location`
- Optional fields: `estimatedWeight`, `estimatedValue`, `verificationImages`, `notes`
- Eco points are automatically calculated based on item type, weight, and value
- The `userId` field is automatically set to `req.userId` from the middleware
- Status is set to "pending" by default

### 2. Required Fields Validation
The system validates that all required fields are present:
- `itemType` - Type of recyclable item
- `itemDescription` - Detailed description of items
- `location` - Where items are located

### 3. Eco-Points Calculation
The system calculates eco-points based on item type and optionally weight/value:

**Base Points by Item Type:**
- `electronics`: 20 points
- `vehicle-parts`: 25 points
- `mobile-devices`: 15 points
- `computers`: 30 points
- `batteries`: 10 points
- `appliances`: 20 points
- `plastic`: 5 points
- `metal`: 8 points
- `other`: 10 points (default)

**Calculation Logic:**
- If `estimatedWeight` is provided: points = basePoints * estimatedWeight
- If `estimatedValue` is provided (but no weight): points = basePoints * (estimatedValue / 100)
- If neither is provided: base points are awarded
- Final points are capped between 5 and 500 points

### 4. Recycling Submission Creation Process
- New RecyclingSubmission document is created with provided data
- User ID is automatically set from authentication token
- Eco points are calculated using the `calculateEcoPoints` function
- Verification images array is initialized as empty if not provided
- Status is set to "pending" by default
- Submission is saved to database
- Response includes success status and the created submission

## Eco-Points Update Process

### 1. Approval Process
When an admin approves a submission via `PUT /api/recycling-submissions/:id/approve`:
- Submission status is updated to "approved"
- Admin ID is recorded in `verifiedBy`
- Verification timestamp is recorded
- User's eco points are increased by the calculated `ecoPointsEarned`
- The user document is saved with the updated eco points

### 2. Points Verification
- Only submissions with "pending" status can be approved
- Points are only awarded upon approval (not on submission)
- User's total eco points are updated in the User model
- Points are not awarded for rejected submissions

## API Endpoints
- `POST /api/recycling-submissions` - Create a new recycling submission (requires authentication)
- `GET /api/recycling-submissions/my-submissions` - Get user's submissions (requires authentication)
- `GET /api/recycling-submissions` - Get all submissions (requires authentication, likely for admin)
- `GET /api/recycling-submissions/:id` - Get a specific submission (requires authentication)
- `PUT /api/recycling-submissions/:id/approve` - Approve a submission and award points (requires authentication, likely for admin)
- `PUT /api/recycling-submissions/:id/reject` - Reject a submission (requires authentication, likely for admin)
- `PUT /api/recycling-submissions/:id/complete` - Mark as completed (requires authentication, likely for admin)

## Database Schema
The RecyclingSubmission model includes:
- `userId`: ObjectId reference to User (required, set from token)
- `itemType`: String (required) - Type of recyclable item
- `itemDescription`: String (required) - Detailed description of items
- `estimatedWeight`: Number (optional) - Weight of items for points calculation
- `estimatedValue`: Number (optional) - Value of items for points calculation
- `ecoPointsEarned`: Number (calculated) - Points to be awarded
- `location`: String (required) - Where items are located
- `status`: String (default: "pending") - Current status (pending, approved, rejected, completed)
- `verificationImages`: Array of strings (image URLs for verification)
- `notes`: String (optional) - Additional notes
- `verifiedBy`: ObjectId reference to Admin User (set when approved/rejected)
- `verifiedAt`: Date (set when approved/rejected)
- `createdAt`/`updatedAt`: Timestamps

The User model includes:
- `ecoPoints`: Number (default: 0) - Accumulated eco points

## Authentication Requirements
- Creating, viewing own submissions require authentication
- Only admins can approve, reject, or complete submissions
- Users can only view their own submissions
- Admins can view all submissions

## Additional Features
- Submissions can be filtered by status and item type
- Admins track which submissions they verify
- Verification timestamps are recorded
- User information is populated when retrieving submissions (name, profile picture)

## Error Handling
- Returns 400 for missing required fields
- Returns 400 for attempting to approve/reject non-pending submissions
- Returns 401 for unauthenticated requests to protected endpoints
- Returns 403 for unauthorized access to approve/reject submissions
- Returns 404 for non-existent submissions

## Security Measures
- Users can only view their own submissions
- Only authorized admins can approve/reject submissions
- Authentication token is required for all operations
- User ID is automatically set from the authenticated user (cannot be overridden by client)

## Expected Behavior
- Authenticated users can submit recyclable items for verification
- Eco points are calculated automatically based on item type and weight/value
- Admins must approve submissions to award eco points
- User's eco points balance is updated upon approval
- Rejected submissions do not award eco points
- Users can track their submission status and earned points
- All eco points earned are cumulative and stored in the user profile