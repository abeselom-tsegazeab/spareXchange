import mongoose from "mongoose";
import { RecyclingSubmission } from "../models/recyclingSubmission.model.js";
import { User } from "../models/user.model.js";
import crypto from "crypto";

// Calculate eco points based on item type and weight/value
const calculateEcoPoints = (itemType, estimatedWeight, estimatedValue) => {
	// Base points per item type
	const basePoints = {
		electronics: 20,
		"vehicle-parts": 25,
		"mobile-devices": 15,
		computers: 30,
		batteries: 10,
		appliances: 20,
		plastic: 5,
		metal: 8,
		other: 10,
	};

	let points = basePoints[itemType] || 10; // default to 10 if type not found

	// Adjust points based on weight (if provided)
	if (estimatedWeight) {
		points = Math.round(points * estimatedWeight);
	} else if (estimatedValue) {
		// Adjust points based on value if weight not provided
		points = Math.round(points * (estimatedValue / 100));
	}

	// Ensure points are reasonable
	return Math.max(5, Math.min(500, points)); // between 5 and 500 points
};

// Create a new recycling submission
export const createRecyclingSubmission = async (req, res) => {
	try {
		const { itemType, itemDescription, estimatedWeight, estimatedValue, location, latitude, longitude, verificationImages, notes } = req.body;

		// Validate required fields
		if (!itemType || !itemDescription || !location) {
			return res.status(400).json({ success: false, message: "Item type, description, and location are required" });
		}

		// Calculate eco points
		const ecoPointsEarned = calculateEcoPoints(itemType, estimatedWeight, estimatedValue);

		const verificationToken = crypto.randomInt(100000, 999999).toString();

		const newSubmission = new RecyclingSubmission({
			userId: req.userId, // from middleware
			itemType,
			itemDescription,
			estimatedWeight,
			estimatedValue,
			ecoPointsEarned,
			location,
			locationCoords: {
				type: "Point",
				coordinates: [Number(longitude) || 0, Number(latitude) || 0]
			},
			verificationImages: verificationImages || [],
			notes,
			verificationToken,
		});

		const savedSubmission = await newSubmission.save();

		// Generate a placeholder QR code data (in a real app, use a library like 'qrcode')
		const qrCodeData = `sparexchange:recycle:${verificationToken}`;

		res.status(201).json({
			success: true,
			message: "Recycling submission created successfully",
			submission: savedSubmission,
			qrCodeData, // Frontend can use this to generate a QR code
		});
	} catch (error) {
		console.error("Error in createRecyclingSubmission:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get all recycling submissions for a user
export const getUserRecyclingSubmissions = async (req, res) => {
	try {
		const submissions = await RecyclingSubmission.find({ userId: req.userId })
			.sort({ createdAt: -1 }); // newest first

		res.status(200).json({
			success: true,
			count: submissions.length,
			submissions,
		});
	} catch (error) {
		console.error("Error in getUserRecyclingSubmissions:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get all recycling submissions (for admin)
export const getAllRecyclingSubmissions = async (req, res) => {
	try {
		const { status, itemType } = req.query;

		// Build query object
		const query = {};
		if (status) query.status = status;
		if (itemType) query.itemType = itemType;

		const submissions = await RecyclingSubmission.find(query)
			.populate("userId", "name profilePicture")
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			count: submissions.length,
			submissions,
		});
	} catch (error) {
		console.error("Error in getAllRecyclingSubmissions:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get a single recycling submission
export const getRecyclingSubmission = async (req, res) => {
	try {
		const { id } = req.params;

		const submission = await RecyclingSubmission.findById(id)
			.populate("userId", "name profilePicture");

		if (!submission) {
			return res.status(404).json({ success: false, message: "Submission not found" });
		}

		// Check if the user is the owner of the submission or is an admin
		if (submission.userId.toString() !== req.userId) {
			// Additional checks for admin access could go here
		}

		res.status(200).json({
			success: true,
			submission,
		});
	} catch (error) {
		console.error("Error in getRecyclingSubmission:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Approve a recycling submission (for admin)
export const approveRecyclingSubmission = async (req, res) => {
	const session = await mongoose.startSession();
	try {
		const { id } = req.params;

		const submission = await RecyclingSubmission.findById(id);
		if (!submission) return res.status(404).json({ success: false, message: "Submission not found" });
		if (submission.status !== "pending") return res.status(400).json({ success: false, message: "Submission is not pending" });

		await session.withTransaction(async () => {
			// Update status and mark as verified
			submission.status = "approved";
			submission.verifiedBy = req.userId;
			submission.verifiedAt = new Date();
			await submission.save({ session });

			// Update user's eco points
			const user = await User.findById(submission.userId).session(session);
			if (user) {
				user.ecoPoints = (user.ecoPoints || 0) + submission.ecoPointsEarned;
				await user.save({ session });

				// Add to Ledger
				const EcoTx = mongoose.model("EcoPointTransaction");
				const transaction = new EcoTx({
					userId: user._id,
					points: submission.ecoPointsEarned,
					reason: "recycling",
					description: `Recycled ${submission.itemType}: ${submission.itemDescription}`,
					referenceId: submission._id
				});
				await transaction.save({ session });
			}
		});

		res.status(200).json({
			success: true,
			message: "Submission approved successfully and eco points added",
			submission,
		});
	} catch (error) {
		console.error("Error in approveRecyclingSubmission:", error);
		res.status(500).json({ success: false, message: "Server error" });
	} finally {
		await session.endSession();
	}
};

// Reject a recycling submission (for admin)
export const rejectRecyclingSubmission = async (req, res) => {
	try {
		const { id } = req.params;
		const { notes } = req.body;

		const submission = await RecyclingSubmission.findById(id);

		if (!submission) {
			return res.status(404).json({ success: false, message: "Submission not found" });
		}

		if (submission.status !== "pending") {
			return res.status(400).json({ success: false, message: "Submission is not pending" });
		}

		// Update status and add rejection notes
		submission.status = "rejected";
		submission.notes = notes || submission.notes;
		submission.verifiedBy = req.userId;
		submission.verifiedAt = new Date();
		await submission.save();

		res.status(200).json({
			success: true,
			message: "Submission rejected",
			submission,
		});
	} catch (error) {
		console.error("Error in rejectRecyclingSubmission:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Complete a recycling submission (for admin)
export const completeRecyclingSubmission = async (req, res) => {
	try {
		const { id } = req.params;

		const submission = await RecyclingSubmission.findById(id);

		if (!submission) {
			return res.status(404).json({ success: false, message: "Submission not found" });
		}

		if (submission.status !== "approved") {
			return res.status(400).json({ success: false, message: "Submission must be approved first" });
		}

		submission.status = "completed";
		await submission.save();

		res.status(200).json({
			success: true,
			message: "Submission marked as completed",
			submission,
		});
	} catch (error) {
		console.error("Error in completeRecyclingSubmission:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Verify recycling by token (Recycler Role)
export const verifyRecyclingByToken = async (req, res) => {
	const session = await mongoose.startSession();
	try {
		const { token } = req.body;

		// Find the pending submission with this token
		const submission = await RecyclingSubmission.findOne({ verificationToken: token, status: "pending" });
		if (!submission) return res.status(404).json({ success: false, message: "Invalid or expired verification token" });

		await session.withTransaction(async () => {
			submission.status = "approved";
			submission.isVerifiedByRecycler = true;
			submission.verifiedBy = req.userId; 
			submission.verifiedAt = new Date();
			await submission.save({ session });

			// Update user's eco points and ledger
			const user = await User.findById(submission.userId).session(session);
			if (user) {
				user.ecoPoints = (user.ecoPoints || 0) + submission.ecoPointsEarned;
				if (!user.achievements.includes("Eco Warrior (First Recycle)")) {
					user.achievements.push("Eco Warrior (First Recycle)");
				}
				await user.save({ session });

				const EcoTx = mongoose.model("EcoPointTransaction");
				const transaction = new EcoTx({
					userId: user._id,
					points: submission.ecoPointsEarned,
					reason: "recycling",
					description: `Recycled ${submission.itemType} (Verified by Recycler)`,
					referenceId: submission._id
				});
				await transaction.save({ session });
			}
		});

		res.status(200).json({
			success: true,
			message: "Recycling verified successfully and eco points awarded",
			submission,
		});
	} catch (error) {
		console.error("Error in verifyRecyclingByToken:", error);
		res.status(500).json({ success: false, message: "Server error" });
	} finally {
		await session.endSession();
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 10. Nearby Recycler Discovery (Map-based infrastructure)
// ──────────────────────────────────────────────────────────────────────────
export const getNearbyRecyclers = async (req, res) => {
	try {
		const { latitude, longitude, radius = 50 } = req.query;

		if (!latitude || !longitude) {
			return res.status(400).json({ success: false, message: "Latitude and longitude are required for discovery" });
		}

		// Find approved submissions nearby as a proxy for "Recycling stations"
		const nearbySubmissions = await RecyclingSubmission.find({
			locationCoords: {
				$near: {
					$geometry: {
						type: "Point",
						coordinates: [Number(longitude), Number(latitude)],
					},
					$maxDistance: Number(radius) * 1000, // Distance in meters
				},
			},
			status: { $in: ["approved", "completed"] },
		})
		.limit(30)
		.populate("userId", "name profilePicture");

		res.status(200).json({
			success: true,
			count: nearbySubmissions.length,
			data: nearbySubmissions
		});
	} catch (error) {
		console.error("Error in getNearbyRecyclers:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};