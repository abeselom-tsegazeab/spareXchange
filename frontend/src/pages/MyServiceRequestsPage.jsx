import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTechnicianRequestStore } from "../store/technicianRequestStore";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import { Wrench, Clock, MapPin, Wallet, ArrowRight, AlertCircle, PlusCircle, ShieldAlert } from "lucide-react";
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
	const { myRequests, getMyRequests, cancelRequest, updateRequestStatus, isLoading } = useTechnicianRequestStore();
	const { user } = useAuthStore();
	const [cancelModal, setCancelModal] = useState(null);
	const [statusModal, setStatusModal] = useState(null);
	const [selectedStatus, setSelectedStatus] = useState('');

	useEffect(() => {
		// Check if user is verified
		if (user && !user.isVerified) {
			toast.error("⚠️ Account verification required. Please verify your account to make service requests.");
		}
		loadRequests();
	}, [user]);

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

	const handleStatusUpdate = async (requestId) => {
		if (!selectedStatus) {
			toast.error("Please select a status");
			return;
		}

		try {
			await updateRequestStatus(requestId, selectedStatus);
			toast.success(`Status updated to ${selectedStatus.replace('-', ' ')}`);
			setStatusModal(null);
			setSelectedStatus('');
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update status");
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
									Your account is currently unverified. You cannot make service requests until an admin verifies your account.
								</p>
								<p className='text-red-600 dark:text-red-500 text-sm'>
									• Service requests will not be processed<br/>
									• Technicians cannot see your requests<br/>
									• Please contact admin or complete verification process
								</p>
							</div>
						</div>
					</motion.div>
				)}

				{/* Header */}
				<div className='flex items-center justify-between mb-8'>
					<div>
						<h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3'>
							<Wrench className='text-cyan-600 dark:text-cyan-400' size={40} />
							My Service Requests
						</h1>
						<p className='text-gray-600 dark:text-gray-400'>Manage and track all your service requests</p>
					</div>
					{user && user.isVerified ? (
						<Link
							to='/technician-requests/create'
							className='px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition duration-200 flex items-center gap-2'
						>
							<PlusCircle size={20} />
							New Request
						</Link>
					) : (
						<button
							disabled
							className='px-6 py-3 bg-gray-400 dark:bg-gray-600 text-white font-semibold rounded-lg cursor-not-allowed flex items-center gap-2 opacity-60'
							title='Verification required to create requests'
						>
							<PlusCircle size={20} />
							New Request (Verification Required)
						</button>
					)}
				</div>

				{/* Requests List */}
				{isLoading ? (
					<LoadingSpinner size="md" fullScreen={false} text="Loading your requests..." />
				) : myRequests.length === 0 ? (
					user && !user.isVerified ? (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className='bg-primary dark:bg-gray-800 rounded-xl p-12 border-2 border-red-300 dark:border-red-700 text-center'
						>
							<ShieldAlert size={64} className='mx-auto text-red-400 dark:text-red-600 mb-4' />
							<h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>
								⚠️ Verification Required to Make Requests
							</h3>
							<p className='text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto'>
								Your account needs to be verified by an admin before you can create service requests. 
								Unverified users cannot make requests or interact with technicians.
							</p>
							<div className='bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6 max-w-xl mx-auto'>
								<p className='text-red-700 dark:text-red-400 text-sm font-medium'>
									<strong>What you can do:</strong><br/>
									• Browse available services and technicians<br/>
									• Complete your profile information<br/>
									• Contact admin for verification assistance
								</p>
							</div>
							<p className='text-gray-500 dark:text-gray-500 text-sm'>
								Once verified, you'll be able to create requests and get quotes from technicians.
							</p>
						</motion.div>
					) : (
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
					)
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
												<Wallet size={14} />
												Budget: ETB {request.budgetMin} - ETB {request.budgetMax}
											</p>
										)}
									</div>
									<div className='flex items-center gap-2 ml-4'>
										{request.status !== 'completed' && request.status !== 'cancelled' && (
											<>
												<button
													onClick={() => {
														setStatusModal(request);
														setSelectedStatus(request.status);
													}}
													className='px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition duration-200'
												>
													Update Status
												</button>
												<button
													onClick={() => setCancelModal(request)}
													className='px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition duration-200'
												>
													Cancel
												</button>
											</>
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

				{/* Status Update Modal */}
				{statusModal && (
					<div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'>
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className='bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700'
						>
							<h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>Update Request Status</h3>
							<p className='text-gray-600 dark:text-gray-400 mb-4'>
								Current status: <span className='font-semibold capitalize'>{statusModal.status}</span>
							</p>
							
							<div className='mb-6'>
								<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-2'>
									New Status
								</label>
								<select
									value={selectedStatus}
									onChange={(e) => setSelectedStatus(e.target.value)}
									className='w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
								>
									<option value='pending'>Pending</option>
									<option value='quoted'>Quoted</option>
									<option value='accepted'>Accepted</option>
									<option value='in-progress'>In Progress</option>
									<option value='arrived'>Arrived</option>
									<option value='started'>Started</option>
									<option value='completed'>Completed</option>
									<option value='cancelled'>Cancelled</option>
								</select>
							</div>

							<div className='flex gap-3'>
								<button
									onClick={() => {
										setStatusModal(null);
										setSelectedStatus('');
									}}
									className='flex-1 py-3 px-4 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition duration-200'
								>
									Cancel
								</button>
								<button
									onClick={() => handleStatusUpdate(statusModal._id)}
									disabled={isLoading}
									className='flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50'
								>
									{isLoading ? 'Updating...' : 'Update Status'}
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
