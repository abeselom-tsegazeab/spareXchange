import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Plus, X, Upload, AlertCircle } from "lucide-react";
import { useListingStore } from "../store/listingStore";
import toast from "react-hot-toast";

const BulkUploadPage = () => {
	const navigate = useNavigate();
	const { bulkCreateListings, isLoading } = useListingStore();
	const [mode, setMode] = useState("form"); // 'form' or 'json'
	const [listings, setListings] = useState([]);
	const [jsonInput, setJsonInput] = useState("");
	const [jsonError, setJsonError] = useState("");
	const [currentListing, setCurrentListing] = useState({
		title: "",
		description: "",
		price: "",
		category: "",
		condition: "",
		location: ""
	});

	const categories = ["vehicle", "electronics", "appliances", "machinery", "mobile", "computer", "other"];
	const conditions = ["new", "like-new", "used-good", "used-fair", "refurbished"];

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setCurrentListing(prev => ({ ...prev, [name]: value }));
	};

	const addListing = () => {
		if (!currentListing.title || !currentListing.description || !currentListing.price || !currentListing.category || !currentListing.condition || !currentListing.location) {
			toast.error("Please fill in all required fields");
			return;
		}

		setListings(prev => [...prev, {
			...currentListing,
			price: Number(currentListing.price)
		}]);

		setCurrentListing({
			title: "",
			description: "",
			price: "",
			category: "",
			condition: "",
			location: ""
		});

		toast.success("Listing added to batch");
	};

	const removeListing = (index) => {
		setListings(prev => prev.filter((_, i) => i !== index));
	};

	const handleJsonValidate = () => {
		try {
			const parsed = JSON.parse(jsonInput);
			if (!Array.isArray(parsed)) {
				setJsonError("JSON must be an array of listings");
				return false;
			}
			setJsonError("");
			return true;
		} catch (e) {
			setJsonError("Invalid JSON format");
			return false;
		}
	};

	const handleSubmit = async () => {
		try {
			let listingsToSubmit = [];

			if (mode === "json") {
				if (!handleJsonValidate()) return;
				listingsToSubmit = JSON.parse(jsonInput);
			} else {
				if (listings.length === 0) {
					toast.error("Add at least one listing");
					return;
				}
				listingsToSubmit = listings;
			}

			const response = await bulkCreateListings(listingsToSubmit);
			toast.success(`${response.count || listingsToSubmit.length} listings created successfully!`);
			navigate("/my-listings");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to create bulk listings");
		}
	};

	return (
		<div className='min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8'>
			<div className='container mx-auto px-4 max-w-4xl'>
				<motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='mb-8'>
					<h1 className='text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
						Bulk Upload Listings
					</h1>
					<p className='text-gray-400'>Upload multiple listings at once (For Garages & Recyclers)</p>
				</motion.div>

				{/* Mode Selector */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='mb-6 flex gap-4'>
					<button
						onClick={() => setMode("form")}
						className={`flex-1 px-6 py-3 rounded-lg font-bold transition ${mode === "form" ? "bg-primary text-primary-foreground" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
					>
						Form Mode
					</button>
					<button
						onClick={() => setMode("json")}
						className={`flex-1 px-6 py-3 rounded-lg font-bold transition ${mode === "json" ? "bg-primary text-primary-foreground" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}
					>
						JSON Mode
					</button>
				</motion.div>

				{mode === "form" ? (
					<>
						{/* Form Mode */}
						<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className='bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-700 mb-6'>
							<h2 className='text-2xl font-bold mb-4'>Add Listing to Batch</h2>
							<div className='space-y-4'>
								<input type='text' name='title' value={currentListing.title} onChange={handleInputChange} placeholder='Title *' className='w-full px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white' required />
								<textarea name='description' value={currentListing.description} onChange={handleInputChange} placeholder='Description *' rows='3' className='w-full px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white' required />
								<div className='grid grid-cols-2 gap-4'>
									<input type='number' name='price' value={currentListing.price} onChange={handleInputChange} placeholder='Price *' min='0' className='px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white' required />
									<select name='category' value={currentListing.category} onChange={handleInputChange} className='px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white' required>
										<option value=''>Category *</option>
										{categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
									</select>
								</div>
								<div className='grid grid-cols-2 gap-4'>
									<select name='condition' value={currentListing.condition} onChange={handleInputChange} className='px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white' required>
										<option value=''>Condition *</option>
										{conditions.map(cond => <option key={cond} value={cond}>{cond}</option>)}
									</select>
									<input type='text' name='location' value={currentListing.location} onChange={handleInputChange} placeholder='Location *' className='px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg text-white' required />
								</div>
								<button type='button' onClick={addListing} className='w-full px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition flex items-center justify-center'>
									<Plus size={20} className='mr-2' />
									Add to Batch ({listings.length} listings)
								</button>
							</div>
						</motion.div>

						{/* Batch Preview */}
						{listings.length > 0 && (
							<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className='bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-700 mb-6'>
								<h3 className='text-xl font-bold mb-4'>Batch Preview ({listings.length} listings)</h3>
								<div className='space-y-2 max-h-96 overflow-y-auto'>
									{listings.map((listing, index) => (
										<div key={index} className='flex justify-between items-center p-3 bg-gray-700 bg-opacity-50 rounded-lg border border-gray-600'>
											<div>
												<div className='font-medium'>{listing.title}</div>
												<div className='text-sm text-gray-400'>${listing.price} - {listing.category}</div>
											</div>
											<button onClick={() => removeListing(index)} className='p-1 bg-red-600 rounded-full hover:bg-red-700'>
												<X size={16} />
											</button>
										</div>
									))}
								</div>
							</motion.div>
						)}
					</>
				) : (
					/* JSON Mode */
					<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className='bg-gray-800 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl p-6 border border-gray-700 mb-6'>
						<h2 className='text-2xl font-bold mb-4'>JSON Input</h2>
						<textarea
							value={jsonInput}
							onChange={(e) => setJsonInput(e.target.value)}
							rows='15'
							className='w-full px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-600 rounded-lg font-mono text-sm text-white'
							placeholder='[{"title":"Item 1","description":"Desc 1","price":100,"category":"vehicle","condition":"new","location":"Addis Ababa"},...]'
						/>
						{jsonError && (
							<div className='mt-2 flex items-center text-red-400'>
								<AlertCircle size={16} className='mr-2' />
								<span>{jsonError}</span>
							</div>
						)}
					</motion.div>
				)}

				{/* Submit Button */}
				<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className='flex gap-4'>
					<button
						onClick={handleSubmit}
						disabled={isLoading}
						className='flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 flex items-center justify-center'
					>
						<Upload size={20} className='mr-2' />
						{isLoading ? "Uploading..." : "Upload All Listings"}
					</button>
					<button
						onClick={() => navigate("/my-listings")}
						className='px-6 py-3 bg-gray-700 text-white font-bold rounded-lg hover:bg-gray-600 transition'
					>
						Cancel
					</button>
				</motion.div>
			</div>
		</div>
	);
};

export default BulkUploadPage;
