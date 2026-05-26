import express from "express";
import { 
	createNotification,
	getUserNotifications,
	markNotificationAsRead,
	markAllNotificationsAsRead,
	deleteNotification,
	getUnreadNotificationsCount
} from "../controllers/notification.controller.js";
import {
	registerDeviceToken,
	removeDeviceToken,
	sendPushNotification,
	sendBulkPushNotification,
	getRegisteredDevices,
	toggleDeviceToken,
	getNotificationStats
} from "../controllers/pushNotification.controller.js";
import {
	updateNotificationPreferences,
	getNotificationPreferences,
	resetNotificationPreferences
} from "../controllers/notificationPreferences.controller.js";
import {
	createWebhook,
	getWebhooks,
	getWebhookById,
	updateWebhook,
	deleteWebhook,
	regenerateWebhookSecret,
	getWebhookStats
} from "../controllers/webhook.controller.js";
import {
	createNotificationFromTemplate,
	getNotificationTemplates,
	sendBulkNotificationFromTemplate,
	getNotificationHistory
} from "../controllers/notificationTemplates.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// ────────────────────────────────────────────────────────────────────────
// Basic Notification Routes
// ────────────────────────────────────────────────────────────────────────
router.get("/", verifyToken, getUserNotifications);
router.get("/history", verifyToken, getNotificationHistory);
router.get("/unread-count", verifyToken, getUnreadNotificationsCount);
router.put("/:id/read", verifyToken, markNotificationAsRead);
router.put("/mark-all-read", verifyToken, markAllNotificationsAsRead);
router.delete("/:id", verifyToken, deleteNotification);
router.post("/", verifyToken, authorize(["send_notifications"]), createNotification);

// ────────────────────────────────────────────────────────────────────────
// Push Notification Routes
// ────────────────────────────────────────────────────────────────────────
router.post("/push/register", verifyToken, registerDeviceToken);
router.post("/push/remove", verifyToken, removeDeviceToken);
router.post("/push/send", verifyToken, authorize(["send_notifications"]), sendPushNotification);
router.post("/push/send-bulk", verifyToken, authorize(["admin"]), sendBulkPushNotification);
router.get("/push/devices", verifyToken, getRegisteredDevices);
router.put("/push/toggle", verifyToken, toggleDeviceToken);
router.get("/push/stats", verifyToken, authorize(["view_stats"]), getNotificationStats);

// ────────────────────────────────────────────────────────────────────────
// Notification Preferences Routes
// ────────────────────────────────────────────────────────────────────────
router.get("/preferences", verifyToken, getNotificationPreferences);
router.put("/preferences", verifyToken, updateNotificationPreferences);
router.post("/preferences/reset", verifyToken, resetNotificationPreferences);

// ────────────────────────────────────────────────────────────────────────
// Notification Templates Routes
// ────────────────────────────────────────────────────────────────────────
router.post("/template", verifyToken, authorize(["send_notifications"]), createNotificationFromTemplate);
router.get("/templates", verifyToken, getNotificationTemplates);
router.post("/template/bulk", verifyToken, authorize(["admin"]), sendBulkNotificationFromTemplate);

// ────────────────────────────────────────────────────────────────────────
// Webhook Management Routes
// ────────────────────────────────────────────────────────────────────────
router.post("/webhooks", verifyToken, createWebhook);
router.get("/webhooks", verifyToken, getWebhooks);
router.get("/webhooks/stats", verifyToken, getWebhookStats);
router.get("/webhooks/:id", verifyToken, getWebhookById);
router.put("/webhooks/:id", verifyToken, updateWebhook);
router.delete("/webhooks/:id", verifyToken, deleteWebhook);
router.post("/webhooks/:id/regenerate-secret", verifyToken, regenerateWebhookSecret);

export default router;