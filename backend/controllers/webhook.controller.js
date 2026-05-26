import crypto from "crypto";
import { Webhook } from "../models/webhook.model.js";

// Create a new webhook
export const createWebhook = async (req, res) => {
	try {
		const { name, url, events, headers } = req.body;

		if (!name || !url || !events || !Array.isArray(events)) {
			return res.status(400).json({
				success: false,
				message: "Name, URL, and events array are required"
			});
		}

		// Generate webhook secret
		const secret = crypto.randomBytes(32).toString("hex");

		const webhook = new Webhook({
			userId: req.userId,
			name,
			url,
			events,
			secret,
			headers: headers || {}
		});

		await webhook.save();

		// Return secret only once
		res.status(201).json({
			success: true,
			message: "Webhook created successfully",
			webhook: {
				...webhook._doc,
				secret: undefined // Don't store secret in response
			},
			secret, // Send secret only on creation
			webhookSecret: `whsec_${secret}`
		});
	} catch (error) {
		console.error("Error in createWebhook:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get all webhooks for user
export const getWebhooks = async (req, res) => {
	try {
		const webhooks = await Webhook.find({ userId: req.userId })
			.select("-secret")
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			count: webhooks.length,
			webhooks
		});
	} catch (error) {
		console.error("Error in getWebhooks:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get webhook by ID
export const getWebhookById = async (req, res) => {
	try {
		const { id } = req.params;
		const webhook = await Webhook.findOne({ _id: id, userId: req.userId })
			.select("-secret");

		if (!webhook) {
			return res.status(404).json({
				success: false,
				message: "Webhook not found"
			});
		}

		res.status(200).json({
			success: true,
			webhook
		});
	} catch (error) {
		console.error("Error in getWebhookById:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Update webhook
export const updateWebhook = async (req, res) => {
	try {
		const { id } = req.params;
		const { name, url, events, isActive, headers } = req.body;

		const webhook = await Webhook.findOne({ _id: id, userId: req.userId });
		if (!webhook) {
			return res.status(404).json({
				success: false,
				message: "Webhook not found"
			});
		}

		if (name) webhook.name = name;
		if (url) webhook.url = url;
		if (events && Array.isArray(events)) webhook.events = events;
		if (typeof isActive === "boolean") webhook.isActive = isActive;
		if (headers) webhook.headers = new Map(Object.entries(headers));

		await webhook.save();

		res.status(200).json({
			success: true,
			message: "Webhook updated successfully",
			webhook
		});
	} catch (error) {
		console.error("Error in updateWebhook:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Delete webhook
export const deleteWebhook = async (req, res) => {
	try {
		const { id } = req.params;
		const webhook = await Webhook.findOneAndDelete({ _id: id, userId: req.userId });

		if (!webhook) {
			return res.status(404).json({
				success: false,
				message: "Webhook not found"
			});
		}

		res.status(200).json({
			success: true,
			message: "Webhook deleted successfully"
		});
	} catch (error) {
		console.error("Error in deleteWebhook:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Regenerate webhook secret
export const regenerateWebhookSecret = async (req, res) => {
	try {
		const { id } = req.params;
		const webhook = await Webhook.findOne({ _id: id, userId: req.userId });

		if (!webhook) {
			return res.status(404).json({
				success: false,
				message: "Webhook not found"
			});
		}

		const newSecret = crypto.randomBytes(32).toString("hex");
		webhook.secret = newSecret;
		await webhook.save();

		res.status(200).json({
			success: true,
			message: "Webhook secret regenerated successfully",
			webhookSecret: `whsec_${newSecret}`,
			warning: "Update your endpoint with the new secret immediately"
		});
	} catch (error) {
		console.error("Error in regenerateWebhookSecret:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Trigger webhook (internal utility - can be called by other controllers)
export const triggerWebhook = async (event, payload) => {
	try {
		const webhooks = await Webhook.find({
			events: event,
			isActive: true
		});

		const deliveries = [];

		for (const webhook of webhooks) {
			try {
				// TODO: Implement actual HTTP POST to webhook URL
				// For now, we'll log the webhook trigger
				console.log(`Triggering webhook: ${webhook.name}`);
				console.log(`Event: ${event}`);
				console.log(`URL: ${webhook.url}`);
				console.log(`Payload:`, payload);

				// Update webhook stats
				webhook.lastTriggered = new Date();
				webhook.totalDeliveries += 1;
				await webhook.save();

				deliveries.push({
					webhookId: webhook._id,
					status: "success",
					timestamp: new Date()
				});
			} catch (error) {
				console.error(`Webhook delivery failed: ${webhook.name}`, error);
				webhook.failedDeliveries += 1;
				await webhook.save();

				deliveries.push({
					webhookId: webhook._id,
					status: "failed",
					error: error.message,
					timestamp: new Date()
				});
			}
		}

		return deliveries;
	} catch (error) {
		console.error("Error in triggerWebhook:", error);
		return [];
	}
};

// Get webhook delivery logs (Admin or webhook owner)
export const getWebhookStats = async (req, res) => {
	try {
		const webhooks = await Webhook.find({ userId: req.userId });

		const totalDeliveries = webhooks.reduce((sum, w) => sum + w.totalDeliveries, 0);
		const totalFailures = webhooks.reduce((sum, w) => sum + w.failedDeliveries, 0);
		const activeWebhooks = webhooks.filter(w => w.isActive).length;

		res.status(200).json({
			success: true,
			stats: {
				totalWebhooks: webhooks.length,
				activeWebhooks,
				inactiveWebhooks: webhooks.length - activeWebhooks,
				totalDeliveries,
				totalFailures,
				successRate: totalDeliveries > 0
					? (((totalDeliveries - totalFailures) / totalDeliveries) * 100).toFixed(2) + "%"
					: "0%"
			}
		});
	} catch (error) {
		console.error("Error in getWebhookStats:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
