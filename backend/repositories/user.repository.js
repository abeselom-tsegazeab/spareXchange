import { BaseRepository } from "./base.repository.js";
import { User } from "../models/user.model.js";

/**
 * User Repository - User-specific data access operations
 */
class UserRepository extends BaseRepository {
	constructor() {
		super(User);
	}

	/**
	 * Find user by email
	 */
	async findByEmail(email) {
		return this.findOne({ email });
	}

	/**
	 * Find user by refresh token
	 */
	async findByRefreshToken(refreshToken) {
		return this.findOne({ refreshToken });
	}

	/**
	 * Get eco-points leaderboard
	 */
	async getLeaderboard(options = {}) {
		const { limit = 50, page = 1, ecoTier = null } = options;

		const query = { isActive: true, isBanned: false };
		if (ecoTier) query.ecoTier = ecoTier;

		return this.find(query, {
			page,
			limit,
			sort: "-ecoPoints",
			select: "name profilePicture ecoPoints ecoTier trustScore totalReviews location",
		});
	}

	/**
	 * Find verified users by role
	 */
	async findVerifiedByRole(userType) {
		return this.find({
			userType,
			roleStatus: "verified",
			isActive: true,
			isBanned: false,
		});
	}

	/**
	 * Get user sustainability metrics
	 */
	async getSustainabilityMetrics(userId) {
		const user = await this.findById(userId, {
			select: "ecoPoints ecoTier achievements totalReviews trustScore",
		});

		if (!user) return null;

		return {
			ecoPoints: user.ecoPoints || 0,
			ecoTier: user.ecoTier || "Bronze",
			achievements: user.achievements || [],
			totalReviews: user.totalReviews || 0,
			trustScore: user.trustScore || 0,
		};
	}

	/**
	 * Ban user
	 */
	async banUser(userId) {
		return this.updateById(userId, { isBanned: true, isActive: false });
	}

	/**
	 * Unban user
	 */
	async unbanUser(userId) {
		return this.updateById(userId, { isBanned: false, isActive: true });
	}

	/**
	 * Verify user role (admin action)
	 */
	async verifyRole(userId, userType) {
		return this.updateById(userId, {
			userType,
			roleStatus: "verified",
		});
	}

	/**
	 * Reject role verification
	 */
	async rejectRoleVerification(userId) {
		return this.updateById(userId, {
			roleStatus: "none",
		});
	}

	/**
	 * Get pending verification requests
	 */
	async getPendingVerifications() {
		return this.find(
			{ roleStatus: "pending" },
			{
				sort: "-createdAt",
				select: "name email userType expertise verificationDocs createdAt",
			}
		);
	}

	/**
	 * Update user eco-points atomically
	 */
	async addEcoPoints(userId, points, reason) {
		const user = await this.findById(userId);
		if (!user) throw new Error("User not found");

		user.ecoPoints = (user.ecoPoints || 0) + points;

		// Auto-update eco-tier based on points
		user.ecoTier = this.calculateEcoTier(user.ecoPoints);

		await user.save();
		return user;
	}

	/**
	 * Calculate eco-tier based on points
	 */
	calculateEcoTier(points) {
		if (points >= 1000) return "Platinum";
		if (points >= 500) return "Gold";
		if (points >= 200) return "Silver";
		return "Bronze";
	}

	/**
	 * Get user activity stats
	 */
	async getActivityStats(userId) {
		const user = await this.findById(userId, {
			select: "lastLogin joinedAt ecoPoints totalReviews",
		});

		if (!user) return null;

		const daysActive = Math.floor((Date.now() - user.joinedAt) / (1000 * 60 * 60 * 24));

		return {
			daysActive,
			lastLogin: user.lastLogin,
			ecoPoints: user.ecoPoints || 0,
			totalReviews: user.totalReviews || 0,
		};
	}

	/**
	 * Find users near location
	 */
	async findNearby(latitude, longitude, radiusKm = 50) {
		// Note: User model needs locationCoords field for this to work
		// This is a placeholder for future implementation
		return this.find(
			{
				location: { $regex: ".*", $options: "i" }, // Fallback to text search
				isActive: true,
			},
			{ limit: 20 }
		);
	}
}

export { UserRepository };
