import mongoose from "mongoose";

const ecoPointTransactionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		points: {
			type: Number,
			required: true,
		},
		reason: {
			type: String,
			enum: ["listing", "exchange", "recycling", "achievement"],
			required: true,
		},
		description: {
			type: String,
			default: "",
		},
		referenceId: {
			type: mongoose.Schema.Types.ObjectId, // ID of the listing, exchange, or recycling record
			required: false,
		},
	},
	{ timestamps: true }
);

export const EcoPointTransaction = mongoose.model("EcoPointTransaction", ecoPointTransactionSchema);
