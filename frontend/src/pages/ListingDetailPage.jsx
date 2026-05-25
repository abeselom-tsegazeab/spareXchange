import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MapPin, Truck, Shield, RotateCcw, AlertTriangle, ShoppingCart, Mail, User, Handshake } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDisputeStore } from "../store/disputeStore";
import { useCartStore } from "../store/cartStore";
import { useTheme } from "../contexts/ThemeContext";
import ProposeExchangeModal from "../components/ProposeExchangeModal";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import axios from "axios";

const ListingDetailPage = () => {
	const { darkMode } = useTheme();
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const { createDispute } = useDisputeStore();
	const { addToCart } = useCartStore();
	const [listing, setListing] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [quantity, setQuantity] = useState(1);
	const [selectedImage, setSelectedImage] = useState(0);
	const [showExchangeModal, setShowExchangeModal] = useState(false);

	const getImageUrl = (imagePath) => {
		if (!imagePath) return "/placeholder-image.jpg";
		// If it's already a full URL, return as is
		if (imagePath.startsWith("http")) return imagePath;
		// If it's a local upload path, prepend backend URL
		if (imagePath.startsWith("/uploads")) {
			return `http://localhost:5000${imagePath}`;
		}
		return imagePath;
	};

	useEffect(() => {
		const fetchListing = async () => {
			setIsLoading(true);
			try {
				const response = await fetch(`http://localhost:5000/api/listings/${id}`);
				const data = await response.json();
				if (data.success) {
					setListing(data.listing);
				}
			} catch (error) {
				console.error("Error fetching listing:", error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchListing();
	}, [id]);

	const handleReport = async () => {
		if (!user) {
			alert("Please login to report.");
			return;
		}
		const reason = prompt("Reason for reporting?");
		if (!reason) return;
		const description = prompt("Please provide a description:");
		if (!description) return;

		try {
			await createDispute({
				targetId: listing.seller?._id,
				exchangeId: null,
				reason,
				description
			});
			alert("Report submitted successfully.");
		} catch (error) {
			alert("Failed to submit report.");
		}
	};

	const handleAddToCart = async () => {
		if (!user) {
			toast.error("Please login to add items to cart");
			navigate("/login");
			return;
		}
		
		try {
			await addToCart(listing._id, quantity);
			toast.success(`Added ${quantity} x ${listing.title} to cart!`);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to add to cart");
		}
	};

	const handleBuyNow = async () => {
		if (!user) {
			toast.error("Please login to proceed");
			navigate("/login");
			return;
		}

		if (listing.seller?._id === user._id) {
			toast.error("You cannot buy your own listing");
			return;
		}

		try {
			// Send notification to listing owner
			await axios.post(`http://localhost:5000/api/notifications`, {
				userId: listing.seller._id,
				title: "Purchase Interest",
				message: `${user.name} is interested in buying "${listing.title}" (Qty: ${quantity}). Contact them to proceed with the exchange!`,
				type: "exchange_proposed",
				link: `/listing/${id}`
			});

			toast.success("Seller has been notified of your interest!");
			
			// Redirect to messages to contact seller
			setTimeout(() => {
				navigate(`/messages/${listing.seller._id}`);
			}, 1500);
		} catch (error) {
			console.error("Error sending notification:", error);
			toast.error("Failed to notify seller. Please try again.");
		}
	};

	const handleProposeExchange = () => {
		if (!user) {
			alert("Please login to propose an exchange.");
			return;
		}
		if (listing.seller?._id === user._id) {
			alert("You cannot propose an exchange on your own listing.");
			return;
		}
		setShowExchangeModal(true);
	};

	if (isLoading) return <LoadingSpinner />;
	if (!listing) return <div className='min-h-screen bg-background flex items-center justify-center text-white'>Listing not found</div>;

	return (
		<div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white' : 'bg-white text-gray-900'}`}>
			<div className='container mx-auto px-4 py-8'>
				{/* Breadcrumb */}
				<nav className='mb-6 text-sm text-gray-500'>
					<Link to='/' className='hover:text-green-400'>Home</Link>
					<span className='mx-2'>/</span>
					<Link to='/marketplace' className='hover:text-green-400'>Marketplace</Link>
					<span className='mx-2'>/</span>
					<span className='text-primary'>{listing.title}</span>
				</nav>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='grid grid-cols-1 lg:grid-cols-2 gap-8'
				>
					{/* Image Gallery */}
					<div>
						<div className='mb-4'>
							<img
								src={getImageUrl(listing.images?.[selectedImage])}
								alt={listing.title}
								onError={(e) => {
									e.target.onerror = null;
									e.target.src = "/placeholder-image.jpg";
								}}
								className='w-full h-96 object-cover rounded-xl border border-primary/70'
							/>
						</div>
						<div className='flex gap-2 overflow-x-auto pb-2'>
							{listing.images?.map((image, index) => (
								<button
									key={index}
									onClick={() => setSelectedImage(index)}
									className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${
										selectedImage === index ? "border-green-500" : "border-gray-300 dark:border-gray-700"
									}`}
								>
									<img 
										src={getImageUrl(image)} 
										alt={`Preview ${index + 1}`} 
										onError={(e) => {
											e.target.onerror = null;
											e.target.src = "/placeholder-image.jpg";
										}}
										className='w-full h-full object-cover' 
									/>
								</button>
							))}
						</div>
					</div>

					{/* Product Info */}
					<div className="border border-gray-300 dark:border-primary rounded-md p-4 bg-white dark:bg-primary">
						<div className='mb-4'>
							<div className='flex justify-between items-start'>
								<h1 className='text-3xl font-bold mb-2 text-gray-900 dark:text-white'>{listing.title}</h1>
								<button 
									onClick={handleReport}
									className='flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition'
									title='Report this listing'
								>
									<AlertTriangle size={20} className='mr-1' />
									<span className='text-xs'>Report</span>
								</button>
							</div>
							<div className='flex items-center mb-4'>
								<div className='flex items-center mr-4'>
									<Star size={20} className='text-yellow-400 fill-current' />
									<span className='ml-1 font-bold text-gray-900 dark:text-white'>{listing.seller?.rating || 4.5}</span>
									<span className='text-gray-600 dark:text-gray-400 ml-1'>({listing.seller?.totalReviews || 0} reviews)</span>
								</div>
								{listing.seller?.verifiedSeller && (
									<div className='flex items-center text-sm text-blue-600 dark:text-blue-400'>
										<Shield size={16} className='mr-1' />
										<span>Verified Seller</span>
									</div>
								)}
							</div>
							<div className='flex items-center text-gray-600 dark:text-gray-400 mb-4'>
								<MapPin size={16} className='mr-1' />
								<span>{listing.location || "Addis Ababa"}</span>
							</div>
						</div>

						{/* Price */}
						<div className='mb-6'>
							<div className='flex items-baseline'>
								<span className='text-3xl font-bold text-green-400'>${listing.price}</span>
							</div>
							<div className='flex items-center mt-2'>
								<span className='text-sm bg-green-100 dark:bg-green-900 dark:bg-opacity-30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full mr-2'>
									+{listing.ecoPoints || 10} Eco Points
								</span>
								<span className='text-sm text-gray-600 dark:text-gray-400 font-medium'>Earned upon purchase</span>
							</div>
						</div>

						{/* Description */}
						<div className='mb-6'>
							<h2 className='text-xl font-bold mb-3 text-gray-900 dark:text-white'>Description</h2>
							<p className='text-gray-700 dark:text-gray-300 whitespace-pre-line'>{listing.description}</p>
						</div>

						{/* Specifications */}
						<div className='mb-6'>
							<h2 className='text-xl font-bold mb-3 text-gray-900 dark:text-white'>Specifications</h2>
							<div className='grid grid-cols-2 gap-x-8 gap-y-2'>
								{listing.specifications && Object.entries(listing.specifications).map(([key, value], index) => (
									<div key={index} className='flex justify-between py-2 border-b border-gray-300 dark:border-gray-700'>
										<span className='text-gray-600 dark:text-gray-400 capitalize'>{key}:</span>
										<span className='font-medium text-gray-900 dark:text-white'>{value}</span>
									</div>
								))}
								{!listing.specifications && (
									<p className='text-sm text-gray-500 dark:text-gray-500 italic'>No detailed specifications provided.</p>
								)}
							</div>
						</div>

						{/* Actions */}
						<div className='mb-6'>
							<div className='flex items-center mb-4'>
								<span className='mr-3'>Quantity:</span>
								<div className='flex items-center border border-gray-300 dark:border-gray-600 rounded-lg'>
									<button
										onClick={() => setQuantity(Math.max(1, quantity - 1))}
										className='px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:rounded-lg '
									>
										-
									</button>
									<span className='px-3 py-1 text-gray-900 dark:text-white'>{quantity}</span>
									<button
										onClick={() => setQuantity(quantity + 1)}
										className='px-3 py-1 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:rounded-lg'
									>
										+
									</button>
								</div>
							</div>
							<div className="flex flex-wrap gap-3">
								<button
									onClick={handleAddToCart}
									className='flex-1 min-w-[150px] px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition duration-300 flex items-center justify-center'
								>
									<ShoppingCart className='h-5 w-5 mr-2' />
									Add to Cart
								</button>
								<button
									onClick={handleBuyNow}
									className='flex-1 min-w-[150px] px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300'
								>
									Buy Now
								</button>
								<button
									onClick={handleProposeExchange}
									className='flex-1 min-w-[150px] px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-600 hover:to-cyan-700 transition duration-300 flex items-center justify-center'
								>
									<Handshake className='h-5 w-5 mr-2' />
									Propose Exchange
								</button>
							</div>
						</div>

						{/* Additional Info */}
						<div className='grid grid-cols-3 gap-4 pt-6 border-t border-gray-300 dark:border-gray-700'>
							<div className='text-center'>
								<Truck className='mx-auto mb-2 text-green-600 dark:text-green-400' size={24} />
								<span className='text-sm text-gray-700 dark:text-gray-300'>Local Delivery</span>
							</div>
							<div className='text-center'>
								<Shield className='mx-auto mb-2 text-green-600 dark:text-green-400' size={24} />
								<span className='text-sm text-gray-700 dark:text-gray-300'>Verified Seller</span>
							</div>
							<div className='text-center'>
								<RotateCcw className='mx-auto mb-2 text-green-600 dark:text-green-400' size={24} />
								<span className='text-sm text-gray-700 dark:text-gray-300'>Quality Guarantee</span>
							</div>
						</div>
					</div>
				</motion.div>

				{/* Seller Info */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className='mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-700'
				>
					<h2 className='text-2xl font-bold mb-4 text-gray-900 dark:text-white'>Seller Information</h2>
					<div className='flex flex-col md:flex-row items-center'>
						<div className='flex items-center flex-1'>
							<div className='w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mr-4'>
								<span className='text-2xl font-bold text-green-600 dark:text-green-400'>
									{listing.seller?.name?.charAt(0) || "S"}
								</span>
							</div>
							<div>
								<div className='flex items-center'>
									<h3 className='text-xl font-bold mr-2 text-gray-900 dark:text-white'>{listing.seller?.name || "Anonymous Seller"}</h3>
									{listing.seller?.verifiedSeller && (
										<Shield size={20} className='text-blue-400' />
									)}
								</div>
								<div className='flex items-center text-gray-600 dark:text-gray-400'>
									<Star size={16} className='text-yellow-400 fill-current mr-1' />
									<span>{listing.seller?.rating || 4.5} ({listing.seller?.totalReviews || 0} reviews)</span>
								</div>
							</div>
						</div>
						<div className='mt-4 md:mt-0 flex gap-2'>
							<button className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 flex items-center'>
								<Mail size={16} className='mr-2' />
								Contact Seller
							</button>
							<Link 
								to={`/profile/${listing.seller?._id}`}
								className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300 flex items-center'
							>
								<User size={16} className='mr-2' />
								View Profile
							</Link>
						</div>
					</div>
				</motion.div>

				{/* Propose Exchange Modal */}
				<ProposeExchangeModal
					isOpen={showExchangeModal}
					onClose={() => setShowExchangeModal(false)}
					listingId={id}
				/>
			</div>
		</div>
	);
};

export default ListingDetailPage;