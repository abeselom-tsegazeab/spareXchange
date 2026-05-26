import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTechnicianRequestStore } from "../store/technicianRequestStore";
import { toast } from "react-hot-toast";
import { Wrench, MapPin, DollarSign, AlertCircle } from "lucide-react";

const SERVICE_TYPES = [
	"repair",
	"installation",
	"maintenance",
	"diagnosis",
	"Engine Repair",
	"other"
];

const PRIORITIES = ["low", "medium", "high", "urgent"];

const CreateTechnicianRequestPage = () => {
	const navigate = useNavigate();
	const { createTechnicianRequest, isLoading } = useTechnicianRequestStore();

	const [formData, setFormData] = useState({
		serviceType: "",
		description: "",
		location: "",
		latitude: "",
		longitude: "",
		contactPhone: "",
		contactEmail: "",
		priority: "medium",
		budgetMin: "",
		budgetMax: "",
		images: []
	});

	const [errors, setErrors] = useState({});

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		// Clear error on change
		if (errors[name]) {
			setErrors(prev => ({ ...prev, [name]: "" }));
		}
	};

	const handleGetLocation = () => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					setFormData(prev => ({
						...prev,
						latitude: position.coords.latitude,
						longitude: position.coords.longitude
					}));
					toast.success("Location captured successfully!");
				},
				() => {
					toast.error("Unable to retrieve your location");
				}
			);
		} else {
			toast.error("Geolocation is not supported by your browser");
		}
	};

	const validateForm = () => {
		const newErrors = {};

		if (!formData.serviceType) {
			newErrors.serviceType = "Service type is required";
		}
		if (!formData.description || formData.description.length < 10) {
			newErrors.description = "Description must be at least 10 characters";
		}
		if (!formData.location) {
			newErrors.location = "Location is required";
		}
		if (formData.budgetMin && formData.budgetMax && Number(formData.budgetMin) >= Number(formData.budgetMax)) {
			newErrors.budgetMax = "Maximum budget must be greater than minimum budget";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error("Please fix the errors in the form");
			return;
		}

		try {
			const requestData = {
				serviceType: formData.serviceType,
				description: formData.description,
				location: formData.location,
				latitude: formData.latitude ? Number(formData.latitude) : undefined,
				longitude: formData.longitude ? Number(formData.longitude) : undefined,
				priority: formData.priority,
				contactInfo: {
					phone: formData.contactPhone || undefined,
					email: formData.contactEmail || undefined
				},
				budgetMin: formData.budgetMin ? Number(formData.budgetMin) : undefined,
				budgetMax: formData.budgetMax ? Number(formData.budgetMax) : undefined,
				images: formData.images
			};

			const response = await createTechnicianRequest(requestData);
			toast.success(response.message);
			navigate(`/technician-requests/${response.request._id}`);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to create request");
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8 px-4'
		>
			<div className='max-w-3xl mx-auto'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3'>
						<Wrench className='text-cyan-600 dark:text-cyan-400' size={40} />
						Request Professional Service
					</h1>
					<p className='text-gray-600 dark:text-gray-400'>
						Describe your issue and get quotes from verified technicians near you
					</p>
				</div>

				{/* Form */}
				<motion.form
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					onSubmit={handleSubmit}
					className='bg-primary dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 space-y-6'
				>
					{/* Service Type */}
					<div>
						<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-2'>
							Service Type <span className='text-red-500'>*</span>
						</label>
						<select
							name='serviceType'
							value={formData.serviceType}
							onChange={handleChange}
							className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.serviceType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500`}
						>
							<option value=''>Select a service type</option>
							{SERVICE_TYPES.map(type => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>
						{errors.serviceType && (
							<p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
								<AlertCircle size={14} /> {errors.serviceType}
							</p>
						)}
					</div>

					{/* Description */}
					<div>
						<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-2'>
							Description <span className='text-red-500'>*</span>
						</label>
						<textarea
							name='description'
							value={formData.description}
							onChange={handleChange}
							rows={5}
							placeholder='Describe the issue in detail...'
							className={`w-full px-4 py-3 bg-white dark:bg-gray-800 border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
						/>
						{errors.description && (
							<p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
								<AlertCircle size={14} /> {errors.description}
							</p>
						)}
					</div>

					{/* Location */}
					<div>
						<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-2'>
							Location <span className='text-red-500'>*</span>
						</label>
						<div className='flex gap-2'>
							<div className='flex-1 relative'>
								<MapPin className='absolute left-3 top-3.5 text-gray-500 dark:text-gray-400' size={20} />
								<input
									type='text'
									name='location'
									value={formData.location}
									onChange={handleChange}
									placeholder='Enter your address or location'
									className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border ${errors.location ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
								/>
							</div>
							<button
								type='button'
								onClick={handleGetLocation}
								className='px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition duration-200'
							>
								Use My Location
							</button>
						</div>
						{errors.location && (
							<p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
								<AlertCircle size={14} /> {errors.location}
							</p>
						)}
						{(formData.latitude && formData.longitude) && (
							<p className='text-green-600 dark:text-green-400 text-sm mt-1'>
								✓ Coordinates: {formData.latitude}, {formData.longitude}
							</p>
						)}
					</div>

					{/* Contact Info */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-2'>Phone Number</label>
							<input
								type='tel'
								name='contactPhone'
								value={formData.contactPhone}
								onChange={handleChange}
								placeholder='+1 (555) 000-0000'
								className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500'
							/>
						</div>
						<div>
							<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-2'>Email</label>
							<input
								type='email'
								name='contactEmail'
								value={formData.contactEmail}
								onChange={handleChange}
								placeholder='your@email.com'
								className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500'
							/>
						</div>
					</div>

					{/* Priority */}
					<div>
						<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-2'>Priority</label>
						<div className='flex gap-3'>
							{PRIORITIES.map(priority => (
								<button
									key={priority}
									type='button'
									onClick={() => setFormData(prev => ({ ...prev, priority }))}
									className={`flex-1 py-3 rounded-lg font-semibold capitalize transition duration-200 ${
										formData.priority === priority
											? priority === 'urgent' ? 'bg-red-600 text-white'
											: priority === 'high' ? 'bg-orange-600 text-white'
											: priority === 'medium' ? 'bg-yellow-600 text-white'
											: 'bg-green-600 text-white'
											: 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
									}`}
								>
									{priority}
								</button>
							))}
						</div>
					</div>

					{/* Budget Range */}
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<div>
							<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-2'>Minimum Budget ($)</label>
							<div className='relative'>
								<DollarSign className='absolute left-3 top-3.5 text-gray-500 dark:text-gray-400' size={20} />
								<input
									type='number'
									name='budgetMin'
									value={formData.budgetMin}
									onChange={handleChange}
									placeholder='200'
									className='w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500'
								/>
							</div>
						</div>
						<div>
							<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-2'>Maximum Budget ($)</label>
							<div className='relative'>
								<DollarSign className='absolute left-3 top-3.5 text-gray-500 dark:text-gray-400' size={20} />
								<input
									type='number'
									name='budgetMax'
									value={formData.budgetMax}
									onChange={handleChange}
									placeholder='600'
									className={`w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border ${errors.budgetMax ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500`}
								/>
							</div>
							{errors.budgetMax && (
								<p className='text-red-500 text-sm mt-1 flex items-center gap-1'>
									<AlertCircle size={14} /> {errors.budgetMax}
								</p>
							)}
						</div>
					</div>

					{/* Submit Button */}
					<button
						type='submit'
						disabled={isLoading}
						className={`w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg shadow-lg hover:from-cyan-600 hover:to-blue-700 transition duration-200 ${
							isLoading ? 'opacity-50 cursor-not-allowed' : ''
						}`}
					>
						{isLoading ? 'Creating Request...' : 'Create Service Request'}
					</button>
				</motion.form>
			</div>
		</motion.div>
	);
};

export default CreateTechnicianRequestPage;
