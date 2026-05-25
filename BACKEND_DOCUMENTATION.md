# SpareXChange Backend - Complete Module Documentation

## 📋 Table of Contents
1. [Module 1: Identity & Security](#module-1-identity--security)
2. [Module 2: Marketplace & Inventory](#module-2-marketplace--inventory)
3. [Module 3: Exchange & Transaction](#module-3-exchange--transaction)
4. [Module 4: Sustainability & Incentives](#module-4-sustainability--incentives)
5. [Module 5: Professional Services](#module-5-professional-services)
6. [Module 6: Saved Search & Alerts](#module-6-saved-search--alerts)
7. [Module 7: Communication & Trust](#module-7-communication--trust)
8. [Module 8: Operations & Intelligence](#module-8-operations--intelligence)
9. [Module 9: Notifications & Mobile](#module-9-notifications--mobile)
10. [Module 10: Community Engagement](#module-10-community-engagement)

---

## 🏗️ Backend Architecture Overview

**Technology Stack:**
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (dual token) + MFA (TOTP) + OAuth 2.0 (Google)
- **Real-time**: Socket.io for live updates
- **Testing**: Jest + Supertest (3,500+ tests)
- **Logging**: Winston with file rotation
- **Error Handling**: Centralized middleware with custom error classes
- **Storage**: Cloudinary (cloud) + Local filesystem (fallback)

**Design Patterns:**
- Repository Pattern (data access layer)
- MVC Architecture (Model-View-Controller)
- Middleware Pattern (request processing)
- Event-Driven Architecture (Socket.io + Cron jobs)

---

## Module 1: Identity & Security 🔐

### **What It Does**
Handles everything related to user authentication, authorization, and account security. This is the foundation that keeps the entire platform secure.

### **Why It Matters**
Without proper identity management, users can't trust the platform. This module prevents unauthorized access, protects user data, and ensures only verified users can participate in exchanges.

### **Key Features**

#### 1. **User Registration & Login**
- **Signup**: Creates account with email/password, assigns default role ("user")
- **Login**: Validates credentials, returns JWT access + refresh tokens
- **Password Hashing**: bcrypt with salt rounds (security best practice)
- **Email Verification**: 6-digit code sent via email (prevents fake accounts)

**Files:**
- Controller: `backend/controllers/auth.controller.js`
- Model: `backend/models/user.model.js`
- Routes: `backend/routes/auth.route.js`

#### 2. **Multi-Factor Authentication (MFA)**
- **TOTP (Time-based One-Time Password)**: Google Authenticator compatible
- **Backup Codes**: 10 single-use codes if phone is lost
- **Setup Flow**: Generate secret → Show QR code → Verify code → Enable

**How It Works:**
```
User login → Enter password → If MFA enabled → Enter 6-digit TOTP code → Access granted
```

#### 3. **OAuth 2.0 (Google Login)**
- One-click login with Google account
- Automatic account creation if first time
- Links Google account to existing email

#### 4. **Dual Token System**
- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), stored in HTTP-only cookie
- **Auto-refresh**: When access token expires, backend issues new one using refresh token

#### 5. **Role-Based Access Control (RBAC)**
**5 User Roles:**
- `user`: Basic user (create listings, propose exchanges)
- `technician`: Can accept service requests
- `seller`: Commercial seller (higher listing limits)
- `recycler`: Manages recycling submissions
- `admin`: Full platform access

**Permissions System:**
Each role has specific permissions stored in user document:
```javascript
permissions: ["create_listings", "propose_exchanges", "manage_profile"]
```

#### 6. **Password Management**
- **Forgot Password**: Sends reset token via email
- **Reset Password**: Token-based password change (expires in 1 hour)
- **Password Strength Meter**: Validates complexity on frontend

### **API Endpoints**
```
POST   /api/auth/signup              - Create new account
POST   /api/auth/login               - Login with credentials
POST   /api/auth/google              - Login with Google OAuth
POST   /api/auth/verify-email        - Verify email with code
POST   /api/auth/forgot-password     - Request password reset
POST   /api/auth/reset-password/:token - Reset password with token
POST   /api/auth/refresh-token       - Get new access token
POST   /api/auth/logout              - Logout (clear tokens)
GET    /api/auth/check-auth          - Verify if logged in
POST   /api/auth/mfa/setup           - Setup MFA
POST   /api/auth/mfa/verify          - Verify MFA code
POST   /api/auth/mfa/disable         - Disable MFA
GET    /api/auth/mfa/backup-codes    - Get backup codes
```

### **Security Features**
✅ Helmet.js (HTTP security headers)  
✅ CORS (Cross-Origin Resource Sharing)  
✅ Rate Limiting (100 requests per 15 minutes)  
✅ HTTP-only cookies (prevent XSS attacks)  
✅ bcrypt password hashing (prevent rainbow table attacks)  
✅ JWT token expiration (prevent token reuse)  

---

## Module 2: Marketplace & Inventory 🏪

### **What It Does**
Manages spare parts listings - the core marketplace where users buy, sell, and exchange vehicle parts.

### **Why It Matters**
This is the heart of SpareXChange. Without listings, there's no marketplace. This module handles everything from creating a listing to searching and filtering thousands of parts.

### **Key Features**

#### 1. **Listing Management**
- **Create**: Add spare part with details (title, category, condition, price, images)
- **Update**: Modify listing details
- **Delete**: Remove listing (soft delete - keeps record)
- **View**: Get listing by ID with seller info
- **My Listings**: View all listings by current user

**Listing Data:**
```javascript
{
  title: "Toyota Corolla Brake Pads 2015",
  description: "Genuine OEM brake pads, barely used",
  category: "brakes",
  condition: "like-new", // enum: new, like-new, used-good, used-fair, refurbished
  price: 500,
  location: "Addis Ababa",
  locationCoords: [38.7636, 9.0213], // For geospatial search
  fitmentData: {
    make: "Toyota",
    model: "Corolla",
    year: 2015,
    engine: "1.6L"
  },
  images: ["url1", "url2"],
  seller: userId,
  isAvailable: true
}
```

#### 2. **Advanced Search & Filtering**
- **Keyword Search**: Search title and description
- **Category Filter**: brakes, engine, transmission, electrical, etc.
- **Condition Filter**: new, used, refurbished
- **Price Range**: min/max price
- **Geospatial Search**: Find parts within X km radius
- **Fitment Filter**: Search by vehicle make/model/year

#### 3. **Geospatial Search**
**How It Works:**
```
User location: [longitude, latitude]
Query: "Find brake pads within 50km"
MongoDB $near operator → Returns listings sorted by distance
```

**Repository Pattern:**
```javascript
const listingRepo = new ListingRepository();
const results = await listingRepo.findByProximity(lat, lng, 50, {
  category: "brakes",
  condition: "used-good"
});
```

#### 4. **Image Handling**
- **Cloudinary**: Cloud storage with automatic optimization
- **Local Fallback**: Stores in `uploads/` directory if Cloudinary not configured
- **Image Optimization**: Auto-resize, compress, convert to WebP
- **Max 5 images per listing**

#### 5. **Listing Expiry**
- Listings automatically expire after 30 days
- Cron job runs daily to mark expired listings
- Sellers notified before expiry

### **API Endpoints**
```
POST   /api/listings                  - Create new listing
GET    /api/listings                  - Browse all listings (paginated)
GET    /api/listings/:id              - Get listing by ID
PUT    /api/listings/:id              - Update listing
DELETE /api/listings/:id              - Delete listing
GET    /api/listings/my-listings      - Get my listings
GET    /api/listings/search           - Advanced search
GET    /api/listings/nearby           - Geospatial search
GET    /api/listings/category/:cat    - Filter by category
```

### **Database Indexes**
```javascript
// For fast geospatial queries
locationCoords: "2dsphere"

// For search optimization
category: 1,
condition: 1,
isAvailable: 1,
createdAt: -1
```

---

## Module 3: Exchange & Transaction 🔄

### **What It Does**
Manages the exchange process between buyers and sellers - the transaction engine that facilitates trades.

### **Why It Matters**
Listings are useless without a way to exchange them. This module handles the entire lifecycle from proposal to completion, ensuring both parties are protected.

### **Key Features**

#### 1. **Exchange Lifecycle**
```
pending → accepted → completed
     ↓
  cancelled
     ↓
  disputed (if issues arise)
```

**Status Flow:**
- `pending`: Buyer proposes exchange
- `accepted`: Seller agrees
- `completed`: Exchange finalized, eco-points awarded
- `cancelled`: Either party cancels
- `disputed`: Issue reported, admin intervention needed

#### 2. **Propose Exchange**
- Buyer sends exchange proposal with message
- Can propose direct purchase or part swap
- Seller receives notification

#### 3. **Auto-Sweep Engine**
**What It Does:**
When a listing is sold/exchanged, automatically cancels all other pending exchanges for that listing.

**Why It Matters:**
Prevents multiple buyers from thinking they purchased the same item.

```javascript
// In exchange.controller.js
const pendingExchanges = await Exchange.find({
  listingId: soldListing._id,
  status: "pending"
});

pendingExchanges.forEach(exchange => {
  exchange.status = "cancelled";
  exchange.cancellationReason = "Item sold";
});
```

#### 4. **Exchange History**
- Tracks all status changes with timestamps
- Records who made the change and why
- Audit trail for dispute resolution

#### 5. **Matching Engine**
**Smart Matching Algorithm:**
- Finds compatible listings based on fitment data
- Matches buyer's vehicle with available parts
- Ranks results by relevance, distance, price

**How It Works:**
```javascript
Input: { make: "Toyota", model: "Corolla", year: 2015, part: "brake pads" }
Query: Find all listings matching vehicle + part
Sort: By distance (nearest first)
Output: Ranked list of compatible parts
```

### **API Endpoints**
```
POST   /api/exchanges                    - Propose exchange
GET    /api/exchanges                    - Get my exchanges
GET    /api/exchanges/:id                - Get exchange details
PUT    /api/exchanges/:id/status         - Update status (accept/reject)
PUT    /api/exchanges/:id/complete       - Mark as completed
PUT    /api/exchanges/:id/cancel         - Cancel exchange
GET    /api/exchanges/listing/:listingId - Get exchanges for listing
GET    /api/exchanges/pending            - Get pending exchanges
```

### **Transaction Integrity**
✅ MongoDB transactions (atomic operations)  
✅ Eco-points ledger (immutable record)  
✅ Rollback on failure (no partial updates)  

---

## Module 4: Sustainability & Incentives 🌱

### **What It Does**
Rewards users for eco-friendly behavior - recycling, reusing parts, and reducing waste.

### **Why It Matters**
SpareXChange isn't just a marketplace - it's an environmental initiative. This module incentivizes sustainable practices through eco-points and tier system.

### **Key Features**

#### 1. **Eco-Points System**
**How Users Earn Points:**
- Create listing: +10 points
- Complete exchange: +25 points
- Recycle e-waste: +50-200 points (based on item)
- Get positive review: +5 points
- Refer friend: +30 points

**How Users Spend Points:**
- Redeem for rewards (discounts, badges, premium features)
- Boost listing visibility
- Unlock advanced features

#### 2. **Eco-Point Ledger**
**What It Is:**
Immutable transaction record of all point changes.

**Why It Matters:**
Prevents disputes about point balances. Every change is logged.

```javascript
{
  userId: userId,
  points: +25, // Positive = earned, Negative = spent
  reason: "exchange",
  description: "Completed exchange: Toyota Brake Pads",
  referenceId: exchangeId,
  timestamp: Date.now()
}
```

#### 3. **Sustainability Tiers**
**5 Tier Levels:**
1. **Seedling** (0-99 points): New user
2. **Sprout** (100-499 points): Active participant
3. **Tree** (500-1499 points): Eco-conscious user
4. **Forest** (1500-2999 points): Sustainability champion
5. **Ecosystem** (3000+ points): Environmental leader

**Tier Benefits:**
- Higher tiers get more visibility
- Access to exclusive features
- Badge displayed on profile
- Priority customer support

#### 4. **Recycling Submission**
**Process:**
1. User submits e-waste/recyclable item
2. Uploads photo and description
3. System calculates eco-points based on item type
4. Points awarded after verification

**Supported Items:**
- Vehicle batteries
- Engine oil
- Tires
- Electronic components
- Metal parts

#### 5. **Leaderboard**
- Top 100 users by eco-points
- Filter by time period (weekly, monthly, all-time)
- Public recognition encourages participation

### **API Endpoints**
```
GET    /api/users/eco-points             - Get my points
GET    /api/users/eco-points/history     - Get transaction history
POST   /api/users/eco-points/redeem      - Redeem points for reward
GET    /api/users/leaderboard            - View leaderboard
POST   /api/recycling/submit             - Submit recycling item
GET    /api/recycling/my-submissions     - Get my submissions
GET    /api/users/tier                   - Get my sustainability tier
```

---

## Module 5: Professional Services 🔧

### **What It Does**
Connects users with certified technicians for vehicle repairs and maintenance services.

### **Why It Matters**
Not everyone can install a spare part themselves. This module bridges the gap between buying a part and getting it professionally installed.

### **Key Features**

#### 1. **Technician Requests**
**User Flow:**
1. User needs service (e.g., "Install brake pads")
2. Submits request with vehicle details
3. Technicians in area receive notification
4. Technician accepts request
5. Service completed, both parties leave review

#### 2. **Technician Verification**
- Technicians must apply and provide credentials
- Admin reviews and approves
- Verified badge displayed on profile
- Higher trust = more requests

#### 3. **Service Categories**
- General maintenance
- Brake system repair
- Engine diagnostics
- Electrical system
- Transmission service
- Tire replacement
- Custom fabrication

#### 4. **Geospatial Matching**
- Matches requests with nearby technicians
- Considers technician availability
- Factors in specialization

#### 5. **Service History**
- Records all completed services
- Technician performance metrics
- User satisfaction ratings

### **API Endpoints**
```
POST   /api/technician-requests              - Submit service request
GET    /api/technician-requests              - Get my requests
GET    /api/technician-requests/available    - Get available requests (technicians)
PUT    /api/technician-requests/:id/accept   - Accept request
PUT    /api/technician-requests/:id/complete - Mark as completed
GET    /api/technician-requests/:id          - Get request details
```

---

## Module 6: Saved Search & Alerts 🔔

### **What It Does**
Allows users to save search queries and receive automatic notifications when new matching listings appear.

### **Why It Matters**
Users don't have time to check the marketplace daily. This module proactively notifies them when relevant parts become available.

### **Key Features**

#### 1. **Save Search**
**What Gets Saved:**
- Search keywords
- Category filter
- Price range
- Location radius
- Vehicle fitment data

**Example:**
```javascript
{
  userId: userId,
  name: "Toyota Corolla 2015 Brakes",
  filters: {
    keyword: "brake pads",
    category: "brakes",
    fitmentData: {
      make: "Toyota",
      model: "Corolla",
      year: 2015
    },
    radius: 50 // km
  },
  isActive: true
}
```

#### 2. **Alert System**
**How It Works:**
1. New listing created
2. Cron job runs every hour
3. Checks all saved searches
4. If listing matches, sends notification
5. User receives email + in-app notification

#### 3. **Search Logging**
- Logs all searches for analytics
- Identifies high-demand parts
- Helps sellers understand market needs

### **API Endpoints**
```
POST   /api/users/saved-searches           - Save a search
GET    /api/users/saved-searches           - Get my saved searches
DELETE /api/users/saved-searches/:id       - Delete saved search
PUT    /api/users/saved-searches/:id/toggle - Enable/disable alerts
GET    /api/users/search-history           - Get search history
```

---

## Module 7: Communication & Trust 💬

### **What It Does**
Enables messaging between users and builds trust through reviews and dispute resolution.

### **Why It Matters**
Marketplaces live or die by trust. This module ensures users can communicate safely and resolve conflicts fairly.

### **Key Features**

#### 1. **Real-Time Messaging**
**Technology:** Socket.io for instant messaging

**Features:**
- Send/receive messages in real-time
- Message history stored in database
- Read receipts
- Typing indicators
- Online status

**Message Data:**
```javascript
{
  sender: userId,
  receiver: userId,
  exchangeId: exchangeId, // Link to exchange
  content: "Is this part still available?",
  isRead: false,
  timestamp: Date.now()
}
```

#### 2. **Review & Rating System**
**When Can Users Review:**
- After exchange is completed
- Both parties can review each other
- 1-5 star rating + text review

**Review Data:**
```javascript
{
  reviewer: userId,
  reviewed: userId,
  exchangeId: exchangeId,
  rating: 5,
  comment: "Great seller, fast delivery!",
  timestamp: Date.now()
}
```

#### 3. **Dispute Resolution**
**When to Use:**
- Item not as described
- Payment issues
- Fraudulent behavior
- Communication breakdown

**Process:**
1. User files dispute
2. Admin receives notification
3. Reviews evidence (messages, photos)
4. Makes decision (refund, ban, warning)
5. Updates exchange status

#### 4. **Reporting System**
- Report suspicious listings
- Report inappropriate behavior
- Admin reviews and takes action

### **API Endpoints**
```
POST   /api/messages                     - Send message
GET    /api/messages/:userId             - Get conversation
GET    /api/messages/inbox               - Get all messages
PUT    /api/messages/:id/read            - Mark as read
POST   /api/reviews                      - Leave review
GET    /api/reviews/user/:userId         - Get user's reviews
POST   /api/disputes                     - File dispute
GET    /api/disputes                     - Get my disputes
PUT    /api/disputes/:id/resolve         - Resolve dispute (admin)
```

---

## Module 8: Operations & Intelligence 📊

### **What It Does**
Provides analytics, reporting, and admin tools to monitor platform health and user behavior.

### **Why It Matters**
Admins need insights to make data-driven decisions. This module turns raw data into actionable intelligence.

### **Key Features**

#### 1. **Platform Analytics**
**Metrics Tracked:**
- Total users, listings, exchanges
- Daily/weekly/monthly active users
- Revenue (if applicable)
- Eco-points awarded
- Conversion rates

**Time-Series Analytics:**
- Growth trends
- Peak usage hours
- Seasonal patterns

#### 2. **User Engagement Analytics**
- User retention rate
- Churn analysis
- Feature usage statistics
- Most active users

#### 3. **Listing Performance**
- Views per listing
- Time to sell
- Most popular categories
- Price trends

#### 4. **Exchange Analytics**
- Success rate (completed vs cancelled)
- Average time to complete
- Dispute rate
- Most active exchangers

#### 5. **Admin Dashboard**
- View all users
- Ban/suspend users
- Manage listings (approve/remove)
- Resolve disputes
- View platform metrics

#### 6. **Report Management**
- View all reports
- Update report status
- Track resolution time

### **API Endpoints**
```
GET    /api/admin/analytics/overview         - Platform overview
GET    /api/admin/analytics/users            - User analytics
GET    /api/admin/analytics/listings         - Listing analytics
GET    /api/admin/analytics/exchanges        - Exchange analytics
GET    /api/admin/analytics/trends           - Time-series trends
GET    /api/admin/reports                    - View all reports
PUT    /api/admin/reports/:id                - Update report
GET    /api/admin/users                      - View all users
PUT    /api/admin/users/:id/ban              - Ban user
DELETE /api/admin/listings/:id               - Remove listing
```

---

## Module 9: Notifications & Mobile 📱

### **What It Does**
Manages all notification channels - in-app, email, push notifications, and SMS.

### **Why It Matters**
Users need to know when important things happen (new messages, exchange updates, saved search alerts). This module ensures they never miss critical updates.

### **Key Features**

#### 1. **Notification Types**
- **Exchange Updates**: "Your exchange was accepted"
- **Messages**: "New message from John"
- **Saved Search Alerts**: "New Toyota brake pads found"
- **Reviews**: "You received a 5-star review"
- **System Alerts**: "Your listing expires in 3 days"
- **Dispute Updates**: "Your dispute was resolved"

#### 2. **Notification Channels**
**In-App Notifications:**
- Stored in database
- Real-time via Socket.io
- Mark as read/unread

**Email Notifications:**
- Nodemailer integration
- HTML email templates
- Sent for critical events

**Push Notifications (FCM):**
- Firebase Cloud Messaging
- Mobile app support
- Real-time alerts

**SMS Notifications:**
- Twilio integration (optional)
- Urgent alerts only

#### 3. **Notification Preferences**
Users can customize:
- Which notifications to receive
- Which channels to use
- Email frequency (instant, daily digest)
- Quiet hours (no notifications at night)

#### 4. **Notification Templates**
- Reusable email templates
- Dynamic content (user name, listing details)
- Localization support (future)

#### 5. **Webhook Integration**
- Third-party integrations
- Real-time data sync
- Custom automation

### **API Endpoints**
```
GET    /api/notifications                  - Get my notifications
PUT    /api/notifications/:id/read         - Mark as read
PUT    /api/notifications/read-all         - Mark all as read
DELETE /api/notifications/:id              - Delete notification
GET    /api/notifications/preferences      - Get preferences
PUT    /api/notifications/preferences      - Update preferences
POST   /api/notifications/templates        - Create template (admin)
GET    /api/notifications/templates        - Get all templates
POST   /api/notifications/push             - Send push notification
POST   /api/notifications/sms              - Send SMS
POST   /api/notifications/webhooks         - Create webhook
GET    /api/notifications/webhooks         - Get webhooks
```

---

## Module 10: Community Engagement 🤝

### **What It Does**
Builds community through activity feeds, public profiles, achievements, and social proof.

### **Why It Matters**
A strong community increases user retention and trust. This module makes SpareXChange feel like a community, not just a marketplace.

### **Key Features**

#### 1. **Activity Feed**
**What It Shows:**
- User's recent actions (listings created, exchanges completed)
- Aggregated from multiple sources
- Chronological timeline

**Activity Types:**
- Created listing
- Completed exchange
- Earned eco-points
- Received review
- Unlocked achievement

#### 2. **Public User Profiles**
**Profile Data:**
- Name, profile picture
- Sustainability tier & badge
- Eco-points
- Number of listings/exchanges
- Average rating
- Member since
- Activity feed

**Why It Matters:**
Builds trust by showing user's history and reputation.

#### 3. **Achievement System**
**Achievement Examples:**
- 🌱 **First Recycle**: Submit first recycling item
- 🏪 **First Listing**: Create first listing
- 🔄 **First Exchange**: Complete first exchange
- ⭐ **Top Rated**: Receive 10 five-star reviews
- 🌳 **Eco Warrior**: Reach Tree tier
- 📈 **Power Seller**: Complete 50 exchanges
- 🤝 **Community Leader**: Active for 1 year

**How It Works:**
```javascript
// Check achievement conditions after user action
if (user.exchangesCompleted === 1) {
  unlockAchievement(userId, "first_exchange");
}
```

#### 4. **Social Proof Notifications**
- "5 people viewed your listing today"
- "Your listing is trending"
- "You're in the top 10% of eco-warriors"

### **API Endpoints**
```
GET    /api/users/:id/profile          - Get public profile
GET    /api/users/:id/activity-feed    - Get activity feed
GET    /api/users/achievements         - Get my achievements
GET    /api/users/achievements/:id     - Get achievement details
GET    /api/users/:id/achievements     - Get user's achievements
```

---

## 🛠️ Backend Infrastructure

### **Error Handling System**
**Custom Error Classes:**
- `NotFoundError` (404)
- `ValidationError` (400)
- `AuthenticationError` (401)
- `AuthorizationError` (403)
- `ConflictError` (409)
- `BusinessLogicError` (400/422)

**Usage:**
```javascript
// Old way (20 lines)
try {
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).json({ success: false, message: "Not found" });
  }
} catch (error) {
  console.error(error);
  res.status(500).json({ success: false, message: "Server error" });
}

// New way (5 lines)
const listing = await listingRepo.findById(id);
if (!listing) throw new NotFoundError("Listing");
```

### **Logging System (Winston)**
**Log Files:**
- `backend/logs/error.log` - Errors only
- `backend/logs/combined.log` - All levels
- `backend/logs/http.log` - HTTP requests

**Module-Specific Loggers:**
```javascript
import { listingLogger } from "../utils/logger.js";
listingLogger.info("Listing created", { listingId, seller });
```

### **Repository Pattern**
**Base Repository:**
- Generic CRUD operations
- Pagination, sorting, filtering
- Population support

**Specialized Repositories:**
- `ListingRepository`: Geospatial search, advanced filtering
- `UserRepository`: Leaderboard, eco-points
- `ExchangeRepository`: Statistics, bulk operations

### **Database Models (14 Models)**
1. `User` - User accounts
2. `Listing` - Spare parts listings
3. `Exchange` - Transaction records
4. `Message` - Chat messages
5. `Review` - User reviews
6. `Notification` - In-app notifications
7. `Dispute` - Dispute records
8. `TechnicianRequest` - Service requests
9. `RecyclingSubmission` - Recycling items
10. `EcoPointTransaction` - Points ledger
11. `SavedSearch` - Saved search queries
12. `SearchLog` - Search analytics
13. `Report` - User reports
14. `Webhook` - Third-party integrations

### **Testing Coverage**
- **3,500+ tests** across 10 modules
- **Jest** + **Supertest** for API testing
- **Postman Collections** for manual testing
- **Coverage**: Authentication, marketplace, exchanges, sustainability, services, alerts, communication, operations, notifications, community

---

## 🚀 Getting Started

### **Prerequisites**
```bash
Node.js 18+
MongoDB (local or Atlas)
npm or yarn
```

### **Installation**
```bash
# Clone repository
git clone https://github.com/abeselom-tsegazeab/spareXchange.git

# Install dependencies
cd spareXchange
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, etc.

# Start development server
npm run dev
```

### **Run Tests**
```bash
# Run all tests
npm test

# Run specific module test
npm test -- tests/module1_identity_security.test.js

# Run with coverage
npm test -- --coverage
```

---

## 📝 Summary

SpareXChange backend is a **production-ready, enterprise-grade** platform with:

✅ **10 comprehensive modules** covering all aspects of a spare parts marketplace  
✅ **3,500+ automated tests** ensuring reliability  
✅ **Advanced security** (JWT, MFA, OAuth, RBAC)  
✅ **Scalable architecture** (Repository pattern, error handling, logging)  
✅ **Real-time features** (Socket.io messaging, notifications)  
✅ **Environmental focus** (Eco-points, recycling, sustainability tiers)  
✅ **Admin tools** (Analytics, reports, user management)  
✅ **Community features** (Activity feeds, achievements, public profiles)  

**Lines of Code:** ~15,000+ (backend only)  
**API Endpoints:** 100+  
**Database Models:** 14  
**Test Coverage:** 90%+  

---

*Last Updated: May 2026*  
*Version: 2.0*  
*Developer: Abeselom Tsegazeab & Team*
