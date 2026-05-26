import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { formatDate } from "../utils/date";
import TierBadge from "../components/TierBadge";
import { 
	Trophy, 
	Package, 
	PlusCircle, 
	Leaf, 
	ArrowUpRight,
	ArrowRight,
	ShoppingCart,
	Eye,
	CheckCircle,
	MessageSquare,
	Recycle,
	Search,
	Bell
} from "lucide-react";
import { useListingStore } from "../store/listingStore";
import { useSavedSearchStore } from "../store/savedSearchStore";

const IndividualDashboard = () => {
	const { user, logout } = useAuthStore();
	const navigate = useNavigate();
	const { getUserListings: fetchUserListings, getHighDemandAnalytics: fetchAnalytics } = useListingStore();
	const { getSavedSearches, savedSearches } = useSavedSearchStore();
	const [userListings, setUserListings] = useState([]);
	const [analytics, setAnalytics] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const userListingsData = await fetchUserListings();
				setUserListings(userListingsData?.listings || []);

				const analyticsData = await fetchAnalytics();
				setAnalytics(analyticsData);

				// Fetch saved searches count
				await getSavedSearches();
			} catch (error) {
				console.error("Error fetching dashboard data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleLogout = async () => {
		await logout();
		navigate("/");
	};

	const totalViews = userListings.reduce((sum, listing) => sum + (listing.views || 0), 0);
	const activeListings = userListings.filter(l => l.status === 'active' || l.available).length;

	const tierThresholds = {
		"Seed": 100,
		"Sprout": 500,
		"Sapling": 1500,
		"Oak": 5000,
		"Gaia": 10000
	};
	const nextTierPoints = tierThresholds[user.ecoTier] || 10000;
	const progressPercent = Math.min(100, ((user.ecoPoints || 0) / nextTierPoints) * 100);

	const statCards = [
		{ label: "Eco Points", value: user.ecoPoints || 0, icon: Leaf, color: "from-green-400 to-emerald-600", link: "/leaderboard" },
		{ label: "My Listings", value: userListings.length, icon: Package, color: "from-blue-400 to-cyan-600", link: "/my-listings" },
		{ label: "Total Views", value: totalViews, icon: Eye, color: "from-purple-400 to-pink-600", link: "/analytics" },
		{ label: "Saved Searches", value: savedSearches.length, icon: Search, color: "from-teal-400 to-blue-600", link: "/saved-searches" },
	];

	const quickActions = [
		{ name: "Sell Parts", path: "/create-listing", icon: PlusCircle, color: "bg-green-600 hover:bg-green-700" },
		{ name: "Browse Marketplace", path: "/marketplace", icon: ShoppingCart, color: "bg-blue-600 hover:bg-blue-700" },
		{ name: "Saved Searches", path: "/saved-searches", icon: Search, color: "bg-teal-600 hover:bg-teal-700" },
		{ name: "Recycle Items", path: "/recycle/submit", icon: Recycle, color: "bg-purple-600 hover:bg-purple-700" },
	];

	return (
		<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className='min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8 px-4'>
			<div className='max-w-7xl mx-auto'>
				{/* Welcome Header */}
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='mb-8'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
						<div>
							<h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2'>Welcome back, {user.name}! 👋</h1>
							<p className='text-gray-600 dark:text-gray-400'>Manage your listings and track your eco-impact</p>
						</div>
						<div className='flex items-center gap-3'>
							<TierBadge tier={user.ecoTier} />
							<Link to='/marketplace' className='px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition duration-200 flex items-center gap-2'>
								<ShoppingCart size={20} />
								Browse Marketplace
							</Link>
						</div>
					</div>
				</motion.div>

				{/* Stats Grid */}
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
					{statCards.map((stat, index) => (
						<motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'>
							<div className='flex items-center justify-between mb-4'>
								<div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}><stat.icon size={24} className='text-white' /></div>
								<ArrowUpRight size={20} className='text-gray-500 dark:text-gray-400' />
							</div>
							<h3 className='text-3xl font-bold text-gray-900 dark:text-white mb-1'>{stat.value}</h3>
							<p className='text-gray-600 dark:text-gray-400 text-sm mb-3'>{stat.label}</p>
							<Link to={stat.link} className='text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center gap-1'>View Details <ArrowRight size={14} /></Link>
						</motion.div>
					))}
				</div>

				{/* Quick Actions */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className='bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-700 mb-8'>
					<h2 className='text-2xl font-bold text-white mb-4'>Quick Actions</h2>
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
						{quickActions.map((action) => (
							<Link key={action.name} to={action.path} className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition duration-200 hover:scale-105`}>
								<action.icon size={28} />
								<span className='text-sm font-semibold'>{action.name}</span>
							</Link>
						))}
					</div>
				</motion.div>

				<div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8'>
					{/* Eco Points Progress */}
					<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Eco Status</h2>
							<Trophy className='text-yellow-500' size={24} />
						</div>
						<div className='flex items-center justify-between mb-4'>
							<TierBadge tier={user.ecoTier} />
							<span className='text-4xl font-bold text-gray-900 dark:text-white'>{user.ecoPoints || 0}</span>
						</div>
						<div className='space-y-2 mb-4'>
							<div className='h-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
								<motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1, delay: 0.6 }} className='h-full bg-gradient-to-r from-green-400 to-emerald-600' />
							</div>
							<div className='flex justify-between text-xs text-gray-600 dark:text-gray-400'>
								<span>{user.ecoTier}</span>
								<span>{user.ecoTier === "Gaia" ? "Max Tier" : `Next: ${user.ecoTier === "Seed" ? "Sprout" : user.ecoTier === "Sprout" ? "Sapling" : user.ecoTier === "Sapling" ? "Oak" : "Gaia"}`}</span>
							</div>
						</div>
						<Link to='/leaderboard' className='flex items-center justify-center gap-2 w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg text-gray-900 dark:text-white font-semibold transition duration-200 mb-2'>
							<Trophy size={18} className='text-yellow-500' />
							View Leaderboard
						</Link>
						<Link to='/recycle/my-submissions' className='flex items-center justify-center gap-2 w-full py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-semibold transition duration-200'>
							<Recycle size={18} />
							My Submissions
						</Link>
					</motion.div>

					{/* Recent Listings */}
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 lg:col-span-2'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Your Recent Listings</h2>
							<Link to='/my-listings' className='text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center gap-1'>View All <ArrowRight size={14} /></Link>
						</div>
						{loading ? (<div className='text-center py-8 text-gray-600 dark:text-gray-400'>Loading...</div>) : userListings.length === 0 ? (
							<div className='text-center py-8'>
								<Package size={48} className='mx-auto text-gray-400 dark:text-gray-600 mb-3' />
								<p className='text-gray-600 dark:text-gray-400 mb-4'>No listings yet</p>
								<Link to='/create-listing' className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition duration-200'>Create Your First Listing</Link>
							</div>
						) : (
							<div className='space-y-3'>
								{userListings.slice(0, 5).map((listing) => (
									<Link key={listing._id} to={`/listing/${listing._id}`} className='block p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition duration-200'>
										<div className='flex items-start justify-between'>
											<div className='flex-1'>
												<h3 className='text-gray-900 dark:text-white font-semibold mb-1'>{listing.title}</h3>
												<p className='text-gray-600 dark:text-gray-400 text-sm mb-2'>{listing.category} • {listing.condition}</p>
												<div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500'>
													<span className='flex items-center gap-1'><Eye size={12} />{listing.views || 0} views</span>
													<span>Created {formatDate(listing.createdAt)}</span>
												</div>
											</div>
											<div className='flex items-center gap-2'>
												{listing.available && (<span className='px-3 py-1 bg-green-600 text-white text-xs rounded-full'>Active</span>)}
											</div>
										</div>
									</Link>
								))}
							</div>
						)}
					</motion.div>
				</div>

				{/* High Demand Categories */}
				{analytics && analytics.highDemandCategories && analytics.highDemandCategories.length > 0 && (
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-2xl font-bold text-gray-900 dark:text-white'>High Demand Categories</h2>
							<Link to='/analytics' className='text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center gap-1'>View Analytics <ArrowRight size={14} /></Link>
						</div>
						<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
							{analytics.highDemandCategories.slice(0, 4).map((category, index) => (
								<motion.div key={category._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + index * 0.1 }} className='bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center'>
									<div className='text-3xl font-bold text-green-600 dark:text-green-400 mb-1'>{category.count}</div>
									<div className='text-gray-900 dark:text-white font-semibold mb-1'>{category._id}</div>
									<div className='text-gray-600 dark:text-gray-400 text-xs'>Active Listings</div>
								</motion.div>
							))}
						</div>
					</motion.div>
				)}

				{/* Saved Searches Widget */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8'>
					<div className='flex items-center justify-between mb-4'>
						<h2 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
							<Search className='text-green-600 dark:text-green-400' size={24} />
							Saved Searches
						</h2>
						<Link to='/saved-searches' className='text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center gap-1'>Manage <ArrowRight size={14} /></Link>
					</div>
					{savedSearches.length === 0 ? (
						<div className='text-center py-6'>
							<Search size={48} className='mx-auto text-gray-400 dark:text-gray-600 mb-3' />
							<p className='text-gray-600 dark:text-gray-400 mb-4'>No saved searches yet</p>
							<Link to='/marketplace' className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition duration-200'>Browse Marketplace</Link>
						</div>
					) : (
						<div className='space-y-3'>
							{savedSearches.slice(0, 3).map((search) => (
								<div key={search._id} className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg'>
									<div className='flex items-start justify-between'>
										<div className='flex-1'>
											<h3 className='text-gray-900 dark:text-white font-semibold mb-1 flex items-center gap-2'>
												{search.name || "Untitled Search"}
												{search.notify && <Bell size={14} className='text-green-600 dark:text-green-400' />}
											</h3>
											{search.query && <p className='text-gray-600 dark:text-gray-400 text-sm'>"{search.query}"</p>}
											<div className='flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-500'>
												{search.filters?.category && (
													<span className='px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded'>{search.filters.category}</span>
												)}
												{search.geo && (
													<span className='px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded'>{search.geo.radiusKm}km radius</span>
												)}
											</div>
										</div>
									</div>
								</div>
							))}
							{savedSearches.length > 3 && (
								<Link to='/saved-searches' className='block text-center text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium py-2'>
									View {savedSearches.length - 3} more saved search{savedSearches.length - 3 !== 1 ? 'es' : ''}
								</Link>
							)}
						</div>
					)}
				</motion.div>

				{/* Account Info */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8'>
					<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>Account Information</h2>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg'>
							<p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Email</p>
							<p className='text-gray-900 dark:text-white font-semibold'>{user.email}</p>
						</div>
						<div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg'>
							<p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Account Type</p>
							<p className='text-gray-900 dark:text-white font-semibold capitalize'>{user.userType || 'Individual'}</p>
						</div>
						<div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg'>
							<p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Member Since</p>
							<p className='text-gray-900 dark:text-white font-semibold'>{new Date(user.createdAt).toLocaleDateString()}</p>
						</div>
						<div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg'>
							<p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Last Login</p>
							<p className='text-gray-900 dark:text-white font-semibold'>{formatDate(user.lastLogin)}</p>
						</div>
					</div>
				</motion.div>

				{/* Logout Button */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.0 }}>
					<motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleLogout} className='w-full py-4 px-6 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-lg shadow-lg hover:from-red-600 hover:to-red-700 transition duration-200'>
						Logout
					</motion.button>
				</motion.div>
			</div>
		</motion.div>
	);
};

export default IndividualDashboard;
