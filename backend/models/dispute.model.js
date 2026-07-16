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
		targetModel: {
			type: String,
			enum: ["User", "Listing", "Exchange"],
			default: "User",
		},
		exchangeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Exchange",
			required: false,
		},
		listingId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Listing",
			required: false,
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
			enum: ["pending", "under_review", "resolved", "dismissed"],
			default: "pending",
		},
		adminNote: {
			type: String,
			default: "",
		},
		action: {
			type: String,
			enum: ["none", "warn_user", "ban_user", "remove_listing", "cancel_exchange","edit_listing"],
			default: "none",
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
