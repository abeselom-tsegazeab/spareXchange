import mongoose from "mongoose";

const exchangeSchema = new mongoose.Schema(
	{
		buyerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		sellerId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		listingId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Listing",
			required: true,
		},
		// Structured offer — can reference another listing
		offeredListingId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Listing",
			default: null,
		},
		offeredItems: {
			type: String,
			default: "",
		},
		status: {
			type: String,
			enum: [
				"pending",
				"counter_offered",
				"accepted",
				"rejected",
				"cancelled",
				"completed_by_buyer",
				"completed_by_seller",
				"fully_completed",
				"disputed",
				"expired",
			],
			default: "pending",
		},
		cancelReason: { type: String, default: null },

		// Counter-offer history
		counterOffers: [
			{
				offeredItems: { type: String, default: null },
				offeredListingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", default: null },
				proposedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
				note: { type: String, default: null },
				createdAt: { type: Date, default: () => new Date() },
			}
		],

		// Meeting / negotiation
		meetingDetails: {
			location: String,
			time: Date,
			isLocked: { type: Boolean, default: false }
		},
		negotiationNotes: { type: String, default: "" },
		lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },

		// Dispute system
		disputeStatus: {
			type: String,
			enum: ["none", "open", "resolved"],
			default: "none",
		},
		disputeReason: { type: String, default: null },
		disputeOpenedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
		disputeResolution: { type: String, default: null }, // admin notes on resolution
		disputeResolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },



		// Audit log — every status change is recorded here
		history: [
			{
				action: { type: String, required: true },
				by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
				at: { type: Date, default: () => new Date() },
				note: { type: String, default: null },
			},
		],

		// Auto-expire pending proposals after 7 days
		expiresAt: {
			type: Date,
			default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
		},

		// --- Modernization Features ---
		handshakeToken: { type: String, default: null }, // 6-digit TOTP token
		handshakeExpiresAt: { type: Date, default: null },
		handshakeRegenerated: { type: Number, default: 0 }, // Track regeneration count
		handoverPhotos: [{ type: String }], // Proof of condition at handover
		safeZoneId: { type: String, default: null }, // Reference to a verified meeting point
	},
	{ timestamps: true }
);

// Indexes
exchangeSchema.index({ buyerId: 1, status: 1 });
exchangeSchema.index({ sellerId: 1, status: 1 });
exchangeSchema.index({ listingId: 1, buyerId: 1, status: 1 }); // for spam guard
// NOTE: TTL index on expiresAt can be added in DB directly if needed
// (only removes docs with status:pending automatically when time passes)

export const Exchange = mongoose.model("Exchange", exchangeSchema);
