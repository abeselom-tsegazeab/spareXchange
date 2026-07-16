import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Edit, Trash2, Eye, ToggleLeft, ToggleRight, RefreshCw, Plus, Package, ShieldAlert } from "lucide-react";
import { useListingStore } from "../store/listingStore";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const MyListingsPage = () => {
	const { listings, getUserListings, deleteListing, toggleAvailability, renewListing, isLoading } = useListingStore();
	const { user } = useAuthStore();
	const [filter, setFilter] = useState("all");

	useEffect(() => {
		// Check if user is verified
		if (user && !user.isVerified) {
			toast.error("⚠️ Account verification required. Please verify your account to create and manage listings.");
		}
		fetchListings();
	}, [user]);

	const fetchListings = async () => {
		try {
			await getUserListings();
		} catch (error) {
			console.error("Error fetching listings:", error);
			const errorMessage = error.response?.data?.message || error.message || "Failed to load your listings";
			toast.error(errorMessage);
		}
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this listing?")) {
			try {
				await deleteListing(id);
				toast.success("Listing deleted successfully");
				fetchListings();
			} catch (error) {
				toast.error("Failed to delete listing");
			}
		}
	};

	const handleToggleAvailability = async (id) => {
		try {
			const response = await toggleAvailability(id);
			toast.success(response.message);
			fetchListings();
		} catch (error) {
			toast.error("Failed to update availability");
		}
	};

	const handleRenew = async (id) => {
		try {
			const response = await renewListing(id);
			toast.success(response.message);
			fetchListings();
		} catch (error) {
			toast.error("Failed to renew listing");
		}
	};

	const getStatus = (listing) => {
		const now = new Date();
		const expiresAt = new Date(listing.expiresAt);
		
		if (!listing.isActive) return { label: "Archived", color: "bg-gray-600" };
		if (!listing.available) return { label: "Unavailable", color: "bg-yellow-600" };
		if (expiresAt < now) return { label: "Expired", color: "bg-red-600" };
		return { label: "Active", color: "bg-green-600" };
	};

	const filteredListings = listings.filter(listing => {
		if (filter === "all") return true;
		if (filter === "active") {
			const status = getStatus(listing);
			return status.label === "Active";
		}
		if (filter === "unavailable") {
			const status = getStatus(listing);
			return status.label === "Unavailable";
		}
		if (filter === "expired") {
			const status = getStatus(listing);
			return status.label === "Expired" || status.label === "Archived";
		}
		return true;
	});

	if (isLoading && listings.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<div className='min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8'>
			<div className='container mx-auto px-4'>
				{/* Verification Warning for Unverified Users */}
				{user && !user.isVerified && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						className='mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg'
					>
						<div className='flex items-start gap-3'>
							<ShieldAlert className='text-red-600 dark:text-red-400 flex-shrink-0 mt-1' size={24} />
							<div>
								<h3 className='text-lg font-bold text-red-800 dark:text-red-300 mb-1'>
									⚠️ Account Verification Required
								</h3>
								<p className='text-red-700 dark:text-red-400 mb-2'>
									Your account is currently unverified. You cannot create new listings until an admin verifies your account.
								</p>
								<p className='text-red-600 dark:text-red-500 text-sm'>
									• New listings will not be created<br/>
									• Existing listings may be hidden from marketplace<br/>
									• Please contact admin or complete verification process
								</p>
							</div>
						</div>
					</motion.div>
				)}

				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className='mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4'
				>
					<div>
						<h1 className='text-4xl font-bold mb-2'>
							My Listings
						</h1>
						<p className='text-gray-600 dark:text-gray-400'>Manage your spare part listings</p>
					</div>
					{user && user.isVerified ? (
						<Link
							to='/create-listing'
							className='px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition flex items-center'
						>
							<Plus size={20} className='mr-2' />
							Create New Listing
						</Link>
					) : (
						<button
							disabled
							className='px-6 py-3 bg-gray-400 dark:bg-gray-600 text-white font-bold rounded-lg cursor-not-allowed flex items-center opacity-60'
							title='Verification required to create listings'
						>
							<Plus size={20} className='mr-2' />
							Create Listing (Verification Required)
						</button>
					)}
				</motion.div>

				{/* Filters */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className='mb-6 flex flex-wrap gap-2'
				>
					{["all", "active", "unavailable", "expired"].map((filterOption) => (
						<button
							key={filterOption}
							onClick={() => setFilter(filterOption)}
							className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
								filter === filterOption
									? "bg-green-600 text-white"
									: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
							}`}
						>
							{filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
						</button>
					))}
				</motion.div>

				{/* Listings Grid */}
				{filteredListings.length === 0 ? (
					user && !user.isVerified ? (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className='text-center py-16 bg-primary dark:bg-gray-800 rounded-xl border-2 border-red-300 dark:border-red-700'
						>
							<ShieldAlert size={64} className='mx-auto mb-4 text-red-400 dark:text-red-600' />
							<h3 className='text-2xl font-bold mb-2 text-gray-900 dark:text-white'>
								⚠️ Verification Required to Create Listings
							</h3>
							<p className='text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto'>
								Your account needs to be verified by an admin before you can create listings. 
								Unverified users cannot post items to the marketplace.
							</p>
							<div className='bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6 max-w-xl mx-auto'>
								<p className='text-red-700 dark:text-red-400 text-sm font-medium'>
									<strong>What you can do:</strong><br/>
									• Browse the marketplace and view items<br/>
									• Add items to your cart<br/>
									• Complete your profile information<br/>
									• Contact admin for verification assistance
								</p>
							</div>
							<p className='text-gray-500 dark:text-gray-500 text-sm'>
								Once verified, you'll be able to create and manage your own listings.
							</p>
						</motion.div>
					) : (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className='text-center py-16 bg-primary dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700'
						>
							<Package size={64} className='mx-auto mb-4 text-gray-400 dark:text-gray-600' />
							<h3 className='text-2xl font-bold mb-2 text-gray-900 dark:text-white'>No listings yet</h3>
							<p className='text-gray-600 dark:text-gray-400 mb-6'>Start by creating your first listing</p>
							<Link
								to='/create-listing'
								className='px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition inline-flex items-center'
							>
								<Plus size={20} className='mr-2' />
								Create Your First Listing
							</Link>
						</motion.div>
					)
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
						className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
					>
						{filteredListings.map((listing, index) => {
							const status = getStatus(listing);
							const daysUntilExpiry = Math.ceil((new Date(listing.expiresAt) - new Date()) / (1000 * 60 * 60 * 24));

							return (
								<motion.div
									key={listing._id}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
									className='bg-primary dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-green-500 transition duration-300'
								>
									{/* Image */}
									<div className='relative h-48'>
										<img
											src={listing.images?.[0] || "/placeholder-image.jpg"}
											alt={listing.title}
											className='w-full h-full object-cover'
										/>
										<div className='absolute top-2 right-2'>
											<span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color} text-white`}>
												{status.label}
											</span>
										</div>
										{daysUntilExpiry <= 7 && daysUntilExpiry > 0 && status.label === "Active" && (
											<div className='absolute top-2 left-2'>
												<span className='px-3 py-1 rounded-full text-xs font-bold bg-orange-600 text-white'>
													{daysUntilExpiry} days left
												</span>
											</div>
										)}
									</div>

									{/* Content */}
									<div className='p-4'>
										<h3 className='font-bold text-lg mb-2 truncate text-gray-900 dark:text-white'>{listing.title}</h3>
										<div className='flex justify-between items-center mb-2'>
											<span className='text-white dark:text-green-400 font-bold text-xl'>ETB {listing.price}</span>
											<span className='text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded'>{listing.condition}</span>
										</div>
										<div className='text-sm text-gray-600 dark:text-gray-400 mb-2'>
											Views: {listing.views || 0}
										</div>
										<div className='text-xs text-gray-600 dark:text-gray-400 mb-4'>
											Expires: {new Date(listing.expiresAt).toLocaleDateString()}
										</div>

										{/* Actions */}
										<div className='flex flex-wrap gap-2'>
											<Link
												to={`/listing/${listing._id}`}
												className='flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition flex items-center justify-center'
											>
												<Eye size={16} className='mr-1' />
												View
											</Link>
											<Link
												to={`/edit-listing/${listing._id}`}
												className='flex-1 px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition flex items-center justify-center'
											>
												<Edit size={16} className='mr-1' />
												Edit
											</Link>
											<button
												onClick={() => handleToggleAvailability(listing._id)}
												className='px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition flex items-center justify-center'
												title={listing.available ? "Mark as unavailable" : "Mark as available"}
											>
												{listing.available ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
											</button>
											{status.label !== "Active" && (
												<button
													onClick={() => handleRenew(listing._id)}
													className='px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition flex items-center justify-center'
													title='Renew for 30 days'
												>
													<RefreshCw size={16} />
												</button>
											)}
											<button
												onClick={() => handleDelete(listing._id)}
												className='px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition flex items-center justify-center'
											>
												<Trash2 size={16} />
											</button>
										</div>
									</div>
								</motion.div>
							);
						})}
					</motion.div>
				)}
			</div>
		</div>
	);
};

export default MyListingsPage;
