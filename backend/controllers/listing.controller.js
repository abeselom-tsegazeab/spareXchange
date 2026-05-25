import mongoose from "mongoose";
import { Listing } from "../models/listing.model.js";
import { User } from "../models/user.model.js";
import { SearchLog } from "../models/searchLog.model.js";
import { Report } from "../models/report.model.js";
import * as matchingService from "../services/matching.service.js";
import { uploadImage } from "../services/image.service.js";
import { getRecommendations as fetchRecommendations } from "../services/recommendation.service.js";

// Create a new listing
export const createListing = async (req, res) => {
	try {
		const { title, description, price, category, condition, location, locationCoords, images, contactInfo, specifications, compatibleVehicles } = req.body;

		const user = await User.findById(req.userId);
		if (!user || user.isBanned) return res.status(403).json({ success: false, message: "Forbidden" });

		// Process images (Mocked Cloudinary)
		let processedImages = [];
		if (Array.isArray(images)) {
			console.log("Processing", images.length, "images...");
			const uploadPromises = images.map(img => uploadImage(img));
			processedImages = (await Promise.all(uploadPromises)).filter(url => url !== null);
		}

		// Validate required fields
		if (!title || !description || !price || !category || !condition || !location) {
			return res.status(400).json({ success: false, message: "All required fields must be filled" });
		}

		const newListing = new Listing({
			title,
			description,
			price,
			category,
			condition,
			location,
			locationCoords: locationCoords || { type: "Point", coordinates: [0, 0] },
			images: processedImages,
			seller: req.userId, // from middleware
			contactInfo,
			specifications,
			compatibleVehicles: compatibleVehicles || [],
		});

		const savedListing = await newListing.save();

		// Award 10 eco-points for posting (according to SRS)
		try {
			const pointsAwarded = 10;
			user.ecoPoints = (user.ecoPoints || 0) + pointsAwarded;
			
			if (!Array.isArray(user.achievements)) {
				user.achievements = [];
			}
			
			if (!user.achievements.includes("First Listing Posted")) {
				user.achievements.push("First Listing Posted");
			}
			await user.save();

			// Log transaction
			const transaction = new (mongoose.model("EcoPointTransaction"))({
				userId: req.userId,
				points: pointsAwarded,
				reason: "listing",
				description: `Posted a new spare part listing: ${savedListing.title}`,
				referenceId: savedListing._id,
			});
			await transaction.save();
		} catch (pointError) {
			console.error("Failed to award points for listing:", pointError);
		}

		// Trigger automated matching engine (async, don't block response)
		matchingService.scanMatches(savedListing);

		res.status(201).json({
			success: true,
			message: "Listing created successfully",
			listing: savedListing,
		});
	} catch (error) {
		console.error("Error in createListing:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get all listings with optional filters
export const getListings = async (req, res) => {
	try {
		const { category, condition, minPrice, maxPrice, location, search, sort } = req.query;

		// Build query object
		const query = { 
			available: true, 
			isActive: true,
			expiresAt: { $gt: new Date() } // Only show non-expired
		}; 

		if (category) query.category = category;
		if (condition) query.condition = condition;
		if (location) query.location = { $regex: location, $options: "i" }; // case-insensitive
		
		if (search) {
			const keywords = search.split(/\s+/).filter(k => k.length > 1);
			if (keywords.length > 0) {
				query.$and = keywords.map(kw => ({
					$or: [
						{ title: { $regex: kw, $options: "i" } },
						{ description: { $regex: kw, $options: "i" } },
						{ brand: { $regex: kw, $options: "i" } },
						{ model: { $regex: kw, $options: "i" } }
					]
				}));
			} else {
				query.title = { $regex: search, $options: "i" };
			}
		}

		// Advanced Filtering: Brand, Model, Year (Structured Compatibility)
		const { brand, model, year, latitude, longitude, radius } = req.query;
		
		if (brand || model || year) {
			const compatQuery = {};
			if (brand) compatQuery["compatibleVehicles.brand"] = { $regex: brand, $options: "i" };
			if (model) compatQuery["compatibleVehicles.model"] = { $regex: model, $options: "i" };
			if (year) {
				const yr = Number(year);
				compatQuery["compatibleVehicles"] = {
					$elemMatch: {
						yearStart: { $lte: yr },
						yearEnd: { $gte: yr }
					}
				};
			}
			
			// Combine with existing text filters or overwrite if preferred. 
			// For now, let's use $or to search both top-level and compatibleVehicles
			const topLevelFilter = {};
			if (brand) topLevelFilter.brand = { $regex: brand, $options: "i" };
			if (model) topLevelFilter.model = { $regex: model, $options: "i" };
			if (year) topLevelFilter.year = Number(year);

			query.$or = [
				topLevelFilter,
				compatQuery
			];
		}

		// Proximity Search (GeoJSON)
		if (latitude && longitude) {
			query.locationCoords = {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: [Number(longitude), Number(latitude)],
					},
					$maxDistance: (Number(radius) || 50) * 1000, // Default 50km
				},
			};
		}

		// Price range filter
		if (minPrice || maxPrice) {
			query.price = {};
			if (minPrice) query.price.$gte = Number(minPrice);
			if (maxPrice) query.price.$lte = Number(maxPrice);
		}

		// Sorting
		let sortOption = "-createdAt"; // default: newest first
		if (sort === "price-asc") sortOption = "price";
		if (sort === "price-desc") sortOption = "-price";
		if (sort === "oldest") sortOption = "createdAt";

		const listings = await Listing.find(query)
			.populate("seller", "name profilePicture verifiedSeller ecoPoints") // populate seller info
			.sort(sortOption);

		// Log search if search or category or location filters are used
		if (search || category || location) {
			try {
				const log = new SearchLog({
					userId: req.userId || null,
					query: search,
					filters: { category, condition, brand, model, year: year ? Number(year) : undefined, minPrice, maxPrice, location, latitude: latitude ? Number(latitude) : undefined, longitude: longitude ? Number(longitude) : undefined, radius: radius ? Number(radius) : undefined },
					resultsCount: listings.length,
				});
				await log.save();
			} catch (logError) {
				console.error("Failed to log search:", logError);
			}
		}

		res.status(200).json({
			success: true,
			count: listings.length,
			listings,
		});
	} catch (error) {
		console.error("Error in getListings:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get a single listing by ID
export const getListing = async (req, res) => {
	try {
		const { id } = req.params;

		const listing = await Listing.findOne({ _id: id, isActive: true })
			.populate("seller", "name profilePicture verifiedSeller ecoPoints location phone");

		if (!listing) {
			return res.status(404).json({ success: false, message: "Listing not found" });
		}

		// Increment view count
		listing.views += 1;
		await listing.save();

		res.status(200).json({
			success: true,
			listing,
		});
	} catch (error) {
		console.error("Error in getListing:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Update a listing
export const updateListing = async (req, res) => {
	try {
		const { id } = req.params;
		const { title, description, price, category, condition, location, locationCoords, images, contactInfo, specifications, available, compatibleVehicles } = req.body;

		const listing = await Listing.findById(id);

		if (!listing) {
			return res.status(404).json({ success: false, message: "Listing not found" });
		}

		// Check if the user is the owner of the listing
		if (listing.seller.toString() !== req.userId) {
			return res.status(403).json({ success: false, message: "Not authorized to update this listing" });
		}

		const updatedListing = await Listing.findByIdAndUpdate(
			id,
			{
				title,
				description,
				price,
				category,
				condition,
				location,
				locationCoords: locationCoords || listing.locationCoords,
				images: images || listing.images,
				contactInfo,
				specifications,
				available,
				compatibleVehicles: compatibleVehicles || listing.compatibleVehicles,
			},
			{ new: true } // return updated document
		).populate("seller", "name profilePicture verifiedSeller");

		res.status(200).json({
			success: true,
			message: "Listing updated successfully",
			listing: updatedListing,
		});
	} catch (error) {
		console.error("Error in updateListing:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Delete a listing
export const deleteListing = async (req, res) => {
	try {
		const { id } = req.params;

		const listing = await Listing.findById(id);

		if (!listing) {
			return res.status(404).json({ success: false, message: "Listing not found" });
		}

		// Check if the user is the owner of the listing
		if (listing.seller.toString() !== req.userId) {
			return res.status(403).json({ success: false, message: "Not authorized to delete this listing" });
		}

		listing.isActive = false;
		await listing.save();

		res.status(200).json({
			success: true,
			message: "Listing deleted successfully",
		});
	} catch (error) {
		console.error("Error in deleteListing:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get listings by current user
export const getUserListings = async (req, res) => {
	try {
		const listings = await Listing.find({ seller: req.userId, isActive: true })
			.sort({ createdAt: -1 }); // newest first

		res.status(200).json({
			success: true,
			count: listings.length,
			listings,
		});
	} catch (error) {
		console.error("Error in getUserListings:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Toggle listing availability
export const toggleListingAvailability = async (req, res) => {
	try {
		const { id } = req.params;

		const listing = await Listing.findById(id);

		if (!listing) {
			return res.status(404).json({ success: false, message: "Listing not found" });
		}

		// Check if the user is the owner of the listing
		if (listing.seller.toString() !== req.userId) {
			return res.status(403).json({ success: false, message: "Not authorized to update this listing" });
		}

		listing.available = !listing.available;
		await listing.save();

		res.status(200).json({
			success: true,
			message: `Listing marked as ${listing.available ? "available" : "unavailable"}`,
			available: listing.available,
		});
	} catch (error) {
		console.error("Error in toggleListingAvailability:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};



// Bulk create listings (for Garages/Recyclers)
export const bulkCreateListings = async (req, res) => {
	try {
		const { listings } = req.body;
		if (!Array.isArray(listings) || listings.length === 0) {
			return res.status(400).json({ success: false, message: "Valid listings array required" });
		}

		const user = await User.findById(req.userId);
		if (!user || user.isBanned) return res.status(403).json({ success: false, message: "Forbidden" });

		const sellerId = req.userId;
		const finalData = listings.map(l => {
			if (!l.title || !l.description || !l.price || !l.category || !l.condition || !l.location) {
				throw new Error("Missing required fields in one or more listings");
			}
			return {
				...l,
				seller: sellerId,
				images: l.images || [],
				compatibleVehicles: l.compatibleVehicles || []
			};
		});

		const saved = await Listing.insertMany(finalData);

		// Award points
		try {
			const totalPoints = saved.length * 10;
			user.ecoPoints = (user.ecoPoints || 0) + totalPoints;
			await user.save();

			const tx = new (mongoose.model("EcoPointTransaction"))({
				userId: sellerId,
				points: totalPoints,
				reason: "listing",
				description: `Bulk posted ${saved.length} items`,
			});
			await tx.save();
		} catch (e) {
			console.error("Bulk points error:", e);
		}

		res.status(201).json({
			success: true,
			message: `${saved.length} listings created`,
			count: saved.length
		});
	} catch (error) {
		console.error("Error in bulkCreateListings:", error.message);
		if (error.message.includes("Missing required fields")) {
			return res.status(400).json({ success: false, message: error.message });
		}
		res.status(500).json({ success: false, message: "Server error during bulk upload" });
	}
};

// Renew a listing (Reset expiration)
export const renewListing = async (req, res) => {
	try {
		const { id } = req.params;
		const listing = await Listing.findById(id);

		if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
		if (listing.seller.toString() !== req.userId) {
			return res.status(403).json({ success: false, message: "Not authorized" });
		}

		listing.expiresAt = new Date(+new Date() + 30 * 24 * 60 * 60 * 1000);
		listing.isActive = true; // Ensure it's active if it was archived
		await listing.save();

		res.status(200).json({
			success: true,
			message: "Listing renewed for 30 days",
			expiresAt: listing.expiresAt
		});
	} catch (error) {
		console.error("Error in renewListing:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Report a listing
export const reportListing = async (req, res) => {
	try {
		const { id } = req.params;
		const { reason, details } = req.body;

		if (!reason) return res.status(400).json({ success: false, message: "Reason is required" });

		const listing = await Listing.findById(id);
		if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });

		const newReport = new Report({
			reporter: req.userId,
			targetId: id,
			targetModel: "Listing",
			reason,
			details
		});

		await newReport.save();

		res.status(201).json({ success: true, message: "Listing reported successfully. Our team will review it." });
	} catch (error) {
		console.error("Error in reportListing:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const getRecommendations = async (req, res) => {
	try {
		const userId = req.userId;
		const recommendations = await fetchRecommendations(userId);

		res.status(200).json({
			success: true,
			count: recommendations.length,
			listings: recommendations
		});
	} catch (error) {
		console.error("Error in getRecommendations controller:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Community Compatibility Voting
export const voteCompatibility = async (req, res) => {
	try {
		const { id, vehicleId } = req.params;
		const { voteType } = req.body; // "up" or "down"

		if (!["up", "down"].includes(voteType)) {
			return res.status(400).json({ success: false, message: "Invalid vote type. Must be 'up' or 'down'." });
		}

		const listing = await Listing.findById(id);
		if (!listing) {
			return res.status(404).json({ success: false, message: "Listing not found" });
		}

		const vehicle = listing.compatibleVehicles.id(vehicleId);
		if (!vehicle) {
			return res.status(404).json({ success: false, message: "Compatible vehicle entry not found" });
		}

		// Check if user has already voted
		const existingVoteIndex = vehicle.voters.findIndex(v => v.user.toString() === req.userId);

		if (existingVoteIndex !== -1) {
			const existingVote = vehicle.voters[existingVoteIndex];
			if (existingVote.voteType === voteType) {
				return res.status(400).json({ success: false, message: "You have already voted this way." });
			} else {
				// Change vote
				if (voteType === "up") {
					vehicle.upvotes += 1;
					vehicle.downvotes = Math.max(0, vehicle.downvotes - 1);
				} else {
					vehicle.downvotes += 1;
					vehicle.upvotes = Math.max(0, vehicle.upvotes - 1);
				}
				existingVote.voteType = voteType;
			}
		} else {
			// New vote
			if (voteType === "up") {
				vehicle.upvotes += 1;
			} else {
				vehicle.downvotes += 1;
			}
			vehicle.voters.push({ user: req.userId, voteType });
		}

		await listing.save();

		res.status(200).json({
			success: true,
			message: "Vote recorded successfully",
			vehicle
		});
	} catch (error) {
		console.error("Error in voteCompatibility:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// High Demand/Low Supply Analytics for Sellers
export const getHighDemandAnalytics = async (req, res) => {
	try {
        // Find most frequent searches where result count was 0 or very small (e.g. < 2)
		const highDemandQueries = await SearchLog.aggregate([
			{ $match: { resultsCount: { $lt: 2 }, query: { $exists: true, $ne: "" }, createdAt: { $exists: true } } },
			{
				$group: {
					_id: { $toLower: "$query" },
					searchCount: { $sum: 1 },
					avgResults: { $avg: "$resultsCount" },
					lastSearched: { $max: "$createdAt" }
				}
			},
			{ $sort: { searchCount: -1 } },
			{ $limit: 20 }
		]);

		res.status(200).json({
			success: true,
			count: highDemandQueries.length,
			analytics: highDemandQueries
		});
	} catch (error) {
		console.error("Error in getHighDemandAnalytics:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Admin: Get ALL listings (including inactive/expired) with full owner details
export const getAllListingsAdmin = async (req, res) => {
	try {
		const { category, condition, status, available, search } = req.query;
		
		// Build query - no default filters for admin
		const query = {};
		
		if (category) query.category = category;
		if (condition) query.condition = condition;
		if (available !== undefined) query.available = available === "true";
		if (status !== undefined) query.isActive = status === "true";
		
		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ description: { $regex: search, $options: "i" } }
			];
		}

		const listings = await Listing.find(query)
			.populate("seller", "name email profilePicture verifiedSeller ecoPoints isBanned location phone createdAt userType")
			.sort("-createdAt");

		res.status(200).json({
			success: true,
			count: listings.length,
			listings,
		});
	} catch (error) {
		console.error("Error in getAllListingsAdmin:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};