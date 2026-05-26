import mongoose from "mongoose";

const webhookSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		name: {
			type: String,
			required: true,
			trim: true,
		},
		url: {
			type: String,
			required: true,
			trim: true,
		},
		events: [{
			type: String,
			enum: [
				"listing.created",
				"listing.updated",
				"listing.deleted",
				"exchange.proposed",
				"exchange.completed",
				"exchange.cancelled",
				"message.received",
				"review.created",
				"user.verified",
				"payment.received"
			],
			required: true,
		}],
		secret: {
			type: String,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastTriggered: {
			type: Date,
		},
		totalDeliveries: {
			type: Number,
			default: 0,
		},
		failedDeliveries: {
			type: Number,
			default: 0,
		},
		headers: {
			type: Map,
			of: String,
		},
	},
	{ timestamps: true }
);

export const Webhook = mongoose.model("Webhook", webhookSchema);
