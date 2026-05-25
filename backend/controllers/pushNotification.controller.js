import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

// Register device token for push notifications
export const registerDeviceToken = async (req, res) => {
	try {
		const { token, deviceType, deviceName } = req.body;
		// deviceType: 'android', 'ios', 'web'

		if (!token || !deviceType) {
			return res.status(400).json({ 
				success: false, 
				message: "Device token and device type are required" 
			});
		}

		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		// Check if token already exists
		const existingTokenIndex = user.deviceTokens.findIndex(
			dt => dt.token === token
		);

		if (existingTokenIndex !== -1) {
			// Update existing token
			user.deviceTokens[existingTokenIndex].lastUsed = new Date();
		} else {
			// Add new token
			user.deviceTokens.push({
				token,
				deviceType,
				deviceName: deviceName || "Unknown Device",
				isActive: true
			});
		}

		await user.save();

		res.status(200).json({
			success: true,
			message: "Device token registered successfully",
			deviceCount: user.deviceTokens.length
		});
	} catch (error) {
		console.error("Error in registerDeviceToken:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Remove device token
export const removeDeviceToken = async (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(400).json({ 
				success: false, 
				message: "Device token is required" 
			});
		}

		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		user.deviceTokens = user.deviceTokens.filter(dt => dt.token !== token);
		await user.save();

		res.status(200).json({
			success: true,
			message: "Device token removed successfully"
		});
	} catch (error) {
		console.error("Error in removeDeviceToken:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Send push notification to specific user
export const sendPushNotification = async (req, res) => {
	try {
		const { userId, title, message, type, data, link } = req.body;

		if (!userId || !title || !message) {
			return res.status(400).json({ 
				success: false, 
				message: "User ID, title, and message are required" 
			});
		}

		// Create in-app notification
		const notification = new Notification({
			userId,
			title,
			message,
			type: type || "system",
			link: link || "",
			data: data || {}
		});

		await notification.save();

		// Get user's device tokens
		const user = await User.findById(userId);
		if (!user || !user.deviceTokens || user.deviceTokens.length === 0) {
			return res.status(200).json({
				success: true,
				message: "Notification created but no device tokens registered",
				notification
			});
		}

		// TODO: Integrate with FCM (Firebase Cloud Messaging)
		// For now, we'll simulate push notification sending
		const activeTokens = user.deviceTokens
			.filter(dt => dt.isActive)
			.map(dt => dt.token);

		// Simulate FCM push
		console.log(`Push notification sent to ${activeTokens.length} devices`);
		console.log(`Title: ${title}, Message: ${message}`);

		res.status(200).json({
			success: true,
			message: "Push notification sent successfully",
			notification,
			devicesNotified: activeTokens.length
		});
	} catch (error) {
		console.error("Error in sendPushNotification:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Send push notification to multiple users (Admin)
export const sendBulkPushNotification = async (req, res) => {
	try {
		const { userIds, title, message, type, data, link } = req.body;

		if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
			return res.status(400).json({ 
				success: false, 
				message: "Valid userIds array is required" 
			});
		}

		if (!title || !message) {
			return res.status(400).json({ 
				success: false, 
				message: "Title and message are required" 
			});
		}

		// Create notifications for all users
		const notifications = userIds.map(userId => ({
			userId,
			title,
			message,
			type: type || "system",
			link: link || "",
			data: data || {}
		}));

		await Notification.insertMany(notifications);

		// TODO: Send actual push notifications via FCM
		const totalDevices = userIds.length; // Simplified

		res.status(200).json({
			success: true,
			message: `Bulk notification sent to ${userIds.length} users`,
			notificationsCreated: notifications.length,
			estimatedDevicesReached: totalDevices
		});
	} catch (error) {
		console.error("Error in sendBulkPushNotification:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get user's registered devices
export const getRegisteredDevices = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("deviceTokens");
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		res.status(200).json({
			success: true,
			devices: user.deviceTokens,
			count: user.deviceTokens.length
		});
	} catch (error) {
		console.error("Error in getRegisteredDevices:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Toggle device token active status
export const toggleDeviceToken = async (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(400).json({ 
				success: false, 
				message: "Device token is required" 
			});
		}

		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		const deviceToken = user.deviceTokens.find(dt => dt.token === token);
		if (!deviceToken) {
			return res.status(404).json({ 
				success: false, 
				message: "Device token not found" 
			});
		}

		deviceToken.isActive = !deviceToken.isActive;
		await user.save();

		res.status(200).json({
			success: true,
			message: `Device token ${deviceToken.isActive ? "activated" : "deactivated"}`,
			isActive: deviceToken.isActive
		});
	} catch (error) {
		console.error("Error in toggleDeviceToken:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get notification delivery stats (Admin)
export const getNotificationStats = async (req, res) => {
	try {
		const now = new Date();
		const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		// Total notifications
		const totalNotifications = await Notification.countDocuments();

		// Notifications by type
		const notificationsByType = await Notification.aggregate([
			{ $group: { _id: "$type", count: { $sum: 1 } } }
		]);

		// Read vs Unread
		const readNotifications = await Notification.countDocuments({ isRead: true });
		const unreadNotifications = await Notification.countDocuments({ isRead: false });

		// Recent notifications
		const recentNotifications = await Notification.countDocuments({ 
			createdAt: { $gte: last7Days } 
		});

		res.status(200).json({
			success: true,
			stats: {
				totalNotifications,
				readNotifications,
				unreadNotifications,
				readRate: totalNotifications > 0 
					? ((readNotifications / totalNotifications) * 100).toFixed(2) + "%" 
					: "0%",
				recentNotificationsLast7Days: recentNotifications,
				notificationsByType
			}
		});
	} catch (error) {
		console.error("Error in getNotificationStats:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
