import { create } from "zustand";
import axios from "axios";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/cart" : "/api/cart";

axios.defaults.withCredentials = true;

export const useCartStore = create((set, get) => ({
	cartItems: [],
	loading: false,
	error: null,
	totalItems: 0,
	totalPrice: 0,

	// Fetch user's cart from backend
	initializeCart: async () => {
		set({ loading: true, error: null });
		try {
			const res = await axios.get(API_URL);
			set({
				cartItems: res.data.cart.items,
				totalItems: res.data.cart.totalItems,
				totalPrice: res.data.cart.totalPrice,
				loading: false,
			});
		} catch (error) {
			console.error("Failed to load cart:", error);
			set({ error: error.response?.data?.message || "Failed to fetch cart", loading: false });
		}
	},

	// Add item to cart
	addToCart: async (listingId, quantity = 1) => {
		set({ loading: true, error: null });
		try {
			const res = await axios.post(`${API_URL}/add`, { listingId, quantity });
			set({
				cartItems: res.data.cart.items,
				totalItems: res.data.cart.totalItems,
				totalPrice: res.data.cart.totalPrice,
				loading: false,
			});
			return res.data;
		} catch (error) {
			console.error("Failed to add to cart:", error);
			set({ error: error.response?.data?.message || "Failed to add to cart", loading: false });
			throw error;
		}
	},

	// Remove item from cart
	removeFromCart: async (listingId) => {
		set({ loading: true, error: null });
		try {
			const res = await axios.delete(`${API_URL}/${listingId}`);
			set({
				cartItems: res.data.cart.items,
				totalItems: res.data.cart.totalItems,
				totalPrice: res.data.cart.totalPrice,
				loading: false,
			});
			return res.data;
		} catch (error) {
			console.error("Failed to remove from cart:", error);
			set({ error: error.response?.data?.message || "Failed to remove from cart", loading: false });
			throw error;
		}
	},

	// Update item quantity
	updateQuantity: async (listingId, quantity) => {
		if (quantity < 1) return;
		
		set({ loading: true, error: null });
		try {
			const res = await axios.put(`${API_URL}/${listingId}`, { quantity });
			set({
				cartItems: res.data.cart.items,
				totalItems: res.data.cart.totalItems,
				totalPrice: res.data.cart.totalPrice,
				loading: false,
			});
			return res.data;
		} catch (error) {
			console.error("Failed to update quantity:", error);
			set({ error: error.response?.data?.message || "Failed to update quantity", loading: false });
			throw error;
		}
	},

	// Clear cart
	clearCart: async () => {
		set({ loading: true, error: null });
		try {
			const res = await axios.delete(`${API_URL}/clear`);
			set({
				cartItems: res.data.cart.items,
				totalItems: res.data.cart.totalItems,
				totalPrice: res.data.cart.totalPrice,
				loading: false,
			});
			return res.data;
		} catch (error) {
			console.error("Failed to clear cart:", error);
			set({ error: error.response?.data?.message || "Failed to clear cart", loading: false });
			throw error;
		}
	},

	// Get cart total (from state)
	getCartTotal: () => {
		const state = get();
		return state.totalPrice;
	},

	// Get cart items count (from state)
	getCartCount: () => {
		const state = get();
		return state.totalItems;
	},

	clearError: () => {
		set({ error: null });
	}
}));
