import { Listing } from "../models/listing.model.js";
import { SearchLog } from "../models/searchLog.model.js";
import { User } from "../models/user.model.js";
import { SavedSearch } from "../models/savedSearch.model.js";

export const getRecommendations = async (userId) => {
	try {
		const user = await User.findById(userId).select("interests locationCoords");

		// 1. Get user's recent search history
		const userLogs = await SearchLog.find({ userId })
			.sort({ createdAt: -1 })
			.limit(10);

		// 2. Saved searches (explicit intent > implicit logs)
		const saved = await SavedSearch.find({ userId, notify: true }).sort({ updatedAt: -1 }).limit(10);

		// 3. Extract unique categories/brands/models from logs + saved searches
		const categories = [...new Set(userLogs.map(log => log.filters?.category).filter(Boolean))];
		const brands = [...new Set(userLogs.map(log => log.filters?.brand).filter(Boolean))];
		const models = [...new Set(userLogs.map(log => log.filters?.model).filter(Boolean))];
		const savedCategories = [...new Set(saved.map(s => s.filters?.category).filter(Boolean))];
		const savedBrands = [...new Set(saved.map(s => s.filters?.brand).filter(Boolean))];
		const savedModels = [...new Set(saved.map(s => s.filters?.model).filter(Boolean))];
		const interestTokens = Array.isArray(user?.interests) ? user.interests.filter(Boolean) : [];

		const mergedCategories = [...new Set([...categories, ...savedCategories])];
		const mergedBrands = [...new Set([...brands, ...savedBrands])];
		const mergedModels = [...new Set([...models, ...savedModels])];

		// 4. Find listings that match these categories or brands/models
		const query = {
			seller: { $ne: userId }, // Don't recommend own listings
			available: true,
			isActive: true,
			$or: [
				{ category: { $in: mergedCategories } },
				{ brand: { $in: mergedBrands } },
				{ model: { $in: mergedModels } },
				{ "compatibleVehicles.brand": { $in: mergedBrands } },
				{ "compatibleVehicles.model": { $in: mergedModels } },
				{ title: { $regex: interestTokens.join("|"), $options: "i" } },
			]
		};

		let base = Listing.find(query).populate("seller", "name profilePicture verifiedSeller ecoPoints");

		// Optional proximity boost: if user has locationCoords, prefer nearby
		if (user?.locationCoords?.coordinates?.length === 2) {
			const [lng, lat] = user.locationCoords.coordinates;
			base = base.sort({
				// keep it simple: still newest-first, real geo scoring would be via aggregation
				createdAt: -1
			});
			// (Geo-aware scoring is handled by listing discovery; recommendations remain lightweight.)
		} else {
			base = base.sort({ createdAt: -1 });
		}

		const recommendedListings = await base.limit(12);

		if (recommendedListings.length > 0) return recommendedListings;

		// Fallback: return most viewed active listings
		return await Listing.find({ available: true, isActive: true })
			.sort({ views: -1, createdAt: -1 })
			.limit(6)
			.populate("seller", "name profilePicture verifiedSeller ecoPoints");
	} catch (error) {
		console.error("Error in getRecommendations logic:", error);
		return [];
	}
};
