# Spare Listing Creation Test

## Overview
This document details the spare listing creation process in the SpareXChange application based on code analysis.

## Listing Creation Flow

### 1. Creating a Listing
When a verified user creates a listing via `POST /api/listings`:
- User must be authenticated (verifiedToken middleware required)
- Request body must contain: `title`, `description`, `price`, `category`, `condition`, `location`
- Optional fields: `images`, `contactInfo`, `specifications`
- The `seller` field is automatically set to `req.userId` from the middleware
- The `available` field is set to `true` by default

### 2. Required Fields Validation
The system validates that all required fields are present:
- `title`
- `description` 
- `price`
- `category`
- `condition`
- `location`

### 3. Listing Creation Process
- New Listing document is created with provided data
- Seller ID is automatically set from authentication token
- Images array is initialized as empty if not provided
- Listing is saved to database
- Response includes success status and the created listing

## API Endpoints
- `POST /api/listings` - Create a new listing (requires authentication)
- `GET /api/listings` - Get all listings (public endpoint)
- `GET /api/listings/:id` - Get a specific listing (public endpoint)
- `PUT /api/listings/:id` - Update a listing (requires authentication and ownership)
- `DELETE /api/listings/:id` - Delete a listing (requires authentication and ownership)
- `GET /api/listings/my-listings` - Get user's listings (requires authentication)

## Database Schema
The Listing model includes:
- `title`: String (required)
- `description`: String (required)
- `price`: Number (required)
- `category`: String (required)
- `condition`: String (required) - e.g., "New", "Used", etc.
- `location`: String (required)
- `images`: Array of strings (image URLs)
- `seller`: ObjectId reference to User (required, set from token)
- `contactInfo`: String (optional)
- `specifications`: Object (optional)
- `available`: Boolean (default: true)
- `views`: Number (default: 0, incremented on viewing)
- `createdAt`/`updatedAt`: Timestamps

## Authentication Requirements
- Creating, updating, and deleting listings requires authentication
- Only the listing owner can update or delete their listings
- Viewing listings is available to all users (public)

## Additional Features
- Listings have an `available` field that can be toggled
- Views are incremented when a listing is accessed
- Listings can be filtered by category, condition, price range, and location
- Seller information is populated when retrieving listings (name, profile picture, verification status, eco points)

## Error Handling
- Returns 400 for missing required fields
- Returns 401 for unauthenticated requests to protected endpoints
- Returns 403 for unauthorized access to modify other users' listings
- Returns 404 for non-existent listings

## Security Measures
- Users can only modify/delete their own listings
- Authentication token is required for protected operations
- Seller ID is automatically set from the authenticated user (cannot be overridden by client)

## Expected Behavior
- Verified users can create new listings
- Listings appear in the user's "my listings" collection
- Listings are visible to all users in the general listings feed
- Users can update listing availability status
- Listing views are tracked and incremented