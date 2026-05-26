import { TechnicianRequest } from "../models/technicianRequest.model.js";
import { User } from "../models/user.model.js";
import { scanTechnicianMatches } from "../services/matching.service.js";
import crypto from "crypto";
import mongoose from "mongoose";

// Create a new technician request
export const createTechnicianRequest = async (req, res) => {
	try {
		const { serviceType, description, location, latitude, longitude, contactInfo, priority, images, budgetMin, budgetMax } = req.body;

		// Validate required fields
		if (!serviceType || !description || !location) {
			return res.status(400).json({ success: false, message: "Service type, description, and location are required" });
		}

		const newRequest = new TechnicianRequest({
			userId: req.userId,
			serviceType,
			description,
			location,
			locationCoords: {
				type: "Point",
				coordinates: [Number(longitude) || 0, Number(latitude) || 0]
			},
			contactInfo,
			priority: priority || "medium",
			images: images || [],
			budgetMin,
			budgetMax
		});

		const savedRequest = await newRequest.save();

		// Trigger matching service
		// In tests we await to make notification assertions deterministic.
		if (process.env.NODE_ENV === "test") {
			await scanTechnicianMatches(savedRequest);
		} else {
			scanTechnicianMatches(savedRequest);
		}

		res.status(201).json({
			success: true,
			message: "Technician request created successfully. Matching service initiated.",
			request: savedRequest,
		});
	} catch (error) {
		console.error("Error in createTechnicianRequest:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Technicians: Submit a quote (bid) for a request
export const submitQuote = async (req, res) => {
	try {
		const { id } = req.params;
		const { estimatedCost, additionalNotes } = req.body;
		const techId = req.userId;

		// 1. Verify user is a technician
		const tech = await User.findById(techId);
		if (!tech || tech.userType !== "technician" || tech.roleStatus !== "verified") {
			return res.status(403).json({ success: false, message: "Only verified technicians can submit quotes" });
		}

		const request = await TechnicianRequest.findById(id);
		if (!request) return res.status(404).json({ success: false, message: "Request not found" });

		if (request.status !== "pending" && request.status !== "quoted") {
			return res.status(400).json({ success: false, message: "Cannot submit quotes for this request state" });
		}

		// 2. Add or update quote
		const existingQuoteIndex = request.quotes.findIndex(q => q.technicianId.toString() === techId);
		if (existingQuoteIndex > -1) {
			request.quotes[existingQuoteIndex].estimatedCost = estimatedCost;
			request.quotes[existingQuoteIndex].additionalNotes = additionalNotes;
		} else {
			request.quotes.push({ technicianId: techId, estimatedCost, additionalNotes });
		}

		request.status = "quoted";
		await request.save();

		res.status(200).json({ success: true, message: "Quote submitted successfully", quotesCount: request.quotes.length });
	} catch (error) {
		console.error("Error in submitQuote:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Users: Accept a specific quote and hire the technician
export const acceptQuote = async (req, res) => {
	try {
		const { id, techId } = req.params; // Request ID and Technician ID

		const request = await TechnicianRequest.findById(id);
		if (!request) return res.status(404).json({ success: false, message: "Request not found" });

		if (request.userId.toString() !== req.userId) {
			return res.status(403).json({ success: false, message: "Not authorized to accept quotes for this request" });
		}

		const selectedQuote = request.quotes.find(q => q.technicianId.toString() === techId);
		if (!selectedQuote) return res.status(404).json({ success: false, message: "Quote not found" });

		// Assign technician and set final cost
		request.assignedTechnician = techId;
		request.estimatedCost = selectedQuote.estimatedCost;
		request.status = "accepted";
		await request.save();

		res.status(200).json({ success: true, message: "Technician hired successfully", assignedTechnician: techId });
	} catch (error) {
		console.error("Error in acceptQuote:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Technicians: Generate 6-digit handshake token when work is done
export const generateVerificationToken = async (req, res) => {
	try {
		const { id } = req.params;
		const request = await TechnicianRequest.findById(id);

		if (!request || request.assignedTechnician?.toString() !== req.userId) {
			return res.status(403).json({ success: false, message: "Only the assigned technician can generate a completion token" });
		}

		const token = crypto.randomInt(100000, 999999).toString();
		request.verificationToken = token;
		request.status = "started"; // Work is underway or nearly finished
		await request.save();

		res.status(200).json({ success: true, message: "Handshake token generated", token });
	} catch (error) {
		console.error("Error in generateVerificationToken:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Users: Complete the request by providing the 6-digit handshake token
export const completeWithToken = async (req, res) => {
	const session = await mongoose.startSession();
	try {
		const { id } = req.params;
		const { token } = req.body;

		const request = await TechnicianRequest.findById(id);

		if (!request || request.userId.toString() !== req.userId) {
			return res.status(403).json({ success: false, message: "Only the request owner can provide the completion token" });
		}

		if (request.verificationToken !== token) {
			return res.status(400).json({ success: false, message: "Invalid verification token" });
		}

		await session.withTransaction(async () => {
			request.status = "completed";
			request.verificationToken = undefined;
			await request.save({ session });

			// Reward Technician: Increase Trust Score and Job Count
			const technician = await User.findById(request.assignedTechnician).session(session);
			if (technician) {
				technician.totalReviews = (technician.totalReviews || 0) + 1;
				technician.trustScore = Math.min(100, (technician.trustScore || 80) + 2); // Boost trust score
				
				if (!technician.achievements.includes("Pro Service (First Job)")) {
					technician.achievements.push("Pro Service (First Job)");
				}
				
				await technician.save({ session });
			}
		});

		res.status(200).json({ success: true, message: "Service request completed successfully. Handshake verified." });
	} catch (error) {
		console.error("Error in completeWithToken:", error);
		res.status(500).json({ success: false, message: "Server error" });
	} finally {
		await session.endSession();
	}
};

// Normal GET/UPDATE/DELETE operations
export const getUserTechnicianRequests = async (req, res) => {
	try {
		const requests = await TechnicianRequest.find({ userId: req.userId }).sort({ createdAt: -1 });
		res.status(200).json({ success: true, count: requests.length, requests });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const getAllTechnicianRequests = async (req, res) => {
	try {
		const { status, serviceType, priority } = req.query;
		const query = {};
		if (status) query.status = status;
		if (serviceType) query.serviceType = serviceType;
		if (priority) query.priority = priority;

		const requests = await TechnicianRequest.find(query)
			.populate("userId", "name profilePicture location")
			.sort({ createdAt: -1 });

		res.status(200).json({ success: true, count: requests.length, requests });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const getTechnicianRequest = async (req, res) => {
	try {
		const { id } = req.params;
		const request = await TechnicianRequest.findById(id)
			.populate("userId", "name profilePicture location phone")
			.populate("assignedTechnician", "name profilePicture location phone")
			.populate("quotes.technicianId", "name profilePicture trustScore expertise");
		
		if (!request) return res.status(404).json({ success: false, message: "Request not found" });

		res.status(200).json({ success: true, request });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const cancelTechnicianRequest = async (req, res) => {
	try {
		const { id } = req.params;
		const request = await TechnicianRequest.findById(id);

		if (!request || request.userId.toString() !== req.userId) {
			return res.status(403).json({ success: false, message: "Unauthorized" });
		}

		request.status = "cancelled";
		await request.save();
		res.status(200).json({ success: true, message: "Request cancelled" });
	} catch (error) {
		res.status(500).json({ success: false, message: "Server error" });
	}
};
