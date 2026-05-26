import mongoose from "mongoose";

const recyclingSubmissionSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		itemType: {
			type: String,
			required: true,
			enum: [
				"electronics",
				"vehicle-parts",
				"appliances",
				"mobile-devices",
				"computers",
				"batteries",
				"plastic",
				"metal",
				"other"
			],
		},
		itemDescription: {
			type: String,
			required: true,
		},
		estimatedWeight: {
			type: Number, // in kg
		},
		estimatedValue: {
			type: Number, // estimated monetary value
		},
		ecoPointsEarned: {
			type: Number,
			required: true,
			default: 0,
		},
		location: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "approved", "rejected", "completed"],
			default: "pending",
		},
		verificationImages: [{
			type: String, // URLs to images for verification
		}],
		notes: {
			type: String,
		},
		verifiedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User", // admin or staff who verified
		},
		verifiedAt: {
			type: Date,
		},
		verificationToken: {
			type: String,
			unique: true,
			sparse: true, // Allow multiple nulls if token is only generated when needed
		},
		isVerifiedByRecycler: {
			type: Boolean,
			default: false,
		},
		locationCoords: {
			type: {
				type: String,
				enum: ["Point"],
				default: "Point",
			},
			coordinates: {
				type: [Number], // [longitude, latitude]
				default: [0, 0],
			},
		},
	},
	{ timestamps: true }
);

recyclingSubmissionSchema.index({ locationCoords: "2dsphere" });

export const RecyclingSubmission = mongoose.model("RecyclingSubmission", recyclingSubmissionSchema);