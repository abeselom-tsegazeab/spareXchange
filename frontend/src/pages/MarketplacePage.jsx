import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, Star, Heart, AlertTriangle, BookmarkPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useDisputeStore } from "../store/disputeStore";
import { useSavedSearchStore } from "../store/savedSearchStore";
import { useTheme } from "../contexts/ThemeContext";
import CreateSavedSearchModal from "../components/CreateSavedSearchModal";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const MarketplacePage = () => {
	const { darkMode } = useTheme();
	const { user } = useAuthStore();
	const { createDispute } = useDisputeStore();
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [listings, setListings] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [showSaveSearchModal, setShowSaveSearchModal] = useState(false);

	const handleReport = async (listing) => {
		if (!user) {
			alert("Please login to report a listing.");
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

	const fetchListings = async () => {
		setIsLoading(true);
		try {
			const params = new URLSearchParams();
			if (searchTerm) params.append("search", searchTerm);
			if (selectedCategory !== "all") params.append("category", selectedCategory);
			
			const response = await fetch(`http://localhost:5000/api/listings?${params.toString()}`);
			const data = await response.json();
			if (data.success) {
				setListings(data.listings);
			}
		} catch (error) {
			console.error("Error fetching listings:", error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchListings();
	}, [selectedCategory]);

	const handleSearch = (e) => {
		e.preventDefault();
		fetchListings();
	};

	const handleSaveSearch = () => {
		setShowSaveSearchModal(true);
	};

	const handleCreateSavedSearch = async (searchData) => {
		try {
			// Pre-fill with current search context
			const searchDataWithContext = {
				...searchData,
				query: searchData.query || searchTerm,
				filters: {
					...searchData.filters,
					category: searchData.filters.category || (selectedCategory !== "all" ? selectedCategory : undefined)
				}
			};

			await useSavedSearchStore.getState().createSavedSearch(searchDataWithContext);
			toast.success("Search saved successfully! You'll be notified when new listings match.");
			setShowSaveSearchModal(false);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to save search");
		}
	};

	const filteredListings = listings; // Backend already filters

	const categories = [
		{ id: "all", name: "All Categories" },
		{ id: "vehicle", name: "Vehicle Parts" },
		{ id: "electronics", name: "Electronics" },
		{ id: "appliances", name: "Home Appliances" },
		{ id: "machinery", name: "Industrial Machinery" },
	];

	return (
		<div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white' : 'bg-white text-gray-900'}`}>
			<div className='container mx-auto px-4 py-8'>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='mb-10 text-center'
				>
					<h1 className='text-4xl font-bold mb-4 text-gray-900 dark:text-white'>
						Spare Parts Marketplace
					</h1>
					<p className='text-gray-600 dark:text-gray-400 max-w-2xl mx-auto'>
						Find affordable and compatible spare parts for vehicles, machinery, and electronics from trusted sellers in our community.
					</p>
				</motion.div>

				{/* Search and Filters */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className='mb-10'
				>
					<form onSubmit={handleSearch} className='flex flex-col md:flex-row gap-4 mb-6'>
						<div className='relative flex-grow'>
							<div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
								<Search className='text-gray-500 dark:text-gray-400' size={20} />
							</div>
							<input
								type='text'
								placeholder='Search for spare parts...'
								className='w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder-gray-500'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<button 
							type='submit'
							className='px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300'
						>
							Search
						</button>
					</form>

					{/* Save This Search Button */}
					{(searchTerm || selectedCategory !== "all") && (
						<motion.div
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							className='mb-4 p-4 bg-primary dark:bg-gray-800 border border-green-600 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4'
						>
							<div className='flex items-center gap-3'>
								<BookmarkPlus size={24} className='text-green-600 dark:text-green-400' />
								<div>
									<p className='text-gray-900 dark:text-white font-semibold'>Like these results?</p>
									<p className='text-gray-600 dark:text-gray-400 text-sm'>Save this search to get notified when new listings match</p>
								</div>
							</div>
							<button
								onClick={handleSaveSearch}
								className='px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors whitespace-nowrap flex items-center gap-2'
							>
								<BookmarkPlus size={18} />
								Save This Search
							</button>
						</motion.div>
					)}

					{/* Category Filters */}
					<div className='flex flex-wrap gap-2'>
						{categories.map((category) => (
							<button
								key={category.id}
								className={`px-4 py-2 rounded-full text-sm font-medium transition duration-300 ${
									selectedCategory === category.id
										? "bg-green-600 text-white"
										: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
								}`}
								onClick={() => setSelectedCategory(category.id)}
							>
								{category.name}
							</button>
						))}
					</div>
				</motion.div>

				{/* Listings Grid */}
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
				>
					{isLoading ? (
						<div className='col-span-full flex justify-center py-12'>
							<LoadingSpinner />
						</div>
					) : listings.map((listing, index) => (
						<motion.div
							key={listing._id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.3, delay: index * 0.1 }}
							className='bg-primary dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-green-500 transition duration-300'
						>
							<div className='relative'>
								<img
									src={listing.images?.[0] || "/placeholder-image.jpg"}
									alt={listing.title}
									className='w-full h-48 object-cover'
								/>
								<div className='absolute top-2 right-2 flex gap-2'>
									<button className='p-2 bg-gray-900 bg-opacity-50 rounded-full hover:bg-opacity-75 transition duration-300'>
										<Heart size={16} className='text-white' />
									</button>
									<button 
										onClick={() => handleReport(listing)}
										className='p-2 bg-red-900 bg-opacity-50 rounded-full hover:bg-opacity-75 transition duration-300'
										title='Report Listing'
									>
										<AlertTriangle size={16} className='text-red-400' />
									</button>
								</div>
								<div className='absolute bottom-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded'>
									+{listing.ecoPoints || 10} EcoPts
								</div>
							</div>
							<div className='p-4'>
								<div className='flex justify-between items-start mb-2'>
									<h3 className='text-gray-900 dark:text-white font-bold text-lg truncate' title={listing.title}>{listing.title}</h3>
									<span className='text-green-600 dark:text-green-400 font-bold'>${listing.price}</span>
								</div>
								<div className='flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2'>
									<MapPin size={16} className='mr-1' />
									<span>{listing.location || "Addis Ababa"}</span>
								</div>
								<div className='flex items-center justify-between mb-3'>
									<div className='flex items-center'>
										<Star size={16} className='text-yellow-400 fill-current' />
										<span className='text-gray-900 dark:text-white ml-1 text-sm'>{listing.seller?.rating || 4.5}</span>
									</div>
									<span className='text-gray-900 dark:text-white text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded'>{listing.condition}</span>
								</div>
								<div className='flex justify-between items-center'>
									<span className='text-sm text-gray-600 dark:text-gray-400'>by {listing.seller?.name || "Seller"}</span>
									<Link
										to={`/listing/${listing._id}`}
										className='px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300'
									>
										View
									</Link>
								</div>
							</div>
						</motion.div>
					))}
				</motion.div>

				{/* Empty State */}
				{filteredListings.length === 0 && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='text-center py-12'
					>
						<h3 className='text-xl font-bold text-gray-900 dark:text-white mb-2'>No listings found</h3>
						<p className='text-gray-600 dark:text-gray-400 mb-4'>Try adjusting your search or filter criteria</p>
						<button
							onClick={() => {
								setSearchTerm("");
								setSelectedCategory("all");
							}}
							className='px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition duration-300'
						>
							Clear Filters
						</button>
					</motion.div>
				)}
			</div>

			{/* Save Search Modal */}
			<CreateSavedSearchModal
				isOpen={showSaveSearchModal}
				onClose={() => setShowSaveSearchModal(false)}
				onSave={handleCreateSavedSearch}
				initialData={{
					query: searchTerm,
					filters: selectedCategory !== "all" ? { category: selectedCategory } : {}
				}}
			/>
		</div>
	);
};

export default MarketplacePage;