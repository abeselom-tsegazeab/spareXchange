import { Notification } from "../models/notification.model.js";
import { User } from "../models/user.model.js";

// Notification template definitions
const notificationTemplates = {
	listing_match: {
		title: "New Listing Match Found!",
		message: "A new listing matching your search criteria has been posted: {{listingTitle}}",
		type: "match"
	},
	exchange_proposed: {
		title: "Exchange Proposal Received",
		message: "{{userName}} has proposed an exchange for your listing: {{listingTitle}}",
		type: "listing"
	},
	exchange_completed: {
		title: "Exchange Completed Successfully",
		message: "Your exchange for {{listingTitle}} has been completed!",
		type: "listing"
	},
	message_received: {
		title: "New Message",
		message: "You have a new message from {{userName}}",
		type: "message"
	},
	eco_points_earned: {
		title: "Eco Points Earned!",
		message: "You earned {{points}} eco points for {{reason}}",
		type: "eco-points"
	},
	verification_approved: {
		title: "Verification Approved",
		message: "Your {{userType}} verification has been approved!",
		type: "verification"
	},
	review_received: {
		title: "New Review",
		message: "{{userName}} left you a {{rating}}-star review",
		type: "system"
	},
	listing_expired: {
		title: "Listing Expired",
		message: "Your listing '{{listingTitle}}' has expired. Renew it to keep it active.",
		type: "listing"
	},
	system_announcement: {
		title: "System Announcement",
		message: "{{announcement}}",
		type: "system"
	}
};

// Create notification from template
export const createNotificationFromTemplate = async (req, res) => {
	try {
		const { templateName, userId, variables } = req.body;

		if (!templateName || !userId) {
			return res.status(400).json({
				success: false,
				message: "Template name and user ID are required"
			});
		}

		const template = notificationTemplates[templateName];
		if (!template) {
			return res.status(404).json({
				success: false,
				message: "Template not found"
			});
		}

		// Replace variables in title and message
		let title = template.title;
		let message = template.message;

		if (variables) {
			Object.keys(variables).forEach(key => {
				const regex = new RegExp(`{{${key}}}`, "g");
				title = title.replace(regex, variables[key]);
				message = message.replace(regex, variables[key]);
			});
		}

		const notification = new Notification({
			userId,
			title,
			message,
			type: template.type,
			data: { template: templateName, variables }
		});

		await notification.save();

		res.status(201).json({
			success: true,
			message: "Notification created from template",
			notification
		});
	} catch (error) {
		console.error("Error in createNotificationFromTemplate:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get all available templates (Admin)
export const getNotificationTemplates = async (req, res) => {
	try {
		const templates = Object.keys(notificationTemplates).map(key => ({
			name: key,
			...notificationTemplates[key]
		}));

		res.status(200).json({
			success: true,
			count: templates.length,
			templates
		});
	} catch (error) {
		console.error("Error in getNotificationTemplates:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Send bulk notification from template (Admin)
export const sendBulkNotificationFromTemplate = async (req, res) => {
	try {
		const { templateName, userIds, variables, targetType } = req.body;

		if (!templateName) {
			return res.status(400).json({
				success: false,
				message: "Template name is required"
			});
		}

		const template = notificationTemplates[templateName];
		if (!template) {
			return res.status(404).json({
				success: false,
				message: "Template not found"
			});
		}

		// Determine target users
		let targetUsers = userIds;
		if (!targetUsers && targetType) {
			// Send to all users of specific type
			const query = targetType === "all" ? {} : { userType: targetType };
			const users = await User.find(query).select("_id");
			targetUsers = users.map(u => u._id);
		}

		if (!targetUsers || targetUsers.length === 0) {
			return res.status(400).json({
				success: false,
				message: "No target users found"
			});
		}

		// Create notifications for all users
		const notifications = targetUsers.map(userId => {
			let title = template.title;
			let message = template.message;

			if (variables) {
				Object.keys(variables).forEach(key => {
					const regex = new RegExp(`{{${key}}}`, "g");
					title = title.replace(regex, variables[key]);
					message = message.replace(regex, variables[key]);
				});
			}

			return {
				userId,
				title,
				message,
				type: template.type,
				data: { template: templateName, variables }
			};
		});

		await Notification.insertMany(notifications);

		res.status(200).json({
			success: true,
			message: `Bulk notification sent to ${targetUsers.length} users`,
			notificationsCreated: notifications.length
		});
	} catch (error) {
		console.error("Error in sendBulkNotificationFromTemplate:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Send notification to user (helper function for other controllers)
export const sendNotificationToUser = async (userId, templateName, variables = {}) => {
	try {
		const template = notificationTemplates[templateName];
		if (!template) {
			console.error(`Notification template not found: ${templateName}`);
			return null;
		}

		let title = template.title;
		let message = template.message;

		Object.keys(variables).forEach(key => {
			const regex = new RegExp(`{{${key}}}`, "g");
			title = title.replace(regex, variables[key]);
			message = message.replace(regex, variables[key]);
		});

		const notification = new Notification({
			userId,
			title,
			message,
			type: template.type,
			data: { template: templateName, variables }
		});

		await notification.save();
		return notification;
	} catch (error) {
		console.error("Error in sendNotificationToUser:", error);
		return null;
	}
};

// Get notification history with filtering
export const getNotificationHistory = async (req, res) => {
	try {
		const { type, isRead, startDate, endDate, page = 1, limit = 20 } = req.query;

		const query = { userId: req.userId };

		if (type) query.type = type;
		if (typeof isRead === "string") query.isRead = isRead === "true";
		if (startDate || endDate) {
			query.createdAt = {};
			if (startDate) query.createdAt.$gte = new Date(startDate);
			if (endDate) query.createdAt.$lte = new Date(endDate);
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const notifications = await Notification.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Notification.countDocuments(query);

		res.status(200).json({
			success: true,
			count: notifications.length,
			total,
			page: parseInt(page),
			totalPages: Math.ceil(total / parseInt(limit)),
			notifications
		});
	} catch (error) {
		console.error("Error in getNotificationHistory:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
