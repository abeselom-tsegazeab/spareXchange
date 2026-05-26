import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { emitToUser } from "../utils/socket.js";
import { SavedSearch } from "../models/savedSearch.model.js";

/**
 * Scans for users who might be interested in a new listing
 * based on their interests and proximity.
 */
export const scanMatches = async (listing) => {
	try {
		const { category, brand, model, year, title, description, locationCoords, seller, _id: listingId, compatibleVehicles } = listing;

		const safeText = `${title || ""} ${description || ""}`.toLowerCase();

		// Modern matching: combine explicit saved searches + user interests.
		// 1) Saved searches (explicit intent)
		const savedSearches = await SavedSearch.find({ notify: true }).select("userId query filters geo");
		const savedUserIds = [...new Set(savedSearches.map(s => s.userId.toString()))];

		// 2) Interest-based discovery (implicit intent)
		const interestUsers = await User.find({
			_id: { $ne: seller },
			isBanned: false,
			isActive: true,
			$or: [
				{ interests: { $in: [category, brand, model].filter(Boolean) } },
				{ interests: { $regex: new RegExp(String(category || ""), "i") } }
			],
			locationCoords: {
				$near: {
					$geometry: locationCoords,
					$maxDistance: 50000
				}
			}
		}).select("_id");

		const candidateUserIds = new Set([...savedUserIds, ...interestUsers.map(u => u._id.toString())].filter(Boolean));

		const users = await User.find({ _id: { $in: Array.from(candidateUserIds) } }).select("_id interests locationCoords");

		const matched = [];
		for (const user of users) {
			if (user._id.toString() === String(seller)) continue;

			let score = 0;
			const reasons = [];

			// Interests match
			const interests = Array.isArray(user.interests) ? user.interests.map(i => String(i).toLowerCase()) : [];
			if (category && interests.includes(String(category).toLowerCase())) { score += 25; reasons.push("category"); }
			if (brand && interests.includes(String(brand).toLowerCase())) { score += 15; reasons.push("brand"); }
			if (model && interests.includes(String(model).toLowerCase())) { score += 10; reasons.push("model"); }

			// Fitment match (compatibleVehicles)
			if (Array.isArray(compatibleVehicles) && compatibleVehicles.length > 0) {
				const fitmentTokens = compatibleVehicles
					.flatMap(v => [v.brand, v.model])
					.filter(Boolean)
					.map(s => String(s).toLowerCase());
				const overlap = fitmentTokens.filter(t => interests.includes(t));
				if (overlap.length > 0) { score += 20; reasons.push("fitment"); }
			}

			// Saved search match (keywords + structured)
			const mySaved = savedSearches.filter(s => s.userId.toString() === user._id.toString());
			for (const s of mySaved) {
				const q = (s.query || "").trim().toLowerCase();
				const f = s.filters || {};

				let thisMatch = 0;
				const thisReasons = [];

				if (q) {
					const tokens = q.split(/\s+/).filter(t => t.length > 1);
					if (tokens.length > 0 && tokens.every(t => safeText.includes(t))) {
						thisMatch += 30;
						thisReasons.push("keywords");
					}
				}
				if (f.category && category && String(f.category).toLowerCase() === String(category).toLowerCase()) { thisMatch += 15; thisReasons.push("category_filter"); }
				if (f.brand && brand && String(f.brand).toLowerCase() === String(brand).toLowerCase()) { thisMatch += 10; thisReasons.push("brand_filter"); }
				if (f.model && model && String(f.model).toLowerCase() === String(model).toLowerCase()) { thisMatch += 10; thisReasons.push("model_filter"); }
				if (f.year && (year || Number.isFinite(Number(year)))) {
					const yr = Number(year);
					if (Number.isFinite(yr) && Array.isArray(compatibleVehicles) && compatibleVehicles.some(v => (v.yearStart ?? -Infinity) <= yr && (v.yearEnd ?? Infinity) >= yr)) {
						thisMatch += 10;
						thisReasons.push("year_fitment");
					}
				}

				// Geo constraint for saved search (if provided)
				if (s.geo?.latitude != null && s.geo?.longitude != null) {
					const dLat = Number(s.geo.latitude);
					const dLng = Number(s.geo.longitude);
					const radiusKm = Number(s.geo.radiusKm || 50);
					if (Number.isFinite(dLat) && Number.isFinite(dLng) && locationCoords?.coordinates?.length === 2) {
						// Rough distance check using bounding (cheap) – DB already enforces proximity for interest users.
						// If listing is far, zero out this saved-search contribution.
						const [lLng, lLat] = locationCoords.coordinates;
						const latDiff = Math.abs(lLat - dLat);
						const lngDiff = Math.abs(lLng - dLng);
						const approxKm = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111;
						if (approxKm > radiusKm) {
							thisMatch = 0;
						} else {
							thisMatch += 10;
							thisReasons.push("geo");
						}
					}
				}

				if (thisMatch > 0) {
					score += thisMatch;
					reasons.push(...thisReasons);
				}
			}

			if (score >= 30) matched.push({ userId: user._id, score, reasons: [...new Set(reasons)] });
		}

		console.log(`Found ${matched.length} matches for listing ${listingId}`);

		// 2. Create notifications (dedup per user+listing)
		const notificationPromises = matched.map(async (m) => {
			const exists = await Notification.countDocuments({
				userId: m.userId,
				type: "match",
				relatedId: listingId,
				relatedModel: "Listing",
			});
			if (exists > 0) return null;

			const newNotification = await Notification.create({
				userId: m.userId,
				type: "match",
				title: "New Spare Part Match!",
				message: `A new ${brand || ""} ${category} listing matches your interests.`,
				link: `/listings/${listingId}`,
				relatedId: listingId,
				relatedModel: "Listing",
				data: { score: m.score, reasons: m.reasons }
			});
			emitToUser(m.userId.toString(), "new_notification", newNotification);
			return newNotification;
		});

		await Promise.all(notificationPromises);

	} catch (error) {
		console.error("Error in scanMatches service:", error);
	}
};

/**
 * Scans for technicians whose expertise matches a new service request
 * and are within the specified proximity.
 */
export const scanTechnicianMatches = async (technicianRequest) => {
	try {
		const { serviceType, locationCoords, userId: customerId, _id: requestId } = technicianRequest;

		// 1. Find verified technicians with matching expertise within 50km
		const matchedTechnicians = await User.find({
			_id: { $ne: customerId },
			userType: "technician",
			roleStatus: "verified",
			expertise: { $regex: new RegExp(serviceType, "i") }, // match expertise to serviceType
			locationCoords: {
				$near: {
					$geometry: locationCoords,
					$maxDistance: 75000 // 75km range for services
				}
			}
		}).select("_id name");

		console.log(`Found ${matchedTechnicians.length} technicians for request ${requestId}`);

		// 2. Create notifications and emit real-time alerts
		const notificationPromises = matchedTechnicians.map(tech => {
			const newNotification = new Notification({
				userId: tech._id,
				type: "technician-request",
				title: "New Service Request Proximity!",
				message: `A new ${serviceType} request was posted near you. Send a quote now!`,
				link: `/technician-requests/${requestId}`,
				relatedId: requestId,
				relatedModel: "TechnicianRequest"
			});
			emitToUser(tech._id.toString(), "new_notification", newNotification);
			return newNotification.save();
		});

		await Promise.all(notificationPromises);

	} catch (error) {
		console.error("Error in scanTechnicianMatches service:", error);
	}
};
