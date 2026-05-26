import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Package, Handshake, Star, Recycle, Users, TrendingUp, 
  Calendar, ChevronLeft, ChevronRight, Award, Crown 
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useCommunityStore } from "../store/communityStore";
import LoadingSpinner from "../components/LoadingSpinner";

const ActivityFeedPage = () => {
  const navigate = useNavigate();
  const { 
    activities, 
    activityFeedMeta, 
    communityHighlights,
    loadingActivities,
    activityError,
    getActivityFeed, 
    getCommunityHighlights 
  } = useCommunityStore();

  const [activeTab, setActiveTab] = useState("all");
  const [showHighlights, setShowHighlights] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab, activityFeedMeta.page, showHighlights]);

  const loadData = async () => {
    try {
      if (showHighlights) {
        await getCommunityHighlights();
      } else {
        const filters = {
          page: activityFeedMeta.page,
          limit: 20,
          type: activeTab === "all" ? undefined : activeTab
        };
        console.log('Loading activity feed with filters:', filters);
        await getActivityFeed(filters);
      }
    } catch (error) {
      console.error('Error loading activity feed:', error);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= activityFeedMeta.totalPages) {
      getActivityFeed({
        page: newPage,
        limit: 20,
        type: activeTab === "all" ? undefined : activeTab
      });
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case "listing_created":
      case "listing":
        return <Package className="text-blue-400" size={20} />;
      case "exchange_completed":
        return <Handshake className="text-green-400" size={20} />;
      case "review_received":
      case "review":
        return <Star className="text-yellow-400" size={20} />;
      case "recycling_completed":
        return <Recycle className="text-purple-400" size={20} />;
      default:
        return <Calendar className="text-gray-400" size={20} />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const tabs = [
    { id: "all", name: "All Activity", icon: Calendar },
    { id: "listing", name: "Listings", icon: Package },
    { id: "exchange", name: "Exchanges", icon: Handshake },
    { id: "review", name: "Reviews", icon: Star },
    { id: "recycling", name: "Recycling", icon: Recycle },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Activity Feed</h1>
            <p className="text-gray-600 dark:text-gray-300">Track your community activity and engagement</p>
          </div>

          {/* Toggle between Personal Feed and Community Highlights */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setShowHighlights(false)}
              className={`px-6 py-3 rounded-lg font-bold transition duration-300 ${
                !showHighlights
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              My Activity
            </button>
            <button
              onClick={() => {
                setShowHighlights(true);
                getCommunityHighlights();
              }}
              className={`px-6 py-3 rounded-lg font-bold transition duration-300 flex items-center gap-2 ${
                showHighlights
                  ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              <Users size={18} />
              Community Highlights
            </button>
          </div>

          {/* Personal Activity Feed */}
          {!showHighlights && (
            <>
              {/* Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      getActivityFeed({
                        page: 1,
                        limit: 20,
                        type: tab.id === "all" ? undefined : tab.id
                      });
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition duration-300 ${
                      activeTab === tab.id
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.name}
                  </button>
                ))}
              </div>

              {/* Error Message */}
              {activityError && (
                <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl p-6 mb-6 text-center">
                  <p className="text-red-700 dark:text-red-400 font-semibold">{activityError}</p>
                  <button
                    onClick={loadData}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Activity List */}
              {loadingActivities ? (
                <LoadingSpinner size="md" fullScreen={false} text="Loading activities..." />
              ) : activities.length === 0 ? (
                <div className="bg-primary dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
                  <Calendar size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">No activities yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start engaging with the community to see your activities here
                  </p>
                  <button
                    onClick={() => navigate("/marketplace")}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300"
                  >
                    Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {console.log('Rendering activities:', activities.length, 'items')}
                  {activities.map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-green-600 dark:hover:border-green-600 transition duration-300"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-bold text-lg mb-1">{activity.title}</h3>
                              <p className="text-gray-700 dark:text-gray-300 mb-2">{activity.description}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-500">
                                {formatTimestamp(activity.timestamp)}
                              </p>
                            </div>
                            {activity.data?.otherUserId && (
                              <Link
                                to={`/profile/${activity.data.otherUserId}`}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition duration-300"
                              >
                                View Profile
                              </Link>
                            )}
                          </div>
                          {activity.data?.image && (
                            <img
                              src={activity.data.image}
                              alt={activity.data.title}
                              className="mt-3 rounded-lg max-h-48 object-cover"
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {activityFeedMeta.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={() => handlePageChange(activityFeedMeta.page - 1)}
                    disabled={activityFeedMeta.page === 1}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-700 transition duration-300 flex items-center gap-2 text-gray-900 dark:text-white"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <span className="text-gray-700 dark:text-gray-300">
                    Page {activityFeedMeta.page} of {activityFeedMeta.totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(activityFeedMeta.page + 1)}
                    disabled={activityFeedMeta.page === activityFeedMeta.totalPages}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-700 transition duration-300 flex items-center gap-2 text-gray-900 dark:text-white"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Community Highlights */}
          {showHighlights && communityHighlights && (
            <div className="space-y-8">
              {/* Top Contributors */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="text-green-400" />
                  Top Contributors This Week
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communityHighlights.topContributors?.map((contributor, index) => (
                    <Link
                      key={contributor.userId}
                      to={`/profile/${contributor.userId}`}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-green-400">#{index + 1}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">{contributor.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {contributor.listingCount} listings
                          </p>
                        </div>
                        {contributor.ecoTier && (
                          <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                            {contributor.ecoTier}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Recent Exchanges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Handshake className="text-blue-400" />
                  Recent Successful Exchanges
                </h2>
                <div className="space-y-3">
                  {communityHighlights.recentExchanges?.map((exchange) => (
                    <div key={exchange.exchangeId} className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-bold text-gray-900 dark:text-white">{exchange.requester}</span>
                        {" ↔ "}
                        <span className="font-bold text-gray-900 dark:text-white">{exchange.receiver}</span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Item: {exchange.listing} • {formatTimestamp(exchange.completedAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Top Recyclers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Recycle className="text-purple-400" />
                  Top Recyclers This Month
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communityHighlights.topRecyclers?.map((recycler, index) => (
                    <Link
                      key={recycler.userId}
                      to={`/profile/${recycler.userId}`}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-bold text-purple-400">#{index + 1}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">{recycler.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {recycler.recyclingCount} items • {recycler.totalWeight}kg
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>

              {/* Trusted Users */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Award className="text-yellow-400" />
                  Most Trusted Community Members
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {communityHighlights.trustedUsers?.map((trustedUser, index) => (
                    <Link
                      key={trustedUser._id}
                      to={`/profile/${trustedUser._id}`}
                      className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300"
                    >
                      <div className="flex items-center gap-3">
                        <Crown className="text-yellow-400" size={24} />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white">{trustedUser.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Trust Score: {trustedUser.trustScore} • {trustedUser.totalReviews} reviews
                          </p>
                        </div>
                        <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded-full">
                          {trustedUser.ecoTier}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ActivityFeedPage;
