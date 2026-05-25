import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
	{
		reporter: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		targetId: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
		},
		targetModel: {
			type: String,
			enum: ["Listing", "User", "Exchange"],
			required: true,
		},
		reason: {
			type: String,
			enum: ["inaccurate", "fraud", "repost", "offensive", "other"],
			required: true,
		},
		details: {
			type: String,
			default: "",
		},
		status: {
			type: String,
			enum: ["pending", "reviewed", "resolved", "dismissed"],
			default: "pending",
		},
		moderatorNote: String,
	},
	{ timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
