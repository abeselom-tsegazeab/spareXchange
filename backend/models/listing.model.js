import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: true,
			trim: true,
		},
		description: {
			type: String,
			required: true,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		category: {
			type: String,
			required: true,
			enum: [
				"vehicle",
				"electronics", 
				"appliances",
				"machinery",
				"mobile",
				"computer",
				"other"
			],
		},
		condition: {
			type: String,
			required: true,
			enum: ["new", "like-new", "used-good", "used-fair", "refurbished"],
		},
		brand: {
			type: String,
			required: false,
		},
		model: {
			type: String,
			required: false,
		},
		year: {
			type: Number,
			required: false,
		},
		compatibleVehicles: [{
			brand: { type: String, required: true },
			model: { type: String, required: true },
			yearStart: { type: Number },
			yearEnd: { type: Number },
			upvotes: { type: Number, default: 0 },
			downvotes: { type: Number, default: 0 },
			voters: [{
				user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
				voteType: { type: String, enum: ["up", "down"] }
			}]
		}],
		location: {
			type: String,
			required: true,
		},
		images: [{
			type: String, // URLs to images
		}],
		seller: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		available: {
			type: Boolean,
			default: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		views: {
			type: Number,
			default: 0,
		},
		isVerified: {
			type: Boolean,
			default: false, // Admin verification
		},
		ecoPoints: {
			type: Number,
			default: 0,
		},
		contactInfo: {
			phone: String,
			email: String,
		},
		specifications: {
			type: Map,
			of: String, // Allows for flexible key-value pairs
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
		expiresAt: {
			type: Date,
			default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000), // 30 days
		},
	},
	{ timestamps: true }
);

listingSchema.index({ locationCoords: "2dsphere" });
listingSchema.index({ "compatibleVehicles.brand": 1, "compatibleVehicles.model": 1 });
listingSchema.index({ "compatibleVehicles.yearStart": 1, "compatibleVehicles.yearEnd": 1 });

export const Listing = mongoose.model("Listing", listingSchema);