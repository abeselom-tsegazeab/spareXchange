import mongoose from "mongoose";

const savedSearchSchema = new mongoose.Schema(
	{
		userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
		name: { type: String, default: "" },

		// Free-text query (keywords)
		query: { type: String, default: "" },

		// Structured filters (subset of listing search)
		filters: {
			category: { type: String },
			condition: { type: String },
			brand: { type: String },
			model: { type: String },
			year: { type: Number },
			minPrice: { type: Number },
			maxPrice: { type: Number },
		},

		// Optional geo preference. If set, it constrains matches/alerts.
		geo: {
			latitude: { type: Number },
			longitude: { type: Number },
			radiusKm: { type: Number, default: 50 },
		},

		notify: { type: Boolean, default: true, index: true },
		lastNotifiedAt: { type: Date },
	},
	{ timestamps: true }
);

savedSearchSchema.index({ userId: 1, notify: 1, updatedAt: -1 });

export const SavedSearch = mongoose.model("SavedSearch", savedSearchSchema);

