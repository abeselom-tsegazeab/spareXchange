import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Exchange } from "../models/exchange.model.js";
import { Review } from "../models/review.model.js";
import { RecyclingSubmission } from "../models/recyclingSubmission.model.js";

// Get user's activity feed (aggregated from multiple sources)
export const getActivityFeed = async (req, res) => {
	try {
		const { page = 1, limit = 20, type } = req.query;
		const userId = req.userId;
		
		const skip = (parseInt(page) - 1) * parseInt(limit);
		const activities = [];

		// Fetch recent listings by user
		if (!type || type === 'listing') {
			const listings = await Listing.find({ seller: userId })
				.sort({ createdAt: -1 })
				.limit(parseInt(limit))
				.select('title category condition status createdAt images');

			listings.forEach(listing => {
				activities.push({
					type: 'listing_created',
					title: 'New Listing Created',
					description: `You listed "${listing.title}"`,
					category: listing.category,
					timestamp: listing.createdAt,
					data: {
						listingId: listing._id,
						title: listing.title,
						category: listing.category,
						condition: listing.condition,
						status: listing.status,
						image: listing.images?.[0] || null
					}
				});
			});
		}

		// Fetch completed exchanges
		if (!type || type === 'exchange') {
			const exchanges = await Exchange.find({
				$or: [{ requester: userId }, { receiver: userId }]
			})
			.populate('requester', 'name')
			.populate('receiver', 'name')
			.populate('listing', 'title')
			.sort({ completedAt: -1 })
			.limit(parseInt(limit));

			exchanges.forEach(exchange => {
				if (exchange.status === 'completed') {
					const isRequester = exchange.requester._id.toString() === userId;
					const otherUser = isRequester ? exchange.receiver : exchange.requester;
					
					activities.push({
						type: 'exchange_completed',
						title: 'Exchange Completed',
						description: `Exchange completed with ${otherUser.name}`,
						timestamp: exchange.completedAt || exchange.updatedAt,
						data: {
							exchangeId: exchange._id,
							listingTitle: exchange.listing?.title || 'Unknown Item',
							otherUserId: otherUser._id,
							otherUserName: otherUser.name,
							role: isRequester ? 'requester' : 'receiver'
						}
					});
				}
			});
		}

		// Fetch reviews received
		if (!type || type === 'review') {
			const reviews = await Review.find({ reviewedUser: userId })
				.populate('reviewer', 'name')
				.populate('exchange', 'listing')
				.sort({ createdAt: -1 })
				.limit(parseInt(limit));

			reviews.forEach(review => {
				activities.push({
					type: 'review_received',
					title: 'New Review Received',
					description: `${review.reviewer.name} gave you ${review.rating} stars`,
					timestamp: review.createdAt,
					data: {
						reviewId: review._id,
						rating: review.rating,
						comment: review.comment,
						reviewerId: review.reviewer._id,
						reviewerName: review.reviewer.name
					}
				});
			});
		}

		// Fetch recycling submissions
		if (!type || type === 'recycling') {
			const recyclings = await RecyclingSubmission.find({ userId })
				.sort({ submittedAt: -1 })
				.limit(parseInt(limit));

			recyclings.forEach(recycling => {
				activities.push({
					type: 'recycling_completed',
					title: 'Recycling Submitted',
					description: `Submitted ${recycling.itemType} for recycling`,
					timestamp: recycling.submittedAt,
					data: {
						submissionId: recycling._id,
						itemType: recycling.itemType,
						weight: recycling.weight,
						pointsEarned: recycling.pointsEarned || 0,
						status: recycling.status
					}
				});
			});
		}

		// Sort all activities by timestamp
		activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

		// Apply pagination
		const paginatedActivities = activities.slice(skip, skip + parseInt(limit));

		res.status(200).json({
			success: true,
			count: paginatedActivities.length,
			totalActivities: activities.length,
			page: parseInt(page),
			totalPages: Math.ceil(activities.length / parseInt(limit)),
			activities: paginatedActivities
		});
	} catch (error) {
		console.error("Error in getActivityFeed:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get public activity feed for a specific user (for viewing other users' activities)
export const getUserPublicActivity = async (req, res) => {
	try {
		const { userId: targetUserId } = req.params;
		const { page = 1, limit = 10 } = req.query;
		
		const skip = (parseInt(page) - 1) * parseInt(limit);
		const activities = [];

		// Check if user exists
		const user = await User.findById(targetUserId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		// Fetch public listings
		const listings = await Listing.find({ 
			seller: targetUserId,
			status: { $in: ['active', 'exchanged'] }
		})
		.sort({ createdAt: -1 })
		.limit(parseInt(limit))
		.select('title category condition createdAt');

		listings.forEach(listing => {
			activities.push({
				type: 'listing',
				title: 'Listed an item',
				description: listing.title,
				timestamp: listing.createdAt,
				data: {
					listingId: listing._id,
					title: listing.title,
					category: listing.category,
					condition: listing.condition
				}
			});
		});

		// Fetch public reviews received
		const reviews = await Review.find({ reviewedUser: targetUserId })
			.populate('reviewer', 'name')
			.sort({ createdAt: -1 })
			.limit(parseInt(limit));

		reviews.forEach(review => {
			activities.push({
				type: 'review',
				title: 'Received a review',
				description: `Rated ${review.rating} stars by ${review.reviewer.name}`,
				timestamp: review.createdAt,
				data: {
					rating: review.rating,
					reviewerName: review.reviewer.name
				}
			});
		});

		// Sort by timestamp
		activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

		// Apply pagination
		const paginatedActivities = activities.slice(skip, skip + parseInt(limit));

		res.status(200).json({
			success: true,
			count: paginatedActivities.length,
			totalActivities: activities.length,
			page: parseInt(page),
			activities: paginatedActivities
		});
	} catch (error) {
		console.error("Error in getUserPublicActivity:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get community highlights (trending/top activities across platform)
export const getCommunityHighlights = async (req, res) => {
	try {
		const highlights = {};

		// Top contributors this week (most listings)
		const sevenDaysAgo = new Date();
		sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

		const topContributors = await Listing.aggregate([
			{ $match: { createdAt: { $gte: sevenDaysAgo } } },
			{ $group: { _id: "$seller", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 5 },
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
					userId: "$user._id",
					name: "$user.name",
					profilePicture: "$user.profilePicture",
					ecoTier: "$user.ecoTier",
					listingCount: "$count"
				}
			}
		]);

		// Recent successful exchanges
		const recentExchanges = await Exchange.find({ status: 'completed' })
			.populate('requester', 'name')
			.populate('receiver', 'name')
			.populate('listing', 'title')
			.sort({ completedAt: -1 })
			.limit(5)
			.select('requester receiver listing completedAt');

		// Top recyclers this month
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const topRecyclers = await RecyclingSubmission.aggregate([
			{ $match: { submittedAt: { $gte: thirtyDaysAgo }, status: 'verified' } },
			{ $group: { _id: "$userId", totalWeight: { $sum: "$weight" }, count: { $sum: 1 } } },
			{ $sort: { totalWeight: -1 } },
			{ $limit: 5 },
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
					userId: "$user._id",
					name: "$user.name",
					totalWeight: 1,
					recyclingCount: "$count",
					ecoPoints: "$user.ecoPoints"
				}
			}
		]);

		// Most reviewed users (highest trust)
		const trustedUsers = await User.find({ 
			totalReviews: { $gte: 5 },
			isBanned: false
		})
		.sort({ trustScore: -1, totalReviews: -1 })
		.limit(5)
		.select('name profilePicture trustScore totalReviews ecoTier');

		highlights.topContributors = topContributors;
		highlights.recentExchanges = recentExchanges.map(ex => ({
			exchangeId: ex._id,
			requester: ex.requester.name,
			receiver: ex.receiver.name,
			listing: ex.listing?.title || 'Unknown',
			completedAt: ex.completedAt
		}));
		highlights.topRecyclers = topRecyclers;
		highlights.trustedUsers = trustedUsers;

		res.status(200).json({
			success: true,
			highlights
		});
	} catch (error) {
		console.error("Error in getCommunityHighlights:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
