import { Dispute } from "../models/dispute.model.js";

export const createDispute = async (req, res) => {
	try {
		const { targetId, exchangeId, listingId, reason, description } = req.body;
		const reporterId = req.userId;

		if (!targetId || !reason || !description) {
			return res.status(400).json({ success: false, message: "Target user, reason, and description are required" });
		}

		// Validate reason is one of the allowed enum values
		const validReasons = ["not_as_described", "no_show", "harassment", "scam", "other"];
		if (!validReasons.includes(reason)) {
			return res.status(400).json({ 
				success: false, 
				message: `Invalid reason. Must be one of: ${validReasons.join(", ")}` 
			});
		}

		// Determine target model
		let targetModel = "User";
		if (listingId) targetModel = "Listing";
		else if (exchangeId) targetModel = "Exchange";

		const newDispute = new Dispute({
			reporterId,
			targetId,
			targetModel,
			exchangeId,
			listingId,
			reason,
			description,
		});

		await newDispute.save();
		
		// Populate reporter info for response
		await newDispute.populate('reporterId', 'name email');
		
		res.status(201).json({ success: true, message: "Dispute reported successfully", data: newDispute });
	} catch (error) {
		console.error("Error in createDispute: ", error);
		// Provide more specific error message for validation errors
		if (error.name === 'ValidationError') {
			return res.status(400).json({ 
				success: false, 
				message: error.message 
			});
		}
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const getDisputes = async (req, res) => {
	try {
		const { status, targetModel, page = 1, limit = 20 } = req.query;
		const query = {};

		if (status) query.status = status;
		if (targetModel) query.targetModel = targetModel;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const disputes = await Dispute.find(query)
			.populate("reporterId", "name email")
			.populate("targetId", "name email")
			.populate("exchangeId")
			.populate("listingId", "title")
			.populate("resolvedBy", "name")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Dispute.countDocuments(query);

		res.status(200).json({ 
			success: true, 
			count: disputes.length,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				totalPages: Math.ceil(total / parseInt(limit))
			},
			data: disputes 
		});
	} catch (error) {
		console.error("Error in getDisputes: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const updateDisputeStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, adminNote, action } = req.body;

		const dispute = await Dispute.findById(id);
		if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });

		// Update fields
		if (status) dispute.status = status;
		if (adminNote) dispute.adminNote = adminNote;
		if (action) dispute.action = action;
		
		dispute.resolvedBy = req.userId;
		dispute.resolvedAt = new Date();

		await dispute.save();
		
		// Populate for response
		await dispute.populate('reporterId', 'name email');
		await dispute.populate('targetId', 'name email');
		await dispute.populate('resolvedBy', 'name');

		res.status(200).json({ success: true, message: "Dispute status updated", data: dispute });
	} catch (error) {
		console.error("Error in updateDisputeStatus: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get dispute by ID
export const getDisputeById = async (req, res) => {
	try {
		const { id } = req.params;

		const dispute = await Dispute.findById(id)
			.populate("reporterId", "name email")
			.populate("targetId", "name email")
			.populate("exchangeId")
			.populate("listingId", "title price")
			.populate("resolvedBy", "name");

		if (!dispute) {
			return res.status(404).json({ success: false, message: "Dispute not found" });
		}

		res.status(200).json({ success: true, data: dispute });
	} catch (error) {
		console.error("Error in getDisputeById: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get dispute statistics
export const getDisputeStats = async (req, res) => {
	try {
		const stats = await Dispute.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 }
				}
			}
		]);

		const totalDisputes = await Dispute.countDocuments();
		const pendingDisputes = await Dispute.countDocuments({ status: "pending" });

		// Calculate average resolution time
		const resolvedDisputes = await Dispute.find({ 
			status: { $in: ["resolved", "dismissed"] },
			resolvedAt: { $exists: true }
		});

		let avgResolutionHours = 0;
		if (resolvedDisputes.length > 0) {
			const totalHours = resolvedDisputes.reduce((sum, dispute) => {
				const hours = (dispute.resolvedAt - dispute.createdAt) / (1000 * 60 * 60);
				return sum + hours;
			}, 0);
			avgResolutionHours = Math.round(totalHours / resolvedDisputes.length);
		}

		res.status(200).json({
			success: true,
			data: {
				totalDisputes,
				pendingDisputes,
				avgResolutionHours,
				disputesByStatus: stats
			}
		});
	} catch (error) {
		console.error("Error in getDisputeStats: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Delete dispute
export const deleteDispute = async (req, res) => {
	try {
		const { id } = req.params;

		const dispute = await Dispute.findByIdAndDelete(id);
		if (!dispute) {
			return res.status(404).json({ success: false, message: "Dispute not found" });
		}

		res.status(200).json({ success: true, message: "Dispute deleted successfully" });
	} catch (error) {
		console.error("Error in deleteDispute: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
