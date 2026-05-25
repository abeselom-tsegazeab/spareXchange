import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, MapPin, Star, Package, Handshake, 
  ShieldCheck, Award, Clock, ChevronLeft,
  MessageSquare, Star as StarIcon, Shield, Mail, Phone, Calendar, AlertTriangle
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useCommunityStore } from "../store/communityStore";
import { useAuthStore } from "../store/authStore";

const UserProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const { 
    userProfile, 
    userListings, 
    userListingsMeta,
    userReviews,
    userReviewsMeta,
    userStats,
    loadingProfile, 
    getPublicProfile, 
    getUserListings,
    getUserReviews,
    getUserStats,
    clearProfileData
  } = useCommunityStore();

  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadProfileData();
    return () => clearProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    await getPublicProfile(userId);
    await getUserStats(userId);
    // Preload listings to get total count for header
    await getUserListings(userId, { page: 1, limit: 10 });
  };

  const handleListingsPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= userListingsMeta.totalPages) {
      getUserListings(userId, { page: newPage, limit: 10 });
    }
  };

  const handleReviewsPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= userReviewsMeta.totalPages) {
      getUserReviews(userId, { page: newPage, limit: 10 });
    }
  };

  useEffect(() => {
    if (activeTab === "listings") {
      getUserListings(userId, { page: 1, limit: 10 });
    } else if (activeTab === "reviews") {
      getUserReviews(userId, { page: 1, limit: 10 });
    }
  }, [activeTab]);

  if (loadingProfile && !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center">
        <div className="text-center text-white">
          <User size={64} className="mx-auto text-gray-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-gray-400 mb-4">This user profile doesn't exist or is no longer active</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", name: "Overview", icon: User },
    { id: "listings", name: "Listings", icon: Package },
    { id: "reviews", name: "Reviews", icon: Star },
    { id: "stats", name: "Statistics", icon: Award },
    ...(currentUser?.userType === "admin" || currentUser?.permissions?.includes("admin")
      ? [{ id: "admin", name: "Admin View", icon: Shield }]
      : []),
  ];

  const getEcoTierColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case "bronze": return "from-orange-600 to-orange-700";
      case "silver": return "from-gray-400 to-gray-500";
      case "gold": return "from-yellow-500 to-yellow-600";
      case "platinum": return "from-blue-400 to-blue-500";
      default: return "from-green-500 to-emerald-600";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition duration-300"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          {/* Profile Header */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8 border border-gray-700">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-r ${getEcoTierColor(userProfile.sustainability?.ecoTier)} flex items-center justify-center`}>
                {userProfile.profilePicture ? (
                  <img
                    src={userProfile.profilePicture}
                    alt={userProfile.name}
                    className="w-32 h-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-5xl font-bold text-white">
                    {userProfile.name.charAt(0)}
                  </span>
                )}
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold mb-2 flex items-center justify-center md:justify-start gap-2">
                  {userProfile.name}
                  {userProfile.trust?.isVerified && (
                    <ShieldCheck className="text-blue-400" size={24} />
                  )}
                </h1>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
                  {userProfile.location && (
                    <div className="flex items-center text-gray-300">
                      <MapPin size={16} className="mr-2" />
                      <span>{userProfile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-300">
                    <Clock size={16} className="mr-2" />
                    <span>Member for {userProfile.daysAsMember} days</span>
                  </div>
                  <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm">
                    {userProfile.userType}
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">
                      {userListingsMeta.totalListings || userProfile.stats?.activeListings || 0}
                    </div>
                    <div className="text-sm text-gray-400">Total Listings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">
                      {userProfile.stats?.completedExchanges || 0}
                    </div>
                    <div className="text-sm text-gray-400">Exchanges</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center">
                      <StarIcon size={20} className="text-yellow-400 fill-current mr-1" />
                      <span className="text-2xl font-bold">
                        {userProfile.stats?.averageRating || "N/A"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {userProfile.stats?.totalReviews || 0} Reviews
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {userProfile.sustainability?.ecoPoints || 0}
                    </div>
                    <div className="text-sm text-gray-400">Eco Points</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {currentUser && currentUser._id !== userId && (
                  <>
                    <Link
                      to={`/messages/${userId}`}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-300"
                    >
                      <MessageSquare size={18} />
                      Send Message
                    </Link>
                    <Link
                      to={`/reviews/${userId}`}
                      className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                      <StarIcon size={18} />
                      Write Review
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-700">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-t-lg transition duration-300 ${
                  activeTab === tab.id
                    ? "bg-gray-800 text-green-400 border-b-2 border-green-400"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                <tab.icon size={18} />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              {/* Trust & Reputation */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-blue-400" />
                  Trust & Reputation
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Trust Score</span>
                      <span className="text-2xl font-bold text-blue-400">
                        {userProfile.trust?.trustScore || 0}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-3">
                      <div
                        className="bg-blue-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${userProfile.trust?.trustScore || 0}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="font-bold mb-2">Verification Status</h3>
                    <div className="flex items-center gap-2">
                      {userProfile.trust?.isVerified ? (
                        <>
                          <ShieldCheck className="text-green-400" size={20} />
                          <span className="text-green-400">Verified {userProfile.userType}</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="text-gray-500" size={20} />
                          <span className="text-gray-400">Not Verified</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Sustainability */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Award className="text-purple-400" />
                  Sustainability
                </h2>
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300">Eco Points</span>
                      <span className="text-2xl font-bold text-purple-400">
                        {userProfile.sustainability?.ecoPoints || 0}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-gray-400">Tier:</span>
                      <span className={`px-3 py-1 bg-gradient-to-r ${getEcoTierColor(userProfile.sustainability?.ecoTier)} rounded-full text-white font-bold`}>
                        {userProfile.sustainability?.ecoTier || "Bronze"}
                      </span>
                    </div>
                  </div>

                  {userProfile.sustainability?.achievements?.length > 0 && (
                    <div className="bg-gray-700 rounded-lg p-4">
                      <h3 className="font-bold mb-2">Achievements Unlocked</h3>
                      <div className="flex flex-wrap gap-2">
                        {userProfile.sustainability.achievements.slice(0, 5).map((ach, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm"
                          >
                            {ach.replace(/_/g, " ")}
                          </span>
                        ))}
                        {userProfile.sustainability.achievements.length > 5 && (
                          <span className="px-3 py-1 bg-gray-600 text-gray-300 rounded-full text-sm">
                            +{userProfile.sustainability.achievements.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Reviews */}
              {userProfile.recentReviews?.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 lg:col-span-2">
                  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                    <StarIcon className="text-yellow-400" />
                    Recent Reviews
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userProfile.recentReviews.map((review) => (
                      <div key={review._id} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                size={16}
                                className={i < review.rating ? "fill-current" : "text-gray-600"}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-400">
                            by {review.reviewer?.name || "Anonymous"}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-300 text-sm">{review.comment}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "listings" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {/* Listings Header */}
              <div className="mb-6 bg-gray-800 rounded-xl p-4 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">User Listings</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {userListingsMeta.totalListings || 0} total listing{userListingsMeta.totalListings !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {userListingsMeta.totalListings > 0 && (
                      <div className="flex items-center gap-2">
                        <Package className="text-green-400" size={20} />
                        <span className="text-green-400 font-bold">
                          Showing {userListings.length} of {userListingsMeta.totalListings}
                        </span>
                      </div>
                    )}
                    {/* Admin badge - shows all listings including inactive */}
                    {(currentUser?.userType === "admin" || currentUser?.permissions?.includes("admin")) && (
                      <div className="px-3 py-1 bg-purple-900/50 border border-purple-700 rounded-full">
                        <span className="text-xs font-bold text-purple-300">
                          🔑 Admin View - All Listings
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {userListings.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-12 text-center">
                  <Package size={48} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No active listings</h3>
                  <p className="text-gray-400">This user doesn't have any active listings right now</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userListings.map((listing) => (
                      <Link
                        key={listing._id}
                        to={`/listing/${listing._id}`}
                        className="bg-gray-800 rounded-xl overflow-hidden hover:border-green-600 border border-gray-700 transition duration-300 relative"
                      >
                        {/* Status Badge for Admin */}
                        {(currentUser?.userType === "admin" || currentUser?.permissions?.includes("admin")) && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              listing.status === 'active' ? 'bg-green-600 text-white' :
                              listing.status === 'sold' ? 'bg-blue-600 text-white' :
                              listing.status === 'expired' ? 'bg-gray-600 text-white' :
                              listing.status === 'cancelled' ? 'bg-red-600 text-white' :
                              'bg-yellow-600 text-white'
                            }`}>
                              {listing.status}
                            </span>
                          </div>
                        )}
                        
                        {listing.images?.[0] && (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-48 object-cover"
                          />
                        )}
                        <div className="p-4">
                          <h3 className="font-bold text-lg mb-2">{listing.title}</h3>
                          <div className="flex items-center justify-between">
                            <span className="text-green-400 font-bold">
                              ${listing.price || "Exchange"}
                            </span>
                            <span className="text-sm text-gray-400">
                              {listing.condition}
                            </span>
                          </div>
                          {listing.location && (
                            <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                              <MapPin size={14} />
                              {listing.location}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Pagination */}
                  {userListingsMeta.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                      <button
                        onClick={() => handleListingsPageChange(userListingsMeta.page - 1)}
                        disabled={userListingsMeta.page === 1}
                        className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition duration-300"
                      >
                        Previous
                      </button>
                      <span className="text-gray-300">
                        Page {userListingsMeta.page} of {userListingsMeta.totalPages}
                      </span>
                      <button
                        onClick={() => handleListingsPageChange(userListingsMeta.page + 1)}
                        disabled={userListingsMeta.page === userListingsMeta.totalPages}
                        className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition duration-300"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {activeTab === "reviews" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {userReviews?.reviews?.length === 0 ? (
                <div className="bg-gray-800 rounded-xl p-12 text-center">
                  <StarIcon size={48} className="mx-auto text-gray-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
                  <p className="text-gray-400">This user hasn't received any reviews yet</p>
                </div>
              ) : (
                <>
                  {/* Rating Summary */}
                  {userReviews && (
                    <div className="bg-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-yellow-400 mb-2">
                            {userReviews.averageRating}
                          </div>
                          <div className="flex justify-center text-yellow-400 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                size={24}
                                className={i < Math.round(userReviews.averageRating) ? "fill-current" : "text-gray-600"}
                              />
                            ))}
                          </div>
                          <p className="text-gray-400">
                            Based on {userReviewsMeta.totalReviews} reviews
                          </p>
                        </div>
                        
                        <div className="space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => {
                            const count = userReviews.ratingDistribution?.[rating] || 0;
                            const percentage = userReviewsMeta.totalReviews > 0
                              ? (count / userReviewsMeta.totalReviews) * 100
                              : 0;
                            return (
                              <div key={rating} className="flex items-center gap-2">
                                <span className="text-sm w-8">{rating} ★</span>
                                <div className="flex-1 bg-gray-700 rounded-full h-3">
                                  <div
                                    className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-400 w-8">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-4">
                    {userReviews?.reviews?.map((review) => (
                      <div key={review._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                              <span className="font-bold">
                                {review.reviewer?.name?.charAt(0) || "?"}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-bold">{review.reviewer?.name || "Anonymous"}</h4>
                              <p className="text-sm text-gray-400">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                size={18}
                                className={i < review.rating ? "fill-current" : "text-gray-600"}
                              />
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-gray-300">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {userReviewsMeta.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-8">
                      <button
                        onClick={() => handleReviewsPageChange(userReviewsMeta.page - 1)}
                        disabled={userReviewsMeta.page === 1}
                        className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition duration-300"
                      >
                        Previous
                      </button>
                      <span className="text-gray-300">
                        Page {userReviewsMeta.page} of {userReviewsMeta.totalPages}
                      </span>
                      <button
                        onClick={() => handleReviewsPageChange(userReviewsMeta.page + 1)}
                        disabled={userReviewsMeta.page === userReviewsMeta.totalPages}
                        className="px-4 py-2 bg-gray-800 rounded-lg disabled:opacity-50 hover:bg-gray-700 transition duration-300"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {activeTab === "stats" && userStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {/* Listings Stats */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Package className="text-blue-400" />
                  Listings Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Listings</span>
                    <span className="font-bold">{userStats.listings?.total || 0}</span>
                  </div>
                  {userStats.listings?.byStatus && Object.entries(userStats.listings.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{status}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exchanges Stats */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Handshake className="text-green-400" />
                  Exchange Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Exchanges</span>
                    <span className="font-bold">{userStats.exchanges?.total || 0}</span>
                  </div>
                  {userStats.exchanges?.avgResponseTimeHours !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-300">Avg Response Time</span>
                      <span className="font-bold">
                        {userStats.exchanges.avgResponseTimeHours}h
                      </span>
                    </div>
                  )}
                  {userStats.exchanges?.byStatus && Object.entries(userStats.exchanges.byStatus).map(([status, count]) => (
                    <div key={status} className="flex justify-between">
                      <span className="text-gray-400 capitalize">{status}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recycling Stats */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="text-purple-400" />
                  Recycling Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Submissions</span>
                    <span className="font-bold">{userStats.recycling?.totalSubmissions || 0}</span>
                  </div>
                </div>
              </div>

              {/* Reputation Stats */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="text-yellow-400" />
                  Reputation
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Trust Score</span>
                    <span className="font-bold">{userStats.reputation?.trustScore || 0}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Reviews</span>
                    <span className="font-bold">{userStats.reputation?.totalReviews || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Eco Points</span>
                    <span className="font-bold text-purple-400">{userStats.reputation?.ecoPoints || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Eco Tier</span>
                    <span className="font-bold text-green-400">{userStats.reputation?.ecoTier || "Bronze"}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "admin" && (currentUser?.userType === "admin" || currentUser?.permissions?.includes("admin")) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Admin Alert Banner */}
              <div className="bg-red-900/30 border border-red-700 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-lg font-bold text-red-400">Admin View</h3>
                  <p className="text-sm text-red-300">
                    You are viewing this profile with administrative privileges. All user data is visible for moderation purposes.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Account Details */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Shield className="text-red-400" />
                    Account Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 flex items-center gap-2">
                        <Mail size={16} /> Email
                      </span>
                      <span className="font-bold text-white">{userProfile.email || "N/A"}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 flex items-center gap-2">
                        <User size={16} /> User ID
                      </span>
                      <span className="font-mono text-xs text-white bg-gray-900 px-2 py-1 rounded">
                        {userProfile.userId}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300 flex items-center gap-2">
                        <Calendar size={16} /> Joined
                      </span>
                      <span className="font-bold text-white">
                        {new Date(userProfile.memberSince).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Account Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        userProfile.isActive !== false
                          ? "bg-green-900 text-green-300"
                          : "bg-red-900 text-red-300"
                      }`}>
                        {userProfile.isActive !== false ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Verification & Role */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="text-blue-400" />
                    Verification & Role
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">User Type</span>
                      <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-bold capitalize">
                        {userProfile.userType}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Role Status</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold capitalize ${
                        userProfile.roleStatus === "verified"
                          ? "bg-green-900 text-green-300"
                          : userProfile.roleStatus === "pending"
                          ? "bg-yellow-900 text-yellow-300"
                          : "bg-gray-600 text-gray-300"
                      }`}>
                        {userProfile.roleStatus}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Email Verified</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        userProfile.trust?.isVerified
                          ? "bg-green-900 text-green-300"
                          : "bg-red-900 text-red-300"
                      }`}>
                        {userProfile.trust?.isVerified ? "Verified" : "Not Verified"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity Summary */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="text-purple-400" />
                    Activity Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Member Duration</span>
                      <span className="font-bold text-white">
                        {userProfile.daysAsMember} days
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Total Listings</span>
                      <span className="font-bold text-blue-400">
                        {userStats?.listings?.total || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Total Exchanges</span>
                      <span className="font-bold text-green-400">
                        {userStats?.exchanges?.total || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Recycling Submissions</span>
                      <span className="font-bold text-purple-400">
                        {userStats?.recycling?.totalSubmissions || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reputation & Trust */}
                <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <StarIcon className="text-yellow-400" />
                    Reputation & Trust
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Trust Score</span>
                      <span className="font-bold text-blue-400">
                        {userProfile.trust?.trustScore || 0}/100
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Average Rating</span>
                      <div className="flex items-center gap-2">
                        <StarIcon size={16} className="text-yellow-400 fill-current" />
                        <span className="font-bold text-yellow-400">
                          {userProfile.stats?.averageRating || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Total Reviews</span>
                      <span className="font-bold text-white">
                        {userProfile.stats?.totalReviews || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Eco Points</span>
                      <span className="font-bold text-purple-400">
                        {userProfile.sustainability?.ecoPoints || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">Eco Tier</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white font-bold capitalize">
                        {userProfile.sustainability?.ecoTier || "Bronze"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Admin Actions */}
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="text-red-400" />
                  Quick Admin Actions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    to={`/admin/users`}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition duration-300 text-center"
                  >
                    <User size={24} className="mx-auto mb-2 text-blue-400" />
                    <p className="font-bold text-white">Manage Users</p>
                    <p className="text-xs text-gray-400 mt-1">View all users</p>
                  </Link>
                  <Link
                    to={`/reviews/${userId}`}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition duration-300 text-center"
                  >
                    <StarIcon size={24} className="mx-auto mb-2 text-yellow-400" />
                    <p className="font-bold text-white">Write Review</p>
                    <p className="text-xs text-gray-400 mt-1">Admin review</p>
                  </Link>
                  <button
                    onClick={() => navigate(-1)}
                    className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg transition duration-300 text-center"
                  >
                    <ChevronLeft size={24} className="mx-auto mb-2 text-green-400" />
                    <p className="font-bold text-white">Go Back</p>
                    <p className="text-xs text-gray-400 mt-1">Return to previous</p>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default UserProfilePage;
