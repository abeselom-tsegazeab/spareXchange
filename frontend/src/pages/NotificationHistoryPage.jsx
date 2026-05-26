import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../store/notificationStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
	ArrowLeft,
	ChevronLeft,
	ChevronRight,
	Filter,
	Clock
} from "lucide-react";

const NotificationHistoryPage = () => {
	const navigate = useNavigate();
	const { history, historyPagination, loading, getNotificationHistory, markAsRead } = useNotificationStore();
	
	const [filters, setFilters] = useState({
		type: "",
		isRead: "",
		startDate: "",
		endDate: "",
		page: 1,
		limit: 20
	});

	const [showFilters, setShowFilters] = useState(false);

	useEffect(() => {
		loadHistory();
	}, [filters.page, filters.limit]);

	const loadHistory = async () => {
		try {
			await getNotificationHistory(filters);
		} catch (error) {
			toast.error("Failed to load notification history");
		}
	};

	const handleFilterChange = (key, value) => {
		setFilters(prev => ({
			...prev,
			[key]: value,
			page: 1 // Reset to first page when filters change
		}));
	};

	const applyFilters = () => {
		loadHistory();
		setShowFilters(false);
	};

	const clearFilters = () => {
		setFilters({
			type: "",
			isRead: "",
			startDate: "",
			endDate: "",
			page: 1,
			limit: 20
		});
		setTimeout(() => loadHistory(), 0);
	};

	const handleMarkAsRead = async (notificationId) => {
		try {
			await markAsRead(notificationId);
			toast.success("Notification marked as read");
			loadHistory();
		} catch (error) {
			toast.error("Failed to mark as read");
		}
	};

	const handleNotificationClick = async (notification) => {
		if (!notification.isRead) {
			await handleMarkAsRead(notification._id);
		}
		
		if (notification.link) {
			navigate(notification.link);
		}
	};

	const getNotificationIcon = (type) => {
		switch (type) {
			case "message":
				return "💬";
			case "listing":
				return "📦";
			case "eco-points":
				return "🌱";
			case "verification":
				return "✓";
			case "match":
				return "🎯";
			default:
				return "🔔";
		}
	};

	const formatTime = (date) => {
		const now = new Date();
		const notificationDate = new Date(date);
		const diffInHours = (now - notificationDate) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
			return `${diffInMinutes} minutes ago`;
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)} hours ago`;
		} else {
			return notificationDate.toLocaleDateString();
		}
	};

	const notificationTypes = [
		{ value: "", label: "All Types" },
		{ value: "listing", label: "Listing" },
		{ value: "message", label: "Message" },
		{ value: "system", label: "System" },
		{ value: "eco-points", label: "Eco Points" },
		{ value: "verification", label: "Verification" },
		{ value: "match", label: "Match" }
	];

	if (loading && history.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<div className="min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 py-8 px-4">
		<div className="max-w-6xl mx-auto">
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
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification History</h1>
								<p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
									{historyPagination.total} total notifications
								</p>
							</div>
						</div>
						
						<button
							onClick={() => setShowFilters(!showFilters)}
							className="flex items-center gap-2 px-4 py-2 bg-primary dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors ml-2"
						>
							<Filter className="w-4 h-4" />
							<span>Filters</span>
						</button>
					</div>

					{/* Filters Panel */}
					{showFilters && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="bg-primary dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
								{/* Type Filter */}
								<div>
									<label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Type</label>
									<select
										value={filters.type}
										onChange={(e) => handleFilterChange("type", e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
									>
										{notificationTypes.map(type => (
											<option key={type.value} value={type.value}>
												{type.label}
											</option>
										))}
									</select>
								</div>

								{/* Read Status Filter */}
								<div>
									<label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Status</label>
									<select
										value={filters.isRead}
										onChange={(e) => handleFilterChange("isRead", e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
									>
										<option value="">All</option>
										<option value="true">Read</option>
										<option value="false">Unread</option>
									</select>
								</div>

								{/* Start Date */}
								<div>
									<label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">Start Date</label>
									<input
										type="date"
										value={filters.startDate}
										onChange={(e) => handleFilterChange("startDate", e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
									/>
								</div>

								{/* End Date */}
								<div>
									<label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">End Date</label>
									<input
										type="date"
										value={filters.endDate}
										onChange={(e) => handleFilterChange("endDate", e.target.value)}
										className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
									/>
								</div>
							</div>

							<div className="flex gap-2 justify-end">
								<button
									onClick={clearFilters}
									className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
								>
									Clear Filters
								</button>
								<button
									onClick={applyFilters}
									className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
								>
									Apply Filters
								</button>
							</div>
						</motion.div>
					)}
				</div>

				{/* Notifications List */}
				<div className="bg-primary dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
					{history.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 px-4">
							<Clock className="w-16 h-16 text-gray-400 mb-4" />
							<h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
								No notifications found
							</h3>
							<p className="text-gray-500 dark:text-gray-400 text-center">
								Try adjusting your filters
							</p>
						</div>
					) : (
						<div className="divide-y divide-gray-200 dark:divide-gray-700">
							{history.map((notification, index) => (
								<motion.div
									key={notification._id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.05 }}
									className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
										!notification.isRead ? "bg-green-50 dark:bg-green-900/20" : ""
									}`}
								>
									<div className="flex items-start gap-4">
										<div className="flex-shrink-0 text-2xl">
											{getNotificationIcon(notification.type)}
										</div>

										<div
											className="flex-1 cursor-pointer"
											onClick={() => handleNotificationClick(notification)}
										>
											<div className="flex items-start justify-between gap-2 mb-1">
												<h3 className={`font-semibold ${
													!notification.isRead
														? "text-gray-900 dark:text-white"
														: "text-gray-700 dark:text-gray-300"
												}`}>
													{notification.title}
												</h3>
												{!notification.isRead && (
													<div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
												)}
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
												{notification.message}
											</p>
											<div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-500">
												<div className="flex items-center gap-1">
													<Clock className="w-3 h-3" />
													<span>{formatTime(notification.createdAt)}</span>
												</div>
												<span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
													{notification.type}
												</span>
											</div>
										</div>

										{!notification.isRead && (
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleMarkAsRead(notification._id);
												}}
												className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
												title="Mark as read"
											>
												<span className="text-green-500 text-lg">✓</span>
											</button>
										)}
									</div>
								</motion.div>
							))}
						</div>
					)}
				</div>

				{/* Pagination */}
				{historyPagination.totalPages > 1 && (
					<div className="flex items-center justify-between bg-primary dark:bg-gray-800 rounded-lg shadow-lg px-6 py-4">
						<p className="text-sm text-gray-600 dark:text-gray-400">
							Page {historyPagination.page} of {historyPagination.totalPages}
						</p>
						
						<div className="flex gap-2">
							<button
								onClick={() => handleFilterChange("page", historyPagination.page - 1)}
								disabled={historyPagination.page === 1}
								className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
							>
								<ChevronLeft className="w-4 h-4" />
								Previous
							</button>
							
							<button
								onClick={() => handleFilterChange("page", historyPagination.page + 1)}
								disabled={historyPagination.page === historyPagination.totalPages}
								className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
							>
								Next
								<ChevronRight className="w-4 h-4" />
							</button>
						</div>
					</div>
				)}
			</motion.div>
		</div>
		</div>
	);
};

export default NotificationHistoryPage;
