import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
	listingId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Listing",
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	images: [{
		type: String,
	}],
	quantity: {
		type: Number,
		required: true,
		default: 1,
		min: 1,
	},
	seller: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	ecoPoints: {
		type: Number,
		default: 0,
	},
}, { _id: true });

const cartSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
		unique: true, // One cart per user
	},
	items: [cartItemSchema],
	totalItems: {
		type: Number,
		default: 0,
	},
	totalPrice: {
		type: Number,
		default: 0,
	},
}, { 
	timestamps: true 
});

// Pre-save middleware to calculate totals
cartSchema.pre("save", function(next) {
	this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
	this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
	next();
});

export const Cart = mongoose.model("Cart", cartSchema);
