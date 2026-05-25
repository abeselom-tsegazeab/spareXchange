import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";

import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import MFASetupPage from "./pages/MFASetupPage";
import MFAVerificationPage from "./pages/MFAVerificationPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import LandingPage from "./pages/LandingPage";
import MarketplacePage from "./pages/MarketplacePage";
import ListingDetailPage from "./pages/ListingDetailPage";
import CartPage from "./pages/CartPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import AboutPage from "./pages/AboutPage";
import FaqPage from "./pages/FaqPage";
import ContactPage from "./pages/ContactPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import CreateListingPage from "./pages/CreateListingPage";
import MyListingsPage from "./pages/MyListingsPage";
import EditListingPage from "./pages/EditListingPage";
import BulkUploadPage from "./pages/BulkUploadPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import MyExchangesPage from "./pages/MyExchangesPage";
import ExchangeDetailPage from "./pages/ExchangeDetailPage";

// Module 6: Saved Search & Alerts
import SavedSearchesPage from "./pages/SavedSearchesPage";

// Module 4: Sustainability & Incentives
import RecyclingSubmissionPage from "./pages/RecyclingSubmissionPage";
import MySubmissionsPage from "./pages/MySubmissionsPage";
import RecyclerVerificationPage from "./pages/RecyclerVerificationPage";

// Module 5: Professional Services
import CreateTechnicianRequestPage from "./pages/CreateTechnicianRequestPage";
import MyServiceRequestsPage from "./pages/MyServiceRequestsPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import TechnicianRequestsPage from "./pages/TechnicianRequestsPage";
import TechnicianDashboard from "./pages/TechnicianDashboard";

// Module 7: Communication, Trust & Dispute Resolution
import MessagesPage from "./pages/MessagesPage";
import ChatPage from "./pages/ChatPage";
import NotificationsPage from "./pages/NotificationsPage";
import ReviewPage from "./pages/ReviewPage";
import DisputeReportPage from "./pages/DisputeReportPage";

// Module 9: Advanced Notifications & Mobile Integration
import NotificationPreferencesPage from "./pages/NotificationPreferencesPage";
import NotificationHistoryPage from "./pages/NotificationHistoryPage";
import WebhookManagementPage from "./pages/WebhookManagementPage";
import NotificationStatsPage from "./pages/NotificationStatsPage";

// Module 8: Operations & Intelligence
import AdminDashboard from "./pages/AdminDashboard";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import ReportManagement from "./pages/ReportManagement";
import UserManagement from "./pages/UserManagement";
import AdminItemListingsPage from "./pages/AdminItemListingsPage";
import AdminTechnicianRequestsPage from "./pages/AdminTechnicianRequestsPage";
import AdminTechnicianRequestDetailPage from "./pages/AdminTechnicianRequestDetailPage";

// Module 10: Community Engagement
import ActivityFeedPage from "./pages/ActivityFeedPage";
import UserProfilePage from "./pages/UserProfilePage";
import AchievementsPage from "./pages/AchievementsPage";
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";

import LoadingSpinner from "./components/LoadingSpinner";
import InactivityHandler from "./components/InactivityHandler";

import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./store/authStore";
import { useEffect } from "react";

// protect routes that require authentication
const ProtectedRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />;
	}

	if (!user.isVerified) {
		return <Navigate to='/verify-email' replace />;
	}

	return children;
};

// redirect authenticated users to the marketplace (or admin panel for admins)
const RedirectAuthenticatedUser = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (isAuthenticated && user.isVerified) {
		// Redirect admins to admin panel, others to marketplace
		const redirectPath = user.userType === "admin" ? "/admin" : "/marketplace";
		return <Navigate to={redirectPath} replace />;
	}

	return children;
};

// Dashboard redirect component - sends admins to admin panel
const DashboardRedirect = () => {
	const { user } = useAuthStore();
	
	if (user?.userType === "admin") {
		return <Navigate to='/admin' replace />;
	}
	
	return <DashboardPage />;
};

// protect routes that require admin privileges
const AdminRoute = ({ children }) => {
	const { isAuthenticated, user } = useAuthStore();

	if (!isAuthenticated) return <Navigate to='/login' replace />;
	if (user.userType !== "admin") return <Navigate to='/dashboard' replace />;

	return children;
};

function App() {
	const { isCheckingAuth, checkAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (isCheckingAuth) return <LoadingSpinner />;

	return (
		<div className='min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300 dark:bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900'>
			<InactivityHandler />
			<Navbar />
			<Toaster />
			<Routes>
				<Route path='/' element={<LandingPage />} />
				<Route
					path='/marketplace'
					element={
						<ProtectedRoute>
							<>
								<MarketplacePage />
							</>
						</ProtectedRoute>
					}
				/>
				<Route
					path='/listing/:id'
					element={
						<ProtectedRoute>
							<>
								<ListingDetailPage />
							</>
						</ProtectedRoute>
					}
				/>
				<Route
					path='/cart'
					element={
						<ProtectedRoute>
							<CartPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/profile'
					element={
						<ProtectedRoute>
							<>
								<ProfilePage />
							</>
						</ProtectedRoute>
					}
				/>
				<Route
					path='/edit-profile'
					element={
						<ProtectedRoute>
							<EditProfilePage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/dashboard'
					element={
						<ProtectedRoute>
							<DashboardRedirect />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/leaderboard'
					element={
						<ProtectedRoute>
							<Leaderboard />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/create-listing'
					element={
						<ProtectedRoute>
							<CreateListingPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/my-listings'
					element={
						<ProtectedRoute>
							<MyListingsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/edit-listing/:id'
					element={
						<ProtectedRoute>
							<EditListingPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/bulk-upload'
					element={
						<ProtectedRoute>
							<BulkUploadPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/analytics'
					element={
						<ProtectedRoute>
							<AnalyticsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/my-exchanges'
					element={
						<ProtectedRoute>
							<MyExchangesPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/exchange/:id'
					element={
						<ProtectedRoute>
							<ExchangeDetailPage />
						</ProtectedRoute>
					}
				/>

				{/* Module 6: Saved Search & Alerts Routes */}
				<Route
					path='/saved-searches'
					element={
						<ProtectedRoute>
							<SavedSearchesPage />
						</ProtectedRoute>
					}
				/>

				{/* Module 4: Sustainability & Incentives Routes */}
				<Route
					path='/recycle/submit'
					element={
						<ProtectedRoute>
							<RecyclingSubmissionPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/recycle/my-submissions'
					element={
						<ProtectedRoute>
							<MySubmissionsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/recycle/verify'
					element={
						<ProtectedRoute>
							<RecyclerVerificationPage />
						</ProtectedRoute>
					}
				/>

				{/* Module 5: Professional Services Routes */}
				<Route
					path='/technician-requests'
					element={
						<ProtectedRoute>
							<TechnicianRequestsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/technician-requests/create'
					element={
						<ProtectedRoute>
							<CreateTechnicianRequestPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/technician-requests/my-requests'
					element={
						<ProtectedRoute>
							<MyServiceRequestsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/technician-requests/:id'
					element={
						<ProtectedRoute>
							<RequestDetailPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/technician/dashboard'
					element={
						<ProtectedRoute>
							<TechnicianDashboard />
						</ProtectedRoute>
					}
				/>

				{/* Module 7: Communication, Trust & Dispute Resolution Routes */}
				<Route
					path='/messages'
					element={
						<ProtectedRoute>
							<MessagesPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/messages/:userId'
					element={
						<ProtectedRoute>
							<ChatPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/notifications'
					element={
						<ProtectedRoute>
							<NotificationsPage />
						</ProtectedRoute>
					}
				/>
				
				{/* Module 9: Advanced Notifications & Mobile Integration Routes */}
				<Route
					path='/notifications/preferences'
					element={
						<ProtectedRoute>
							<NotificationPreferencesPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/notifications/history'
					element={
						<ProtectedRoute>
							<NotificationHistoryPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/notifications/webhooks'
					element={
						<ProtectedRoute>
							<WebhookManagementPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/notifications/stats'
					element={
						<ProtectedRoute>
							<NotificationStatsPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/reviews/:userId'
					element={
						<ProtectedRoute>
							<ReviewPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/disputes/report'
					element={
						<ProtectedRoute>
							<DisputeReportPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/signup'
					element={
						<RedirectAuthenticatedUser>
							<SignUpPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route
					path='/login'
					element={
						<RedirectAuthenticatedUser>
							<LoginPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route path='/verify-email' element={<EmailVerificationPage />} />
				<Route
					path='/mfa/setup'
					element={
						<ProtectedRoute>
							<MFASetupPage />
						</ProtectedRoute>
					}
				/>
				<Route path='/mfa/verify' element={<MFAVerificationPage />} />
				<Route
					path='/forgot-password'
					element={
						<RedirectAuthenticatedUser>
							<ForgotPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>

				<Route
					path='/reset-password/:token'
					element={
						<RedirectAuthenticatedUser>
							<ResetPasswordPage />
						</RedirectAuthenticatedUser>
					}
				/>
				<Route path='/about' element={<><AboutPage /></>} />
				<Route path='/faq' element={<><FaqPage /></>} />
				<Route path='/contact' element={<><ContactPage /></>} />
				<Route path='/privacy' element={<PrivacyPage />} />
				<Route path='/terms' element={<TermsPage />} />
				<Route
					path='/admin'
					element={
						<AdminRoute>
							<AdminDashboard />
						</AdminRoute>
					}
				/>
				<Route
					path='/admin/analytics'
					element={
						<AdminRoute>
							<AnalyticsDashboard />
						</AdminRoute>
					}
				/>
				<Route
					path='/admin/reports'
					element={
						<AdminRoute>
							<ReportManagement />
						</AdminRoute>
					}
				/>
				<Route
					path='/admin/disputes'
					element={
						<AdminRoute>
							<DashboardPage /> {/* Using Dashboard as placeholder or create specialized components */}
						</AdminRoute>
					}
				/>
				<Route
					path='/admin/users'
					element={
						<AdminRoute>
							<UserManagement />
						</AdminRoute>
					}
				/>
				<Route
					path='/admin/listings'
					element={
						<AdminRoute>
							<AdminItemListingsPage />
						</AdminRoute>
					}
				/>
				<Route
					path='/admin/technician-requests'
					element={
						<AdminRoute>
							<AdminTechnicianRequestsPage />
						</AdminRoute>
					}
				/>
				<Route
					path='/admin/technician-requests/:id'
					element={
						<AdminRoute>
							<AdminTechnicianRequestDetailPage />
						</AdminRoute>
					}
				/>

				{/* Module 10: Community Engagement Routes */}
				<Route
					path='/activity-feed'
					element={
						<ProtectedRoute>
							<ActivityFeedPage />
						</ProtectedRoute>
					}
				/>
				<Route
					path='/profile/:userId'
					element={<UserProfilePage />}
				/>
				<Route
					path='/achievements'
					element={
						<ProtectedRoute>
							<AchievementsPage />
						</ProtectedRoute>
					}
				/>

				{/* catch all routes */}
				<Route path='*' element={<Navigate to='/' replace />} />
			</Routes>
		</div>
	);
}

export default App;
