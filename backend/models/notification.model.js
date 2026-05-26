import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		title: {
			type: String,
			default: "Notification", // Make optional with default value
		},
		message: {
			type: String,
			required: true,
		},
		type: {
			type: String,
			enum: [
				"listing", 
				"technician-request", 
				"recycling", 
				"system", 
				"message",
				"eco-points",
				"verification",
				"match",
				"exchange_proposed",
				"exchange_status_updated",
				"exchange_counter_offered",
				"exchange_completed",
				"exchange_expired",
				"exchange_disputed",
				"exchange_dispute_resolved"
			],
			default: "system",
		},
		isRead: {
			type: Boolean,
			default: false,
		},
		link: {
			type: String,
			default: "",
		},
		relatedId: {
			type: mongoose.Schema.Types.ObjectId,
		},
		relatedModel: {
			type: String,
		},
		data: {
			type: Object, // Additional data related to the notification
		},
		metadata: {
			type: Object, // Alternative field for additional metadata (used by exchange controller)
		},
	},
	{ timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);