import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useReviewStore } from "../store/reviewStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
	Star,
	ArrowLeft,
	User,
	Calendar,
	CheckCircle
} from "lucide-react";

const ReviewPage = () => {
	const { userId } = useParams();
	const navigate = useNavigate();
	const { reviews, loading, getUserReviews, createReview, getReviewableExchanges, reviewableExchanges } = useReviewStore();
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");
	const [hoveredRating, setHoveredRating] = useState(0);
	const [exchangeId, setExchangeId] = useState("");
	const [selectedExchange, setSelectedExchange] = useState(null);
	const [isFetchingExchanges, setIsFetchingExchanges] = useState(false);

	useEffect(() => {
		fetchReviews();
	}, [userId]);

	const fetchReviews = async () => {
		try {
			await getUserReviews(userId);
		} catch (error) {
			toast.error("Failed to load reviews");
		}
	};

	const handleOpenReviewForm = async () => {
		setShowReviewForm(true);
		setIsFetchingExchanges(true);
		try {
			// Fetch completed exchanges with this user
			await getReviewableExchanges(userId);
		} catch (error) {
			console.error("Error fetching exchanges:", error);
			toast.error("Failed to load exchange history");
		} finally {
			setIsFetchingExchanges(false);
		}
	};

	const handleSubmitReview = async (e) => {
		e.preventDefault();
		
		if (rating === 0) {
			toast.error("Please select a rating");
			return;
		}

		if (!exchangeId) {
			toast.error("Please select an exchange");
			return;
		}

		try {
			await createReview(userId, exchangeId, rating, comment);
			toast.success("Review submitted successfully!");
			setShowReviewForm(false);
			setRating(0);
			setComment("");
			setExchangeId("");
			setSelectedExchange(null);
			fetchReviews();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to submit review");
		}
	};

	const calculateAverageRating = () => {
		if (reviews.length === 0) return 0;
		const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
		return (sum / reviews.length).toFixed(1);
	};

	const renderStars = (rating, interactive = false, onRate = null) => {
		return (
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						className={`w-5 h-5 ${
							star <= (interactive ? hoveredRating || rating : rating)
								? "fill-yellow-400 text-yellow-400"
								: "text-gray-300 dark:text-gray-600"
						} ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
						onClick={() => interactive && onRate && onRate(star)}
						onMouseEnter={() => interactive && setHoveredRating(star)}
						onMouseLeave={() => interactive && setHoveredRating(0)}
					/>
				))}
			</div>
		);
	};

	if (loading && reviews.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<div className="min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8 px-4">
			<div className="max-w-4xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-4">
							<button
								onClick={() => navigate(-1)}
								className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
							>
								<ArrowLeft className="w-6 h-6" />
							</button>
							<h1 className="text-3xl font-bold">Reviews & Ratings</h1>
						</div>
						<button
							onClick={() => showReviewForm ? setShowReviewForm(false) : handleOpenReviewForm()}
							className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
						>
							{showReviewForm ? "Cancel" : "Write a Review"}
						</button>
					</div>

					{/* Rating Summary */}
					<div className="bg-primary dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700">
						<div className="flex items-center gap-6">
							<div className="text-center">
								<div className="text-5xl font-bold text-green-500">
									{calculateAverageRating()}
								</div>
								<div className="mt-2">
									{renderStars(parseFloat(calculateAverageRating()))}
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
									{reviews.length} review{reviews.length !== 1 ? "s" : ""}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Review Form */}
				{showReviewForm && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="mb-6 bg-primary dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
					>
						<h2 className="text-xl font-semibold mb-4">Write a Review</h2>
						<form onSubmit={handleSubmitReview} className="space-y-4">
							<div>
								<label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Select Exchange *</label>
								{isFetchingExchanges ? (
									<div className="flex items-center gap-2 p-3 border border-gray-300 dark:border-gray-700 rounded-lg">
										<LoadingSpinner size="sm" />
										<span className="text-sm text-gray-500">Loading exchanges...</span>
									</div>
								) : reviewableExchanges.length > 0 ? (
									<select
										value={selectedExchange || ''}
										onChange={(e) => {
											setSelectedExchange(e.target.value);
											setExchangeId(e.target.value);
										}}
										className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
										required
									>
										<option value="">Select a completed exchange...</option>
										{reviewableExchanges.map((ex) => (
											<option key={ex.exchangeId} value={ex.exchangeId}>
												{ex.exchangeType} {ex.revieweeName} - {ex.listingTitle}
											</option>
										))}
									</select>
								) : (
									<div className="p-4 border border-yellow-300 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
										<div className="flex items-start gap-2">
											<CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
											<div>
												<p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
													No completed exchanges found
												</p>
												<p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
													You need to complete an exchange with this user before leaving a review.
												</p>
											</div>
										</div>
									</div>
								)}
								{reviewableExchanges.length > 0 && (
									<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
										Select from your completed exchanges with this user.
									</p>
								)}
							</div>

							<div>
								<label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Rating *</label>
								<div className="flex items-center gap-2">
									{renderStars(rating, true, setRating)}
									<span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
										{rating > 0 ? `${rating} star${rating > 1 ? "s" : ""}` : "Select rating"}
									</span>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Comment</label>
								<textarea
									value={comment}
									onChange={(e) => setComment(e.target.value)}
									placeholder="Share your experience with this user..."
									rows="4"
									className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
								/>
								<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
									Optional: Tell others about your experience with this exchange.
								</p>
							</div>

							<button
								type="submit"
								disabled={loading || rating === 0 || !exchangeId}
								className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold"
							>
								{loading ? "Submitting..." : "Submit Review"}
							</button>
						</form>
					</motion.div>
				)}

				{/* Reviews List */}
				<div className="space-y-4">
					{reviews.length === 0 ? (
						<div className="bg-primary dark:bg-gray-800 rounded-lg shadow-lg p-16 text-center border border-gray-200 dark:border-gray-700">
							<User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
							<h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
								No reviews yet
							</h3>
							<p className="text-gray-500 dark:text-gray-400">
								Be the first to leave a review!
							</p>
						</div>
					) : (
						reviews.map((review, index) => (
							<motion.div
								key={review._id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.05 }}
								className="bg-primary dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700"
							>
								<div className="flex items-start gap-4">
									{review.reviewerId?.profilePicture ? (
										<img
											src={review.reviewerId.profilePicture}
											alt={review.reviewerId.name}
											className="w-12 h-12 rounded-full object-cover"
										/>
									) : (
										<div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
											{review.reviewerId?.name?.charAt(0).toUpperCase() || "U"}
										</div>
									)}

									<div className="flex-1">
										<div className="flex items-center justify-between mb-2">
											<h3 className="font-semibold text-lg">
												{review.reviewerId?.name || "Anonymous"}
											</h3>
											<div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
												<Calendar className="w-4 h-4" />
												<span>{new Date(review.createdAt).toLocaleDateString()}</span>
											</div>
										</div>

										<div className="mb-2">
											{renderStars(review.rating)}
										</div>

										{review.comment && (
											<p className="text-gray-700 dark:text-gray-300 mt-2">
												{review.comment}
											</p>
										)}
									</div>
								</div>
							</motion.div>
						))
					)}
				</div>
			</motion.div>
		</div>
	</div>
	);
};

export default ReviewPage;
