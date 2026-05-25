import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTechnicianRequestStore } from "../store/technicianRequestStore";
import { toast } from "react-hot-toast";
import { Wrench, Clock, MapPin, DollarSign, ArrowRight, AlertCircle, PlusCircle } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";

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

const MyServiceRequestsPage = () => {
	const { myRequests, getMyRequests, cancelRequest, isLoading } = useTechnicianRequestStore();
	const [cancelModal, setCancelModal] = useState(null);

	useEffect(() => {
		loadRequests();
	}, []);

	const loadRequests = async () => {
		try {
			await getMyRequests();
		} catch (error) {
			toast.error("Failed to load your requests");
		}
	};

	const handleCancel = async (requestId) => {
		try {
			await cancelRequest(requestId);
			toast.success("Request cancelled successfully");
			setCancelModal(null);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to cancel request");
		}
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
				<div className='flex items-center justify-between mb-8'>
					<div>
						<h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3'>
							<Wrench className='text-cyan-600 dark:text-cyan-400' size={40} />
							My Service Requests
						</h1>
						<p className='text-gray-600 dark:text-gray-400'>Manage and track all your service requests</p>
					</div>
					<Link
						to='/technician-requests/create'
						className='px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition duration-200 flex items-center gap-2'
					>
						<PlusCircle size={20} />
						New Request
					</Link>
				</div>

				{/* Requests List */}
				{isLoading ? (
					<LoadingSpinner size="md" fullScreen={false} text="Loading your requests..." />
				) : myRequests.length === 0 ? (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className='bg-primary dark:bg-gray-800 rounded-xl p-12 border border-gray-200 dark:border-gray-700 text-center'
					>
						<Wrench size={64} className='mx-auto text-gray-400 dark:text-gray-600 mb-4' />
						<h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>No Service Requests Yet</h3>
						<p className='text-gray-600 dark:text-gray-400 mb-6'>Create your first service request and get quotes from verified technicians</p>
						<Link
							to='/technician-requests/create'
							className='inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition duration-200'
						>
							<PlusCircle size={20} />
							Create Your First Request
						</Link>
					</motion.div>
				) : (
					<div className='space-y-4'>
						{myRequests.map((request, index) => (
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
										<span className='text-gray-600 dark:text-gray-400 mb-3 line-clamp-2'>{request.description}</span>
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
												<AlertCircle size={14} />
												{request.priority} priority
											</span>
											{request.quotes && request.quotes.length > 0 && (
												<span className='text-blue-600 dark:text-blue-400 font-semibold'>
													{request.quotes.length} quote{request.quotes.length > 1 ? 's' : ''}
												</span>
											)}
										</div>
										{request.budgetMin && request.budgetMax && (
											<p className='text-green-600 dark:text-green-400 text-sm mt-2 flex items-center gap-1'>
												<DollarSign size={14} />
												Budget: ${request.budgetMin} - ${request.budgetMax}
											</p>
										)}
									</div>
									<div className='flex items-center gap-2 ml-4'>
										{request.status !== 'completed' && request.status !== 'cancelled' && (
											<button
												onClick={() => setCancelModal(request)}
												className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition duration-200'
											>
												Cancel
											</button>
										)}
										<Link
											to={`/technician-requests/${request._id}`}
											className='px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg transition duration-200 flex items-center gap-1'
										>
											View Details
											<ArrowRight size={14} />
										</Link>
									</div>
								</div>
							</motion.div>
						))}
					</div>
				)}

				{/* Cancel Confirmation Modal */}
				{cancelModal && (
					<div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'>
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className='bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700'
						>
							<h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>Cancel Request?</h3>
							<p className='text-gray-600 dark:text-gray-400 mb-6'>
								Are you sure you want to cancel this service request? This action cannot be undone.
							</p>
							<div className='flex gap-3'>
								<button
									onClick={() => setCancelModal(null)}
									className='flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition duration-200'
								>
									No, Keep It
								</button>
								<button
									onClick={() => handleCancel(cancelModal._id)}
									disabled={isLoading}
									className='flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50'
								>
									{isLoading ? 'Cancelling...' : 'Yes, Cancel'}
								</button>
							</div>
						</motion.div>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default MyServiceRequestsPage;
