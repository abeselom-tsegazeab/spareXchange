import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { SavedSearch } from "../models/savedSearch.model.js";
import { uploadImage, deleteImage, bulkUploadVerificationDocs } from "../services/image.service.js";

// Get all verified technicians
export const getTechnicians = async (req, res) => {
	try {
		const { expertise, search } = req.query;
		const query = { 
			userType: "technician", 
			roleStatus: "verified",
			isBanned: false
		};

		if (expertise) {
			query.expertise = { $regex: expertise, $options: "i" };
		}

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ expertise: { $regex: search, $options: "i" } }
			];
		}

		const technicians = await User.find(query).select("name email expertise totalReviews trustScore locationCoords");
		
		res.status(200).json({ success: true, count: technicians.length, technicians });
	} catch (error) {
		console.error("Error in getTechnicians:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get single technician profile
export const getTechnicianById = async (req, res) => {
	try {
		const { id } = req.params;
		const technician = await User.findOne({ _id: id, userType: "technician" }).select("-password -verificationDocs");
		
		if (!technician) {
			return res.status(404).json({ success: false, message: "Technician not found" });
		}

		res.status(200).json({ success: true, technician });
	} catch (error) {
		console.error("Error in getTechnicianById:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Redeem Eco Points
export const redeemPoints = async (req, res) => {
	try {
		const { points, rewardDescription } = req.body;
		const userId = req.userId;

		if (!points || points <= 0) {
			return res.status(400).json({ success: false, message: "Valid points amount is required" });
		}

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ success: false, message: "User not found" });

		// Role Check: Only verified users or technicians can redeem
		if (user.roleStatus !== "verified") {
			return res.status(403).json({ success: false, message: "Only verified users or technicians can redeem points" });
		}

		if (user.ecoPoints < points) {
			return res.status(400).json({ success: false, message: "Insufficient eco points" });
		}

		// Deduct points
		user.ecoPoints -= points;
		await user.save();

		// Log transaction
		const transaction = new (mongoose.model("EcoPointTransaction"))({
			userId,
			points: -points, // Negative for redemption
			reason: "redemption",
			description: rewardDescription || "Redeemed points for reward",
		});
		await transaction.save();

		res.status(200).json({
			success: true,
			message: `${points} points redeemed successfully`,
			currentPoints: user.ecoPoints,
			transaction
		});
	} catch (error) {
		console.error("Error in redeemPoints:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
// Request Role Verification (Upload Documents)
export const requestRoleVerification = async (req, res) => {
	try {
		const { requestedType } = req.body;
		const userId = req.userId;

		if (!requestedType) {
			return res.status(400).json({ success: false, message: "Requested role type is required" });
		}

		const user = await User.findById(userId);
		if (!user) return res.status(404).json({ success: false, message: "User not found" });

		if (user.roleStatus === "verified" && user.userType === requestedType) {
			return res.status(400).json({ success: false, message: "You are already verified for this role" });
		}

		// Handle file uploads
		if (!req.files || req.files.length === 0) {
			return res.status(400).json({ success: false, message: "At least one verification document is required" });
		}

		// Validate file types
		const allowedTypes = [
			'application/pdf',
			'image/jpeg',
			'image/png',
			'image/webp',
			'image/gif'
		];
		
		const invalidFiles = req.files.filter(file => !allowedTypes.includes(file.mimetype));
		if (invalidFiles.length > 0) {
			return res.status(400).json({ 
				success: false, 
				message: "Invalid file types. Only PDF, JPG, PNG, WebP, and GIF are allowed." 
			});
		}

		// Upload documents to Cloudinary (with local fallback)
		console.log(`\n=== VERIFICATION UPLOAD START ===`);
		console.log(`User ID: ${userId}`);
		console.log(`Requested Type: ${requestedType}`);
		console.log(`Number of files: ${req.files.length}`);
		console.log(`Cloudinary Configured: ${process.env.CLOUDINARY_CLOUD_NAME ? 'YES' : 'NO'}`);
		
		const docUrls = await bulkUploadVerificationDocs(req.files);
		
		console.log(`Upload results: ${docUrls.length} successful URL(s)`);
		console.log(`=== VERIFICATION UPLOAD END ===\n`);
		
		if (docUrls.length === 0) {
			console.error("ERROR: All document uploads failed!");
			return res.status(500).json({ 
				success: false, 
				message: "Failed to upload verification documents. Please try again. Check server logs for details." 
			});
		}

		console.log(`✓ Successfully uploaded ${docUrls.length} document(s)`);

		// Clear old verification docs and add new ones
		user.verificationDocs = docUrls;
		user.userType = requestedType; // Set intended role, but stay pending
		user.roleStatus = "pending";
		await user.save();

		res.status(200).json({
			success: true,
			message: "Verification request submitted successfully",
			roleStatus: "pending",
			docsCount: docUrls.length,
			docUrls: docUrls
		});
	} catch (error) {
		console.error("Error in requestRoleVerification:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Update User Profile
export const updateProfile = async (req, res) => {
	try {
		const { name, phone, location, interests, profilePicture } = req.body;
		const user = await User.findById(req.userId);
		if (!user) return res.status(404).json({ success: false, message: "User not found" });

		if (name) user.name = name.trim();
		if (phone) user.phone = phone.trim();
		if (location) user.location = location.trim();
		
		// Handle profile picture upload to Cloudinary
		if (req.file) {
			// Delete old profile picture if it exists and is from Cloudinary/local uploads
			if (user.profilePicture && (user.profilePicture.includes("res.cloudinary.com") || user.profilePicture.startsWith("/uploads/"))) {
				await deleteImage(user.profilePicture);
			}
			
			// Convert file to base64 and upload to Cloudinary
			const base64Data = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
			const cloudinaryUrl = await uploadImage(base64Data);
			
			if (cloudinaryUrl) {
				user.profilePicture = cloudinaryUrl;
			} else {
				// Fallback to local storage if Cloudinary fails
				user.profilePicture = `/uploads/profiles/${req.file.filename}`;
			}
		} else if (profilePicture) {
			// Delete old profile picture if updating with new URL
			if (user.profilePicture && (user.profilePicture.includes("res.cloudinary.com") || user.profilePicture.startsWith("/uploads/"))) {
				await deleteImage(user.profilePicture);
			}
			// Handle base64 data or URL from frontend
			if (profilePicture.startsWith("data:image")) {
				const cloudinaryUrl = await uploadImage(profilePicture);
				user.profilePicture = cloudinaryUrl || profilePicture;
			} else {
				user.profilePicture = profilePicture;
			}
		}
		
		if (interests && Array.isArray(interests)) user.interests = interests;

		await user.save();
		res.status(200).json({ success: true, message: "Profile updated successfully", user });
	} catch (error) {
		console.error("Error in updateProfile:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get Eco-Leaderboard
export const getLeaderboard = async (req, res) => {
	try {
		const leaderboard = await User.find({ isBanned: false })
			.sort({ ecoPoints: -1 })
			.limit(20)
			.select("name profilePicture ecoPoints achievements ecoTier");

		res.status(200).json({
			success: true,
			count: leaderboard.length,
			leaderboard
		});
	} catch (error) {
		console.error("Error in getLeaderboard:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get Leaderboard Statistics (Total Eco Points & Monthly Growth)
export const getLeaderboardStats = async (req, res) => {
	try {
		const now = new Date();
		
		// Current month boundaries
		const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
		const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
		
		// Previous month boundaries
		const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
		const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

		// Total eco points awarded (sum of all users' ecoPoints)
		const ecoPointsStats = await User.aggregate([
			{ $match: { ecoPoints: { $gt: 0 } } },
			{
				$group: {
					_id: null,
					totalEcoPoints: { $sum: "$ecoPoints" },
					usersWithPoints: { $sum: 1 }
				}
			}
		]);

		// Current month metrics
		const currentMonthUsers = await User.countDocuments({ 
			createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd } 
		});
		
		const currentMonthExchanges = await mongoose.model('Exchange').countDocuments({
			createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd }
		});
		
		const currentMonthRecycling = await mongoose.model('RecyclingSubmission').countDocuments({
			createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
			status: 'approved'
		});

		// Previous month metrics
		const prevMonthUsers = await User.countDocuments({ 
			createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd } 
		});
		
		const prevMonthExchanges = await mongoose.model('Exchange').countDocuments({
			createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd }
		});
		
		const prevMonthRecycling = await mongoose.model('RecyclingSubmission').countDocuments({
			createdAt: { $gte: prevMonthStart, $lte: prevMonthEnd },
			status: 'approved'
		});

		// Calculate monthly growth percentage
		// Weight: 40% new users, 30% eco points (from total), 30% activity (exchanges + recycling)
		const userGrowth = prevMonthUsers > 0 
			? ((currentMonthUsers - prevMonthUsers) / prevMonthUsers) * 100 
			: (currentMonthUsers > 0 ? 100 : 0);
		
		const activityGrowth = (prevMonthExchanges + prevMonthRecycling) > 0
			? (((currentMonthExchanges + currentMonthRecycling) - (prevMonthExchanges + prevMonthRecycling)) / 
			   (prevMonthExchanges + prevMonthRecycling)) * 100
			: ((currentMonthExchanges + currentMonthRecycling) > 0 ? 100 : 0);

		// Overall monthly growth (weighted average)
		const monthlyGrowth = (userGrowth * 0.4) + (activityGrowth * 0.6);

		res.status(200).json({
			success: true,
			stats: {
				totalEcoPointsAwarded: ecoPointsStats[0]?.totalEcoPoints || 0,
				usersWithPoints: ecoPointsStats[0]?.usersWithPoints || 0,
				monthlyGrowth: {
					percentage: Math.round(monthlyGrowth * 10) / 10, // Round to 1 decimal
					newUsersThisMonth: currentMonthUsers,
					newUsersLastMonth: prevMonthUsers,
					exchangesThisMonth: currentMonthExchanges,
					exchangesLastMonth: prevMonthExchanges,
					recyclingThisMonth: currentMonthRecycling,
					recyclingLastMonth: prevMonthRecycling
				}
			}
		});
	} catch (error) {
		console.error("Error in getLeaderboardStats:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ────────────────────────────────────────────────────────────────────────
// Saved Searches (Module 6 - modern matching)
// ────────────────────────────────────────────────────────────────────────

export const listSavedSearches = async (req, res) => {
	try {
		const searches = await SavedSearch.find({ userId: req.userId }).sort({ updatedAt: -1 });
		res.status(200).json({ success: true, count: searches.length, searches });
	} catch (error) {
		console.error("Error in listSavedSearches:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const createSavedSearch = async (req, res) => {
	try {
		const { name, query, filters, geo, notify } = req.body || {};

		const saved = await SavedSearch.create({
			userId: req.userId,
			name: typeof name === "string" ? name.trim() : "",
			query: typeof query === "string" ? query.trim() : "",
			filters: filters || {},
			geo: geo || undefined,
			notify: notify !== false,
		});

		res.status(201).json({ success: true, savedSearch: saved });
	} catch (error) {
		console.error("Error in createSavedSearch:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const updateSavedSearch = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, query, filters, geo, notify } = req.body || {};

		const saved = await SavedSearch.findOne({ _id: id, userId: req.userId });
		if (!saved) return res.status(404).json({ success: false, message: "Saved search not found" });

		if (typeof name === "string") saved.name = name.trim();
		if (typeof query === "string") saved.query = query.trim();
		if (filters && typeof filters === "object") saved.filters = { ...saved.filters, ...filters };
		if (geo && typeof geo === "object") saved.geo = { ...saved.geo, ...geo };
		if (typeof notify === "boolean") saved.notify = notify;

		await saved.save();
		res.status(200).json({ success: true, savedSearch: saved });
	} catch (error) {
		console.error("Error in updateSavedSearch:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const deleteSavedSearch = async (req, res) => {
	try {
		const { id } = req.params;
		const deleted = await SavedSearch.findOneAndDelete({ _id: id, userId: req.userId });
		if (!deleted) return res.status(404).json({ success: false, message: "Saved search not found" });
		res.status(200).json({ success: true, message: "Saved search deleted" });
	} catch (error) {
		console.error("Error in deleteSavedSearch:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
