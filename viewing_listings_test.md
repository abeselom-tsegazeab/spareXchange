# Viewing Spare Listings Functionality Test

## Overview
This document details the spare listings viewing process in the SpareXChange application based on code analysis.

## Viewing Listings Flow

### 1. Public Listings Access
When users access listings via `GET /api/listings`:
- No authentication required (public endpoint)
- Returns all available listings sorted by creation date (newest first)
- Only shows listings with `available: true`
- Seller information is populated (name, profilePicture, verifiedSeller, ecoPoints)

### 2. Filtering and Search Capabilities
The system supports various query parameters for filtering:
- `category`: Filter by listing category
- `condition`: Filter by item condition
- `minPrice`/`maxPrice`: Filter by price range
- `location`: Filter by location (case-insensitive)
- `search`: Search in listing titles (case-insensitive)
- `sort`: Sort options include:
  - Default: newest first (-createdAt)
  - `price-asc`: Lowest price first
  - `price-desc`: Highest price first
  - `oldest`: Oldest listings first

### 3. Individual Listing Access
When accessing a specific listing via `GET /api/listings/:id`:
- No authentication required (public endpoint)
- Returns detailed information about the specific listing
- Seller information is populated
- View count is automatically incremented on access

### 4. User's Own Listings
When accessing user's own listings via `GET /api/listings/my-listings`:
- Authentication required
- Returns only listings created by the authenticated user
- Sorted by creation date (newest first)

## API Endpoints
- `GET /api/listings` - Get all available listings (public endpoint)
- `GET /api/listings/:id` - Get a specific listing (public endpoint)
- `GET /api/listings/my-listings` - Get user's listings (requires authentication)

## Data Population
When retrieving listings, the system populates seller information:
- `name`: Seller's name
- `profilePicture`: Seller's profile picture URL
- `verifiedSeller`: Whether seller is verified
- `ecoPoints`: Seller's eco points balance
- `location`: Seller's location
- `phone`: Seller's phone number (for individual listings)

## View Tracking
- Each time a listing is accessed via `GET /api/listings/:id`, the `views` count is incremented
- View count is stored in the database and returned with listing data
- This provides insight into listing popularity

## Response Format
- Public listings endpoint returns: `{ success: true, count: number, listings: [array] }`
- Individual listing endpoint returns: `{ success: true, listing: object }`
- User's listings endpoint returns: `{ success: true, count: number, listings: [array] }`

## Security Measures
- Individual listings can be viewed by anyone
- User's listings endpoint only returns listings belonging to authenticated user
- Sensitive information is not exposed in public listings

## Performance Considerations
- Listings are sorted efficiently
- Filtering is implemented at the database level
- Only necessary fields are populated for performance

## Expected Behavior
- All users can browse available listings
- Listings can be filtered by multiple criteria
- Individual listings show detailed information
- View counts increase with each access
- Authenticated users can view their own listings separately
- Seller information is consistently displayed with listings