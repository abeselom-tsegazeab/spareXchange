import { useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../store/notificationStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
	ArrowLeft,
	Bell,
	CheckCircle,
	XCircle,
	TrendingUp,
	Clock
} from "lucide-react";

const NotificationStatsPage = () => {
	const navigate = useNavigate();
	const { notificationStats, loading, getNotificationStats } = useNotificationStore();

	useEffect(() => {
		loadStats();
	}, []);

	const loadStats = async () => {
		try {
			await getNotificationStats();
		} catch (error) {
			toast.error("Failed to load notification statistics");
		}
	};

	if (loading && !notificationStats) {
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
				<div className="mb-8">
					<div className="flex items-center gap-4 mb-4">
						<button
							onClick={() => navigate(-1)}
							className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						>
							<ArrowLeft className="w-6 h-6" />
						</button>
						<div>
							<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notification Statistics</h1>
							<p className="text-gray-600 dark:text-gray-400 mt-1">
								System-wide notification analytics
							</p>
						</div>
					</div>
				</div>

				{notificationStats && (
					<>
						{/* Overview Stats */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
								className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
							>
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
										<Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
									</div>
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Notifications</p>
								<p className="text-3xl font-bold">{notificationStats.totalNotifications}</p>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
								className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
							>
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
										<CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
									</div>
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Read</p>
								<p className="text-3xl font-bold text-green-600">{notificationStats.readNotifications}</p>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
								className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
							>
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
										<XCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
									</div>
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Unread</p>
								<p className="text-3xl font-bold text-orange-600">{notificationStats.unreadNotifications}</p>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
								className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
							>
								<div className="flex items-center justify-between mb-4">
									<div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
										<TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
									</div>
								</div>
								<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Read Rate</p>
								<p className="text-3xl font-bold text-purple-600">{notificationStats.readRate}</p>
							</motion.div>
						</div>

						{/* Recent Activity */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.5 }}
							className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8"
						>
							<div className="flex items-center gap-3 mb-4">
								<Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
								<h2 className="text-xl font-semibold">Recent Activity</h2>
							</div>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Last 7 Days</p>
									<p className="text-2xl font-bold">{notificationStats.recentNotificationsLast7Days}</p>
									<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">notifications sent</p>
								</div>
								<div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
									<p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Engagement Rate</p>
									<p className="text-2xl font-bold text-green-600">{notificationStats.readRate}</p>
									<p className="text-xs text-gray-500 dark:text-gray-500 mt-1">users reading notifications</p>
								</div>
							</div>
						</motion.div>

						{/* Notifications by Type */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6 }}
							className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
						>
							<h2 className="text-xl font-semibold mb-6">Notifications by Type</h2>
							
							{notificationStats.notificationsByType.length === 0 ? (
								<p className="text-center text-gray-600 dark:text-gray-400 py-8">
									No notification data available
								</p>
							) : (
								<div className="space-y-4">
									{notificationStats.notificationsByType.map((item, index) => {
										const percentage = notificationStats.totalNotifications > 0
											? ((item.count / notificationStats.totalNotifications) * 100).toFixed(1)
											: 0;

										return (
											<motion.div
												key={item._id}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: 0.7 + index * 0.1 }}
												className="space-y-2"
											>
												<div className="flex items-center justify-between">
													<span className="font-medium capitalize">{item._id || "system"}</span>
													<div className="flex items-center gap-4">
														<span className="text-sm text-gray-600 dark:text-gray-400">
															{item.count} notifications
														</span>
														<span className="text-sm font-semibold">
															{percentage}%
														</span>
													</div>
												</div>
												<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
													<motion.div
														initial={{ width: 0 }}
														animate={{ width: `${percentage}%` }}
														transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
														className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
													/>
												</div>
											</motion.div>
										);
									})}
								</div>
							)}
						</motion.div>
					</>
				)}
			</motion.div>
		</div>
		</div>
	);
};

export default NotificationStatsPage;
