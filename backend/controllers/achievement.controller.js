import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Exchange } from "../models/exchange.model.js";
import { Review } from "../models/review.model.js";
import { RecyclingSubmission } from "../models/recyclingSubmission.model.js";

// Achievement definitions with criteria
const achievementDefinitions = {
	// Listing achievements
	first_listing: {
		name: "First Listing",
		description: "Created your first listing",
		icon: "📦",
		category: "listing",
		criteria: { type: "count", target: "listings", threshold: 1 }
	},
	pro_seller: {
		name: "Pro Seller",
		description: "Created 10 listings",
		icon: "🏪",
		category: "listing",
		criteria: { type: "count", target: "listings", threshold: 10 }
	},
	power_seller: {
		name: "Power Seller",
		description: "Created 50 listings",
		icon: "⚡",
		category: "listing",
		criteria: { type: "count", target: "listings", threshold: 50 }
	},

	// Exchange achievements
	first_exchange: {
		name: "First Exchange",
		description: "Completed your first exchange",
		icon: "🤝",
		category: "exchange",
		criteria: { type: "count", target: "exchanges", threshold: 1 }
	},
	exchange_master: {
		name: "Exchange Master",
		description: "Completed 25 exchanges",
		icon: "👑",
		category: "exchange",
		criteria: { type: "count", target: "exchanges", threshold: 25 }
	},
	exchange_legend: {
		name: "Exchange Legend",
		description: "Completed 100 exchanges",
		icon: "🌟",
		category: "exchange",
		criteria: { type: "count", target: "exchanges", threshold: 100 }
	},

	// Review achievements
	first_review: {
		name: "First Review",
		description: "Received your first review",
		icon: "⭐",
		category: "review",
		criteria: { type: "count", target: "reviews", threshold: 1 }
	},
	trusted_seller: {
		name: "Trusted Seller",
		description: "Received 10 reviews with 4+ average rating",
		icon: "✅",
		category: "review",
		criteria: { type: "reviews_with_rating", threshold: 10, minRating: 4 }
	},
	five_star_champion: {
		name: "5-Star Champion",
		description: "Maintained perfect 5-star rating with 20+ reviews",
		icon: "🏆",
		category: "review",
		criteria: { type: "perfect_rating", threshold: 20, requiredRating: 5 }
	},

	// Recycling achievements
	eco_warrior: {
		name: "Eco Warrior",
		description: "Recycled 5 items",
		icon: "♻️",
		category: "recycling",
		criteria: { type: "count", target: "recyclings", threshold: 5 }
	},
	green_champion: {
		name: "Green Champion",
		description: "Recycled 25 items",
		icon: "🌱",
		category: "recycling",
		criteria: { type: "count", target: "recyclings", threshold: 25 }
	},
	planet_saver: {
		name: "Planet Saver",
		description: "Recycled 100 items",
		icon: "🌍",
		category: "recycling",
		criteria: { type: "count", target: "recyclings", threshold: 100 }
	},

	// Eco Points achievements
	points_starter: {
		name: "Points Starter",
		description: "Earned 100 eco points",
		icon: "💎",
		category: "eco_points",
		criteria: { type: "threshold", target: "ecoPoints", threshold: 100 }
	},
	points_collector: {
		name: "Points Collector",
		description: "Earned 500 eco points",
		icon: "💰",
		category: "eco_points",
		criteria: { type: "threshold", target: "ecoPoints", threshold: 500 }
	},
	points_magnate: {
		name: "Points Magnate",
		description: "Earned 1000 eco points",
		icon: "💵",
		category: "eco_points",
		criteria: { type: "threshold", target: "ecoPoints", threshold: 1000 }
	},

	// Community achievements
	community_helper: {
		name: "Community Helper",
		description: "Active member for 30 days",
		icon: "🤗",
		category: "community",
		criteria: { type: "days_active", threshold: 30 }
	},
	veteran_member: {
		name: "Veteran Member",
		description: "Active member for 365 days",
		icon: "🎖️",
		category: "community",
		criteria: { type: "days_active", threshold: 365 }
	}
};

// Get all achievement definitions
export const getAchievementDefinitions = async (req, res) => {
	try {
		const achievements = Object.keys(achievementDefinitions).map(key => ({
			id: key,
			...achievementDefinitions[key]
		}));

		res.status(200).json({
			success: true,
			count: achievements.length,
			achievements
		});
	} catch (error) {
		console.error("Error in getAchievementDefinitions:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Check and unlock achievements for a user
export const checkAndUnlockAchievements = async (req, res) => {
	try {
		const userId = req.userId || req.params.userId;
		
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		const unlockedAchievements = [];
		const currentAchievements = user.achievements || [];

		// Count user's activities
		const listingsCount = await Listing.countDocuments({ owner: userId });
		const exchangesCount = await Exchange.countDocuments({
			$or: [{ requester: userId }, { receiver: userId }],
			status: 'completed'
		});
		const reviewsCount = await Review.countDocuments({ reviewedUser: userId });
		const recyclingsCount = await RecyclingSubmission.countDocuments({ 
			userId, 
			status: 'verified' 
		});

		// Calculate average rating
		const reviews = await Review.find({ reviewedUser: userId });
		const averageRating = reviews.length > 0
			? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
			: 0;

		// Count perfect ratings (5 stars)
		const perfectRatingsCount = await Review.countDocuments({ 
			reviewedUser: userId, 
			rating: 5 
		});

		// Calculate days active
		const memberSince = user.joinedAt || user.createdAt;
		const daysActive = memberSince
			? Math.floor((new Date() - new Date(memberSince)) / (1000 * 60 * 60 * 24))
			: 0;

		// Check each achievement
		for (const [achievementId, achievement] of Object.entries(achievementDefinitions)) {
			// Skip if already unlocked
			if (currentAchievements.includes(achievementId)) {
				continue;
			}

			let unlocked = false;

			switch (achievement.criteria.type) {
				case 'count':
					let count = 0;
					switch (achievement.criteria.target) {
						case 'listings':
							count = listingsCount;
							break;
						case 'exchanges':
							count = exchangesCount;
							break;
						case 'reviews':
							count = reviewsCount;
							break;
						case 'recyclings':
							count = recyclingsCount;
							break;
					}
					unlocked = count >= achievement.criteria.threshold;
					break;

				case 'threshold':
					if (achievement.criteria.target === 'ecoPoints') {
						unlocked = user.ecoPoints >= achievement.criteria.threshold;
					}
					break;

				case 'reviews_with_rating':
					const highRatedReviews = await Review.countDocuments({
						reviewedUser: userId,
						rating: { $gte: achievement.criteria.minRating }
					});
					unlocked = highRatedReviews >= achievement.criteria.threshold && averageRating >= achievement.criteria.minRating;
					break;

				case 'perfect_rating':
					unlocked = perfectRatingsCount >= achievement.criteria.threshold && 
							   averageRating === achievement.criteria.requiredRating;
					break;

				case 'days_active':
					unlocked = daysActive >= achievement.criteria.threshold;
					break;
			}

			if (unlocked) {
				unlockedAchievements.push(achievementId);
			}
		}

		// Update user's achievements
		if (unlockedAchievements.length > 0) {
			user.achievements = [...currentAchievements, ...unlockedAchievements];
			await user.save();
		}

		res.status(200).json({
			success: true,
			message: `Unlocked ${unlockedAchievements.length} new achievements`,
			unlocked: unlockedAchievements.map(id => ({
				id,
				...achievementDefinitions[id]
			})),
			totalAchievements: user.achievements.length,
			allAchievements: user.achievements.map(id => ({
				id,
				...achievementDefinitions[id]
			}))
		});
	} catch (error) {
		console.error("Error in checkAndUnlockAchievements:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get user's achievements
export const getUserAchievements = async (req, res) => {
	try {
		const userId = req.params.userId || req.userId;

		const user = await User.findById(userId).select('achievements ecoPoints');
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		const unlockedAchievements = (user.achievements || []).map(id => ({
			id,
			...achievementDefinitions[id],
			unlocked: true
		}));

		// Get locked achievements
		const allAchievementIds = Object.keys(achievementDefinitions);
		const lockedAchievements = allAchievementIds
			.filter(id => !user.achievements?.includes(id))
			.map(id => ({
				id,
				...achievementDefinitions[id],
				unlocked: false
			}));

		// Calculate progress for locked achievements
		const progress = await calculateAchievementProgress(userId);

		res.status(200).json({
			success: true,
			ecoPoints: user.ecoPoints,
			unlocked: unlockedAchievements,
			locked: lockedAchievements.map(a => ({
				...a,
				progress: progress[a.id] || 0
			})),
			stats: {
				totalUnlocked: unlockedAchievements.length,
				totalLocked: lockedAchievements.length,
				completionPercentage: Math.round((unlockedAchievements.length / allAchievementIds.length) * 100)
			}
		});
	} catch (error) {
		console.error("Error in getUserAchievements:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Helper function to calculate progress for each achievement
async function calculateAchievementProgress(userId) {
	const progress = {};

	const listingsCount = await Listing.countDocuments({ owner: userId });
	const exchangesCount = await Exchange.countDocuments({
		$or: [{ requester: userId }, { receiver: userId }],
		status: 'completed'
	});
	const reviewsCount = await Review.countDocuments({ reviewedUser: userId });
	const recyclingsCount = await RecyclingSubmission.countDocuments({ 
		userId, 
		status: 'verified' 
	});

	const user = await User.findById(userId).select('ecoPoints createdAt joinedAt');
	const memberSince = user?.joinedAt || user?.createdAt;
	const daysActive = memberSince
		? Math.floor((new Date() - new Date(memberSince)) / (1000 * 60 * 60 * 24))
		: 0;

	for (const [id, achievement] of Object.entries(achievementDefinitions)) {
		let current = 0;
		let target = achievement.criteria.threshold;

		switch (achievement.criteria.type) {
			case 'count':
				switch (achievement.criteria.target) {
					case 'listings': current = listingsCount; break;
					case 'exchanges': current = exchangesCount; break;
					case 'reviews': current = reviewsCount; break;
					case 'recyclings': current = recyclingsCount; break;
				}
				break;
			case 'threshold':
				if (achievement.criteria.target === 'ecoPoints') {
					current = user?.ecoPoints || 0;
				}
				break;
			case 'days_active':
				current = daysActive;
				break;
		}

		progress[id] = Math.min(100, Math.round((current / target) * 100));
	}

	return progress;
}

// Get achievement leaderboard (users with most achievements)
export const getAchievementLeaderboard = async (req, res) => {
	try {
		const { limit = 10 } = req.query;

		const users = await User.find({ isBanned: false })
			.sort({ achievements: -1, ecoPoints: -1 })
			.limit(parseInt(limit))
			.select('name profilePicture achievements ecoPoints ecoTier');

		const leaderboard = users.map(user => ({
			userId: user._id,
			name: user.name,
			profilePicture: user.profilePicture,
			achievementsCount: user.achievements?.length || 0,
			ecoPoints: user.ecoPoints,
			ecoTier: user.ecoTier
		}));

		res.status(200).json({
			success: true,
			count: leaderboard.length,
			leaderboard
		});
	} catch (error) {
		console.error("Error in getAchievementLeaderboard:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
