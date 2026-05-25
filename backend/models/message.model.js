import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
	{
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		receiverId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		listingId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Listing",
			required: false, // Optional context
		},
		content: {
			type: String,
			required: true,
		},
		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
