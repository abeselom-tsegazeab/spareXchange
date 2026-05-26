import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, X, Upload, MapPin, DollarSign, Tag } from "lucide-react";
import { useListingStore } from "../store/listingStore";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const EditListingPage = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	useAuthStore();
	const { currentListing, getListing, updateListing, isLoading } = useListingStore();

	const [formData, setFormData] = useState({
		title: "",
		description: "",
		price: "",
		category: "",
		condition: "",
		location: "",
		locationCoords: { type: "Point", coordinates: [0, 0] },
		contactInfo: { phone: "", email: "" },
		specifications: {},
		compatibleVehicles: []
	});

	const [images, setImages] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);
	const [specKey, setSpecKey] = useState("");
	const [specValue, setSpecValue] = useState("");
	const [vehicleForm, setVehicleForm] = useState({
		brand: "",
		model: "",
		yearStart: "",
		yearEnd: ""
	});

	useEffect(() => {
		const fetchListing = async () => {
			try {
				const response = await getListing(id);
				const listing = response.listing;
				
				setFormData({
					title: listing.title || "",
					description: listing.description || "",
					price: listing.price || "",
					category: listing.category || "",
					condition: listing.condition || "",
					location: listing.location || "",
					locationCoords: listing.locationCoords || { type: "Point", coordinates: [0, 0] },
					contactInfo: listing.contactInfo || { phone: "", email: "" },
					specifications: listing.specifications || {},
					compatibleVehicles: listing.compatibleVehicles || []
				});

				if (listing.images && listing.images.length > 0) {
					setImages(listing.images);
					setImagePreviews(listing.images);
				}
			} catch (error) {
				toast.error("Failed to load listing");
				navigate("/my-listings");
			}
		};

		fetchListing();
	}, [id]);

	const categories = ["vehicle", "electronics", "appliances", "machinery", "mobile", "computer", "other"];
	const conditions = ["new", "like-new", "used-good", "used-fair", "refurbished"];

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		if (name.includes(".")) {
			const [parent, child] = name.split(".");
			setFormData(prev => ({
				...prev,
				[parent]: { ...prev[parent], [child]: value }
			}));
		} else {
			setFormData(prev => ({ ...prev, [name]: value }));
		}
	};

	const handleImageUpload = (e) => {
		const files = Array.from(e.target.files);
		const newImages = [];
		const newPreviews = [];

		files.forEach(file => {
			const reader = new FileReader();
			reader.onloadend = () => {
				newImages.push(reader.result);
				newPreviews.push(reader.result);
				if (newImages.length === files.length) {
					setImages(prev => [...prev, ...newImages]);
					setImagePreviews(prev => [...prev, ...newPreviews]);
				}
			};
			reader.readAsDataURL(file);
		});
	};

	const removeImage = (index) => {
		setImages(prev => prev.filter((_, i) => i !== index));
		setImagePreviews(prev => prev.filter((_, i) => i !== index));
	};

	const addSpecification = () => {
		if (specKey && specValue) {
			setFormData(prev => ({
				...prev,
				specifications: { ...prev.specifications, [specKey]: specValue }
			}));
			setSpecKey("");
			setSpecValue("");
		}
	};

	const removeSpecification = (key) => {
		setFormData(prev => {
			const newSpecs = { ...prev.specifications };
			delete newSpecs[key];
			return { ...prev, specifications: newSpecs };
		});
	};

	const addVehicle = () => {
		if (vehicleForm.brand && vehicleForm.model && vehicleForm.yearStart && vehicleForm.yearEnd) {
			setFormData(prev => ({
				...prev,
				compatibleVehicles: [...prev.compatibleVehicles, { ...vehicleForm, yearStart: Number(vehicleForm.yearStart), yearEnd: Number(vehicleForm.yearEnd) }]
			}));
			setVehicleForm({ brand: "", model: "", yearStart: "", yearEnd: "" });
		}
	};

	const removeVehicle = (index) => {
		setFormData(prev => ({
			...prev,
			compatibleVehicles: prev.compatibleVehicles.filter((_, i) => i !== index)
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.title || !formData.description || !formData.price || !formData.category || !formData.condition || !formData.location) {
			toast.error("Please fill in all required fields");
			return;
		}

		try {
			const listingData = {
				...formData,
				price: Number(formData.price),
				images
			};

			await updateListing(id, listingData);
			toast.success("Listing updated successfully!");
			navigate("/my-listings");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update listing");
		}
	};

	if (!currentListing && isLoading) {
		return <LoadingSpinner />;
	}

	return (
		<div className='min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8'>
			<div className='container mx-auto px-4 max-w-4xl'>
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className='mb-8'
				>
					<h1 className='text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
						Edit Listing
					</h1>
					<p className='text-gray-400'>Update your spare part listing</p>
				</motion.div>

				<form onSubmit={handleSubmit} className='space-y-6'>
					{/* Basic Information */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
						className='bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-700'
					>
						<h2 className='text-2xl font-bold mb-4'>Basic Information</h2>
						<div className='space-y-4'>
							<div>
								<label className='block text-sm font-medium mb-2'>Title *</label>
								<input
									type='text'
									name='title'
									value={formData.title}
									onChange={handleInputChange}
									className='w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary'
									required
								/>
							</div>

							<div>
								<label className='block text-sm font-medium mb-2'>Description *</label>
								<textarea
									name='description'
									value={formData.description}
									onChange={handleInputChange}
									rows='4'
									className='w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary'
									required
								/>
							</div>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div>
									<label className='block text-sm font-medium mb-2'>
										<DollarSign size={16} className='inline mr-1' />
										Price *
									</label>
									<input
										type='number'
										name='price'
										value={formData.price}
										onChange={handleInputChange}
										min='0'
										step='0.01'
										className='w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary'
										required
									/>
								</div>

								<div>
									<label className='block text-sm font-medium mb-2'>
										<Tag size={16} className='inline mr-1' />
										Category *
									</label>
									<select
										name='category'
										value={formData.category}
										onChange={handleInputChange}
										className='w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary'
										required
									>
										<option value=''>Select Category</option>
										{categories.map(cat => (
											<option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
										))}
									</select>
								</div>
							</div>

							<div>
								<label className='block text-sm font-medium mb-2'>Condition *</label>
								<select
									name='condition'
									value={formData.condition}
									onChange={handleInputChange}
									className='w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary'
									required
								>
									<option value=''>Select Condition</option>
									{conditions.map(cond => (
										<option key={cond} value={cond}>{cond.charAt(0).toUpperCase() + cond.slice(1)}</option>
									))}
								</select>
							</div>
						</div>
					</motion.div>

					{/* Location */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2 }}
						className='bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-700'
					>
						<h2 className='text-2xl font-bold mb-4'>Location</h2>
						<div>
							<label className='block text-sm font-medium mb-2'>
								<MapPin size={16} className='inline mr-1' />
								Location *
							</label>
							<input
								type='text'
								name='location'
								value={formData.location}
								onChange={handleInputChange}
								className='w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary'
								required
							/>
						</div>
					</motion.div>

					{/* Images */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className='bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-700'
					>
						<h2 className='text-2xl font-bold mb-4'>
							<Upload size={20} className='inline mr-2' />
							Images
						</h2>
						<input
							type='file'
							accept='image/*'
							multiple
							onChange={handleImageUpload}
							className='w-full px-4 py-2 bg-background border border-border rounded-lg'
						/>
						{imagePreviews.length > 0 && (
							<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-4'>
								{imagePreviews.map((preview, index) => (
									<div key={index} className='relative'>
										<img src={preview} alt={`Preview ${index + 1}`} className='w-full h-32 object-cover rounded-lg' />
										<button
											type='button'
											onClick={() => removeImage(index)}
											className='absolute top-2 right-2 p-1 bg-red-600 rounded-full hover:bg-red-700'
										>
											<X size={16} />
										</button>
									</div>
								))}
							</div>
						)}
					</motion.div>

					{/* Compatible Vehicles */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
						className='bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-700'
					>
						<h2 className='text-2xl font-bold mb-4'>Compatible Vehicles</h2>
						<div className='space-y-4'>
							<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
								<input
									type='text'
									placeholder='Brand'
									value={vehicleForm.brand}
									onChange={(e) => setVehicleForm(prev => ({ ...prev, brand: e.target.value }))}
									className='px-4 py-2 bg-background border border-border rounded-lg'
								/>
								<input
									type='text'
									placeholder='Model'
									value={vehicleForm.model}
									onChange={(e) => setVehicleForm(prev => ({ ...prev, model: e.target.value }))}
									className='px-4 py-2 bg-background border border-border rounded-lg'
								/>
								<input
									type='number'
									placeholder='Year Start'
									value={vehicleForm.yearStart}
									onChange={(e) => setVehicleForm(prev => ({ ...prev, yearStart: e.target.value }))}
									className='px-4 py-2 bg-background border border-border rounded-lg'
								/>
								<input
									type='number'
									placeholder='Year End'
									value={vehicleForm.yearEnd}
									onChange={(e) => setVehicleForm(prev => ({ ...prev, yearEnd: e.target.value }))}
									className='px-4 py-2 bg-background border border-border rounded-lg'
								/>
							</div>
							<button
								type='button'
								onClick={addVehicle}
								className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center'
							>
								<Plus size={16} className='mr-2' />
								Add Vehicle
							</button>

							{formData.compatibleVehicles.length > 0 && (
								<div className='space-y-2'>
									{formData.compatibleVehicles.map((vehicle, index) => (
										<div key={index} className='flex justify-between items-center p-3 bg-background rounded-lg border border-border'>
											<span>{vehicle.brand} {vehicle.model} ({vehicle.yearStart}-{vehicle.yearEnd})</span>
											<button
												type='button'
												onClick={() => removeVehicle(index)}
												className='p-1 bg-red-600 rounded-full hover:bg-red-700'
											>
												<X size={16} />
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					</motion.div>

					{/* Specifications */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
						className='bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-700'
					>
						<h2 className='text-2xl font-bold mb-4'>Specifications</h2>
						<div className='space-y-4'>
							<div className='flex gap-4'>
								<input
									type='text'
									placeholder='Key'
									value={specKey}
									onChange={(e) => setSpecKey(e.target.value)}
									className='flex-1 px-4 py-2 bg-background border border-border rounded-lg'
								/>
								<input
									type='text'
									placeholder='Value'
									value={specValue}
									onChange={(e) => setSpecValue(e.target.value)}
									className='flex-1 px-4 py-2 bg-background border border-border rounded-lg'
								/>
								<button
									type='button'
									onClick={addSpecification}
									className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition'
								>
									<Plus size={16} />
								</button>
							</div>

							{Object.keys(formData.specifications).length > 0 && (
								<div className='space-y-2'>
									{Object.entries(formData.specifications).map(([key, value]) => (
										<div key={key} className='flex justify-between items-center p-3 bg-background rounded-lg border border-border'>
											<span><strong>{key}:</strong> {value}</span>
											<button
												type='button'
												onClick={() => removeSpecification(key)}
												className='p-1 bg-red-600 rounded-full hover:bg-red-700'
											>
												<X size={16} />
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					</motion.div>

					{/* Contact Info */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.6 }}
						className='bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-700'
					>
						<h2 className='text-2xl font-bold mb-4'>Contact Information</h2>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div>
								<label className='block text-sm font-medium mb-2'>Phone</label>
								<input
									type='tel'
									name='contactInfo.phone'
									value={formData.contactInfo.phone}
									onChange={handleInputChange}
									className='w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary'
								/>
							</div>
							<div>
								<label className='block text-sm font-medium mb-2'>Email</label>
								<input
									type='email'
									name='contactInfo.email'
									value={formData.contactInfo.email}
									onChange={handleInputChange}
									className='w-full px-4 py-2 bg-background border border-border rounded-lg focus:border-primary focus:ring-2 focus:ring-primary'
								/>
							</div>
						</div>
					</motion.div>

					{/* Submit Button */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.7 }}
						className='flex gap-4'
					>
						<button
							type='submit'
							disabled={isLoading}
							className='flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50'
						>
							{isLoading ? "Updating..." : "Update Listing"}
						</button>
						<button
							type='button'
							onClick={() => navigate("/my-listings")}
							className='px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition'
						>
							Cancel
						</button>
					</motion.div>
				</form>
			</div>
		</div>
	);
};

export default EditListingPage;
