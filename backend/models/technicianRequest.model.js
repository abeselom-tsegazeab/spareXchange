import mongoose from "mongoose";

const technicianRequestSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		serviceType: {
			type: String,
			required: true,
			enum: [
				"repair",
				"installation", 
				"maintenance",
				"diagnosis",
				"Engine Repair",
				"other"
			],
		},
		description: {
			type: String,
			required: true,
		},
		location: {
			type: String,
			required: true,
		},
		contactInfo: {
			phone: String,
			email: String,
		},
		priority: {
			type: String,
			enum: ["low", "medium", "high", "urgent"],
			default: "medium",
		},
		status: {
			type: String,
			enum: ["pending", "quoted", "accepted", "in-progress", "arrived", "started", "completed", "cancelled"],
			default: "pending",
		},
		locationCoords: {
			type: {
				type: String,
				enum: ["Point"],
				default: "Point",
			},
			coordinates: {
				type: [Number],
				default: [0, 0],
			},
		},
		budgetMin: {
			type: Number,
		},
		budgetMax: {
			type: Number,
		},
		quotes: [{
			technicianId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
			estimatedCost: Number,
			additionalNotes: String,
			createdAt: { type: Date, default: Date.now }
		}],
		assignedTechnician: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // technician user
		},
		estimatedCost: {
			type: Number,
		},
		verificationToken: {
			type: String,
		},
		images: [{
			type: String, // URLs to images
		}],
	},
	{ timestamps: true }
);

technicianRequestSchema.index({ locationCoords: "2dsphere" });

export const TechnicianRequest = mongoose.model("TechnicianRequest", technicianRequestSchema);