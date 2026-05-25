import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { formatDate } from "../utils/date";
import TierBadge from "../components/TierBadge";
import { 
  Trophy, Wrench, DollarSign, Clock, CheckCircle, Package, ArrowUpRight, ArrowRight, ShoppingCart, PlusCircle, Eye, Search
} from "lucide-react";
import axios from "axios";

const API_URL = import.meta.env.MODE === 'development' ? 'http://localhost:5000/api/technician-requests' : '/api/technician-requests';

const TechnicianDashboard = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, active: 0, completed: 0, totalEarnings: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestsRes, listingsRes] = await Promise.all([
          axios.get(`${API_URL}`, { withCredentials: true }),
          axios.get('/api/listings/my-listings', { withCredentials: true })
        ]);
        
        const allRequests = requestsRes.data.requests || [];
        setRequests(allRequests);
        setMyListings(listingsRes.data.listings || []);

        // Calculate stats
        const pending = allRequests.filter(r => r.status === 'pending' || r.status === 'open').length;
        const active = allRequests.filter(r => r.status === 'accepted' || r.status === 'started').length;
        const completed = allRequests.filter(r => r.status === 'completed').length;
        const totalEarnings = allRequests
          .filter(r => r.status === 'completed' && r.quotes)
          .reduce((sum, r) => {
            const acceptedQuote = r.quotes?.find(q => q.technicianId === user._id && q.status === 'accepted');
            return sum + (acceptedQuote?.amount || 0);
          }, 0);

        setStats({ pending, active, completed, totalEarnings });
      } catch (error) {
        console.error("Error fetching technician data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user._id]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const statCards = [
    { label: "Pending Requests", value: stats.pending, icon: Clock, color: "from-yellow-400 to-orange-600", link: "/technician-requests" },
    { label: "Active Jobs", value: stats.active, icon: Wrench, color: "from-blue-400 to-cyan-600", link: "/technician-requests" },
    { label: "Completed", value: stats.completed, icon: CheckCircle, color: "from-green-400 to-emerald-600", link: "/technician-requests" },
    { label: "Total Earnings", value: `$${stats.totalEarnings}`, icon: DollarSign, color: "from-purple-400 to-pink-600", link: "/analytics" },
  ];

  const quickActions = [
    { name: "Find Service Requests", path: "/technician-requests", icon: Search, color: "bg-blue-600 hover:bg-blue-700" },
    { name: "List Services/Parts", path: "/create-listing", icon: PlusCircle, color: "bg-green-600 hover:bg-green-700" },
    { name: "My Listings", path: "/my-listings", icon: Package, color: "bg-purple-600 hover:bg-purple-700" },
    { name: "Browse Marketplace", path: "/marketplace", icon: ShoppingCart, color: "bg-teal-600 hover:bg-teal-700" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className='min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8 px-4'>
      <div className='max-w-7xl mx-auto'>
        {/* Welcome Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='mb-8'>
          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <h1 className='text-4xl font-bold mb-2 text-gray-900 dark:text-white'>
                Welcome, {user.name}! 🔧
              </h1>
              <p className='text-gray-600 dark:text-gray-400'>Manage your repair jobs and service listings</p>
              {user.expertise && (
                <p className='text-cyan-600 dark:text-cyan-400 text-sm mt-1'>Expertise: {user.expertise}</p>
              )}
            </div>
            <div className='flex items-center gap-3'>
              <TierBadge tier={user.ecoTier} />
              {user.roleStatus === 'verified' && (
                <span className='px-3 py-1 bg-green-600 text-white text-sm rounded-full'>✓ Verified Technician</span>
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
          {/* Recent Service Requests */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'><Wrench size={24} className='text-cyan-600 dark:text-cyan-400' />Service Requests</h2>
              <Link to='/technician-requests' className='text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 text-sm font-medium flex items-center gap-1'>View All <ArrowRight size={14} /></Link>
            </div>
            {loading ? (<div className='text-center py-8 text-gray-600 dark:text-gray-400'>Loading...</div>) : requests.length === 0 ? (
              <div className='text-center py-8'>
                <Wrench size={48} className='mx-auto text-gray-400 dark:text-gray-600 mb-3' />
                <p className='text-gray-600 dark:text-gray-400 mb-4'>No service requests yet</p>
                <Link to='/technician-requests' className='px-6 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-semibold transition duration-200'>Find Requests</Link>
              </div>
            ) : (
              <div className='space-y-3'>
                {requests.slice(0, 5).map((request) => (
                  <Link key={request._id} to={`/technician-requests/${request._id}`} className='block p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition duration-200'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='text-gray-900 dark:text-white font-semibold mb-1'>{request.serviceType}</h3>
                        <p className='text-gray-600 dark:text-gray-400 text-sm mb-2'>{request.location}</p>
                        <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500'>
                          <span className='flex items-center gap-1'><Clock size={12} />{request.priority}</span>
                          <span>Created {formatDate(request.createdAt)}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        request.status === 'completed' ? 'bg-green-600 text-white' :
                        request.status === 'accepted' || request.status === 'started' ? 'bg-blue-600 text-white' :
                        'bg-yellow-600 text-white'
                      }`}>{request.status}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>

          {/* My Service Listings */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'><Package size={24} className='text-green-600 dark:text-green-400' />My Service Listings</h2>
              <Link to='/my-listings' className='text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm font-medium flex items-center gap-1'>View All <ArrowRight size={14} /></Link>
            </div>
            {myListings.length === 0 ? (
              <div className='text-center py-8'>
                <Package size={48} className='mx-auto text-gray-400 dark:text-gray-600 mb-3' />
                <p className='text-gray-600 dark:text-gray-400 mb-4'>No listings yet</p>
                <Link to='/create-listing' className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition duration-200'>Create Listing</Link>
              </div>
            ) : (
              <div className='space-y-3'>
                {myListings.slice(0, 5).map((listing) => (
                  <Link key={listing._id} to={`/listing/${listing._id}`} className='block p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition duration-200'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <h3 className='text-gray-900 dark:text-white font-semibold mb-1'>{listing.title}</h3>
                        <p className='text-gray-600 dark:text-gray-400 text-sm mb-2'>{listing.category} • ${listing.price}</p>
                        <div className='flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500'>
                          <span className='flex items-center gap-1'><Eye size={12} />{listing.views || 0} views</span>
                        </div>
                      </div>
                      {listing.available && (<span className='px-3 py-1 bg-green-600 text-white text-xs rounded-full'>Active</span>)}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Eco Status */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Eco Status & Reputation</h2>
            <Trophy className='text-yellow-500' size={24} />
          </div>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center'>
              <p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Eco Points</p>
              <p className='text-2xl font-bold text-green-600 dark:text-green-400'>{user.ecoPoints || 0}</p>
            </div>
            <div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center'>
              <p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Trust Score</p>
              <p className='text-2xl font-bold text-blue-600 dark:text-blue-400'>{user.trustScore || 80}%</p>
            </div>
            <div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center'>
              <p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Eco Tier</p>
              <TierBadge tier={user.ecoTier} />
            </div>
            <div className='p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-center'>
              <p className='text-gray-600 dark:text-gray-400 text-sm mb-1'>Completed Jobs</p>
              <p className='text-2xl font-bold text-purple-600 dark:text-purple-400'>{stats.completed}</p>
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

export default TechnicianDashboard;
