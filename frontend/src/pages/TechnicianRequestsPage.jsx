import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTechnicianRequestStore } from "../store/technicianRequestStore";
import { toast } from "react-hot-toast";
import { Wrench, MapPin, Clock, DollarSign, ArrowRight, Search, Filter } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

const SERVICE_TYPES = [
	"repair",
	"installation",
	"maintenance",
	"diagnosis",
	"Engine Repair",
	"other"
];

const PRIORITIES = ["low", "medium", "high", "urgent"];

const STATUS_COLORS = {
	pending: "bg-yellow-600",
	quoted: "bg-blue-600",
	accepted: "bg-purple-600",
	"in-progress": "bg-indigo-600",
	arrived: "bg-teal-600",
	started: "bg-orange-600",
	completed: "bg-green-600",
	cancelled: "bg-red-600"
};

const PRIORITY_COLORS = {
	low: "text-green-600 dark:text-green-400",
	medium: "text-yellow-600 dark:text-yellow-400",
	high: "text-orange-600 dark:text-orange-400",
	urgent: "text-red-600 dark:text-red-400"
};

const TechnicianRequestsPage = () => {
	const { technicianRequests, getAllTechnicianRequests, isLoading } = useTechnicianRequestStore();
	const [filters, setFilters] = useState({
		serviceType: "",
		priority: "",
		status: ""
	});
	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		loadRequests();
	}, []);

	const loadRequests = async () => {
		try {
			await getAllTechnicianRequests(filters);
		} catch (error) {
			toast.error("Failed to load service requests");
		}
	};

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value }));
	};

	const handleApplyFilters = () => {
		loadRequests();
		setShowFilters(false);
	};

	const handleClearFilters = () => {
		setFilters({ serviceType: "", priority: "", status: "" });
		loadRequests();
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className='min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8 px-4'
		>
			<div className='max-w-6xl mx-auto'>
				{/* Header */}
				<div className='mb-8'>
					<h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3'>
						<Wrench className='text-cyan-600 dark:text-cyan-400' size={40} />
						Available Service Requests
					</h1>
					<p className='text-gray-600 dark:text-gray-400'>Find service requests near you and submit quotes</p>
				</div>

				{/* Search and Filters */}
				<div className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-6'>
					<div className='flex items-center justify-between mb-4'>
						<div className='flex-1 max-w-md'>
							<div className='relative'>
								<Search className='absolute left-3 top-3.5 text-gray-500 dark:text-gray-400' size={20} />
								<input
									type='text'
									placeholder='Search by location or description...'
									className='w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500'
								/>
							</div>
						</div>
						<button
							onClick={() => setShowFilters(!showFilters)}
							className='flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition duration-200'
						>
							<Filter size={20} />
							Filters
						</button>
					</div>

					{showFilters && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className='border-t border-gray-200 dark:border-gray-700 pt-4 mt-4'
						>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-4'>
								<div>
									<label className='block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2'>Service Type</label>
									<select
										name='serviceType'
										value={filters.serviceType}
										onChange={handleFilterChange}
										className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500'
									>
										<option value=''>All Types</option>
										{SERVICE_TYPES.map(type => (
											<option key={type} value={type}>{type}</option>
										))}
									</select>
								</div>
								<div>
									<label className='block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2'>Priority</label>
									<select
										name='priority'
										value={filters.priority}
										onChange={handleFilterChange}
										className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500'
									>
										<option value=''>All Priorities</option>
										{PRIORITIES.map(priority => (
											<option key={priority} value={priority}>{priority}</option>
										))}
									</select>
								</div>
								<div>
									<label className='block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2'>Status</label>
									<select
										name='status'
										value={filters.status}
										onChange={handleFilterChange}
										className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500'
									>
										<option value=''>All Statuses</option>
										<option value='pending'>Pending</option>
										<option value='quoted'>Quoted</option>
									</select>
								</div>
							</div>
							<div className='flex gap-3'>
								<button
									onClick={handleApplyFilters}
									className='px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition duration-200'
								>
									Apply Filters
								</button>
								<button
									onClick={handleClearFilters}
									className='px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition duration-200'
								>
									Clear Filters
								</button>
							</div>
						</motion.div>
					)}
				</div>

				{/* Results Count */}
				<div className='mb-4'>
					<p className='text-gray-600 dark:text-gray-400'>
						Showing <span className='text-cyan-600 dark:text-cyan-400 font-semibold'>{technicianRequests.length}</span> request{technicianRequests.length !== 1 ? 's' : ''}
					</p>
				</div>

				{/* Requests List */}
				{isLoading ? (
					<LoadingSpinner size="md" fullScreen={false} text="Loading service requests..." />
				) : technicianRequests.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className='bg-primary dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center'
					>
						<Wrench size={64} className='mx-auto text-gray-400 dark:text-gray-600 mb-4' />
						<h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>No Service Requests Available</h3>
						<p className='text-gray-600 dark:text-gray-400'>Check back later or adjust your filters</p>
					</motion.div>
				) : (
					<div className='space-y-4'>
						{technicianRequests.map((request, index) => (
							<motion.div
								key={request._id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-cyan-600 transition duration-200'
							>
								<div className='flex items-start justify-between mb-4'>
									<div className='flex-1'>
										<div className='flex items-center gap-3 mb-2'>
											<h3 className='text-xl font-bold text-gray-900 dark:text-white capitalize'>{request.serviceType}</h3>
											<span className={`px-3 py-1 ${STATUS_COLORS[request.status]} text-white text-xs rounded-full capitalize`}>
												{request.status}
											</span>
										</div>
										<p className='text-gray-600 dark:text-gray-400 mb-3 line-clamp-2'>{request.description}</p>
										<div className='flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400'>
											<span className='flex items-center gap-1'>
												<MapPin size={14} />
												{request.location}
											</span>
											<span className='flex items-center gap-1'>
												<Clock size={14} />
												{formatDate(request.createdAt)}
											</span>
											<span className={`flex items-center gap-1 ${PRIORITY_COLORS[request.priority]}`}>
												{request.priority} priority
											</span>
										</div>
										{request.budgetMin && request.budgetMax && (
											<p className='text-green-600 dark:text-green-400 text-sm mt-2 flex items-center gap-1'>
												<DollarSign size={14} />
												Budget: ${request.budgetMin} - ${request.budgetMax}
											</p>
										)}
										{request.userId && (
											<p className='text-gray-600 dark:text-gray-400 text-sm mt-2'>
												Posted by: {request.userId.name || 'User'}
											</p>
										)}
									</div>
									<div className='ml-4'>
										{(request.status === 'pending' || request.status === 'quoted') && (
											<Link
												to={`/technician-requests/${request._id}`}
												className='px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg transition duration-200 flex items-center gap-2'
											>
												View & Quote
												<ArrowRight size={16} />
											</Link>
										)}
									</div>
								</div>
							</motion.div>
						))}
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default TechnicianRequestsPage;
