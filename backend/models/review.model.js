import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
	{
		reviewerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		revieweeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		exchangeId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Exchange",
			required: false, // Optional for admin reviews
		},
		rating: {
			type: Number,
			required: true,
			min: 1,
			max: 5,
		},
		comment: {
			type: String,
			required: false,
		},
	},
	{ timestamps: true }
);

// Ensure a user can only review a specific exchange once (if exchangeId is provided)
reviewSchema.index({ reviewerId: 1, exchangeId: 1 }, { unique: true, sparse: true });

export const Review = mongoose.model("Review", reviewSchema);
