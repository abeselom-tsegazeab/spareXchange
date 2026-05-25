import { SavedSearch } from "../models/savedSearch.model.js";
import { Listing } from "../models/listing.model.js";
import { Notification } from "../models/notification.model.js";
import { emitToUser } from "../utils/socket.js";

function tokenize(q) {
	return String(q || "")
		.toLowerCase()
		.split(/\s+/)
		.map((t) => t.trim())
		.filter((t) => t.length > 1);
}

function buildListingQuery(savedSearch) {
	const { query, filters, geo, lastNotifiedAt } = savedSearch;

	const qTokens = tokenize(query);
	const f = filters || {};

	const listingQuery = {
		available: true,
		isActive: true,
	};

	// Only consider new listings since last notification scan
	if (lastNotifiedAt) {
		listingQuery.createdAt = { $gt: lastNotifiedAt };
	}

	// Structured filters
	if (f.category) listingQuery.category = f.category;
	if (f.condition) listingQuery.condition = f.condition;
	if (f.minPrice != null || f.maxPrice != null) {
		listingQuery.price = {};
		if (f.minPrice != null) listingQuery.price.$gte = Number(f.minPrice);
		if (f.maxPrice != null) listingQuery.price.$lte = Number(f.maxPrice);
	}
	if (f.brand || f.model || f.year) {
		const or = [];

		if (f.brand) or.push({ brand: { $regex: String(f.brand), $options: "i" } });
		if (f.model) or.push({ model: { $regex: String(f.model), $options: "i" } });

		if (f.brand) or.push({ "compatibleVehicles.brand": { $regex: String(f.brand), $options: "i" } });
		if (f.model) or.push({ "compatibleVehicles.model": { $regex: String(f.model), $options: "i" } });

		if (f.year != null) {
			const yr = Number(f.year);
			if (Number.isFinite(yr)) {
				or.push({
					compatibleVehicles: {
						$elemMatch: { yearStart: { $lte: yr }, yearEnd: { $gte: yr } },
					},
				});
			}
		}

		if (or.length > 0) listingQuery.$or = or;
	}

	// Keyword query (lightweight AND match on title/description)
	if (qTokens.length > 0) {
		listingQuery.$and = qTokens.map((t) => ({
			$or: [
				{ title: { $regex: t, $options: "i" } },
				{ description: { $regex: t, $options: "i" } },
			],
		}));
	}

	// Geo constraint
	if (geo?.latitude != null && geo?.longitude != null) {
		const lat = Number(geo.latitude);
		const lng = Number(geo.longitude);
		const radiusKm = Number(geo.radiusKm || 50);
		if (Number.isFinite(lat) && Number.isFinite(lng)) {
			listingQuery.locationCoords = {
				$near: {
					$geometry: { type: "Point", coordinates: [lng, lat] },
					$maxDistance: radiusKm * 1000,
				},
			};
		}
	}

	return listingQuery;
}

function scoreMatch(savedSearch, listing) {
	let score = 0;
	const reasons = [];

	const f = savedSearch.filters || {};
	const tokens = tokenize(savedSearch.query);

	if (tokens.length > 0) {
		const hay = `${listing.title || ""} ${listing.description || ""}`.toLowerCase();
		if (tokens.every((t) => hay.includes(t))) {
			score += 30;
			reasons.push("keywords");
		}
	}
	if (f.category && listing.category && String(f.category).toLowerCase() === String(listing.category).toLowerCase()) {
		score += 15;
		reasons.push("category_filter");
	}
	if (f.brand && listing.brand && String(f.brand).toLowerCase() === String(listing.brand).toLowerCase()) {
		score += 10;
		reasons.push("brand_filter");
	}
	if (f.model && listing.model && String(f.model).toLowerCase() === String(listing.model).toLowerCase()) {
		score += 10;
		reasons.push("model_filter");
	}
	if (f.year != null && Array.isArray(listing.compatibleVehicles)) {
		const yr = Number(f.year);
		if (
			Number.isFinite(yr) &&
			listing.compatibleVehicles.some((v) => (v.yearStart ?? -Infinity) <= yr && (v.yearEnd ?? Infinity) >= yr)
		) {
			score += 10;
			reasons.push("year_fitment");
		}
	}
	if (savedSearch.geo?.latitude != null && savedSearch.geo?.longitude != null) {
		score += 10;
		reasons.push("geo");
	}

	return { score, reasons: [...new Set(reasons)] };
}

export async function processSavedSearchAlerts({ limitSearches = 200, limitListingsPerSearch = 5 } = {}) {
	const now = new Date();

	const searches = await SavedSearch.find({ notify: true }).sort({ updatedAt: -1 }).limit(limitSearches);
	let notificationsCreated = 0;

	for (const s of searches) {
		const listingQuery = buildListingQuery(s);
		const listings = await Listing.find(listingQuery)
			.sort({ createdAt: -1 })
			.limit(limitListingsPerSearch)
			.select("_id title description brand category locationCoords compatibleVehicles");

		for (const listing of listings) {
			const exists = await Notification.countDocuments({
				userId: s.userId,
				type: "match",
				relatedId: listing._id,
				relatedModel: "Listing",
				"data.savedSearchId": s._id,
			});
			if (exists > 0) continue;

			const { score, reasons } = scoreMatch(s, listing);
			if (score < 25) continue;

			const n = await Notification.create({
				userId: s.userId,
				type: "match",
				title: "Saved search match",
				message: `A new listing matches your saved search${s.name ? `: ${s.name}` : ""}.`,
				link: `/listings/${listing._id}`,
				relatedId: listing._id,
				relatedModel: "Listing",
				data: {
					source: "saved_search",
					savedSearchId: s._id,
					score,
					reasons,
				},
			});

			emitToUser(s.userId.toString(), "new_notification", n);
			notificationsCreated += 1;
		}

		// Advance cursor to avoid re-scanning the same window forever.
		s.lastNotifiedAt = now;
		await s.save();
	}

	return { searchesProcessed: searches.length, notificationsCreated };
}

