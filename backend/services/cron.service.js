import { Exchange } from "../models/exchange.model.js";
import { Notification } from "../models/notification.model.js";
import { emitToUser } from "../utils/socket.js";
import { processSavedSearchAlerts } from "./savedSearchAlerts.service.js";

const CHECK_INTERVAL = 1000 * 60 * 60 * 12; // run every 12 hours
const SAVED_SEARCH_INTERVAL = 1000 * 60 * 10; // run every 10 minutes

export const startExpiryCron = () => {
	setInterval(async () => {
		try {
			const expiredExchanges = await Exchange.find({
				status: "pending",
				expiresAt: { $lt: new Date() },
			});

			for (const exchange of expiredExchanges) {
				exchange.status = "expired";
				exchange.history.push({ action: "auto_expired", at: new Date(), note: "Proposal expired after 7 days" });
				await exchange.save();

				try {
					await Notification.insertMany([
						{ userId: exchange.buyerId, type: "exchange_expired", message: "Your exchange proposal has expired.", metadata: { exchangeId: exchange._id } },
						{ userId: exchange.sellerId, type: "exchange_expired", message: "An exchange proposal for your listing has expired.", metadata: { exchangeId: exchange._id } },
					]);
					emitToUser(exchange.buyerId.toString(), "exchange:expired", { exchangeId: exchange._id });
					emitToUser(exchange.sellerId.toString(), "exchange:expired", { exchangeId: exchange._id });
				} catch (_) {}
			}

			if (expiredExchanges.length > 0) {
				console.log(`[CRON] Expired ${expiredExchanges.length} pending exchanges.`);
			}
		} catch (error) {
			console.error("[CRON] Error checking expired exchanges:", error);
		}
	}, CHECK_INTERVAL);

	console.log("[CRON] Exchange auto-expiry service started.");
};

export const startSavedSearchCron = () => {
	// Don't run background intervals during tests
	if (process.env.NODE_ENV === "test") return;

	setInterval(async () => {
		try {
			const result = await processSavedSearchAlerts({ limitSearches: 200, limitListingsPerSearch: 5 });
			if (result.notificationsCreated > 0) {
				console.log(`[CRON] Saved search alerts: ${result.notificationsCreated} notifications (${result.searchesProcessed} searches).`);
			}
		} catch (error) {
			console.error("[CRON] Error processing saved search alerts:", error);
		}
	}, SAVED_SEARCH_INTERVAL);

	console.log("[CRON] Saved-search alert service started.");
};
