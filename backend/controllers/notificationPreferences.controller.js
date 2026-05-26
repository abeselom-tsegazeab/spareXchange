import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
	try {
		const {
			emailNotifications,
			pushNotifications,
			smsNotifications,
			listingAlerts,
			exchangeUpdates,
			messageNotifications,
			systemAnnouncements,
			marketingEmails
		} = req.body;

		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		// Update only provided preferences
		if (typeof emailNotifications === 'boolean') {
			user.notificationPreferences.emailNotifications = emailNotifications;
		}
		if (typeof pushNotifications === 'boolean') {
			user.notificationPreferences.pushNotifications = pushNotifications;
		}
		if (typeof smsNotifications === 'boolean') {
			user.notificationPreferences.smsNotifications = smsNotifications;
		}
		if (typeof listingAlerts === 'boolean') {
			user.notificationPreferences.listingAlerts = listingAlerts;
		}
		if (typeof exchangeUpdates === 'boolean') {
			user.notificationPreferences.exchangeUpdates = exchangeUpdates;
		}
		if (typeof messageNotifications === 'boolean') {
			user.notificationPreferences.messageNotifications = messageNotifications;
		}
		if (typeof systemAnnouncements === 'boolean') {
			user.notificationPreferences.systemAnnouncements = systemAnnouncements;
		}
		if (typeof marketingEmails === 'boolean') {
			user.notificationPreferences.marketingEmails = marketingEmails;
		}

		await user.save();

		res.status(200).json({
			success: true,
			message: "Notification preferences updated successfully",
			preferences: user.notificationPreferences
		});
	} catch (error) {
		console.error("Error in updateNotificationPreferences:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("notificationPreferences");
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		res.status(200).json({
			success: true,
			preferences: user.notificationPreferences
		});
	} catch (error) {
		console.error("Error in getNotificationPreferences:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Reset all preferences to default
export const resetNotificationPreferences = async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		user.notificationPreferences = {
			emailNotifications: true,
			pushNotifications: true,
			smsNotifications: false,
			listingAlerts: true,
			exchangeUpdates: true,
			messageNotifications: true,
			systemAnnouncements: true,
			marketingEmails: false
		};

		await user.save();

		res.status(200).json({
			success: true,
			message: "Notification preferences reset to defaults",
			preferences: user.notificationPreferences
		});
	} catch (error) {
		console.error("Error in resetNotificationPreferences:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
