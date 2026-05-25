# Notification Trigger System Test

## Overview
This document details the notification system in the SpareXChange application based on code analysis.

## Notification System Flow

### 1. Creating a Notification
When a notification is created via `POST /api/notifications`:
- User must be authenticated (verifiedToken middleware required)
- Request body must contain: `userId`, `title`, `message`
- Optional fields: `type` (defaults to "system"), `data` (defaults to empty object)
- The notification is saved to the database with `isRead` set to `false` by default

### 2. Required Fields Validation
The system validates that all required fields are present:
- `userId` - Target user ID for the notification
- `title` - Notification title
- `message` - Notification message content

### 3. Notification Creation Process
- New Notification document is created with provided data
- Type is set to "system" if not specified
- Data object is set to empty if not provided
- `isRead` is set to `false` by default
- Notification is saved to database
- Response includes success status and the created notification

## Notification Management Features

### 1. Retrieving User Notifications
When retrieving notifications via `GET /api/notifications`:
- User must be authenticated
- Returns all notifications for the authenticated user
- Sorted by creation date (newest first)
- Response includes count and array of notifications

### 2. Getting Unread Notifications Count
When getting unread count via `GET /api/notifications/unread-count`:
- User must be authenticated
- Returns the count of unread notifications for the user
- Useful for badge counters in UI

### 3. Marking Notifications as Read
When marking a single notification as read via `PUT /api/notifications/:id/read`:
- User must be authenticated and owner of the notification
- Sets `isRead` to `true` for the specified notification
- Response confirms the update

When marking all notifications as read via `PUT /api/notifications/mark-all-read`:
- User must be authenticated
- Updates all unread notifications for the user to `isRead: true`
- Response confirms the operation

### 4. Deleting Notifications
When deleting a notification via `DELETE /api/notifications/:id`:
- User must be authenticated and owner of the notification
- Removes the notification from the database
- Response confirms the deletion

## API Endpoints
- `POST /api/notifications` - Create a new notification (requires authentication)
- `GET /api/notifications` - Get user's notifications (requires authentication)
- `GET /api/notifications/unread-count` - Get unread notifications count (requires authentication)
- `PUT /api/notifications/:id/read` - Mark notification as read (requires authentication and ownership)
- `PUT /api/notifications/mark-all-read` - Mark all notifications as read (requires authentication)
- `DELETE /api/notifications/:id` - Delete a notification (requires authentication and ownership)

## Database Schema
The Notification model includes:
- `userId`: ObjectId reference to User (required)
- `title`: String (required) - Notification title
- `message`: String (required) - Notification message content
- `type`: String (default: "system") - Type of notification (e.g., system, alert, info, etc.)
- `data`: Object (default: {}) - Additional data associated with the notification
- `isRead`: Boolean (default: false) - Whether the notification has been read
- `createdAt`/`updatedAt`: Timestamps

## Authentication Requirements
- All notification operations require authentication
- Users can only manage their own notifications
- Only the notification owner can mark as read or delete

## Additional Features
- Read/unread status tracking
- Unread notifications count endpoint
- Bulk mark as read functionality
- Notification type categorization
- Additional data field for storing related information
- Timestamp tracking for all notifications

## Error Handling
- Returns 400 for missing required fields
- Returns 401 for unauthenticated requests
- Returns 403 for unauthorized access to other users' notifications
- Returns 404 for non-existent notifications

## Security Measures
- Users can only access their own notifications
- Authentication token is required for all operations
- Ownership is verified before allowing updates or deletions

## Expected Behavior
- Users receive notifications targeted to their user ID
- Notifications are marked as unread by default
- Users can track which notifications they've read
- Users can clear notifications they no longer need
- Unread count is available for UI badge displays
- Notifications are sorted chronologically (newest first)
- Admins or system processes can create notifications for users