# Technician Request Functionality Test

## Overview
This document details the technician request process in the SpareXChange application based on code analysis.

## Technician Request Flow

### 1. Creating a Technician Request
When a user creates a technician request via `POST /api/technician-requests`:
- User must be authenticated (verifiedToken middleware required)
- Request body must contain: `serviceType`, `description`, `location`
- Optional fields: `contactInfo`, `priority` (defaults to "medium"), `images`
- The `userId` field is automatically set to `req.userId` from the middleware
- Status is set to "pending" by default

### 2. Required Fields Validation
The system validates that all required fields are present:
- `serviceType` - Type of service needed
- `description` - Detailed description of the issue
- `location` - Where the service is needed

### 3. Technician Request Creation Process
- New TechnicianRequest document is created with provided data
- User ID is automatically set from authentication token
- Images array is initialized as empty if not provided
- Priority is set to "medium" if not specified
- Request is saved to database
- Response includes success status and the created request

## API Endpoints
- `POST /api/technician-requests` - Create a new technician request (requires authentication)
- `GET /api/technician-requests/my-requests` - Get user's requests (requires authentication)
- `GET /api/technician-requests` - Get all requests (requires authentication, likely for admin/technicians)
- `GET /api/technician-requests/:id` - Get a specific request (requires authentication)
- `PUT /api/technician-requests/:id` - Update a request (requires authentication and ownership)
- `PUT /api/technician-requests/:id/assign` - Assign a technician (requires authentication, likely for admin/technicians)
- `PUT /api/technician-requests/:id/complete` - Complete a request (requires authentication and either assigned technician or owner)
- `PUT /api/technician-requests/:id/cancel` - Cancel a request (requires authentication and ownership)

## Database Schema
The TechnicianRequest model includes:
- `userId`: ObjectId reference to User (required, set from token)
- `serviceType`: String (required) - Type of service needed
- `description`: String (required) - Detailed description of the issue
- `location`: String (required) - Where the service is needed
- `contactInfo`: String (optional) - How to contact the user
- `priority`: String (default: "medium") - Priority level (low, medium, high)
- `status`: String (default: "pending") - Current status (pending, in-progress, completed, cancelled)
- `images`: Array of strings (image URLs)
- `assignedTechnician`: ObjectId reference to Technician User (optional)
- `estimatedCost`: Number (optional) - Estimated cost of the service
- `createdAt`/`updatedAt`: Timestamps

## Authentication Requirements
- Creating, viewing own requests, updating, and canceling requests require authentication
- Only the request owner can update or cancel their requests
- Admins/technicians may have additional access to view and manage all requests
- Only assigned technicians or request owners can mark requests as complete

## Additional Features
- Requests can be filtered by status, service type, and priority
- Requests can be assigned to specific technicians
- Both users and technicians can track request status
- User information is populated when retrieving requests (name, profile picture, location, phone)

## Error Handling
- Returns 400 for missing required fields
- Returns 401 for unauthenticated requests to protected endpoints
- Returns 403 for unauthorized access to modify other users' requests
- Returns 404 for non-existent requests

## Security Measures
- Users can only modify/cancel their own requests
- Authentication token is required for protected operations
- User ID is automatically set from the authenticated user (cannot be overridden by client)
- Only authorized personnel can assign technicians or complete requests

## Request Status Flow
- `pending` (default) - Request created, awaiting action
- `in-progress` - Technician assigned and working on request
- `completed` - Request has been completed
- `cancelled` - Request was cancelled by the owner

## Expected Behavior
- Authenticated users can create technician service requests
- Requests appear in the user's "my requests" collection
- Admins/technicians can view and manage all requests
- Requests can be assigned to specific technicians
- Request status can be updated throughout the service process
- Users can cancel their own requests
- Technicians can mark requests as completed