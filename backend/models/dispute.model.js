import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema(
	{
		reporterId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		targetId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		exchangeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Exchange",
			required: false, // Optional, could be a general report
		},
		reason: {
			type: String,
			required: true,
			enum: ["not_as_described", "no_show", "harassment", "scam", "other"],
		},
		description: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["open", "under_review", "resolved", "dismissed"],
			default: "open",
		},
		adminNote: {
			type: String,
		},
		resolvedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		resolvedAt: {
			type: Date,
		},
	},
	{ timestamps: true }
);

export const Dispute = mongoose.model("Dispute", disputeSchema);
