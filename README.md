# SpareXchange - Complete Spare Parts Marketplace Platform 🔐


A production-ready, full-stack marketplace platform built with the MERN stack (MongoDB, Express, React, Node.js) for buying, selling, and exchanging spare parts. Features include comprehensive authentication system, user verification, listing management, technician requests, recycling submissions with eco-points, and a stunning modern UI with beautiful animations.




## 🌟 Key Features

### Authentication & Authorization
- 🔐 Secure user registration with email verification
- 🔑 Login with email/password
- 🚪 Logout functionality
- 🔄 Email verification with 6-digit code
- 🔁 Password reset with email link
- ✅ Password reset confirmation
- 🛡️ JWT-based session management
- 🔄 Protected routes for authenticated users only
- 👤 User profile dashboard

### Security
- 🔒 Password hashing with bcryptjs
- 🕐 Email verification codes expire after 24 hours
- ⏰ Password reset tokens expire after 1 hour
- 🛡️ CORS protection
- 🍪 HttpOnly cookie-based authentication
- 🔐 Environment-based configuration

### User Experience
- 🎨 Modern, responsive UI with TailwindCSS
- 🌈 Smooth animations with Framer Motion
- 📱 Mobile-first design
- ⚡ Fast development with Vite
- 🛠️ Real-time form validation
- 📊 Visual password strength meter
- 🎯 Intuitive 6-digit verification code input
- 📋 Auto-focus navigation between code inputs
- 🔄 Automatic submission when code is complete
- 📢 User feedback with toast notifications

### Email Functionality
- 📧 Email verification after signup
- 🔗 Password reset request with secure link
- ✅ Confirmation after successful password reset
- 💌 Welcome email after verification
- 🧪 Works with any SMTP provider (configured for Ethereal.email)

### Developer Experience
- 📦 Well-organized, modular code structure
- 🛠️ Comprehensive error handling
- 🔄 State management with Zustand
- 🌐 API route organization
- 🎯 Environment-based API configuration
- 🚀 Production-ready deployment setup

### User Verification & Profiles
- ✅ Email verification system
- 📷 Profile picture support
- 🏷️ Verified seller badges
- 🌍 Location-based profiles
- 📊 User activity tracking

### Spare Parts Marketplace
- 📦 Post spare part listings
- 🔍 Search and filter functionality
- 🏷️ Categorization system (Electronics, Automotive, etc.)
- 💰 Pricing information
- 📍 Location-based listings
- 📞 Direct contact with sellers
- 📈 Listing analytics and views tracking

### Technician Services
- 🛠️ Request technician assistance
- ⚡ Real-time matching with technicians
- 📋 Service request tracking
- 📞 Direct communication
- ⭐ Technician rating system
- 📊 Service history

### Recycling & Eco-Points
- ♻️ Submit items for recycling
- 🌱 Earn eco-points for recycling
- 🏆 Points tracking system
- 📊 Eco-points leaderboard
- 📈 Environmental impact tracking

### Notifications
- 🔔 Real-time notification system
- 📧 Email notifications
- 📱 In-app notifications
- 🔔 Customizable notification preferences
- 📬 Notification history

### Interactive Features
- 🌍 Interactive map for user locations
- 📈 Activity feed with live updates
- 🎯 Personalized recommendations
- 🏷️ Category browsing
- 📦 Recent listings preview
- 🌙 Dark/light mode support

## 🛠️ Technology Stack

### Frontend
- ⚛️ React.js with Vite (blazing fast development)
- 🎨 TailwindCSS for styling
- 🗃️ Zustand for lightweight state management
- 🌐 React Router for client-side routing
- 🎞️ Framer Motion for smooth animations
- 🎯 Lucide React for beautiful icons
- 📢 React Hot Toast for user notifications
- 🎨 Theme Context for dark/light mode
- 📊 Activity feed components
- 🗺️ Interactive map components
- 🏷️ Category card components
- 📦 Listing card components
- 🏆 Eco-points badge components

### Backend
- 🟢 Node.js with Express.js
- 🗄️ MongoDB with Mongoose ODM
- 🔐 JSON Web Tokens (JWT) for authentication
- 📧 Nodemailer for email delivery
- 🔒 bcryptjs for password hashing
- 🔑 Crypto for secure token generation
- 🍪 Cookie Parser for cookie handling
- 🌐 CORS for cross-origin resource sharing
- ⚙️ Dotenv for environment configuration
- 📦 Mongoose models for listings, notifications, recycling submissions, and technician requests
- 🛠️ Controllers for marketplace functionality
- 🔔 Notification system with real-time updates

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud instance like MongoDB Atlas)
- npm or yarn package manager

### Environment Configuration

Create a `.env` file in the root of the `backend` directory with the following variables:

```bash
# MongoDB Connection
MONGO_URI=your_mongo_uri

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_secret_key

# Client URL
CLIENT_URL=http://localhost:5173

# Nodemailer Configuration (Ethereal.email test account)
SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=iuqcjydv66lxcve7@ethereal.email
SMTP_PASS=4zzAtV5KkCFNV33apm
FROM_EMAIL=iuqcjydv66lxcve7@ethereal.email
```

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/abeselom-tsegazeab/spareXchange.git
   cd spareXchange
   ```

2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

#### Development Mode

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

#### Production Mode

1. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```

2. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔄 API Endpoints

### Authentication Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user with email verification |
| POST | `/api/auth/login` | Authenticate existing user credentials |
| POST | `/api/auth/logout` | Clear authentication cookie |
| POST | `/api/auth/verify-email` | Verify user email with 6-digit code |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password/:token` | Reset password with token |
| GET | `/api/auth/check-auth` | Validate current authentication status |

### Marketplace Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/listings` | Create a new spare parts listing |
| GET | `/api/listings` | Get all spare parts listings |
| GET | `/api/listings/:id` | Get a specific listing by ID |
| PUT | `/api/listings/:id` | Update a listing |
| DELETE | `/api/listings/:id` | Delete a listing |
| GET | `/api/listings/search` | Search listings with filters |

### Technician Request Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/technician-requests` | Request technician assistance |
| GET | `/api/technician-requests` | Get technician requests for current user |
| GET | `/api/technician-requests/:id` | Get a specific technician request |
| PUT | `/api/technician-requests/:id` | Update technician request status |

### Recycling Submission Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/recycling-submissions` | Submit items for recycling |
| GET | `/api/recycling-submissions` | Get recycling submissions for current user |
| GET | `/api/recycling-submissions/:id` | Get a specific recycling submission |
| PUT | `/api/recycling-submissions/:id` | Update recycling submission status |

### Notification Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/notifications` | Create a new notification |
| GET | `/api/notifications` | Get notifications for current user |
| PUT | `/api/notifications/:id/read` | Mark notification as read |
| DELETE | `/api/notifications/:id` | Delete a notification |

## 📁 Project Architecture

```
spareXchange/
├── backend/
│   ├── controllers/          # Business logic handlers
│   │   ├── auth.controller.js
│   │   ├── listing.controller.js
│   │   ├── notification.controller.js
│   │   ├── recyclingSubmission.controller.js
│   │   └── technicianRequest.controller.js
│   ├── db/                   # Database connection setup
│   ├── mailtrap/             # Email templates and delivery
│   ├── middleware/           # Authentication middleware
│   ├── models/               # MongoDB schemas and models
│   │   ├── listing.model.js
│   │   ├── notification.model.js
│   │   ├── recyclingSubmission.model.js
│   │   ├── technicianRequest.model.js
│   │   └── user.model.js
│   ├── routes/               # API route definitions
│   │   ├── auth.route.js
│   │   ├── listing.route.js
│   │   ├── notification.route.js
│   │   ├── recyclingSubmission.route.js
│   │   └── technicianRequest.route.js
│   ├── utils/                # Helper functions
│   └── index.js              # Server entry point
└── frontend/
    ├── src/
    │   ├── components/       # Reusable UI components
    │   │   ├── ActivityFeed.jsx
    │   │   ├── AnimatedFooter.jsx
    │   │   ├── CategoryCard.jsx
    │   │   ├── EcoPointsBadge.jsx
    │   │   ├── FloatingShape.jsx
    │   │   ├── Input.jsx
    │   │   ├── InteractiveMap.jsx
    │   │   ├── ListingCard.jsx
    │   │   ├── LoadingSpinner.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── PasswordStrengthMeter.jsx
    │   │   ├── PersonalizedCTA.jsx
    │   │   └── SocialProofNotification.jsx
    │   ├── contexts/
    │   │   └── ThemeContext.jsx
    │   ├── pages/              # Page-level components
    │   │   ├── AboutPage.jsx
    │   │   ├── ContactPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── EmailVerificationPage.jsx
    │   │   ├── FaqPage.jsx
    │   │   ├── ForgotPasswordPage.jsx
    │   │   ├── LandingPage.jsx
    │   │   ├── ListingDetailPage.jsx
    │   │   ├── LoginPage.jsx
    │   │   ├── MarketplacePage.jsx
    │   │   ├── ProfilePage.jsx
    │   │   ├── ResetPasswordPage.jsx
    │   │   └── SignUpPage.jsx
    │   ├── store/
    │   │   └── authStore.js
    │   ├── utils/
    │   │   └── date.js
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    └── vite.config.js
```

## 📧 Email Templates

The application includes professionally designed HTML email templates for:
- Email verification with 6-digit code
- Password reset request with secure link
- Password reset confirmation
- Welcome message after successful verification

## 🔄 Application Flow

### Authentication Flow
1. **Registration**: User signs up with name, email, and password
2. **Email Verification**: 6-digit code sent to user's email (expires in 24 hours)
3. **Login**: User authenticates with email/password
4. **Session Management**: JWT stored in HttpOnly cookie
5. **Protected Access**: Middleware validates JWT on protected routes
6. **Password Reset**: User requests reset, receives email with secure link
7. **Logout**: Authentication cookie cleared

### Marketplace Flow
1. **Listing Creation**: Verified users can post spare part listings
2. **Browsing**: Users can search and filter listings
3. **Contact**: Direct communication with sellers
4. **Transaction**: Purchase or exchange arrangements

### Technician Services Flow
1. **Service Request**: Users request technician assistance
2. **Matching**: System matches with available technicians
3. **Communication**: Direct contact with technicians
4. **Service Completion**: Service tracking and feedback

### Recycling Flow
1. **Submission**: Users submit items for recycling
2. **Verification**: System validates recyclable items
3. **Eco-Points**: Users earn points for recycling
4. **Tracking**: Eco-points and environmental impact tracking

## 🔐 Security Features

- Passwords are hashed using bcryptjs
- JWT tokens for secure session management
- Email verification for account validation
- Password reset tokens with expiration
- Protected routes for authenticated users only
- CORS configuration for controlled access
- Cookie-based authentication with HttpOnly flag
- Authorization middleware for sensitive operations
- Input validation and sanitization
- Secure file upload handling
- Rate limiting to prevent abuse
- Data encryption for sensitive information

## 🤝 Support

If you find this project helpful, please consider:

- ⭐ Starring this repository
- 📢 Sharing with others
- 💬 Providing feedback or suggestions
- 🎯 Subscribing to [AsaProgrammer_](https://www.youtube.com/@asaprogrammer_) on YouTube

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all the developers who contributed to the open-source libraries used in this project
- Special thanks to the YouTube community for their continued support

---

Built with ❤️ using the MERN stack
