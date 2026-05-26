import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { formatDate } from "../utils/date";
import TierBadge from "../components/TierBadge";
import { 
  Trophy, Package, DollarSign, TrendingUp, ArrowUpRight, ArrowRight, ShoppingCart, PlusCircle, Eye, Users, List
} from "lucide-react";
import { useListingStore } from "../store/listingStore";

const GarageDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { getUserListings: fetchUserListings, getHighDemandAnalytics: fetchAnalytics } = useListingStore();
  const [myListings, setMyListings] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalListings: 0, activeListings: 0, totalViews: 0, totalRevenue: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [listingsData, analyticsData] = await Promise.all([
          fetchUserListings(),
          fetchAnalytics()
        ]);
        
        const listings = listingsData?.listings || [];
        setMyListings(listings);
        setAnalytics(analyticsData);

        // Calculate stats
        const activeListings = listings.filter(l => l.available || l.status === 'active').length;
        const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
        const totalRevenue = listings
          .filter(l => l.status === 'sold' || l.status === 'exchanged')
          .reduce((sum, l) => sum + (l.price || 0), 0);

        setStats({ totalListings: listings.length, activeListings, totalViews, totalRevenue });
      } catch (error) {
        console.error("Error fetching garage data:", error);
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

  const statCards = [
    { label: "Total Listings", value: stats.totalListings, icon: Package, color: "from-blue-400 to-cyan-600", link: "/my-listings" },
    { label: "Active Listings", value: stats.activeListings, icon: Eye, color: "from-green-400 to-emerald-600", link: "/my-listings" },
    { label: "Total Views", value: stats.totalViews, icon: Users, color: "from-purple-400 to-pink-600", link: "/analytics" },
    { label: "Revenue", value: `$${stats.totalRevenue}`, icon: DollarSign, color: "from-orange-400 to-red-600", link: "/analytics" },
  ];

  const quickActions = [
    { name: "Bulk Upload", path: "/bulk-upload", icon: List, color: "bg-blue-600 hover:bg-blue-700" },
    { name: "Create Listing", path: "/create-listing", icon: PlusCircle, color: "bg-green-600 hover:bg-green-700" },
    { name: "My Inventory", path: "/my-listings", icon: Package, color: "bg-purple-600 hover:bg-purple-700" },
    { name: "Marketplace", path: "/marketplace", icon: ShoppingCart, color: "bg-teal-600 hover:bg-teal-700" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className='min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8 px-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='mb-8'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <h1 className='text-4xl font-bold mb-2 text-gray-900 dark:text-white'>
                Welcome, {user.name}! 🏪
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>Manage your garage inventory and sales</p>
            </div>
            <div className='flex items-center gap-3'>
              <TierBadge tier={user.ecoTier} />
              {user.roleStatus === 'verified' && (
                <span className='px-3 py-1 bg-green-600 text-white text-sm rounded-full'>✓ Verified Garage</span>
              )}
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
              <h3 className='text-3xl font-bold mb-1 text-gray-900 dark:text-white'>{stat.value}</h3>
              <p className='text-gray-600 dark:text-gray-400 text-sm mb-3'>{stat.label}</p>
              <Link to={stat.link} className='text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm font-medium flex items-center gap-1'>View Details <ArrowRight size={14} /></Link>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8'>
          <h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>Quick Actions</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            {quickActions.map((action) => (
              <Link key={action.name} to={action.path} className={`${action.color} text-white rounded-lg p-4 flex flex-col items-center justify-center gap-2 transition duration-200 hover:scale-105`}>
                <action.icon size={28} />
                <span className='text-sm font-semibold'>{action.name}</span>
              </Link>
            ))}
          </div>
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
          {/* Recent Inventory */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'><Package size={24} className='text-blue-600 dark:text-blue-400' />Recent Inventory</h2>
              <Link to='/my-listings' className='text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1'>View All <ArrowRight size={14} /></Link>
            </div>
            {loading ? (<div className='text-center py-8 text-gray-600 dark:text-gray-400'>Loading...</div>) : myListings.length === 0 ? (
              <div className='text-center py-8'>
                <Package size={48} className='mx-auto text-gray-400 dark:text-gray-600 mb-3' />
                <p className='text-gray-600 dark:text-gray-400 mb-4'>No inventory yet</p>
                <Link to='/bulk-upload' className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition duration-200'>Bulk Upload</Link>
              </div>
            ) : (
              <div className='space-y-3'>
                {myListings.slice(0, 5).map((listing) => (
                  <Link key={listing._id} to={`/listing/${listing._id}`} className='block p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition duration-200'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='text-gray-900 dark:text-white font-semibold mb-1'>{listing.title}</h3>
                        <p className='text-gray-600 dark:text-gray-400 text-sm mb-2'>{listing.category} • {listing.condition} • ${listing.price}</p>
                        <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500'>
                          <span className='flex items-center gap-1'><Eye size={12} />{listing.views || 0} views</span>
                          <span>Created {formatDate(listing.createdAt)}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        listing.status === 'sold' ? 'bg-blue-600 text-white' :
                        listing.available ? 'bg-green-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>{listing.status === 'sold' ? 'Sold' : listing.available ? 'Active' : 'Pending'}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* High Demand Categories */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'><TrendingUp size={24} className='text-green-600 dark:text-green-400' />High Demand Categories</h2>
              <Link to='/analytics' className='text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center gap-1'>View Analytics <ArrowRight size={14} /></Link>
            </div>
            {analytics && analytics.highDemandCategories && analytics.highDemandCategories.length > 0 ? (
              <div className='grid grid-cols-2 gap-4'>
                {analytics.highDemandCategories.slice(0, 4).map((category, index) => (
                  <motion.div key={category._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + index * 0.1 }} className='bg-gray-100 dark:bg-gray-700 rounded-lg p-4 text-center'>
                    <div className='text-3xl font-bold text-green-600 dark:text-green-400 mb-1'>{category.count}</div>
                    <div className='text-gray-900 dark:text-white font-semibold mb-1'>{category._id}</div>
                    <div className='text-gray-600 dark:text-gray-400 text-xs'>Active Listings</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8 text-gray-600 dark:text-gray-400'>Loading analytics...</div>
            )}
          </motion.div>
        </div>

        {/* Business Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Business Performance</h2>
            <Trophy className='text-yellow-500' size={24} />
          </div>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center'>
              <p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Eco Points</p>
              <p className='text-2xl font-bold text-green-600 dark:text-green-400'>{user.ecoPoints || 0}</p>
            </div>
            <div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center'>
              <p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Eco Tier</p>
              <TierBadge tier={user.ecoTier} />
            </div>
            <div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center'>
              <p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Trust Score</p>
              <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{user.trustScore || 80}%</p>
            </div>
            <div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center'>
              <p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Total Sales</p>
              <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>{myListings.filter(l => l.status === 'sold').length}</p>
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

export default GarageDashboard;
