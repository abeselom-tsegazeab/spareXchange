import { BaseRepository } from "./base.repository.js";
import { Listing } from "../models/listing.model.js";

/**
 * Listing Repository - Extends base repository with listing-specific queries
 * Encapsulates all database operations for listings
 */
class ListingRepository extends BaseRepository {
	constructor() {
		super(Listing);
	}

	/**
	 * Geospatial proximity search with distance calculation
	 * @param {Number} latitude 
	 * @param {Number} longitude 
	 * @param {Number} radiusKm - Radius in kilometers
	 * @param {Object} additionalFilters - Additional query filters
	 */
	async findByProximity(latitude, longitude, radiusKm = 50, additionalFilters = {}) {
		const query = {
			...additionalFilters,
			locationCoords: {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: [Number(longitude), Number(latitude)],
					},
					$maxDistance: radiusKm * 1000, // Convert km to meters
				},
			},
		};

		return this.find(query);
	}

	/**
	 * Geospatial search with distance field returned
	 * Uses $geoNear aggregation for precise distance calculation
	 */
	async findByProximityWithDistance(latitude, longitude, radiusKm = 50, filters = {}) {
		const pipeline = [
			{
				$geoNear: {
					near: {
						type: "Point",
						coordinates: [Number(longitude), Number(latitude)],
					},
					distanceField: "distanceInMeters",
					maxDistance: radiusKm * 1000,
					spherical: true,
					query: filters,
				},
			},
			{
				$lookup: {
					from: "users",
					localField: "seller",
					foreignField: "_id",
					as: "sellerInfo",
				},
			},
			{
				$unwind: {
					path: "$sellerInfo",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					title: 1,
					price: 1,
					category: 1,
					condition: 1,
					location: 1,
					images: 1,
					available: 1,
					distanceInMeters: 1,
					distanceInKm: { $divide: ["$distanceInMeters", 1000] },
					"sellerInfo.name": 1,
					"sellerInfo.profilePicture": 1,
					"sellerInfo.trustScore": 1,
				},
			},
			{ $sort: { distanceInMeters: 1 } },
		];

		return this.model.aggregate(pipeline);
	}

	/**
	 * Polygon/box search - Find listings within a geographic area
	 * Useful for "search in this area" map functionality
	 */
	async findByPolygon(coordinates, filters = {}) {
		const query = {
			...filters,
			locationCoords: {
				$geoWithin: {
					$geometry: {
						type: "Polygon",
						coordinates: [coordinates], // Array of [lng, lat] pairs forming closed polygon
					},
				},
			},
		};

		return this.find(query);
	}

	/**
	 * Advanced search with keyword, fitment, and filters
	 * Combines text search with structured compatibility matching
	 */
	async advancedSearch(searchParams) {
		const {
			search,
			category,
			condition,
			brand,
			model,
			year,
			minPrice,
			maxPrice,
			location,
			latitude,
			longitude,
			radius,
			page = 1,
			limit = 20,
			sort = "-createdAt",
		} = searchParams;

		// Base query
		const query = {
			available: true,
			isActive: true,
			expiresAt: { $gt: new Date() },
		};

		// Keyword search across multiple fields
		if (search) {
			const keywords = search.split(/\s+/).filter((k) => k.length > 1);
			if (keywords.length > 0) {
				query.$and = keywords.map((kw) => ({
					$or: [
						{ title: { $regex: kw, $options: "i" } },
						{ description: { $regex: kw, $options: "i" } },
						{ brand: { $regex: kw, $options: "i" } },
						{ model: { $regex: kw, $options: "i" } },
					],
				}));
			}
		}

		// Structured fitment filter
		if (brand || model || year) {
			const compatQuery = {};
			if (brand) compatQuery["compatibleVehicles.brand"] = { $regex: brand, $options: "i" };
			if (model) compatQuery["compatibleVehicles.model"] = { $regex: model, $options: "i" };
			if (year) {
				const yr = Number(year);
				compatQuery["compatibleVehicles"] = {
					$elemMatch: {
						yearStart: { $lte: yr },
						yearEnd: { $gte: yr },
					},
				};
			}

			const topLevelFilter = {};
			if (brand) topLevelFilter.brand = { $regex: brand, $options: "i" };
			if (model) topLevelFilter.model = { $regex: model, $options: "i" };
			if (year) topLevelFilter.year = Number(year);

			query.$or = [topLevelFilter, compatQuery];
		}

		// Other filters
		if (category) query.category = category;
		if (condition) query.condition = condition;
		if (location) query.location = { $regex: location, $options: "i" };
		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = Number(minPrice);
			if (maxPrice) query.price.$lte = Number(maxPrice);
		}

		// Geospatial filter
		if (latitude && longitude) {
			query.locationCoords = {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: [Number(longitude), Number(latitude)],
					},
					$maxDistance: (Number(radius) || 50) * 1000,
				},
			};
		}

		return this.find(query, { page, limit, sort });
	}

	/**
	 * Find listings by seller with pagination
	 */
	async findBySeller(sellerId, options = {}) {
		const { page = 1, limit = 10, includeInactive = false } = options;

		const query = { seller: sellerId };
		if (!includeInactive) {
			query.isActive = true;
		}

		return this.find(query, { page, limit, sort: "-createdAt" });
	}

	/**
	 * Get high-demand analytics (searches with low results)
	 */
	async getHighDemandAnalytics(searchLogModel, limit = 20) {
		return searchLogModel.aggregate([
			{
				$match: {
					resultsCount: { $lt: 2 },
					query: { $exists: true, $ne: "" },
					createdAt: { $exists: true },
				},
			},
			{
				$group: {
					_id: { $toLower: "$query" },
					searchCount: { $sum: 1 },
					avgResults: { $avg: "$resultsCount" },
					lastSearched: { $max: "$createdAt" },
				},
			},
			{ $sort: { searchCount: -1 } },
			{ $limit: limit },
		]);
	}

	/**
	 * Get trending categories (most listings created recently)
	 */
	async getTrendingCategories(days = 7) {
		const dateThreshold = new Date();
		dateThreshold.setDate(dateThreshold.getDate() - days);

		const pipeline = [
			{ $match: { createdAt: { $gte: dateThreshold }, isActive: true } },
			{
				$group: {
					_id: "$category",
					count: { $sum: 1 },
					avgPrice: { $avg: "$price" },
				},
			},
			{ $sort: { count: -1 } },
		];

		return this.aggregate(pipeline);
	}

	/**
	 * Bulk update listings (e.g., expire old listings)
	 */
	async bulkExpireListings() {
		const now = new Date();
		return this.updateMany(
			{ expiresAt: { $lt: now }, isActive: true },
			{ isActive: false }
		);
	}

	/**
	 * Get listing statistics
	 */
	async getStats() {
		const pipeline = [
			{ $match: { isActive: true } },
			{
				$group: {
					_id: null,
					totalListings: { $sum: 1 },
					availableListings: { $sum: { $cond: ["$available", 1, 0] } },
					avgPrice: { $avg: "$price" },
					totalViews: { $sum: "$views" },
				},
			},
		];

		const result = await this.aggregate(pipeline);
		return result[0] || { totalListings: 0, availableListings: 0, avgPrice: 0, totalViews: 0 };
	}
}

export { ListingRepository };
