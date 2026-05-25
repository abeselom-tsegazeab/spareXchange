import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Exchange } from "../models/exchange.model.js";
import { Report } from "../models/report.model.js";
import { SearchLog } from "../models/searchLog.model.js";
import { RecyclingSubmission } from "../models/recyclingSubmission.model.js";
import { Review } from "../models/review.model.js";
import { Message } from "../models/message.model.js";
import { Dispute } from "../models/dispute.model.js";

// Get comprehensive platform statistics
export const getComprehensiveStats = async (req, res) => {
	try {
		const now = new Date();
		const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
		const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		// Basic counts
		const totalUsers = await User.countDocuments();
		const activeUsers = await User.countDocuments({ isActive: true });
		const bannedUsers = await User.countDocuments({ isBanned: true });
		const totalListings = await Listing.countDocuments();
		const activeListings = await Listing.countDocuments({ isActive: true, status: "active" });
		const totalExchanges = await Exchange.countDocuments();
		const completedExchanges = await Exchange.countDocuments({ status: "fully_completed" });

		// Recent activity (last 30 days)
		const newUsersLast30Days = await User.countDocuments({ createdAt: { $gte: last30Days } });
		const newListingsLast30Days = await Listing.countDocuments({ createdAt: { $gte: last30Days } });
		const newExchangesLast30Days = await Exchange.countDocuments({ createdAt: { $gte: last30Days } });

		// User type breakdown
		const usersByType = await User.aggregate([
			{ $group: { _id: "$userType", count: { $sum: 1 } } }
		]);

		// Listing status breakdown
		const listingsByStatus = await Listing.aggregate([
			{ $group: { _id: "$status", count: { $sum: 1 } } }
		]);

		// Exchange status breakdown
		const exchangesByStatus = await Exchange.aggregate([
			{ $group: { _id: "$status", count: { $sum: 1 } } }
		]);

		// Pending items
		const pendingVerifications = await User.countDocuments({ roleStatus: "pending" });
		const pendingReports = await Report.countDocuments({ status: "pending" });
		const pendingDisputes = await Dispute.countDocuments({ status: "pending" });

		res.status(200).json({
			success: true,
			stats: {
				overview: {
					totalUsers,
					activeUsers,
					bannedUsers,
					totalListings,
					activeListings,
					totalExchanges,
					completedExchanges
				},
				recentActivity: {
					last30Days: {
						newUsers: newUsersLast30Days,
						newListings: newListingsLast30Days,
						newExchanges: newExchangesLast30Days
					}
				},
				breakdowns: {
					usersByType,
					listingsByStatus,
					exchangesByStatus
				},
				pendingItems: {
					verifications: pendingVerifications,
					reports: pendingReports,
					disputes: pendingDisputes
				}
			}
		});
	} catch (error) {
		console.error("Error in getComprehensiveStats:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get time-series analytics (daily, weekly, or monthly trends)
export const getTimeSeriesAnalytics = async (req, res) => {
	try {
		const { period = "daily", days = 30 } = req.query;
		const now = new Date();
		const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

		let dateFormat;
		if (period === "hourly") {
			dateFormat = "%Y-%m-%d %H";
		} else if (period === "weekly") {
			dateFormat = "%Y-%U";
		} else if (period === "monthly") {
			dateFormat = "%Y-%m";
		} else {
			dateFormat = "%Y-%m-%d";
		}

		// Users over time
		const userTrend = await User.aggregate([
			{ $match: { createdAt: { $gte: startDate } } },
			{
				$group: {
					_id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
					count: { $sum: 1 }
				}
			},
			{ $sort: { _id: 1 } }
		]);

		// Listings over time
		const listingTrend = await Listing.aggregate([
			{ $match: { createdAt: { $gte: startDate } } },
			{
				$group: {
					_id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
					count: { $sum: 1 }
				}
			},
			{ $sort: { _id: 1 } }
		]);

		// Exchanges over time
		const exchangeTrend = await Exchange.aggregate([
			{ $match: { createdAt: { $gte: startDate } } },
			{
				$group: {
					_id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
					count: { $sum: 1 }
				}
			},
			{ $sort: { _id: 1 } }
		]);

		res.status(200).json({
			success: true,
			period,
			days,
			trends: {
				users: userTrend,
				listings: listingTrend,
				exchanges: exchangeTrend
			}
		});
	} catch (error) {
		console.error("Error in getTimeSeriesAnalytics:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get user engagement metrics
export const getUserEngagementMetrics = async (req, res) => {
	try {
		const now = new Date();
		const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		// Active users (based on listing activity)
		const activeListersLast7Days = await Listing.aggregate([
			{ $match: { createdAt: { $gte: last7Days } } },
			{ $group: { _id: "$seller", count: { $sum: 1 } } },
			{ $count: "totalActiveListers" }
		]);

		// Users who initiated exchanges
		const activeExchangersLast30Days = await Exchange.aggregate([
			{ $match: { createdAt: { $gte: last30Days } } },
			{ $group: { _id: "$initiator", count: { $sum: 1 } } },
			{ $count: "totalActiveExchangers" }
		]);

		// Average listings per user
		const avgListingsPerUser = await Listing.aggregate([
			{ $group: { _id: "$seller", listingCount: { $sum: 1 } } },
			{ $group: { _id: null, avgListings: { $avg: "$listingCount" } } }
		]);

		// User retention (users active in both periods)
		const usersActiveLast7Days = await Listing.distinct("seller", { createdAt: { $gte: last7Days } });
		const usersActiveLast30Days = await Listing.distinct("seller", { createdAt: { $gte: last30Days } });
		
		const retainedUsers = usersActiveLast7Days.filter(userId => 
			usersActiveLast30Days.includes(userId)
		);

		const retentionRate = usersActiveLast30Days.length > 0 
			? (retainedUsers.length / usersActiveLast30Days.length) * 100 
			: 0;

		res.status(200).json({
			success: true,
			engagement: {
				activeListersLast7Days: activeListersLast7Days[0]?.totalActiveListers || 0,
				activeExchangersLast30Days: activeExchangersLast30Days[0]?.totalActiveExchangers || 0,
				avgListingsPerUser: avgListingsPerUser[0]?.avgListings || 0,
				retentionMetrics: {
					retainedUsers: retainedUsers.length,
					totalActiveUsers: usersActiveLast30Days.length,
					retentionRate: retentionRate.toFixed(2) + "%"
				}
			}
		});
	} catch (error) {
		console.error("Error in getUserEngagementMetrics:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get exchange performance analytics
export const getExchangePerformance = async (req, res) => {
	try {
		const now = new Date();
		const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		// Exchange status distribution
		const statusDistribution = await Exchange.aggregate([
			{ $group: { _id: "$status", count: { $sum: 1 } } }
		]);

		// Completion rate
		const totalExchanges = await Exchange.countDocuments();
		const completedExchanges = await Exchange.countDocuments({ status: "fully_completed" });
		const cancelledExchanges = await Exchange.countDocuments({ status: "cancelled" });
		const completionRate = totalExchanges > 0 ? (completedExchanges / totalExchanges) * 100 : 0;

		// Average time to complete (for completed exchanges)
		const completedExchangesData = await Exchange.find({ 
			status: "fully_completed",
			completedAt: { $exists: true }
		}).select("createdAt completedAt");

		let avgCompletionTime = 0;
		if (completedExchangesData.length > 0) {
			const totalHours = completedExchangesData.reduce((sum, exchange) => {
				const hours = (exchange.completedAt - exchange.createdAt) / (1000 * 60 * 60);
				return sum + hours;
			}, 0);
			avgCompletionTime = totalHours / completedExchangesData.length;
		}

		// Exchange type distribution
		const typeDistribution = await Exchange.aggregate([
			{ $group: { _id: "$exchangeType", count: { $sum: 1 } } }
		]);

		// Recent exchanges (last 30 days)
		const recentExchanges = await Exchange.countDocuments({ createdAt: { $gte: last30Days } });

		res.status(200).json({
			success: true,
			performance: {
				totalExchanges,
				completedExchanges,
				cancelledExchanges,
				completionRate: completionRate.toFixed(2) + "%",
				avgCompletionTimeHours: avgCompletionTime.toFixed(2),
				statusDistribution,
				typeDistribution,
				recentExchangesLast30Days: recentExchanges
			}
		});
	} catch (error) {
		console.error("Error in getExchangePerformance:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get category and listing performance analytics
export const getCategoryPerformance = async (req, res) => {
	try {
		// Listings by category
		const listingsByCategory = await Listing.aggregate([
			{ $group: { _id: "$category", count: { $sum: 1 } } },
			{ $sort: { count: -1 } }
		]);

		// Active listings by category
		const activeListingsByCategory = await Listing.aggregate([
			{ $match: { isActive: true, status: "active" } },
			{ $group: { _id: "$category", count: { $sum: 1 } } },
			{ $sort: { count: -1 } }
		]);

		// Average price by category
		const avgPriceByCategory = await Listing.aggregate([
			{ $match: { price: { $exists: true, $gt: 0 } } },
			{ $group: { _id: "$category", avgPrice: { $avg: "$price" }, count: { $sum: 1 } } },
			{ $sort: { avgPrice: -1 } }
		]);

		// Condition distribution
		const conditionDistribution = await Listing.aggregate([
			{ $group: { _id: "$condition", count: { $sum: 1 } } }
		]);

		// Top sellers (by number of listings)
		const topSellers = await Listing.aggregate([
			{ $group: { _id: "$seller", listingCount: { $sum: 1 } } },
			{ $sort: { listingCount: -1 } },
			{ $limit: 10 },
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "user"
				}
			},
			{ $unwind: "$user" },
			{
				$project: {
					userId: "$_id",
					userName: "$user.name",
					userEmail: "$user.email",
					listingCount: 1
				}
			}
		]);

		res.status(200).json({
			success: true,
			categoryPerformance: {
				listingsByCategory,
				activeListingsByCategory,
				avgPriceByCategory,
				conditionDistribution,
				topSellers
			}
		});
	} catch (error) {
		console.error("Error in getCategoryPerformance:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get eco-points and sustainability metrics
export const getSustainabilityMetrics = async (req, res) => {
	try {
		// Total recycling submissions
		const totalSubmissions = await RecyclingSubmission.countDocuments();
		const approvedSubmissions = await RecyclingSubmission.countDocuments({ status: "approved" });
		const pendingSubmissions = await RecyclingSubmission.countDocuments({ status: "pending" });

		// Eco-points distribution (from users)
		const ecoPointsStats = await User.aggregate([
			{ $match: { ecoPoints: { $gt: 0 } } },
			{
				$group: {
					_id: null,
					totalEcoPoints: { $sum: "$ecoPoints" },
					avgEcoPoints: { $avg: "$ecoPoints" },
					maxEcoPoints: { $max: "$ecoPoints" }
				}
			}
		]);

		// Top eco-point earners
		const topEcoEarners = await User.find({ ecoPoints: { $gt: 0 } })
			.sort({ ecoPoints: -1 })
			.limit(10)
			.select("name email ecoPoints userType");

		// Recycling by material type
		const recyclingByMaterial = await RecyclingSubmission.aggregate([
			{ $match: { status: "approved" } },
			{ $group: { _id: "$materialType", count: { $sum: 1 }, totalWeight: { $sum: "$weight" } } },
			{ $sort: { count: -1 } }
		]);

		// Environmental impact (estimated)
		const totalWeightRecycled = await RecyclingSubmission.aggregate([
			{ $match: { status: "approved" } },
			{ $group: { _id: null, totalWeight: { $sum: "$weight" } } }
		]);

		res.status(200).json({
			success: true,
			sustainability: {
				recyclingStats: {
					totalSubmissions,
					approvedSubmissions,
					pendingSubmissions,
					recyclingByMaterial,
					totalWeightRecycled: totalWeightRecycled[0]?.totalWeight || 0
				},
				ecoPoints: {
					totalEcoPoints: ecoPointsStats[0]?.totalEcoPoints || 0,
					avgEcoPoints: ecoPointsStats[0]?.avgEcoPoints || 0,
					maxEcoPoints: ecoPointsStats[0]?.maxEcoPoints || 0,
					topEarners: topEcoEarners
				}
			}
		});
	} catch (error) {
		console.error("Error in getSustainabilityMetrics:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get search analytics and insights
export const getSearchAnalytics = async (req, res) => {
	try {
		const { days = 30 } = req.query;
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - parseInt(days));

		// Total searches
		const totalSearches = await SearchLog.countDocuments({ createdAt: { $gte: startDate } });

		// Most popular search queries
		const popularQueries = await SearchLog.aggregate([
			{ $match: { query: { $exists: true, $ne: "" }, createdAt: { $gte: startDate } } },
			{ $group: { _id: { $toLower: "$query" }, count: { $sum: 1 }, avgResults: { $avg: "$resultsCount" } } },
			{ $sort: { count: -1 } },
			{ $limit: 20 }
		]);

		// Searches with no results (unmet demand)
		const noResultSearches = await SearchLog.aggregate([
			{ $match: { resultsCount: 0, createdAt: { $gte: startDate } } },
			{ $group: { _id: { $toLower: "$query" }, count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 20 }
		]);

		// Average results per search
		const avgResultsPerSearch = await SearchLog.aggregate([
			{ $match: { createdAt: { $gte: startDate } } },
			{ $group: { _id: null, avgResults: { $avg: "$resultsCount" } } }
		]);

		// Search success rate (searches with results > 0)
		const searchesWithResults = await SearchLog.countDocuments({ 
			resultsCount: { $gt: 0 },
			createdAt: { $gte: startDate }
		});
		const searchSuccessRate = totalSearches > 0 ? (searchesWithResults / totalSearches) * 100 : 0;

		res.status(200).json({
			success: true,
			searchAnalytics: {
				totalSearches,
				searchSuccessRate: searchSuccessRate.toFixed(2) + "%",
				avgResultsPerSearch: avgResultsPerSearch[0]?.avgResults || 0,
				popularQueries,
				unmetDemand: noResultSearches
			}
		});
	} catch (error) {
		console.error("Error in getSearchAnalytics:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get review and rating analytics
export const getReviewAnalytics = async (req, res) => {
	try {
		// Total reviews
		const totalReviews = await Review.countDocuments();

		// Average rating
		const avgRating = await Review.aggregate([
			{ $group: { _id: null, avgRating: { $avg: "$rating" }, count: { $sum: 1 } } }
		]);

		// Rating distribution
		const ratingDistribution = await Review.aggregate([
			{ $group: { _id: "$rating", count: { $sum: 1 } } },
			{ $sort: { _id: -1 } }
		]);

		// Recent reviews (last 30 days)
		const last30Days = new Date();
		last30Days.setDate(last30Days.getDate() - 30);
		const recentReviews = await Review.countDocuments({ createdAt: { $gte: last30Days } });

		// Top rated users
		const topRatedUsers = await Review.aggregate([
			{ $group: { _id: "$reviewedUser", avgRating: { $avg: "$rating" }, reviewCount: { $sum: 1 } } },
			{ $match: { reviewCount: { $gte: 3 } } },
			{ $sort: { avgRating: -1, reviewCount: -1 } },
			{ $limit: 10 },
			{
				$lookup: {
					from: "users",
					localField: "_id",
					foreignField: "_id",
					as: "user"
				}
			},
			{ $unwind: "$user" },
			{
				$project: {
					userId: "$_id",
					userName: "$user.name",
					avgRating: { $round: ["$avgRating", 2] },
					reviewCount: 1
				}
			}
		]);

		res.status(200).json({
			success: true,
			reviewAnalytics: {
				totalReviews,
				avgRating: avgRating[0]?.avgRating || 0,
				ratingDistribution,
				recentReviewsLast30Days: recentReviews,
				topRatedUsers
			}
		});
	} catch (error) {
		console.error("Error in getReviewAnalytics:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
