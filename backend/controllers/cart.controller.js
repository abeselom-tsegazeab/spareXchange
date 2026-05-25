import { Cart } from "../models/cart.model.js";
import { Listing } from "../models/listing.model.js";

// Get user's cart
export const getCart = async (req, res) => {
	try {
		const userId = req.userId;

		let cart = await Cart.findOne({ userId })
			.populate("items.listingId", "title price images seller")
			.populate("items.seller", "name");

		if (!cart) {
			// Create empty cart if it doesn't exist
			cart = new Cart({ userId, items: [] });
			await cart.save();
		}

		res.status(200).json({
			success: true,
			cart: {
				items: cart.items,
				totalItems: cart.totalItems,
				totalPrice: cart.totalPrice,
			},
		});
	} catch (error) {
		console.error("Error in getCart:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Add item to cart
export const addToCart = async (req, res) => {
	try {
		const userId = req.userId;
		const { listingId, quantity = 1 } = req.body;

		if (!listingId) {
			return res.status(400).json({ success: false, message: "Listing ID is required" });
		}

		// Get listing details
		const listing = await Listing.findById(listingId).populate("seller", "name");
		if (!listing) {
			return res.status(404).json({ success: false, message: "Listing not found" });
		}

		// Check if listing is available and active
		if (!listing.available || !listing.isActive) {
			return res.status(400).json({ success: false, message: "Listing is not available" });
		}

		// Find or create user's cart
		let cart = await Cart.findOne({ userId });
		if (!cart) {
			cart = new Cart({ userId, items: [] });
		}

		// Check if item already exists in cart
		const existingItemIndex = cart.items.findIndex(
			item => item.listingId.toString() === listingId
		);

		if (existingItemIndex > -1) {
			// Update quantity
			cart.items[existingItemIndex].quantity += quantity;
		} else {
			// Add new item
			cart.items.push({
				listingId,
				title: listing.title,
				price: listing.price,
				images: listing.images,
				quantity,
				seller: listing.seller._id,
				ecoPoints: listing.ecoPoints || 0,
			});
		}

		await cart.save();

		res.status(200).json({
			success: true,
			message: "Item added to cart",
			cart: {
				items: cart.items,
				totalItems: cart.totalItems,
				totalPrice: cart.totalPrice,
			},
		});
	} catch (error) {
		console.error("Error in addToCart:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Update item quantity in cart
export const updateCartItemQuantity = async (req, res) => {
	try {
		const userId = req.userId;
		const { listingId } = req.params;
		const { quantity } = req.body;

		if (!quantity || quantity < 1) {
			return res.status(400).json({ success: false, message: "Valid quantity is required" });
		}

		const cart = await Cart.findOne({ userId });
		if (!cart) {
			return res.status(404).json({ success: false, message: "Cart not found" });
		}

		const itemIndex = cart.items.findIndex(
			item => item.listingId.toString() === listingId
		);

		if (itemIndex === -1) {
			return res.status(404).json({ success: false, message: "Item not found in cart" });
		}

		cart.items[itemIndex].quantity = quantity;
		await cart.save();

		res.status(200).json({
			success: true,
			message: "Cart updated",
			cart: {
				items: cart.items,
				totalItems: cart.totalItems,
				totalPrice: cart.totalPrice,
			},
		});
	} catch (error) {
		console.error("Error in updateCartItemQuantity:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
	try {
		const userId = req.userId;
		const { listingId } = req.params;

		const cart = await Cart.findOne({ userId });
		if (!cart) {
			return res.status(404).json({ success: false, message: "Cart not found" });
		}

		cart.items = cart.items.filter(
			item => item.listingId.toString() !== listingId
		);

		await cart.save();

		res.status(200).json({
			success: true,
			message: "Item removed from cart",
			cart: {
				items: cart.items,
				totalItems: cart.totalItems,
				totalPrice: cart.totalPrice,
			},
		});
	} catch (error) {
		console.error("Error in removeFromCart:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Clear cart
export const clearCart = async (req, res) => {
	try {
		const userId = req.userId;

		const cart = await Cart.findOne({ userId });
		if (!cart) {
			return res.status(404).json({ success: false, message: "Cart not found" });
		}

		cart.items = [];
		await cart.save();

		res.status(200).json({
			success: true,
			message: "Cart cleared",
			cart: {
				items: cart.items,
				totalItems: cart.totalItems,
				totalPrice: cart.totalPrice,
			},
		});
	} catch (error) {
		console.error("Error in clearCart:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
