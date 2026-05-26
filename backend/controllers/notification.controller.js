import { Notification } from "../models/notification.model.js";

// Create a new notification
export const createNotification = async (req, res) => {
	try {
		const { userId, title, message, type, data } = req.body;

		// Validate required fields
		if (!userId || !message) {
			return res.status(400).json({ success: false, message: "User ID and message are required" });
		}

		const newNotification = new Notification({
			userId,
			title,
			message,
			type: type || "system",
			data: data || {},
		});

		const savedNotification = await newNotification.save();

		res.status(201).json({
			success: true,
			message: "Notification created successfully",
			notification: savedNotification,
		});
	} catch (error) {
		console.error("Error in createNotification:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get all notifications for a user
export const getUserNotifications = async (req, res) => {
	try {
		const notifications = await Notification.find({ userId: req.userId })
			.sort({ createdAt: -1 }); // newest first

		res.status(200).json({
			success: true,
			count: notifications.length,
			notifications,
		});
	} catch (error) {
		console.error("Error in getUserNotifications:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Mark a notification as read
export const markNotificationAsRead = async (req, res) => {
	try {
		const { id } = req.params;

		const notification = await Notification.findById(id);

		if (!notification) {
			return res.status(404).json({ success: false, message: "Notification not found" });
		}

		// Check if the user is the owner of the notification
		if (notification.userId.toString() !== req.userId) {
			return res.status(403).json({ success: false, message: "Not authorized to update this notification" });
		}

		notification.isRead = true;
		await notification.save();

		res.status(200).json({
			success: true,
			message: "Notification marked as read",
		});
	} catch (error) {
		console.error("Error in markNotificationAsRead:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (req, res) => {
	try {
		await Notification.updateMany(
			{ userId: req.userId, isRead: false },
			{ isRead: true }
		);

		res.status(200).json({
			success: true,
			message: "All notifications marked as read",
		});
	} catch (error) {
		console.error("Error in markAllNotificationsAsRead:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Delete a notification
export const deleteNotification = async (req, res) => {
	try {
		const { id } = req.params;

		const notification = await Notification.findById(id);

		if (!notification) {
			return res.status(404).json({ success: false, message: "Notification not found" });
		}

		// Check if the user is the owner of the notification
		if (notification.userId.toString() !== req.userId) {
			return res.status(403).json({ success: false, message: "Not authorized to delete this notification" });
		}

		await Notification.findByIdAndDelete(id);

		res.status(200).json({
			success: true,
			message: "Notification deleted successfully",
		});
	} catch (error) {
		console.error("Error in deleteNotification:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get unread notifications count for a user
export const getUnreadNotificationsCount = async (req, res) => {
	try {
		const count = await Notification.countDocuments({ 
			userId: req.userId, 
			isRead: false 
		});

		res.status(200).json({
			success: true,
			count,
		});
	} catch (error) {
		console.error("Error in getUnreadNotificationsCount:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};