import express from "express";
import {
	getCart,
	addToCart,
	updateCartItemQuantity,
	removeFromCart,
	clearCart
} from "../controllers/cart.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// All cart routes require authentication
router.use(verifyToken);

// Cart routes
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/:listingId", updateCartItemQuantity);
router.delete("/:listingId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
