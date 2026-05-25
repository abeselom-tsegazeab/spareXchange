import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../store/notificationStore";
import LoadingSpinner from "../components/LoadingSpinner";
import PushNotificationSettings from "../components/PushNotificationSettings";
import toast from "react-hot-toast";
import {
	Bell,
	CheckCircle,
	Trash2,
	CheckCheck,
	ArrowLeft,
	Clock,
	Settings,
	History
} from "lucide-react";

const NotificationsPage = () => {
	const navigate = useNavigate();
	const { notifications, unreadCount, loading, getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotificationStore();
	const [filter, setFilter] = useState("all"); // all, unread, read

	useEffect(() => {
		fetchNotifications();
	}, []);

	const fetchNotifications = async () => {
		try {
			await Promise.all([getNotifications(), getUnreadCount()]);
		} catch (error) {
			toast.error("Failed to load notifications");
		}
	};

	const handleMarkAsRead = async (notificationId) => {
		try {
			await markAsRead(notificationId);
			toast.success("Notification marked as read");
		} catch (error) {
			toast.error("Failed to mark as read");
		}
	};

	const handleMarkAllAsRead = async () => {
		try {
			await markAllAsRead();
			toast.success("All notifications marked as read");
		} catch (error) {
			toast.error("Failed to mark all as read");
		}
	};

	const handleDelete = async (notificationId) => {
		try {
			await deleteNotification(notificationId);
			toast.success("Notification deleted");
		} catch (error) {
			toast.error("Failed to delete notification");
		}
	};

	const handleNotificationClick = async (notification) => {
		if (!notification.isRead) {
			await handleMarkAsRead(notification._id);
		}
		
		// Navigate to related content if available
		if (notification.link) {
			navigate(notification.link);
		}
	};

	const filteredNotifications = notifications.filter(notification => {
		if (filter === "unread") return !notification.isRead;
		if (filter === "read") return notification.isRead;
		return true;
	});

	const getNotificationIcon = (type) => {
		switch (type) {
			case "message":
				return "💬";
			case "exchange_proposed":
			case "exchange_status_updated":
			case "exchange_completed":
			case "exchange_disputed":
			case "exchange_dispute_resolved":
				return "🔄";
			case "listing":
				return "📦";
			case "eco-points":
				return "🌱";
			case "verification":
				return "✓";
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

	if (loading && notifications.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<div className="min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 py-8 px-4">
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
							<div>
								<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications</h1>
								{unreadCount > 0 && (
									<p className="text-sm text-green-600 dark:text-green-400">
										{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
									</p>
								)}
							</div>
						</div>
						{unreadCount > 0 && (
							<button
								onClick={handleMarkAllAsRead}
								className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
							>
								<CheckCheck className="w-4 h-4" />
								<span>Mark all read</span>
							</button>
						)}
					</div>

					{/* Filter Tabs */}
					<div className="flex gap-2 mb-4">
						{["all", "unread", "read"].map((filterType) => (
							<button
								key={filterType}
								onClick={() => setFilter(filterType)}
								className={`px-4 py-2 rounded-lg capitalize transition-colors ${
									filter === filterType
										? "bg-green-500 text-white"
										: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
								}`}
							>
								{filterType}
							</button>
						))}
					</div>
				</div>

				{/* Notifications List */}
				<div className="bg-primary dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden mb-6">
					{filteredNotifications.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 px-4">
							<Bell className="w-16 h-16 text-gray-400 mb-4" />
							<h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
								No notifications
							</h3>
							<p className="text-gray-500 dark:text-gray-400 text-center">
								{filter !== "all"
									? `No ${filter} notifications`
									: "You're all caught up!"}
							</p>
						</div>
					) : (
						<div className="divide-y divide-gray-200 dark:divide-gray-700">
							{filteredNotifications.map((notification, index) => (
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
										{/* Icon */}
										<div className="flex-shrink-0 text-2xl">
											{getNotificationIcon(notification.type)}
										</div>

										{/* Content */}
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
											<div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
												<Clock className="w-3 h-3" />
												<span>{formatTime(notification.createdAt)}</span>
											</div>
										</div>

										{/* Actions */}
										<div className="flex items-center gap-2 flex-shrink-0">
											{!notification.isRead && (
												<button
													onClick={(e) => {
														e.stopPropagation();
														handleMarkAsRead(notification._id);
													}}
													className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
													title="Mark as read"
												>
													<CheckCircle className="w-4 h-4 text-green-500" />
												</button>
											)}
											<button
												onClick={(e) => {
													e.stopPropagation();
													handleDelete(notification._id);
												}}
												className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
												title="Delete"
											>
												<Trash2 className="w-4 h-4 text-red-500" />
											</button>
										</div>
									</div>
								</motion.div>
							))}
						</div>
					)}
				</div>

				{/* Quick Access Links */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
					<button
						onClick={() => navigate('/notifications/preferences')}
						className="flex items-center gap-3 p-4 bg-primary dark:bg-gray-800 rounded-lg shadow-lg hover:bg-primary/90 dark:hover:bg-gray-700 transition-colors"
					>
						<Settings className="w-6 h-6 text-blue-500" />
						<div className="text-left">
							<p className="font-semibold text-gray-900 dark:text-white">Notification Settings</p>
							<p className="text-xs text-gray-600 dark:text-gray-400">Manage preferences</p>
						</div>
					</button>
					
					<button
						onClick={() => navigate('/notifications/history')}
						className="flex items-center gap-3 p-4 bg-primary dark:bg-gray-800 rounded-lg shadow-lg hover:bg-primary/90 dark:hover:bg-gray-700 transition-colors"
					>
						<History className="w-6 h-6 text-purple-500" />
						<div className="text-left">
							<p className="font-semibold text-gray-900 dark:text-white">View History</p>
							<p className="text-xs text-gray-600 dark:text-gray-400">Browse all notifications</p>
						</div>
					</button>
					
					<button
						onClick={() => navigate('/notifications/webhooks')}
						className="flex items-center gap-3 p-4 bg-primary dark:bg-gray-800 rounded-lg shadow-lg hover:bg-primary/90 dark:hover:bg-gray-700 transition-colors"
					>
						<Bell className="w-6 h-6 text-orange-500" />
						<div className="text-left">
							<p className="font-semibold text-gray-900 dark:text-white">Webhooks</p>
							<p className="text-xs text-gray-600 dark:text-gray-400">Manage integrations</p>
						</div>
					</button>
				</div>

				{/* Push Notification Devices */}
				<div className="mt-6">
					<PushNotificationSettings />
				</div>
			</motion.div>
		</div>
		</div>
	);
};

export default NotificationsPage;
