import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Review } from "../models/review.model.js";
import { Exchange } from "../models/exchange.model.js";

// Get public user profile (viewable by other users)
export const getPublicUserProfile = async (req, res) => {
	try {
		const { userId } = req.params;

		// Fetch user with safe fields (no sensitive data)
		const user = await User.findById(userId)
			.select('name email profilePicture userType roleStatus ecoPoints ecoTier achievements trustScore totalReviews location joinedAt isActive isBanned permissions');

		if (!user || !user.isActive) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		// Get user's active listings count
		const activeListingsCount = await Listing.countDocuments({
			owner: userId,
			status: 'active'
		});

		// Get completed exchanges count
		const completedExchangesCount = await Exchange.countDocuments({
			$or: [{ requester: userId }, { receiver: userId }],
			status: 'completed'
		});

		// Get average rating
		const reviews = await Review.find({ revieweeId: userId });
		const averageRating = reviews.length > 0
			? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
			: 0;

		// Get recent reviews (last 5)
		const recentReviews = await Review.find({ revieweeId: userId })
			.populate('reviewerId', 'name profilePicture')
			.sort({ createdAt: -1 })
			.limit(5)
			.select('rating comment createdAt reviewerId');

		// Get user's achievements and badges
		const achievements = user.achievements || [];
		const ecoTier = user.ecoTier || 'Bronze';

		// Calculate member duration
		const memberSince = user.joinedAt || user.createdAt;
		const daysAsMember = memberSince
			? Math.floor((new Date() - new Date(memberSince)) / (1000 * 60 * 60 * 24))
			: 0;

		const profile = {
			userId: user._id,
			name: user.name,
			email: user.email,
			profilePicture: user.profilePicture,
			userType: user.userType,
			roleStatus: user.roleStatus,
			location: user.location,
			memberSince,
			daysAsMember,
			isActive: user.isActive !== false,
			// Stats
			stats: {
				activeListings: activeListingsCount,
				completedExchanges: completedExchangesCount,
				totalReviews: user.totalReviews || reviews.length,
				averageRating: parseFloat(averageRating.toFixed(2)),
				trustScore: user.trustScore || 0
			},
			// Sustainability
			sustainability: {
				ecoPoints: user.ecoPoints,
				ecoTier,
				achievements
			},
			// Recent activity
			recentReviews: recentReviews.map(r => ({
				_id: r._id,
				rating: r.rating,
				comment: r.comment,
				createdAt: r.createdAt,
				reviewer: r.reviewerId
			})),
			// Trust indicators
			trust: {
				isVerified: user.roleStatus === 'verified',
				trustScore: user.trustScore || 0,
				averageRating: parseFloat(averageRating.toFixed(2)),
				totalReviews: user.totalReviews || reviews.length
			}
		};

		res.status(200).json({
			success: true,
			profile
		});
	} catch (error) {
		console.error("Error in getPublicUserProfile:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get user's listings (public view, admin sees all)
export const getUserPublicListings = async (req, res) => {
	try {
		const { userId } = req.params;
		const { page = 1, limit = 10, category, condition, status } = req.query;
		const viewerId = req.userId; // May be undefined if not logged in

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		// Check if viewer is admin
		let isAdmin = false;
		if (viewerId) {
			const viewer = await User.findById(viewerId);
			isAdmin = viewer && (viewer.userType === "admin" || viewer.permissions?.includes("admin"));
		}

		// Build query - admins can see all listings, public sees only active
		const query = {
			owner: userId
		};

		// If status filter is provided (for admins), use it; otherwise default to active for public
		if (status) {
			query.status = status;
		} else if (!isAdmin) {
			query.status = 'active';
		}
		// If admin and no status specified, don't filter by status (show all)

		if (category) {
			query.category = category;
		}

		if (condition) {
			query.condition = condition;
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const listings = await Listing.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit))
			.select('title category brand model condition location price exchangeFor images createdAt status owner');

		const totalListings = await Listing.countDocuments(query);

		res.status(200).json({
			success: true,
			count: listings.length,
			totalListings,
			page: parseInt(page),
			totalPages: Math.ceil(totalListings / parseInt(limit)),
			listings,
			isAdminView: isAdmin
		});
	} catch (error) {
		console.error("Error in getUserPublicListings:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get user's reviews summary (public view)
export const getUserReviewsSummary = async (req, res) => {
	try {
		const { userId } = req.params;
		const { page = 1, limit = 10 } = req.query;

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Get all reviews
		const reviews = await Review.find({ revieweeId: userId })
			.populate('reviewerId', 'name profilePicture')
			.populate('exchangeId', 'listingId')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const totalReviews = await Review.countDocuments({ revieweeId: userId });

		// Calculate rating distribution
		const ratingDistribution = {
			5: await Review.countDocuments({ revieweeId: userId, rating: 5 }),
			4: await Review.countDocuments({ revieweeId: userId, rating: 4 }),
			3: await Review.countDocuments({ revieweeId: userId, rating: 3 }),
			2: await Review.countDocuments({ revieweeId: userId, rating: 2 }),
			1: await Review.countDocuments({ revieweeId: userId, rating: 1 })
		};

		// Calculate average rating
		const averageRating = totalReviews > 0
			? await Review.aggregate([
				{ $match: { revieweeId: user._id } },
				{ $group: { _id: null, avg: { $avg: "$rating" } } }
			  ]).then(result => result[0]?.avg || 0)
			: 0;

		// Map reviews to include reviewer field for frontend compatibility
		const mappedReviews = reviews.map(r => ({
			...r.toObject(),
			reviewer: r.reviewerId
		}));

		res.status(200).json({
			success: true,
			count: mappedReviews.length,
			totalReviews,
			averageRating: parseFloat(averageRating.toFixed(2)),
			ratingDistribution,
			page: parseInt(page),
			totalPages: Math.ceil(totalReviews / parseInt(limit)),
			reviews: mappedReviews
		});
	} catch (error) {
		console.error("Error in getUserReviewsSummary:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get user statistics (public view)
export const getUserStats = async (req, res) => {
	try {
		const { userId } = req.params;

		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		// Count listings by status
		const listingsByStatus = await Listing.aggregate([
			{ $match: { owner: user._id } },
			{ $group: { _id: "$status", count: { $sum: 1 } } }
		]);

		// Count exchanges by status
		const exchangesByStatus = await Exchange.aggregate([
			{ $match: { $or: [{ requester: user._id }, { receiver: user._id }] } },
			{ $group: { _id: "$status", count: { $sum: 1 } } }
		]);

		// Count recycling submissions
		const recyclingCount = await mongoose.model('RecyclingSubmission').countDocuments({ userId });

		// Get response time (average time to respond to exchange requests)
		const exchanges = await Exchange.find({
			receiver: user._id,
			status: { $in: ['completed', 'accepted'] }
		}).select('createdAt updatedAt');

		let avgResponseTime = null;
		if (exchanges.length > 0) {
			const responseTimes = exchanges.map(ex => 
				new Date(ex.updatedAt) - new Date(ex.createdAt)
			);
			avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
			avgResponseTime = Math.floor(avgResponseTime / (1000 * 60 * 60)); // Convert to hours
		}

		const stats = {
			listings: {
				total: listingsByStatus.reduce((sum, item) => sum + item.count, 0),
				byStatus: listingsByStatus.reduce((acc, item) => {
					acc[item._id] = item.count;
					return acc;
				}, {})
			},
			exchanges: {
				total: exchangesByStatus.reduce((sum, item) => sum + item.count, 0),
				byStatus: exchangesByStatus.reduce((acc, item) => {
					acc[item._id] = item.count;
					return acc;
				}, {}),
				avgResponseTimeHours: avgResponseTime
			},
			recycling: {
				totalSubmissions: recyclingCount
			},
			reputation: {
				trustScore: user.trustScore || 0,
				totalReviews: user.totalReviews || 0,
				ecoPoints: user.ecoPoints || 0,
				ecoTier: user.ecoTier || 'Bronze'
			}
		};

		res.status(200).json({
			success: true,
			stats
		});
	} catch (error) {
		console.error("Error in getUserStats:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
