import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSavedSearchStore } from "../store/savedSearchStore";
import CreateSavedSearchModal from "../components/CreateSavedSearchModal";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
	Search,
	Plus,
	Edit,
	Trash2,
	Bell,
	BellOff,
	MapPin,
	Filter
} from "lucide-react";

const SavedSearchesPage = () => {
	const {
		savedSearches,
		isLoading,
		getSavedSearches,
		deleteSavedSearch,
		toggleNotification
	} = useSavedSearchStore();

	const [showModal, setShowModal] = useState(false);
	const [editingSearch, setEditingSearch] = useState(null);
	const [localSearches, setLocalSearches] = useState([]);

	useEffect(() => {
		fetchSearches();
	}, []);

	useEffect(() => {
		setLocalSearches(savedSearches);
	}, [savedSearches]);

	const fetchSearches = async () => {
		try {
			await getSavedSearches();
		} catch (error) {
			toast.error("Failed to load saved searches");
		}
	};

	const handleCreate = async (searchData) => {
		try {
			await useSavedSearchStore.getState().createSavedSearch(searchData);
			toast.success("Saved search created successfully!");
			setShowModal(false);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to create saved search");
		}
	};

	const handleUpdate = async (searchData) => {
		try {
			await useSavedSearchStore.getState().updateSavedSearch(editingSearch._id, searchData);
			toast.success("Saved search updated successfully!");
			setEditingSearch(null);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update saved search");
		}
	};

	const handleDelete = async (id) => {
		if (!window.confirm("Are you sure you want to delete this saved search?")) return;

		try {
			await deleteSavedSearch(id);
			toast.success("Saved search deleted");
		} catch (error) {
			toast.error("Failed to delete saved search");
		}
	};

	const handleToggleNotify = async (id, currentNotify) => {
		try {
			await toggleNotification(id, currentNotify);
			toast.success(currentNotify ? "Notifications disabled" : "Notifications enabled");
		} catch (error) {
			toast.error("Failed to update notification settings");
		}
	};

	const handleEdit = (search) => {
		setEditingSearch(search);
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
		setEditingSearch(null);
	};

	const formatFilters = (search) => {
		const parts = [];
		
		if (search.query) parts.push(`Keywords: "${search.query}"`);
		if (search.filters?.category) parts.push(`Category: ${search.filters.category}`);
		if (search.filters?.condition) parts.push(`Condition: ${search.filters.condition}`);
		if (search.filters?.brand) parts.push(`Brand: ${search.filters.brand}`);
		if (search.filters?.model) parts.push(`Model: ${search.filters.model}`);
		if (search.filters?.year) parts.push(`Year: ${search.filters.year}`);
		
		if (search.filters?.minPrice || search.filters?.maxPrice) {
			const min = search.filters.minPrice ? `$${search.filters.minPrice}` : "$0";
			const max = search.filters.maxPrice ? `$${search.filters.maxPrice}` : "∞";
			parts.push(`Price: ${min} - ${max}`);
		}

		return parts;
	};

	if (isLoading && localSearches.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className='min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-900 dark:text-white py-8 px-4'
		>
			<div className='max-w-7xl mx-auto'>
				{/* Header */}
				<div className='mb-8'>
					<div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
						<div>
							<h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3'>
								<Search className='text-green-600 dark:text-green-400' size={40} />
								Saved Searches
							</h1>
							<p className='text-gray-600 dark:text-gray-400'>
								Manage your saved searches and get notified when new listings match
							</p>
						</div>
						<button
							onClick={() => setShowModal(true)}
							className='px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2'
						>
							<Plus size={20} />
							Create New Search
						</button>
					</div>
				</div>

				{/* Search List */}
				{localSearches.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className='bg-primary dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center'
					>
						<Search size={64} className='text-gray-400 dark:text-gray-600 mx-auto mb-4' />
						<h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>No Saved Searches Yet</h3>
						<p className='text-gray-600 dark:text-gray-400 mb-6'>
							Save your search criteria from the marketplace to get notified when new listings match
						</p>
						<button
							onClick={() => setShowModal(true)}
							className='px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2'
						>
							<Plus size={20} />
							Create Your First Saved Search
						</button>
					</motion.div>
				) : (
					<div className='grid gap-6'>
						{localSearches.map((search, index) => (
							<motion.div
								key={search._id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								className='bg-primary dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 hover:border-green-500 transition-colors'
							>
								<div className='flex flex-col lg:flex-row lg:items-start justify-between gap-4'>
									{/* Search Info */}
									<div className='flex-1'>
										<div className='flex items-center gap-3 mb-3'>
											<h3 className='text-xl font-bold text-gray-900 dark:text-white'>
												{search.name || "Untitled Search"}
											</h3>
											<button
												onClick={() => handleToggleNotify(search._id, search.notify)}
												className={`p-2 rounded-lg transition-colors ${
													search.notify
														? "bg-green-600 hover:bg-green-700"
														: "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
												}`}
												title={search.notify ? "Disable notifications" : "Enable notifications"}
											>
												{search.notify ? (
													<Bell size={18} className='text-white' />
												) : (
													<BellOff size={18} className='text-gray-600 dark:text-gray-400' />
												)}
											</button>
										</div>

										{/* Query */}
										{search.query && (
											<p className='text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2'>
												<Search size={16} className='text-green-600 dark:text-green-400' />
												<span className='font-medium'>Query:</span> {search.query}
											</p>
										)}

										{/* Filters */}
										<div className='flex flex-wrap gap-2 mb-3'>
											{formatFilters(search).map((filter, idx) => (
												<span
													key={idx}
													className='px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm flex items-center gap-1'
												>
													<Filter size={12} />
													{filter}
												</span>
											))}
										</div>

										{/* Geo Info */}
										{search.geo?.latitude && search.geo?.longitude && (
											<p className='text-gray-600 dark:text-gray-400 text-sm flex items-center gap-2'>
												<MapPin size={14} className='text-green-600 dark:text-green-400' />
												Location: {search.geo.latitude.toFixed(4)}, {search.geo.longitude.toFixed(4)} 
												({search.geo.radiusKm}km radius)
											</p>
										)}

										{/* Metadata */}
										<div className='flex items-center gap-4 mt-3 text-sm text-gray-500'>
											<span>Created: {new Date(search.createdAt).toLocaleDateString()}</span>
											<span>Updated: {new Date(search.updatedAt).toLocaleDateString()}</span>
										</div>
									</div>

									{/* Actions */}
									<div className='flex lg:flex-col gap-2'>
										<button
											onClick={() => handleEdit(search)}
											className='p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2'
											title='Edit search'
										>
											<Edit size={18} />
											<span className='lg:hidden'>Edit</span>
										</button>
										<button
											onClick={() => handleDelete(search._id)}
											className='p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2'
											title='Delete search'
										>
											<Trash2 size={18} />
											<span className='lg:hidden'>Delete</span>
										</button>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</div>

			{/* Create/Edit Modal */}
			<CreateSavedSearchModal
				isOpen={showModal}
				onClose={handleCloseModal}
				onSave={editingSearch ? handleUpdate : handleCreate}
				initialData={editingSearch}
			/>
		</motion.div>
	);
};

export default SavedSearchesPage;
