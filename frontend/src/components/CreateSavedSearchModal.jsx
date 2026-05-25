import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Search, DollarSign, Tag, Bell } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = ["electronics", "vehicle", "automotive", "appliances", "tools", "other"];
const CONDITIONS = ["new", "used", "refurbished"];

const CreateSavedSearchModal = ({ isOpen, onClose, onSave, initialData = null }) => {
	const [formData, setFormData] = useState({
		name: "",
		query: "",
		filters: {
			category: "",
			condition: "",
			brand: "",
			model: "",
			year: "",
			minPrice: "",
			maxPrice: ""
		},
		geo: {
			latitude: "",
			longitude: "",
			radiusKm: 50
		},
		notify: true
	});

	const [locationLoading, setLocationLoading] = useState(false);

	// Initialize form with initialData (for editing or pre-filled from marketplace)
	useEffect(() => {
		if (initialData) {
			setFormData({
				name: initialData.name || "",
				query: initialData.query || "",
				filters: {
					category: initialData.filters?.category || "",
					condition: initialData.filters?.condition || "",
					brand: initialData.filters?.brand || "",
					model: initialData.filters?.model || "",
					year: initialData.filters?.year || "",
					minPrice: initialData.filters?.minPrice || "",
					maxPrice: initialData.filters?.maxPrice || ""
				},
				geo: {
					latitude: initialData.geo?.latitude || "",
					longitude: initialData.geo?.longitude || "",
					radiusKm: initialData.geo?.radiusKm || 50
				},
				notify: initialData.notify !== undefined ? initialData.notify : true
			});
		} else {
			// Reset form
			setFormData({
				name: "",
				query: "",
				filters: {
					category: "",
					condition: "",
					brand: "",
					model: "",
					year: "",
					minPrice: "",
					maxPrice: ""
				},
				geo: {
					latitude: "",
					longitude: "",
					radiusKm: 50
				},
				notify: true
			});
		}
	}, [initialData, isOpen]);

	// Get user's current location
	const handleGetMyLocation = () => {
		if (!navigator.geolocation) {
			toast.error("Geolocation is not supported by your browser");
			return;
		}

		setLocationLoading(true);
		navigator.geolocation.getCurrentPosition(
			(position) => {
				setFormData(prev => ({
					...prev,
					geo: {
						...prev.geo,
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					}
				}));
				setLocationLoading(false);
				toast.success("Location detected successfully!");
			},
			(error) => {
				setLocationLoading(false);
				toast.error("Unable to retrieve your location. Please enable location access.");
				console.error("Geolocation error:", error);
			}
		);
	};

	// Handle form input changes
	const handleChange = (field, value) => {
		if (field.includes(".")) {
			const [parent, child] = field.split(".");
			setFormData(prev => ({
				...prev,
				[parent]: {
					...prev[parent],
					[child]: value
				}
			}));
		} else {
			setFormData(prev => ({
				...prev,
				[field]: value
			}));
		}
	};

	// Validate form
	const validateForm = () => {
		// Must have at least query OR some filters
		const hasQuery = formData.query.trim().length > 0;
		const hasFilters = formData.filters.category || formData.filters.brand || formData.filters.model;
		
		if (!hasQuery && !hasFilters) {
			toast.error("Please enter search keywords or select at least one filter");
			return false;
		}

		// Validate geo coordinates if provided
		if (formData.geo.latitude || formData.geo.longitude) {
			const lat = parseFloat(formData.geo.latitude);
			const lng = parseFloat(formData.geo.longitude);
			
			if (isNaN(lat) || lat < -90 || lat > 90) {
				toast.error("Invalid latitude. Must be between -90 and 90");
				return false;
			}
			if (isNaN(lng) || lng < -180 || lng > 180) {
				toast.error("Invalid longitude. Must be between -180 and 180");
				return false;
			}
		}

		// Validate year if provided
		if (formData.filters.year) {
			const year = parseInt(formData.filters.year);
			const currentYear = new Date().getFullYear();
			if (isNaN(year) || year < 1900 || year > currentYear + 2) {
				toast.error(`Invalid year. Must be between 1900 and ${currentYear + 2}`);
				return false;
			}
		}

		// Validate price range
		if (formData.filters.minPrice && formData.filters.maxPrice) {
			const min = parseFloat(formData.filters.minPrice);
			const max = parseFloat(formData.filters.maxPrice);
			if (min > max) {
				toast.error("Minimum price cannot be greater than maximum price");
				return false;
			}
		}

		return true;
	};

	// Handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();

		if (!validateForm()) return;

		// Prepare data for submission (remove empty fields)
		const searchData = {
			name: formData.name.trim(),
			query: formData.query.trim(),
			filters: {},
			notify: formData.notify
		};

		// Add non-empty filters
		if (formData.filters.category) searchData.filters.category = formData.filters.category;
		if (formData.filters.condition) searchData.filters.condition = formData.filters.condition;
		if (formData.filters.brand) searchData.filters.brand = formData.filters.brand.trim();
		if (formData.filters.model) searchData.filters.model = formData.filters.model.trim();
		if (formData.filters.year) searchData.filters.year = parseInt(formData.filters.year);
		if (formData.filters.minPrice) searchData.filters.minPrice = parseFloat(formData.filters.minPrice);
		if (formData.filters.maxPrice) searchData.filters.maxPrice = parseFloat(formData.filters.maxPrice);

		// Add geo if coordinates are provided
		if (formData.geo.latitude && formData.geo.longitude) {
			searchData.geo = {
				latitude: parseFloat(formData.geo.latitude),
				longitude: parseFloat(formData.geo.longitude),
				radiusKm: parseInt(formData.geo.radiusKm) || 50
			};
		}

		onSave(searchData);
	};

	if (!isOpen) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
				onClick={onClose}
			>
				<motion.div
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					exit={{ scale: 0.9, opacity: 0 }}
					transition={{ type: "spring", damping: 25, stiffness: 300 }}
					className="bg-gray-900 dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-700 dark:border-gray-700"
					onClick={(e) => e.stopPropagation()}
				>
					{/* Header */}
					<div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
						<h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
							<Search className="text-green-600 dark:text-green-400" size={24} />
							{initialData?._id ? "Edit Saved Search" : "Save This Search"}
						</h2>
						<button
							onClick={onClose}
							className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
						>
							<X size={24} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white" />
						</button>
					</div>

					{/* Form */}
					<form onSubmit={handleSubmit} className="p-6 space-y-6">
						{/* Search Name */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Saved Search Name (Optional)
							</label>
							<input
								type="text"
								value={formData.name}
								onChange={(e) => handleChange("name", e.target.value)}
								placeholder="e.g., Toyota Brake Pads"
								className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
							/>
						</div>

						{/* Keywords */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Search Keywords
							</label>
							<input
								type="text"
								value={formData.query}
								onChange={(e) => handleChange("query", e.target.value)}
								placeholder="e.g., brake pads toyota camry"
								className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
							/>
						</div>

						{/* Filters Section */}
						<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
								<Tag size={20} className="text-green-600 dark:text-green-400" />
								Filters
							</h3>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{/* Category */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
									<select
										value={formData.filters.category}
										onChange={(e) => handleChange("filters.category", e.target.value)}
										className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
									>
										<option value="">All Categories</option>
										{CATEGORIES.map(cat => (
											<option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
										))}
									</select>
								</div>

								{/* Condition */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Condition</label>
									<select
										value={formData.filters.condition}
										onChange={(e) => handleChange("filters.condition", e.target.value)}
										className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
									>
										<option value="">Any Condition</option>
										{CONDITIONS.map(cond => (
											<option key={cond} value={cond}>{cond.charAt(0).toUpperCase() + cond.slice(1)}</option>
										))}
									</select>
								</div>

								{/* Brand */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Brand</label>
									<input
										type="text"
										value={formData.filters.brand}
										onChange={(e) => handleChange("filters.brand", e.target.value)}
										placeholder="e.g., Toyota"
										className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
								</div>

								{/* Model */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
									<input
										type="text"
										value={formData.filters.model}
										onChange={(e) => handleChange("filters.model", e.target.value)}
										placeholder="e.g., Camry"
										className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
								</div>

								{/* Year */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
									<input
										type="number"
										value={formData.filters.year}
										onChange={(e) => handleChange("filters.year", e.target.value)}
										placeholder="e.g., 2020"
										className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
								</div>

								{/* Min Price */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Min Price</label>
									<div className="relative">
										<DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
										<input
											type="number"
											value={formData.filters.minPrice}
											onChange={(e) => handleChange("filters.minPrice", e.target.value)}
											placeholder="0"
											className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
										/>
									</div>
								</div>

								{/* Max Price */}
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Max Price</label>
									<div className="relative">
										<DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
										<input
											type="number"
											value={formData.filters.maxPrice}
											onChange={(e) => handleChange("filters.maxPrice", e.target.value)}
											placeholder="No limit"
											className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
										/>
									</div>
								</div>
							</div>
						</div>

						{/* Location Section */}
						<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
							<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
								<MapPin size={20} className="text-green-600 dark:text-green-400" />
								Search Location
							</h3>

							<button
								type="button"
								onClick={handleGetMyLocation}
								disabled={locationLoading}
								className="mb-4 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
							>
								<MapPin size={18} />
								{locationLoading ? "Detecting..." : "Use My Current Location"}
							</button>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Latitude</label>
									<input
										type="number"
										step="any"
										value={formData.geo.latitude}
										onChange={(e) => handleChange("geo.latitude", e.target.value)}
										placeholder="e.g., 8.9806"
										className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Longitude</label>
									<input
										type="number"
										step="any"
										value={formData.geo.longitude}
										onChange={(e) => handleChange("geo.longitude", e.target.value)}
										placeholder="e.g., 38.7578"
										className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-300 mb-2">Radius (km)</label>
									<input
										type="number"
										value={formData.geo.radiusKm}
										onChange={(e) => handleChange("geo.radiusKm", e.target.value)}
										min="1"
										max="500"
										className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
									/>
								</div>
							</div>
						</div>

						{/* Notification Toggle */}
						<div className="border-t border-gray-200 dark:border-gray-700 pt-6">
							<label className="flex items-center gap-3 cursor-pointer">
								<input
									type="checkbox"
									checked={formData.notify}
									onChange={(e) => handleChange("notify", e.target.checked)}
									className="w-5 h-5 text-green-500 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-green-500 focus:ring-2"
								/>
								<div className="flex items-center gap-2">
									<Bell size={18} className="text-green-600 dark:text-green-400" />
									<span className="text-gray-900 dark:text-white font-medium">Notify me when new listings match</span>
								</div>
							</label>
						</div>

						{/* Action Buttons */}
						<div className="flex gap-4 pt-4">
							<button
								type="button"
								onClick={onClose}
								className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
							>
								Cancel
							</button>
							<button
								type="submit"
								className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
							>
								<Search size={20} />
								{initialData?._id ? "Update Search" : "Save Search"}
							</button>
						</div>
					</form>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
};

export default CreateSavedSearchModal;
