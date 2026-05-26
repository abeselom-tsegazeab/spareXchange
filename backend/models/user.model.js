import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
		},
		password: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		lastLogin: {
			type: Date,
			default: Date.now,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		resetPasswordToken: String,
		resetPasswordExpiresAt: Date,
		verificationToken: String,
		verificationTokenExpiresAt: Date,
		// New fields for SpareXChange features
		ecoPoints: {
			type: Number,
			default: 0,
			index: true,
		},
		userType: {
			type: String,
			enum: ["individual", "garage", "repair-shop", "recycler", "technician", "admin"],
			default: "individual",
		},
		verifiedSeller: {
			type: Boolean,
			default: false,
		},
		location: {
			type: String,
			default: "",
		},
		phone: {
			type: String,
			default: "",
		},
		profilePicture: {
			type: String,
			default: "",
		},
		totalReviews: {
			type: Number,
			default: 0,
		},
		interests: { type: [String], default: [] },
		achievements: { type: [String], default: [] },
		expertise: { type: String, default: "" },
		trustScore: { type: Number, default: 80 }, // Starting trust score
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
		verificationDocs: [String], // URLs to PDF or images
		roleStatus: {
			type: String,
			enum: ["none", "pending", "verified", "rejected"],
			default: "none",
		},
		verificationNote: { type: String, default: "" }, // Admin feedback for rejected verifications
		refreshToken: { type: String },
		mfaSecret: { type: String },
		isMfaEnabled: { type: Boolean, default: false },
		mfaBackupCodes: [{ type: String }],
		// Push notification device tokens
		deviceTokens: [{
			token: String,
			deviceType: { type: String, enum: ['android', 'ios', 'web'] },
			deviceName: String,
			isActive: { type: Boolean, default: true },
			createdAt: { type: Date, default: Date.now },
			lastUsed: Date
		}],
		// Notification preferences
		notificationPreferences: {
			emailNotifications: { type: Boolean, default: true },
			pushNotifications: { type: Boolean, default: true },
			smsNotifications: { type: Boolean, default: false },
			listingAlerts: { type: Boolean, default: true },
			exchangeUpdates: { type: Boolean, default: true },
			messageNotifications: { type: Boolean, default: true },
			systemAnnouncements: { type: Boolean, default: true },
			marketingEmails: { type: Boolean, default: false }
		},
		permissions: [{ type: String }],
		isBanned: {
			type: Boolean,
			default: false,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		googleId: {
			type: String,
			unique: true,
			sparse: true
		},
		authProvider: {
			type: String,
			enum: ["local", "google"],
			default: "local"
		},
		rememberMe: {
			type: Boolean,
			default: true
		}
	},
	{ 
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
);

userSchema.virtual("ecoTier").get(function () {
	const points = this.ecoPoints || 0;
	if (points <= 100) return "Seed";
	if (points <= 500) return "Sprout";
	if (points <= 1500) return "Sapling";
	if (points <= 5000) return "Oak";
	return "Gaia";
});

userSchema.index({ locationCoords: "2dsphere" });

export const User = mongoose.model("User", userSchema);