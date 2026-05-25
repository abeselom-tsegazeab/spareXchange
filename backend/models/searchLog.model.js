import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: false, // Can be anonymous
		},
		query: {
			type: String,
		},
		filters: {
			category: String,
			condition: String,
			brand: String,
			model: String,
			year: Number,
			minPrice: Number,
			maxPrice: Number,
			location: String,
			latitude: Number,
			longitude: Number,
			radius: Number,
		},
		resultsCount: {
			type: Number,
			default: 0,
		},
	},
	{ timestamps: true }
);

export const SearchLog = mongoose.model("SearchLog", searchLogSchema);
