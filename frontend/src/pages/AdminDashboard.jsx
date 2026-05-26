import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Users, 
  Package, 
  RefreshCw, 
  TrendingUp, 
  AlertTriangle, 
  FileText,
  BarChart3,
  Activity,
  Leaf
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAdminStore } from "../store/adminStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const { darkMode } = useTheme();
  const { 
    getComprehensiveStats, 
    getPlatformStats,
    getPendingVerifications,
    runSavedSearchAlertsJob,
    comprehensiveStats, 
    isLoading 
  } = useAdminStore();
  const [isRunningJob, setIsRunningJob] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      await Promise.all([
        getComprehensiveStats(),
        getPlatformStats(),
        getPendingVerifications()
      ]);
    } catch (error) {
      toast.error("Failed to load admin statistics");
    }
  };

  const handleRunAlertsJob = async () => {
    try {
      setIsRunningJob(true);
      const result = await runSavedSearchAlertsJob({
        limitSearches: 200,
        limitListingsPerSearch: 5
      });
      toast.success(`Alerts job completed! Processed ${result.result?.processedSearches || 0} searches`);
    } catch (error) {
      toast.error("Failed to run alerts job");
    } finally {
      setIsRunningJob(false);
    }
  };

  if (isLoading && !comprehensiveStats) {
    return <LoadingSpinner />;
  }

  const stats = comprehensiveStats?.overview || {};
  const pending = comprehensiveStats?.pendingItems || {};
  const recent = comprehensiveStats?.recentActivity?.last30Days || {};

  const quickActions = [
    { 
      title: "Analytics Dashboard", 
      icon: BarChart3, 
      link: "/admin/analytics",
      color: "from-green-500 to-emerald-600",
      description: "View detailed platform analytics"
    },
    { 
      title: "Report Management", 
      icon: AlertTriangle, 
      link: "/admin/reports",
      color: "from-red-500 to-pink-600",
      description: "Moderate content and handle reports"
    },
    { 
      title: "User Management", 
      icon: Users, 
      link: "/admin/users",
      color: "from-blue-500 to-cyan-600",
      description: "Manage users and verifications"
    },
    { 
      title: "Run Alerts Job", 
      icon: Activity, 
      link: "#",
      color: "from-purple-500 to-violet-600",
      description: "Trigger saved search alerts",
      onClick: handleRunAlertsJob,
      loading: isRunningJob
    }
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white' : 'bg-white text-gray-900'} py-8`}>
      <div className='container mx-auto px-4 max-w-7xl'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <h1 className='text-4xl font-bold mb-2 flex items-center'>
            <Activity size={40} className='mr-3 text-green-600 dark:text-green-400' />
            Admin Dashboard
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>Monitor platform performance and manage operations</p>
        </motion.div>

        {/* Key Metrics Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='bg-primary dark:bg-gray-800 rounded-xl border border-green-300 dark:border-green-700 p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <Users size={32} className=' text-background dark:text-green-600 dark:text-green-400' />
              <span className='text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded'>Total</span>
            </div>
            <h3 className='text-3xl font-bold mb-1'>{stats.totalUsers || 0}</h3>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>Total Users</p>
            <div className='mt-3 text-xs text-background dark:text-green-600 dark:text-green-400'>
              +{recent.newUsers || 0} this month
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='bg-primary dark:bg-gray-800 rounded-xl border border-blue-300 dark:border-blue-700 p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <Package size={32} className='text-blue-600 dark:text-blue-400' />
              <span className='text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded'>Active</span>
            </div>
            <h3 className='text-3xl font-bold mb-1'>{stats.activeListings || 0}</h3>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>Active Listings</p>
            <div className='mt-3 text-xs text-blue-600 dark:text-blue-400'>
              +{recent.newListings || 0} this month
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='bg-primary dark:bg-gray-800 rounded-xl border border-purple-300 dark:border-purple-700 p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <RefreshCw size={32} className='text-purple-600 dark:text-purple-400' />
              <span className='text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded'>Completed</span>
            </div>
            <h3 className='text-3xl font-bold mb-1'>{stats.completedExchanges || 0}</h3>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>Completed Exchanges</p>
            <div className='mt-3 text-xs text-purple-600 dark:text-purple-400'>
              +{recent.newExchanges || 0} this month
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className='bg-primary dark:bg-gray-800 rounded-xl border border-yellow-300 dark:border-yellow-700 p-6'
          >
            <div className='flex items-center justify-between mb-4'>
              <TrendingUp size={32} className='text-yellow-600 dark:text-yellow-400' />
              <span className='text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded'>Active</span>
            </div>
            <h3 className='text-3xl font-bold mb-1'>{stats.activeUsers || 0}</h3>
            <p className='text-gray-600 dark:text-gray-400 text-sm'>Active Users</p>
            <div className='mt-3 text-xs text-yellow-600 dark:text-yellow-400'>
              {stats.bannedUsers || 0} banned
            </div>
          </motion.div>
        </div>

        {/* Pending Items Alert */}
        {(pending.reports > 0 || pending.verifications > 0 || pending.disputes > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className='mb-8 p-6 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl border border-orange-700'
          >
            <div className='flex items-start'>
              <AlertTriangle size={24} className='text-orange-400 mr-3 mt-1 flex-shrink-0' />
              <div className='flex-1'>
                <h3 className='text-xl font-bold mb-3 text-orange-400'>Items Requiring Attention</h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  {pending.reports > 0 && (
                    <Link to='/admin/reports?status=pending' className='bg-primary dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700'>
                      <FileText size={20} className='text-orange-600 dark:text-orange-400 mb-2' />
                      <p className='text-2xl font-bold'>{pending.reports}</p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>Pending Reports</p>
                    </Link>
                  )}
                  {pending.verifications > 0 && (
                    <Link to='/admin/users' className='bg-primary dark:bg-gray-800 p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition border border-gray-200 dark:border-gray-700'>
                      <Users size={20} className='text-blue-600 dark:text-blue-400 mb-2' />
                      <p className='text-2xl font-bold'>{pending.verifications}</p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>Pending Verifications</p>
                    </Link>
                  )}
                  {pending.disputes > 0 && (
                    <div className='bg-primary dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700'>
                      <AlertTriangle size={20} className='text-red-600 dark:text-red-400 mb-2' />
                      <p className='text-2xl font-bold'>{pending.disputes}</p>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>Pending Disputes</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className='mb-8'
        >
          <h2 className='text-2xl font-bold mb-4'>Quick Actions</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return action.onClick ? (
                <button
                  key={index}
                  onClick={action.onClick}
                  disabled={action.loading}
                  className={`bg-gradient-to-r ${action.color} p-6 rounded-xl hover:opacity-90 transition transform hover:scale-105 w-full text-left ${action.loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon size={32} className='mb-3' />
                  <h3 className='text-lg font-bold mb-1'>{action.title}</h3>
                  <p className='text-sm opacity-90'>{action.description}</p>
                  {action.loading && <p className='text-xs mt-2'>Running...</p>}
                </button>
              ) : (
                <Link
                  key={index}
                  to={action.link}
                  className={`bg-gradient-to-r ${action.color} p-6 rounded-xl hover:opacity-90 transition transform hover:scale-105`}
                >
                  <Icon size={32} className='mb-3' />
                  <h3 className='text-lg font-bold mb-1'>{action.title}</h3>
                  <p className='text-sm opacity-90'>{action.description}</p>
                </Link>
              );
            })}
          </div>
        </motion.section>

        {/* Additional Insights */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'
          >
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <BarChart3 size={24} className='mr-2 text-green-600 dark:text-green-400' />
              Platform Breakdown
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded'>
                <span className='text-gray-600 dark:text-gray-400'>Total Listings</span>
                <span className='font-bold'>{stats.totalListings || 0}</span>
              </div>
              <div className='flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded'>
                <span className='text-gray-600 dark:text-gray-400'>Total Exchanges</span>
                <span className='font-bold'>{stats.totalExchanges || 0}</span>
              </div>
              <div className='flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded'>
                <span className='text-gray-600 dark:text-gray-400'>Banned Users</span>
                <span className='font-bold text-red-400'>{stats.bannedUsers || 0}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'
          >
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <Leaf size={24} className='mr-2 text-green-600 dark:text-green-400' />
              Sustainability Impact
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded'>
                <span className='text-gray-600 dark:text-gray-400'>Active Users</span>
                <span className='font-bold text-green-400'>{stats.activeUsers || 0}</span>
              </div>
              <div className='flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded'>
                <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className='font-bold text-emerald-400'>
                  {stats.totalExchanges > 0 
                    ? ((stats.completedExchanges / stats.totalExchanges) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <Link 
                to='/admin/analytics'
                className='block text-center mt-4 text-green-400 hover:text-green-300 transition'
              >
                View Full Analytics →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
