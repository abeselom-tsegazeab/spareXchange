import { BaseRepository } from "./base.repository.js";
import { Exchange } from "../models/exchange.model.js";

/**
 * Exchange Repository - Exchange-specific data access operations
 */
class ExchangeRepository extends BaseRepository {
	constructor() {
		super(Exchange);
	}

	/**
	 * Get exchanges for a user (buyer or seller)
	 */
	async getUserExchanges(userId, options = {}) {
		const { status, page = 1, limit = 10 } = options;

		const query = {
			$or: [{ buyerId: userId }, { sellerId: userId }],
		};

		if (status) query.status = status;

		return this.find(query, {
			page,
			limit,
			sort: "-createdAt",
			populate: [
				{ path: "buyerId", select: "name profilePicture trustScore" },
				{ path: "sellerId", select: "name profilePicture trustScore" },
				{ path: "listingId", select: "title images price" },
			],
		});
	}

	/**
	 * Get pending exchanges for a listing (for auto-sweep)
	 */
	async getPendingForListing(listingId, excludeExchangeId = null) {
		const query = {
			$or: [{ listingId }, { offeredListingId: listingId }],
			status: { $in: ["pending", "counter_offered", "accepted"] },
		};

		if (excludeExchangeId) {
			query._id = { $ne: excludeExchangeId };
		}

		return this.find(query);
	}

	/**
	 * Get exchanges by status
	 */
	async getByStatus(status, options = {}) {
		const { page = 1, limit = 20 } = options;

		return this.find({ status }, {
			page,
			limit,
			sort: "-createdAt",
		});
	}

	/**
	 * Get disputed exchanges
	 */
	async getDisputedExchanges() {
		return this.find({ disputeStatus: "open" }, {
			sort: "-createdAt",
			populate: [
				{ path: "buyerId", select: "name email" },
				{ path: "sellerId", select: "name email" },
				{ path: "listingId", select: "title" },
			],
		});
	}

	/**
	 * Get exchange statistics
	 */
	async getStats() {
		const pipeline = [
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
				},
			},
		];

		const results = await this.aggregate(pipeline);

		const stats = {
			total: 0,
			byStatus: {},
		};

		results.forEach((r) => {
			stats.byStatus[r._id] = r.count;
			stats.total += r.count;
		});

		return stats;
	}

	/**
	 * Get exchanges completed in date range
	 */
	async getCompletedInDateRange(startDate, endDate) {
		return this.find({
			status: "fully_completed",
			createdAt: {
				$gte: new Date(startDate),
				$lte: new Date(endDate),
			},
		});
	}

	/**
	 * Get user's exchange history with metrics
	 */
	async getUserExchangeHistory(userId) {
		const pipeline = [
			{
				$match: {
					$or: [
						{ buyerId: userId },
						{ sellerId: userId },
					],
				},
			},
			{
				$group: {
					_id: null,
					totalExchanges: { $sum: 1 },
					completed: {
						$sum: { $cond: [{ $eq: ["$status", "fully_completed"] }, 1, 0] },
					},
					cancelled: {
						$sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
					},
					disputed: {
						$sum: { $cond: [{ $eq: ["$status", "disputed"] }, 1, 0] },
					},
				},
			},
		];

		const result = await this.aggregate(pipeline);
		return result[0] || { totalExchanges: 0, completed: 0, cancelled: 0, disputed: 0 };
	}

	/**
	 * Expire old pending exchanges
	 */
	async expireOldExchanges() {
		const now = new Date();
		return this.updateMany(
			{
				status: "pending",
				expiresAt: { $lt: now },
			},
			{
				status: "expired",
				$push: {
					history: {
						action: "auto_expired",
						by: null,
						at: now,
						note: "Proposal expired after 7 days",
					},
				},
			}
		);
	}
}

export { ExchangeRepository };
