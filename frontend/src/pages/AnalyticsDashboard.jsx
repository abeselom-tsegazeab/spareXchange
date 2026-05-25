import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Package, 
  RefreshCw,
  Search,
  Star,
  Leaf,
  Calendar
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer 
} from "recharts";
import { useAdminStore } from "../store/adminStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];

const AnalyticsDashboard = () => {
  const { 
    getComprehensiveStats,
    getTimeSeriesTrends,
    getUserEngagement,
    getExchangePerformance,
    getCategoryPerformance,
    getSustainabilityMetrics,
    getSearchAnalytics,
    getReviewAnalytics,
    comprehensiveStats,
    trends,
    engagement,
    exchangePerformance,
    categoryPerformance,
    sustainabilityMetrics,
    searchAnalytics,
    reviewAnalytics,
    isLoading
  } = useAdminStore();

  const [trendPeriod, setTrendPeriod] = useState("daily");
  const [trendDays, setTrendDays] = useState(30);

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  useEffect(() => {
    loadTrends();
  }, [trendPeriod, trendDays]);

  const loadAllAnalytics = async () => {
    try {
      await Promise.all([
        getComprehensiveStats(),
        getUserEngagement(),
        getExchangePerformance(),
        getCategoryPerformance(),
        getSustainabilityMetrics(),
        getSearchAnalytics(),
        getReviewAnalytics()
      ]);
    } catch (error) {
      toast.error("Failed to load analytics");
    }
  };

  const loadTrends = async () => {
    try {
      await getTimeSeriesTrends(trendPeriod, trendDays);
    } catch (error) {
      toast.error("Failed to load trends");
    }
  };

  if (isLoading && !comprehensiveStats) {
    return <LoadingSpinner />;
  }

  // Prepare trend data
  const prepareTrendData = () => {
    if (!trends) return [];
    
    const userMap = new Map(trends.users.map(u => [u._id, u.count]));
    const listingMap = new Map(trends.listings.map(l => [l._id, l.count]));
    const exchangeMap = new Map(trends.exchanges.map(e => [e._id, e.count]));
    
    const allDates = [...new Set([
      ...trends.users.map(u => u._id),
      ...trends.listings.map(l => l._id),
      ...trends.exchanges.map(e => e._id)
    ])].sort();

    return allDates.map(date => ({
      date,
      users: userMap.get(date) || 0,
      listings: listingMap.get(date) || 0,
      exchanges: exchangeMap.get(date) || 0
    }));
  };

  // Prepare category data
  const prepareCategoryData = () => {
    if (!categoryPerformance?.listingsByCategory) return [];
    return categoryPerformance.listingsByCategory
      .slice(0, 10)
      .map(cat => ({
        name: cat._id || "Uncategorized",
        count: cat.count
      }));
  };

  // Prepare rating distribution
  const prepareRatingData = () => {
    if (!reviewAnalytics?.ratingDistribution) return [];
    return reviewAnalytics.ratingDistribution
      .map(r => ({
        rating: `${r._id} Stars`,
        count: r.count
      }))
      .reverse();
  };

  // Prepare status distribution for pie chart
  const prepareStatusData = (data) => {
    if (!data) return [];
    return data.map(item => ({
      name: item._id || "Unknown",
      value: item.count
    }));
  };

  const trendData = prepareTrendData();
  const categoryData = prepareCategoryData();
  const ratingData = prepareRatingData();
  const exchangeStatusData = prepareStatusData(exchangePerformance?.statusDistribution);

  return (
    <div className='min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8'>
      <div className='container mx-auto px-4 max-w-7xl'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8'
        >
          <h1 className='text-4xl font-bold mb-2 flex items-center'>
            <BarChart3 size={40} className='mr-3 text-green-600 dark:text-green-400' />
            Analytics Dashboard
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>Comprehensive platform insights and performance metrics</p>
        </motion.div>

        {/* Trend Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6 p-4 bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'
        >
          <div className='flex items-center gap-4 flex-wrap'>
            <Calendar size={20} className='text-green-600 dark:text-green-400' />
            <span className='font-bold'>Trend Period:</span>
            <div className='flex gap-2'>
              {[
                { label: "Daily", period: "daily", days: 30 },
                { label: "Weekly", period: "weekly", days: 84 },
                { label: "Monthly", period: "monthly", days: 365 }
              ].map(option => (
                <button
                  key={option.period}
                  onClick={() => {
                    setTrendPeriod(option.period);
                    setTrendDays(option.days);
                  }}
                  className={`px-4 py-2 rounded-lg transition ${
                    trendPeriod === option.period
                      ? 'bg-green-400 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Trends Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8 p-6 bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'
        >
          <h2 className='text-2xl font-bold mb-4 flex items-center'>
            <TrendingUp size={24} className='mr-2 text-green-600 dark:text-green-400' />
            Platform Trends
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="users" stroke="#10b981" strokeWidth={2} name="Users" />
              <Line type="monotone" dataKey="listings" stroke="#3b82f6" strokeWidth={2} name="Listings" />
              <Line type="monotone" dataKey="exchanges" stroke="#8b5cf6" strokeWidth={2} name="Exchanges" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Analytics Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8'>
          {/* Category Performance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='p-6 bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'
          >
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <Package size={24} className='mr-2 text-blue-600 dark:text-blue-400' />
              Top Categories
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Rating Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='p-6 bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'
          >
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <Star size={24} className='mr-2 text-yellow-600 dark:text-yellow-400' />
              Rating Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ratingData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {ratingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Exchange Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className='p-6 bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'
          >
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <RefreshCw size={24} className='mr-2 text-purple-600 dark:text-purple-400' />
              Exchange Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={exchangeStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {exchangeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Key Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='p-6 bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'
          >
            <h3 className='text-xl font-bold mb-4'>Key Performance Metrics</h3>
            <div className='space-y-4'>
              <div className='p-4 bg-gray-900/50 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-gray-400 flex items-center'>
                    <Users size={18} className='mr-2' /> User Retention Rate
                  </span>
                  <span className='text-2xl font-bold text-green-400'>
                    {engagement?.retentionMetrics?.retentionRate || "0%"}
                  </span>
                </div>
              </div>
              <div className='p-4 bg-gray-900/50 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-gray-400 flex items-center'>
                    <RefreshCw size={18} className='mr-2' /> Exchange Completion Rate
                  </span>
                  <span className='text-2xl font-bold text-blue-400'>
                    {exchangePerformance?.completionRate || "0%"}
                  </span>
                </div>
              </div>
              <div className='p-4 bg-gray-900/50 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-gray-400 flex items-center'>
                    <Search size={18} className='mr-2' /> Search Success Rate
                  </span>
                  <span className='text-2xl font-bold text-purple-400'>
                    {searchAnalytics?.searchSuccessRate || "0%"}
                  </span>
                </div>
              </div>
              <div className='p-4 bg-gray-900/50 rounded-lg'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-gray-400 flex items-center'>
                    <Star size={18} className='mr-2' /> Average Rating
                  </span>
                  <span className='text-2xl font-bold text-yellow-400'>
                    {reviewAnalytics?.avgRating?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sustainability & Search Analytics */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Sustainability Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='p-6 bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'
          >
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <Leaf size={24} className='mr-2 text-green-600 dark:text-green-400' />
              Sustainability Impact
            </h3>
            <div className='space-y-3'>
              <div className='flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded'>
                <span className='text-gray-600 dark:text-gray-400'>Total Recycling Submissions</span>
                <span className='font-bold'>{sustainabilityMetrics?.recyclingStats?.totalSubmissions || 0}</span>
              </div>
              <div className='flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded'>
                <span className='text-gray-600 dark:text-gray-400'>Approved Submissions</span>
                <span className='font-bold text-green-400'>{sustainabilityMetrics?.recyclingStats?.approvedSubmissions || 0}</span>
              </div>
              <div className='flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded'>
                <span className='text-gray-600 dark:text-gray-400'>Total Eco-Points Awarded</span>
                <span className='font-bold text-emerald-400'>{sustainabilityMetrics?.ecoPoints?.totalEcoPoints || 0}</span>
              </div>
              <div className='flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded'>
                <span className='text-gray-600 dark:text-gray-400'>Total Weight Recycled (kg)</span>
                <span className='font-bold text-blue-400'>{sustainabilityMetrics?.recyclingStats?.totalWeightRecycled || 0}</span>
              </div>
            </div>
          </motion.div>

          {/* Search Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className='p-6 bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'
          >
            <h3 className='text-xl font-bold mb-4 flex items-center'>
              <Search size={24} className='mr-2 text-cyan-600 dark:text-cyan-400' />
              Search Insights
            </h3>
            <div className='space-y-3 mb-4'>
              <div className='flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded'>
                <span className='text-gray-600 dark:text-gray-400'>Total Searches</span>
                <span className='font-bold'>{searchAnalytics?.totalSearches || 0}</span>
              </div>
              <div className='flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-900/50 rounded'>
                <span className='text-gray-600 dark:text-gray-400'>Avg Results per Search</span>
                <span className='font-bold text-cyan-400'>{searchAnalytics?.avgResultsPerSearch?.toFixed(1) || 0}</span>
              </div>
            </div>
            {searchAnalytics?.unmetDemand?.length > 0 && (
              <div>
                <h4 className='font-bold mb-2 text-orange-600 dark:text-orange-400'>Top Unmet Demands</h4>
                <div className='space-y-2'>
                  {searchAnalytics.unmetDemand.slice(0, 5).map((item, index) => (
                    <div key={index} className='flex justify-between items-center p-2 bg-orange-900/20 rounded'>
                      <span className='capitalize'>{item._id}</span>
                      <span className='text-sm font-bold text-orange-400'>{item.count} searches</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
