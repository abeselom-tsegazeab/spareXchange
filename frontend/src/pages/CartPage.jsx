import { useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const CartPage = () => {
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const { 
		cartItems, 
		initializeCart, 
		removeFromCart, 
		updateQuantity, 
		clearCart, 
		getCartTotal 
	} = useCartStore();

	useEffect(() => {
		initializeCart();
	}, [initializeCart]);

	const handleCheckout = () => {
		if (!user) {
			toast.error("Please login to proceed with checkout");
			navigate("/login");
			return;
		}
		
		// For now, redirect to exchanges page to propose exchanges
		// In the future, you can implement a proper checkout flow
		toast.success("Proceeding to exchange proposal...");
		navigate("/my-exchanges");
	};

	if (cartItems.length === 0) {
		return (
			<div className="min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
				<div className="container mx-auto px-4 py-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="text-center"
					>
						<ShoppingCart size={80} className="mx-auto mb-6 text-gray-400" />
						<h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">Your Cart is Empty</h1>
						<p className="text-gray-600 dark:text-gray-400 mb-8">
							Looks like you haven't added any items to your cart yet.
						</p>
						<Link
							to="/marketplace"
							className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300"
						>
							Browse Marketplace
							<ArrowRight className="ml-2" size={20} />
						</Link>
					</motion.div>
				</div>
			</div>
		);
	}

	const total = getCartTotal();

	return (
		<div className="min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900">
			<div className="container mx-auto px-4 py-8">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<h1 className="text-3xl font-bold mb-8 flex items-center text-gray-900 dark:text-white">
						<ShoppingCart className="mr-3" size={32} />
						Shopping Cart ({cartItems.length} items)
					</h1>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Cart Items */}
						<div className="lg:col-span-2 space-y-4">
							{cartItems.map((item) => (
								<motion.div
									key={item.listingId}
									layout
									className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700"
								>
									<div className="flex gap-4">
										<img
											src={item.images?.[0]?.startsWith("http") ? item.images?.[0] : item.images?.[0] ? `http://localhost:5000${item.images?.[0]}` : "/placeholder-image.jpg"}
											alt={item.title}
											onError={(e) => {
												e.target.onerror = null;
												e.target.src = "/placeholder-image.jpg";
											}}
											className="w-24 h-24 object-cover rounded-lg"
										/>
										<div className="flex-1">
											<div className="flex justify-between items-start">
												<div>
													<h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white">{item.title}</h3>
													<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
														Seller: {item.seller?.name || "Unknown"}
													</p>
													{item.ecoPoints && (
														<span className="text-xs bg-green-100 dark:bg-green-900 dark:bg-opacity-30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
															+{item.ecoPoints} Eco Points
														</span>
													)}
												</div>
												<button
													onClick={() => removeFromCart(item.listingId)}
													className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition p-2"
													title="Remove from cart"
												>
													<Trash2 size={20} />
												</button>
											</div>
											
											<div className="flex justify-between items-center mt-4">
												<div className="flex items-center border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
													<button
														onClick={() => updateQuantity(item.listingId, item.quantity - 1)}
														className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
														disabled={item.quantity <= 1}
													>
														<Minus size={16} />
													</button>
													<span className="px-4 py-1 font-bold text-gray-900 dark:text-white">{item.quantity}</span>
													<button
														onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
														className="px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
													>
														<Plus size={16} />
													</button>
												</div>
												<div className="text-right">
													<p className="text-2xl font-bold text-green-600 dark:text-green-400">
														${(item.price * item.quantity).toFixed(2)}
													</p>
													<p className="text-sm text-gray-600 dark:text-gray-400">
														${item.price} each
													</p>
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							))}

							<button
								onClick={() => {
									if (window.confirm("Are you sure you want to clear your cart?")) {
										clearCart();
										toast.success("Cart cleared");
									}
								}}
								className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition text-sm"
							>
								Clear Cart
							</button>
						</div>

						{/* Order Summary */}
						<div className="lg:col-span-1">
							<motion.div
								initial={{ opacity: 0, x: 20 }}
								animate={{ opacity: 1, x: 0 }}
								className="bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 sticky top-24"
							>
								<h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Order Summary</h2>
														
								<div className="space-y-3 mb-6">
									<div className="flex justify-between text-gray-600 dark:text-gray-400">
										<span>Subtotal</span>
										<span className="text-gray-900 dark:text-white">${total.toFixed(2)}</span>
									</div>
									<div className="flex justify-between text-gray-600 dark:text-gray-400">
										<span>Shipping</span>
										<span className="text-green-600 dark:text-green-400">Free</span>
									</div>
									<div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-lg">
										<span className="text-gray-900 dark:text-white">Total</span>
										<span className="text-green-600 dark:text-green-400">${total.toFixed(2)}</span>
									</div>
								</div>

								<button
									onClick={handleCheckout}
									className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300 flex items-center justify-center"
								>
									Proceed to Exchange
									<ArrowRight className="ml-2" size={20} />
								</button>

								<Link
									to="/marketplace"
									className="block text-center mt-4 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition text-sm"
								>
									Continue Shopping
								</Link>
							</motion.div>
						</div>
					</div>
				</motion.div>
			</div>
		</div>
	);
};

export default CartPage;
