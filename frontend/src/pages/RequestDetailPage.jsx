import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTechnicianRequestStore } from "../store/technicianRequestStore";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import {
	MapPin, Clock, DollarSign, User, Phone, Mail,
	ArrowLeft, CheckCircle, MessageSquare, Shield
} from "lucide-react";

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

const RequestDetailPage = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const {
		currentRequest,
		getTechnicianRequest,
		submitQuote,
		acceptQuote,
		generateHandshakeToken,
		completeHandshake,
		isLoading
	} = useTechnicianRequestStore();

	const [quoteForm, setQuoteForm] = useState({ estimatedCost: "", additionalNotes: "" });
	const [completionToken, setCompletionToken] = useState("");
	const [showQuoteForm, setShowQuoteForm] = useState(false);
	const [showTokenModal, setShowTokenModal] = useState(false);
	const [generatedToken, setGeneratedToken] = useState("");

	useEffect(() => {
		loadRequest();
	}, [id]);

	const loadRequest = async () => {
		try {
			await getTechnicianRequest(id);
		} catch (error) {
			toast.error("Failed to load request details");
		}
	};

	const handleSubmitQuote = async (e) => {
		e.preventDefault();
		try {
			await submitQuote(id, quoteForm);
			toast.success("Quote submitted successfully!");
			setShowQuoteForm(false);
			setQuoteForm({ estimatedCost: "", additionalNotes: "" });
			loadRequest();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to submit quote");
		}
	};

	const handleAcceptQuote = async (techId) => {
		try {
			await acceptQuote(id, techId);
			toast.success("Technician hired successfully!");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to accept quote");
		}
	};

	const handleGenerateToken = async () => {
		try {
			const response = await generateHandshakeToken(id);
			setGeneratedToken(response.token);
			setShowTokenModal(true);
			toast.success("Handshake token generated!");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to generate token");
		}
	};

	const handleCompleteRequest = async (e) => {
		e.preventDefault();
		try {
			await completeHandshake(id, completionToken);
			toast.success("Request completed successfully! Handshake verified.");
			setCompletionToken("");
		} catch (error) {
			toast.error(error.response?.data?.message || "Invalid verification token");
		}
	};

	const formatDate = (dateString) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	if (!currentRequest) {
		return (
			<div className='min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white flex items-center justify-center'>
				<div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500'></div>
			</div>
		);
	}

	const isOwner = currentRequest.userId?._id === user?._id;
	const isAssignedTechnician = currentRequest.assignedTechnician?._id === user?._id;
	const isTechnician = user?.userType === "technician" && user?.roleStatus === "verified";

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className='min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8 px-4'
		>
			<div className='max-w-5xl mx-auto'>
				{/* Back Button */}
				<button
					onClick={() => navigate(-1)}
					className='mb-6 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition duration-200'
				>
					<ArrowLeft size={20} />
					Back
				</button>

				{/* Header */}
				<div className='bg-primary dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 mb-6'>
					<div className='flex items-start justify-between mb-4'>
						<div>
							<div className='flex items-center gap-3 mb-2'>
								<h1 className='text-4xl font-bold text-gray-900 dark:text-white capitalize'>{currentRequest.serviceType}</h1>
								<span className={`px-4 py-2 ${STATUS_COLORS[currentRequest.status]} text-white text-sm rounded-full capitalize`}>
									{currentRequest.status}
								</span>
							</div>
							<p className='text-gray-600 dark:text-gray-400 text-lg'>{currentRequest.description}</p>
						</div>
					</div>

					<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mt-6'>
						<div className='flex items-center gap-2 text-gray-700 dark:text-gray-300'>
							<MapPin size={18} className='text-cyan-600 dark:text-cyan-400' />
							<span>{currentRequest.location}</span>
						</div>
						<div className='flex items-center gap-2 text-gray-700 dark:text-gray-300'>
							<Clock size={18} className='text-cyan-600 dark:text-cyan-400' />
							<span className='capitalize'>{currentRequest.priority} priority</span>
						</div>
						{currentRequest.budgetMin && currentRequest.budgetMax && (
							<div className='flex items-center gap-2 text-green-600 dark:text-green-400'>
								<DollarSign size={18} />
								<span>${currentRequest.budgetMin} - ${currentRequest.budgetMax}</span>
							</div>
						)}
						<div className='flex items-center gap-2 text-gray-700 dark:text-gray-300'>
							<Clock size={18} className='text-cyan-600 dark:text-cyan-400' />
							<span>{formatDate(currentRequest.createdAt)}</span>
						</div>
					</div>

					{currentRequest.contactInfo && (currentRequest.contactInfo.phone || currentRequest.contactInfo.email) && (
						<div className='mt-6 pt-6 border-t border-gray-200 dark:border-gray-700'>
							<h3 className='text-gray-900 dark:text-white font-semibold mb-3'>Contact Information</h3>
							<div className='flex gap-4'>
								{currentRequest.contactInfo.phone && (
									<div className='flex items-center gap-2 text-gray-700 dark:text-gray-300'>
										<Phone size={18} className='text-cyan-600 dark:text-cyan-400' />
										<span>{currentRequest.contactInfo.phone}</span>
									</div>
								)}
								{currentRequest.contactInfo.email && (
									<div className='flex items-center gap-2 text-gray-700 dark:text-gray-300'>
										<Mail size={18} className='text-cyan-600 dark:text-cyan-400' />
										<span>{currentRequest.contactInfo.email}</span>
									</div>
								)}
							</div>
						</div>
					)}
				</div>

				{/* Assigned Technician Info */}
				{currentRequest.assignedTechnician && (
					<div className='bg-primary dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 mb-6'>
						<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
							<User className='text-cyan-600 dark:text-cyan-400' size={24} />
							Assigned Technician
						</h2>
						<div className='flex items-center gap-4'>
							{currentRequest.assignedTechnician.profilePicture ? (
								<img
									src={currentRequest.assignedTechnician.profilePicture}
									alt={currentRequest.assignedTechnician.name}
									className='w-16 h-16 rounded-full object-cover border-2 border-cyan-600 dark:border-cyan-400'
								/>
							) : (
								<div className='w-16 h-16 rounded-full bg-cyan-600 flex items-center justify-center text-white text-2xl font-bold'>
									{currentRequest.assignedTechnician.name?.charAt(0)}
								</div>
							)}
							<div className='flex-1'>
								<h3 className='text-xl font-semibold text-gray-900 dark:text-white'>{currentRequest.assignedTechnician.name}</h3>
								<p className='text-gray-600 dark:text-gray-400'>{currentRequest.assignedTechnician.expertise}</p>
								<div className='flex items-center gap-4 mt-2'>
									<span className='text-blue-600 dark:text-blue-400'>Trust Score: {currentRequest.assignedTechnician.trustScore}%</span>
									{currentRequest.assignedTechnician.phone && (
										<span className='text-gray-700 dark:text-gray-300 flex items-center gap-1'>
											<Phone size={14} /> {currentRequest.assignedTechnician.phone}
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Quotes Section */}
				{currentRequest.quotes && currentRequest.quotes.length > 0 && (
					<div className='bg-primary dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 mb-6'>
						<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2'>
							<MessageSquare className='text-cyan-600 dark:text-cyan-400' size={24} />
							Quotes ({currentRequest.quotes.length})
						</h2>
						<div className='space-y-4'>
							{currentRequest.quotes.map((quote, index) => (
								<div key={quote._id || index} className='bg-gray-100 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600'>
									<div className='flex items-start justify-between'>
										<div className='flex-1'>
											<div className='flex items-center gap-3 mb-2'>
												{quote.technicianId?.profilePicture ? (
													<img
														src={quote.technicianId.profilePicture}
														alt={quote.technicianId.name}
														className='w-12 h-12 rounded-full object-cover border-2 border-cyan-600 dark:border-cyan-400'
													/>
												) : (
													<div className='w-12 h-12 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xl font-bold'>
														{quote.technicianId?.name?.charAt(0)}
													</div>
												)}
												<div>
													<h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{quote.technicianId?.name || 'Unknown Technician'}</h3>
													<p className='text-gray-600 dark:text-gray-400 text-sm'>{quote.technicianId?.expertise}</p>
												</div>
											</div>
											<div className='mt-3'>
												<p className='text-3xl font-bold text-green-600 dark:text-green-400 mb-2'>
													<DollarSign size={28} className='inline' />{quote.estimatedCost}
												</p>
												{quote.additionalNotes && (
													<p className='text-gray-700 dark:text-gray-300'>{quote.additionalNotes}</p>
												)}
												<p className='text-gray-500 dark:text-gray-500 text-sm mt-2'>
													Submitted {formatDate(quote.createdAt)}
												</p>
											</div>
										</div>
										{isOwner && currentRequest.status === 'quoted' && (
											<button
												onClick={() => handleAcceptQuote(quote.technicianId?._id)}
												className='ml-4 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200 flex items-center gap-2'
											>
												<CheckCircle size={18} />
												Hire
											</button>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Submit Quote Form (For Technicians) */}
				{isTechnician && !isOwner && (currentRequest.status === 'pending' || currentRequest.status === 'quoted') && (
					<div className='bg-primary dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 mb-6'>
						<button
							onClick={() => setShowQuoteForm(!showQuoteForm)}
							className='w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition duration-200'
						>
							{showQuoteForm ? 'Cancel' : 'Submit a Quote'}
						</button>

						{showQuoteForm && (
							<form onSubmit={handleSubmitQuote} className='mt-6 space-y-4'>
								<div>
									<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-2'>Estimated Cost ($)</label>
									<input
										type='number'
										value={quoteForm.estimatedCost}
										onChange={(e) => setQuoteForm(prev => ({ ...prev, estimatedCost: e.target.value }))}
										required
										className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500'
									/>
								</div>
								<div>
									<label className='block text-gray-700 dark:text-gray-300 font-semibold mb-2'>Additional Notes</label>
									<textarea
										value={quoteForm.additionalNotes}
										onChange={(e) => setQuoteForm(prev => ({ ...prev, additionalNotes: e.target.value }))}
										rows={4}
										placeholder='Describe your approach, timeline, etc.'
										className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500'
									/>
								</div>
								<button
									type='submit'
									disabled={isLoading}
									className='w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200 disabled:opacity-50'
								>
									{isLoading ? 'Submitting...' : 'Submit Quote'}
								</button>
							</form>
						)}
					</div>
				)}

				{/* Handshake Completion Section */}
				{isAssignedTechnician && (currentRequest.status === 'accepted' || currentRequest.status === 'started') && (
					<div className='bg-primary dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 mb-6'>
						<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
							<Shield className='text-cyan-600 dark:text-cyan-400' size={24} />
							Complete the Job
						</h2>
						<p className='text-gray-600 dark:text-gray-400 mb-4'>
							When you're finished with the work, generate a 6-digit verification token and share it with the customer.
						</p>
						<button
							onClick={handleGenerateToken}
							disabled={isLoading}
							className='px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg hover:from-orange-600 hover:to-red-700 transition duration-200 disabled:opacity-50'
						>
							{isLoading ? 'Generating...' : 'Generate Verification Token'}
						</button>
					</div>
				)}

				{isOwner && currentRequest.status === 'started' && (
					<div className='bg-primary dark:bg-gray-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700 mb-6'>
						<h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2'>
							<Shield className='text-cyan-600 dark:text-cyan-400' size={24} />
							Verify Completion
						</h2>
						<p className='text-gray-600 dark:text-gray-400 mb-4'>
							Enter the 6-digit token provided by the technician to verify and complete the service.
						</p>
						<form onSubmit={handleCompleteRequest} className='space-y-4'>
							<input
								type='text'
								value={completionToken}
								onChange={(e) => setCompletionToken(e.target.value)}
								placeholder='Enter 6-digit token'
								maxLength={6}
								pattern='\d{6}'
								required
								className='w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-center text-2xl font-mono tracking-widest'
							/>
							<button
								type='submit'
								disabled={isLoading || completionToken.length !== 6}
								className='w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-200 disabled:opacity-50'
							>
								{isLoading ? 'Verifying...' : 'Verify & Complete'}
							</button>
						</form>
					</div>
				)}

				{/* Generated Token Display Modal */}
				{showTokenModal && generatedToken && (
					<div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4'>
						<motion.div
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							className='bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full border border-gray-200 dark:border-gray-700 text-center'
						>
							<Shield size={48} className='mx-auto text-cyan-600 dark:text-cyan-400 mb-4' />
							<h3 className='text-2xl font-bold text-gray-900 dark:text-white mb-2'>Your Verification Token</h3>
							<p className='text-gray-600 dark:text-gray-400 mb-4'>Share this 6-digit code with the customer to complete the service</p>
							<div className='bg-gray-100 dark:bg-gray-900 rounded-lg p-6 mb-6'>
								<p className='text-5xl font-bold text-cyan-600 dark:text-cyan-400 font-mono tracking-widest'>{generatedToken}</p>
							</div>
							<button
								onClick={() => setShowTokenModal(false)}
								className='w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-lg hover:from-cyan-600 hover:to-blue-700 transition duration-200'
							>
								Close
							</button>
						</motion.div>
					</div>
				)}
			</div>
		</motion.div>
	);
};

export default RequestDetailPage;
