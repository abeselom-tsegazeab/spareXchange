import { Dispute } from "../models/dispute.model.js";

export const createDispute = async (req, res) => {
	try {
		const { targetId, exchangeId, reason, description } = req.body;
		const reporterId = req.userId;

		if (!targetId || !reason || !description) {
			return res.status(400).json({ success: false, message: "Target user, reason, and description are required" });
		}

		const newDispute = new Dispute({
			reporterId,
			targetId,
			exchangeId,
			reason,
			description,
		});

		await newDispute.save();
		res.status(201).json({ success: true, message: "Dispute reported successfully", data: newDispute });
	} catch (error) {
		console.error("Error in createDispute: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const getDisputes = async (req, res) => {
	try {
		const { status } = req.query;
		const query = status ? { status } : {};

		const disputes = await Dispute.find(query)
			.populate("reporterId", "name email")
			.populate("targetId", "name email")
			.populate("exchangeId")
			.sort({ createdAt: -1 });

		res.status(200).json({ success: true, count: disputes.length, data: disputes });
	} catch (error) {
		console.error("Error in getDisputes: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const updateDisputeStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, adminNote } = req.body;

		const dispute = await Dispute.findById(id);
		if (!dispute) return res.status(404).json({ success: false, message: "Dispute not found" });

		dispute.status = status;
		if (adminNote) dispute.adminNote = adminNote;
		dispute.resolvedBy = req.userId;
		dispute.resolvedAt = new Date();

		await dispute.save();
		res.status(200).json({ success: true, message: "Dispute status updated", data: dispute });
	} catch (error) {
		console.error("Error in updateDisputeStatus: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
