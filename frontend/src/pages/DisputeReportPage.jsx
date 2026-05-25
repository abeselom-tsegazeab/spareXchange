import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import {
	ArrowLeft,
	AlertTriangle,
	FileText,
	User
} from "lucide-react";

const API_URL = import.meta.env.MODE === "development" 
	? "http://localhost:5000/api/disputes" 
	: "/api/disputes";

const DisputeReportPage = () => {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		targetId: "",
		exchangeId: "",
		reason: "",
		description: ""
	});

	const reasonOptions = [
		{ value: "not_as_described", label: "Item not as described", icon: "📦" },
		{ value: "no_show", label: "User didn't show up", icon: "❌" },
		{ value: "harassment", label: "Harassment or inappropriate behavior", icon: "⚠️" },
		{ value: "scam", label: "Suspected scam or fraud", icon: "🚨" },
		{ value: "other", label: "Other", icon: "📝" }
	];

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (!formData.targetId || !formData.reason || !formData.description) {
			toast.error("Please fill in all required fields");
			return;
		}

		setLoading(true);
		try {
			await axios.post(API_URL, formData);
			toast.success("Dispute reported successfully. Our team will review it shortly.");
			navigate("/my-exchanges");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to submit dispute");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-3xl mx-auto px-4 py-8">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center gap-4 mb-4">
						<button
							onClick={() => navigate(-1)}
							className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						>
							<ArrowLeft className="w-6 h-6" />
						</button>
						<div>
							<h1 className="text-3xl font-bold flex items-center gap-2">
								<AlertTriangle className="w-8 h-8 text-red-500" />
								Report a Dispute
							</h1>
							<p className="text-gray-600 dark:text-gray-400 mt-1">
								Help us maintain a safe community by reporting issues
							</p>
						</div>
					</div>
				</div>

				{/* Form */}
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Target User ID */}
						<div>
							<label className="block text-sm font-medium mb-2">
								User ID to Report *
							</label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									type="text"
									name="targetId"
									value={formData.targetId}
									onChange={handleChange}
									placeholder="Enter the user ID"
									className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
									required
								/>
							</div>
						</div>

						{/* Exchange ID (Optional) */}
						<div>
							<label className="block text-sm font-medium mb-2">
								Exchange ID (if applicable)
							</label>
							<input
								type="text"
								name="exchangeId"
								value={formData.exchangeId}
								onChange={handleChange}
								placeholder="Enter exchange ID related to this dispute"
								className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
							/>
						</div>

						{/* Reason */}
						<div>
							<label className="block text-sm font-medium mb-2">
								Reason for Report *
							</label>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{reasonOptions.map((option) => (
									<button
										key={option.value}
										type="button"
										onClick={() => setFormData({ ...formData, reason: option.value })}
										className={`p-4 border-2 rounded-lg transition-all text-left ${
											formData.reason === option.value
												? "border-red-500 bg-red-50 dark:bg-red-900/20"
												: "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
										}`}
									>
										<span className="text-2xl mr-2">{option.icon}</span>
										<span className="font-medium">{option.label}</span>
									</button>
								))}
							</div>
						</div>

						{/* Description */}
						<div>
							<label className="block text-sm font-medium mb-2">
								Description *
							</label>
							<div className="relative">
								<FileText className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
								<textarea
									name="description"
									value={formData.description}
									onChange={handleChange}
									placeholder="Provide detailed information about the issue..."
									rows="6"
									className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
									required
								/>
							</div>
							<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
								Please include as much detail as possible to help us investigate
							</p>
						</div>

						{/* Warning */}
						<div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
							<div className="flex items-start gap-3">
								<AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
								<div>
									<h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
										Important Notice
									</h4>
									<p className="text-sm text-yellow-700 dark:text-yellow-400">
										False reports may result in account suspension. Please ensure all information provided is accurate and truthful.
									</p>
								</div>
							</div>
						</div>

						{/* Submit Button */}
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => navigate(-1)}
								className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors font-semibold"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={loading}
								className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors font-semibold disabled:cursor-not-allowed"
							>
								{loading ? "Submitting..." : "Submit Report"}
							</button>
						</div>
					</form>
				</div>

				{/* Additional Info */}
				<div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
					<h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">
						What happens next?
					</h3>
					<ul className="space-y-2 text-sm text-blue-800 dark:text-blue-400">
						<li className="flex items-start gap-2">
							<span className="font-bold">1.</span>
							<span>Our team will review your report within 24-48 hours</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="font-bold">2.</span>
							<span>We may contact you for additional information</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="font-bold">3.</span>
							<span>Appropriate action will be taken based on our investigation</span>
						</li>
						<li className="flex items-start gap-2">
							<span className="font-bold">4.</span>
							<span>You'll be notified of the resolution</span>
						</li>
					</ul>
				</div>
			</motion.div>
		</div>
	);
};

export default DisputeReportPage;
