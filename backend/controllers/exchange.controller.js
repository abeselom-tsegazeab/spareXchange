import mongoose from "mongoose";
import { Exchange } from "../models/exchange.model.js";
import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Notification } from "../models/notification.model.js";
import { emitToUser } from "../utils/socket.js";

// ─── Helper: append to exchange history ───────────────────────────────────
const addHistory = (exchange, action, by, note = null) => {
	exchange.history.push({ action, by, at: new Date(), note });
};

// ─── Helper: check and mark auto-expired ─────────────────────────────────
const checkExpiry = async (exchange) => {
	if (exchange.status === "pending" && exchange.expiresAt < new Date()) {
		exchange.status = "expired";
		addHistory(exchange, "auto_expired", null, "Proposal expired after 7 days");
		await exchange.save();
		try {
			emitToUser(exchange.buyerId.toString(), "exchange:expired", { exchangeId: exchange._id });
			emitToUser(exchange.sellerId.toString(), "exchange:expired", { exchangeId: exchange._id });
		} catch (_) {}
		return true;
	}
	return false;
};

// ─── Helper: Sweep pending exchanges ──────────────────────────────────────
const sweepPendingExchanges = async (listingId, wonExchangeId) => {
	if (!listingId) return;
	const pending = await Exchange.find({
		$or: [{ listingId }, { offeredListingId: listingId }],
		_id: { $ne: wonExchangeId },
		status: { $in: ["pending", "counter_offered", "accepted"] }
	});
	for (const p of pending) {
		p.status = "cancelled";
		p.cancelReason = "Item was sold to another user";
		addHistory(p, "cancelled", null, "Auto-sweep: Item sold");
		await p.save();
		try {
			emitToUser(p.buyerId.toString(), "exchange:status_updated", { exchangeId: p._id, status: "cancelled" });
			await Notification.create({
				userId: p.buyerId,
				type: "exchange_status_updated",
				message: `An exchange proposal was automatically cancelled because the item was sold.`,
				metadata: { exchangeId: p._id },
			});
		} catch (_) {}
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 1. Propose a new exchange
//    Improvements: self-proposal guard, spam protection (max 3 active),
//                  offeredListingId ownership validation
// ──────────────────────────────────────────────────────────────────────────
export const proposeExchange = async (req, res) => {
	try {
		const { listingId, offeredItems, offeredListingId, meetingLocation, meetingTime } = req.body;
		const buyerId = req.userId;

		// 1a. Listing must exist and be available
		const listing = await Listing.findById(listingId);
		if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
		if (!listing.available) return res.status(400).json({ success: false, message: "Listing is no longer available" });

		// 1b. Cannot propose on your own listing
		if (listing.seller.toString() === buyerId) {
			return res.status(400).json({ success: false, message: "You cannot propose an exchange on your own listing" });
		}

		// 1c. 🛡 Spam protection — max 3 pending/counter_offered proposals per listing per buyer
		const activeCount = await Exchange.countDocuments({
			listingId,
			buyerId,
			status: { $in: ["pending", "counter_offered"] },
		});
		if (activeCount >= 3) {
			return res.status(429).json({ success: false, message: "You already have 3 active proposals on this listing. Please wait for a response." });
		}

		// 1d. Validate offeredListingId ownership & availability
		if (offeredListingId) {
			const offeredListing = await Listing.findById(offeredListingId);
			if (!offeredListing) return res.status(404).json({ success: false, message: "Offered listing not found" });
			if (offeredListing.seller.toString() !== buyerId) {
				return res.status(403).json({ success: false, message: "You can only offer listings you own" });
			}
			if (!offeredListing.available) {
				return res.status(400).json({ success: false, message: "The listing you are offering is no longer available" });
			}
		}

		const newExchange = new Exchange({
			buyerId,
			sellerId: listing.seller,
			listingId,
			offeredItems: offeredItems || "",
			offeredListingId: offeredListingId || null,
			meetingDetails: { location: meetingLocation, time: meetingTime },
		});

		addHistory(newExchange, "proposed", buyerId, offeredItems || "");
		await newExchange.save();

		// Add Notification & Socket
		try {
			await Notification.create({
				userId: listing.seller,
				type: "exchange_proposed",
				message: `You have a new exchange proposal for your listing.`,
				metadata: { exchangeId: newExchange._id },
			});
			emitToUser(listing.seller.toString(), "exchange:proposed", { exchangeId: newExchange._id });
		} catch (_) {}

		res.status(201).json({ success: true, message: "Exchange proposed successfully", data: newExchange });
	} catch (error) {
		console.error("Error in proposeExchange:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 2. Get a single exchange by ID (participants only)
//    Improvement: auto-expiry check on fetch
// ──────────────────────────────────────────────────────────────────────────
export const getExchangeById = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.userId;

		const exchange = await Exchange.findById(id)
			.populate("buyerId", "name profilePicture trustScore totalReviews ecoPoints")
			.populate("sellerId", "name profilePicture trustScore totalReviews ecoPoints")
			.populate("listingId", "title images price category condition")
			.populate("offeredListingId", "title images price")
			.populate("counterOffers.offeredListingId", "title images price");

		if (!exchange) return res.status(404).json({ success: false, message: "Exchange not found" });

		const isBuyer = exchange.buyerId._id.toString() === userId;
		const isSeller = exchange.sellerId._id.toString() === userId;

		// Check if admin
		const user = await User.findById(userId);
		const isAdmin = user && (user.userType === "admin" || user.permissions.includes("admin"));

		if (!isBuyer && !isSeller && !isAdmin) {
			return res.status(403).json({ success: false, message: "Not authorized to view this exchange" });
		}

		// Auto-expire check
		await checkExpiry(exchange);

		res.status(200).json({ success: true, data: exchange });
	} catch (error) {
		console.error("Error in getExchangeById:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 3. Update exchange status (accept / reject / cancel)
//    Improvements: role-enforcement, cancelReason required,
//                  status-transition guard, history log
// ──────────────────────────────────────────────────────────────────────────
export const updateExchangeStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, cancelReason } = req.body;
		const userId = req.userId;

		const exchange = await Exchange.findById(id);
		if (!exchange) return res.status(404).json({ success: false, message: "Exchange not found" });

		const isBuyer = exchange.buyerId.toString() === userId;
		const isSeller = exchange.sellerId.toString() === userId;
		if (!isBuyer && !isSeller) return res.status(403).json({ success: false, message: "Not authorized" });

		// Role enforcement
		if ((status === "accepted" || status === "rejected") && !isSeller) {
			return res.status(403).json({ success: false, message: "Only the seller can accept or reject" });
		}

		// Cancel requires reason
		if (status === "cancelled") {
			if (!cancelReason) return res.status(400).json({ success: false, message: "A cancellation reason is required" });
			exchange.cancelReason = cancelReason;
		}

		// Transition guard
		const allowedTransitions = {
			accepted: ["pending", "counter_offered"],
			rejected: ["pending", "counter_offered"],
			cancelled: ["pending", "counter_offered", "accepted"],
		};
		if (allowedTransitions[status] && !allowedTransitions[status].includes(exchange.status)) {
			return res.status(400).json({ success: false, message: `Cannot transition from "${exchange.status}" to "${status}"` });
		}

		// Apply counter-offer terms if accepting from a counter-offer
		if (status === "accepted" && exchange.status === "counter_offered" && exchange.counterOffers.length > 0) {
			const latestOffer = exchange.counterOffers[exchange.counterOffers.length - 1];
			exchange.offeredItems = latestOffer.offeredItems;
			exchange.offeredListingId = latestOffer.offeredListingId;
		}

		exchange.status = status;
		addHistory(exchange, status, userId, cancelReason || null);
		await exchange.save();

		try {
			const other = isBuyer ? exchange.sellerId.toString() : exchange.buyerId.toString();
			await Notification.create({
				userId: other,
				type: "exchange_status_updated",
				message: `An exchange proposal status was updated to ${status}.`,
				metadata: { exchangeId: exchange._id },
			});
			emitToUser(other, "exchange:status_updated", { exchangeId: exchange._id, status });
		} catch (_) {}

		res.status(200).json({ success: true, message: `Exchange ${status}`, data: exchange });
	} catch (error) {
		console.error("Error in updateExchangeStatus:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 4. Counter-offer (seller proposes modified terms)
//    Improvement: full counter-offer negotiation flow
// ──────────────────────────────────────────────────────────────────────────
export const makeCounterOffer = async (req, res) => {
	try {
		const { id } = req.params;
		const { offeredItems, offeredListingId, note } = req.body;
		const userId = req.userId;

		if (!offeredItems && !offeredListingId) {
			return res.status(400).json({ success: false, message: "counteroffer must include offeredItems or offeredListingId" });
		}

		const exchange = await Exchange.findById(id);
		if (!exchange) return res.status(404).json({ success: false, message: "Exchange not found" });

		const isBuyer = exchange.buyerId.toString() === userId;
		const isSeller = exchange.sellerId.toString() === userId;
		if (!isBuyer && !isSeller) return res.status(403).json({ success: false, message: "Not authorized" });

		if (!["pending", "counter_offered"].includes(exchange.status)) {
			return res.status(400).json({ success: false, message: "Counter-offers can only be made on pending or counter-offered exchanges" });
		}

		// Validate offeredListingId if provided
		if (offeredListingId) {
			const ol = await Listing.findById(offeredListingId);
			if (!ol) return res.status(404).json({ success: false, message: "Offered listing not found" });
			if (ol.seller.toString() !== userId) return res.status(403).json({ success: false, message: "You can only offer your own listings" });
		}

		exchange.counterOffers.push({
			offeredItems: offeredItems || null,
			offeredListingId: offeredListingId || null,
			proposedBy: userId,
			note: note || null,
			createdAt: new Date(),
		});
		exchange.status = "counter_offered";
		addHistory(exchange, "counter_offered", userId, note || offeredItems);
		await exchange.save();

		// Add Notification & Socket
		try {
			const notifyId = isBuyer ? exchange.sellerId.toString() : exchange.buyerId.toString();
			await Notification.create({
				userId: notifyId,
				type: "exchange_counter_offered",
				message: `A counter-offer was made on your exchange.`,
				metadata: { exchangeId: exchange._id },
			});
			emitToUser(notifyId, "exchange:counter_offered", { exchangeId: exchange._id });
		} catch (_) {}

		res.status(200).json({ success: true, message: "Counter-offer sent", data: exchange });
	} catch (error) {
		console.error("Error in makeCounterOffer:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 5. Negotiate meeting details (only on accepted exchanges)
// ──────────────────────────────────────────────────────────────────────────
export const negotiateExchange = async (req, res) => {
	try {
		const { id } = req.params;
		const { negotiationNotes, meetingLocation, meetingTime, isLocked } = req.body;
		const userId = req.userId;

		const exchange = await Exchange.findById(id);
		if (!exchange) return res.status(404).json({ success: false, message: "Exchange not found" });
		if (exchange.buyerId.toString() !== userId && exchange.sellerId.toString() !== userId) {
			return res.status(403).json({ success: false, message: "Not authorized" });
		}
		if (exchange.status !== "accepted") {
			return res.status(400).json({ success: false, message: "Exchange must be accepted before negotiating meeting details" });
		}
		if (exchange.meetingDetails?.isLocked) {
			return res.status(400).json({ success: false, message: "Meeting details are locked and cannot be changed anymore" });
		}

		if (negotiationNotes !== undefined) exchange.negotiationNotes = negotiationNotes;
		if (meetingLocation) exchange.meetingDetails.location = meetingLocation;
		if (meetingTime) exchange.meetingDetails.time = meetingTime;
		if (isLocked === true) exchange.meetingDetails.isLocked = true;

		addHistory(exchange, isLocked ? "meeting_locked" : "meeting_updated", userId, meetingLocation || negotiationNotes);
		await exchange.save();

		try {
			const otherId = exchange.buyerId.toString() === userId ? exchange.sellerId.toString() : exchange.buyerId.toString();
			emitToUser(otherId, "exchange:meeting_negotiated", { exchangeId: exchange._id });
		} catch (_) {}

		res.status(200).json({ success: true, message: "Meeting details updated", data: exchange });
	} catch (error) {
		console.error("Error in negotiateExchange:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ─── Internal Helper: Execute Atomic Full Completion ─────────────────────
const executeFullCompletion = async (exchange) => {
	const session = await mongoose.startSession();
	try {
		await session.withTransaction(async () => {
			const rewardPoints = 50;
			const [buyer, seller] = await Promise.all([
				User.findById(exchange.buyerId).session(session),
				User.findById(exchange.sellerId).session(session),
			]);

			if (!buyer || !seller) throw new Error("User data missing");

			for (const u of [buyer, seller]) {
				u.ecoPoints = (u.ecoPoints || 0) + rewardPoints;
				if (!u.achievements.includes("First Successful Exchange")) {
					u.achievements.push("First Successful Exchange");
				}
			}
			await Promise.all([buyer.save({ session }), seller.save({ session })]);

			// Eco-point ledger
			try {
				const EcoTx = mongoose.model("EcoPointTransaction");
				await EcoTx.insertMany(
					[
						{ userId: exchange.buyerId, points: rewardPoints, reason: "exchange", description: `Exchange #${exchange._id} completed`, referenceId: exchange._id },
						{ userId: exchange.sellerId, points: rewardPoints, reason: "exchange", description: `Exchange #${exchange._id} completed`, referenceId: exchange._id },
					],
					{ session }
				);
			} catch (_) {} 

			await Listing.findByIdAndUpdate(exchange.listingId, { available: false }, { session });
			if (exchange.offeredListingId) {
				await Listing.findByIdAndUpdate(exchange.offeredListingId, { available: false }, { session });
			}
		});

		try {
			await Notification.insertMany([
				{ userId: exchange.buyerId, type: "exchange_completed", message: "Your exchange has been fully completed!", metadata: { exchangeId: exchange._id } },
				{ userId: exchange.sellerId, type: "exchange_completed", message: "Your exchange has been fully completed!", metadata: { exchangeId: exchange._id } },
			]);
			emitToUser(exchange.buyerId.toString(), "exchange:completed", { exchangeId: exchange._id });
			emitToUser(exchange.sellerId.toString(), "exchange:completed", { exchangeId: exchange._id });
		} catch (_) {}

		// Auto-sweep pending exchanges
		await sweepPendingExchanges(exchange.listingId, exchange._id);
		if (exchange.offeredListingId) {
			await sweepPendingExchanges(exchange.offeredListingId, exchange._id);
		}
	} finally {
		await session.endSession();
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 6. Complete exchange (dual-confirmation)
// ──────────────────────────────────────────────────────────────────────────
export const completeExchange = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.userId;

		const exchange = await Exchange.findById(id);
		if (!exchange) return res.status(404).json({ success: false, message: "Exchange not found" });

		if (!["accepted", "completed_by_buyer", "completed_by_seller"].includes(exchange.status)) {
			return res.status(400).json({ success: false, message: "Exchange must be accepted before marking complete" });
		}

		const isBuyer = exchange.buyerId.toString() === userId;
		const isSeller = exchange.sellerId.toString() === userId;
		if (!isBuyer && !isSeller) return res.status(403).json({ success: false, message: "Not authorized" });

		let newStatus;
		if (isBuyer) {
			newStatus = exchange.status === "completed_by_seller" ? "fully_completed" : "completed_by_buyer";
		} else {
			newStatus = exchange.status === "completed_by_buyer" ? "fully_completed" : "completed_by_seller";
		}

		exchange.status = newStatus;
		addHistory(exchange, newStatus, userId);
		await exchange.save();

		if (newStatus === "fully_completed") {
			await executeFullCompletion(exchange);
		}

		res.status(200).json({ success: true, message: "Exchange completion updated", data: exchange });
	} catch (error) {
		console.error("Error in completeExchange:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 7. Open a dispute
// ──────────────────────────────────────────────────────────────────────────
export const openDispute = async (req, res) => {
	try {
		const { id } = req.params;
		const { reason } = req.body;
		const userId = req.userId;

		if (!reason) return res.status(400).json({ success: false, message: "A dispute reason is required" });

		const exchange = await Exchange.findById(id);
		if (!exchange) return res.status(404).json({ success: false, message: "Exchange not found" });

		const isParticipant = exchange.buyerId.toString() === userId || exchange.sellerId.toString() === userId;
		if (!isParticipant) return res.status(403).json({ success: false, message: "Not authorized" });

		if (!["accepted", "completed_by_buyer", "completed_by_seller"].includes(exchange.status)) {
			return res.status(400).json({ success: false, message: "Disputes can only be opened on accepted/active exchanges" });
		}
		if (exchange.disputeStatus === "open") {
			return res.status(400).json({ success: false, message: "A dispute is already open for this exchange" });
		}

		exchange.disputeStatus = "open";
		exchange.disputeReason = reason;
		exchange.disputeOpenedBy = userId;
		exchange.status = "disputed";
		addHistory(exchange, "dispute_opened", userId, reason);
		await exchange.save();

		try {
			const other = exchange.buyerId.toString() === userId ? exchange.sellerId.toString() : exchange.buyerId.toString();
			await Notification.create({
				userId: other,
				type: "exchange_disputed",
				message: `A dispute has been opened for your exchange.`,
				metadata: { exchangeId: exchange._id },
			});
		} catch (_) {}

		res.status(201).json({ success: true, message: "Dispute opened. Our team will review it shortly.", data: exchange });
	} catch (error) {
		console.error("Error in openDispute:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 8. Admin: Resolve a dispute
//    NEW endpoint — was missing before
// ──────────────────────────────────────────────────────────────────────────
export const resolveDispute = async (req, res) => {
	try {
		const { id } = req.params;
		const { resolution, outcome } = req.body; // outcome: "buyer_wins" | "seller_wins" | "mutual"
		const adminId = req.userId;

		if (!resolution) return res.status(400).json({ success: false, message: "A resolution note is required" });

		const exchange = await Exchange.findById(id);
		if (!exchange) return res.status(404).json({ success: false, message: "Exchange not found" });
		if (exchange.disputeStatus !== "open") {
			return res.status(400).json({ success: false, message: "No open dispute on this exchange" });
		}

		exchange.disputeStatus = "resolved";
		exchange.disputeResolution = resolution;
		exchange.disputeResolvedBy = adminId;
		// Outcome determines final status
		if (outcome === "mutual") exchange.status = "cancelled";
		else exchange.status = "fully_completed"; // admin forces completion

		addHistory(exchange, `dispute_resolved:${outcome}`, adminId, resolution);
		await exchange.save();

		// 🔴 Force atomic completion logic if admin ruled in favor of completion
		if (exchange.status === "fully_completed") {
			const session = await mongoose.startSession();
			try {
				await session.withTransaction(async () => {
					const rewardPoints = 50;
					const [buyer, seller] = await Promise.all([
						User.findById(exchange.buyerId).session(session),
						User.findById(exchange.sellerId).session(session),
					]);

					if (buyer && seller) {
						for (const u of [buyer, seller]) {
							u.ecoPoints = (u.ecoPoints || 0) + rewardPoints;
							if (!u.achievements.includes("First Successful Exchange")) {
								u.achievements.push("First Successful Exchange");
							}
						}
						await Promise.all([buyer.save({ session }), seller.save({ session })]);
					}

					try {
						const EcoTx = mongoose.model("EcoPointTransaction");
						await EcoTx.insertMany([
							{ userId: exchange.buyerId, points: rewardPoints, reason: "exchange", description: `Dispute resolved -> completion`, referenceId: exchange._id },
							{ userId: exchange.sellerId, points: rewardPoints, reason: "exchange", description: `Dispute resolved -> completion`, referenceId: exchange._id },
						], { session });
					} catch (_) {}

					await Listing.findByIdAndUpdate(exchange.listingId, { available: false }, { session });
					if (exchange.offeredListingId) {
						await Listing.findByIdAndUpdate(exchange.offeredListingId, { available: false }, { session });
					}
				});
			} finally {
				await session.endSession();
			}

			// Auto-sweep pending exchanges
			await sweepPendingExchanges(exchange.listingId, exchange._id);
			if (exchange.offeredListingId) {
				await sweepPendingExchanges(exchange.offeredListingId, exchange._id);
			}
		}

		try {
			await Notification.insertMany([
				{ userId: exchange.buyerId, type: "exchange_dispute_resolved", message: "Your exchange dispute was resolved.", metadata: { exchangeId: exchange._id } },
				{ userId: exchange.sellerId, type: "exchange_dispute_resolved", message: "Your exchange dispute was resolved.", metadata: { exchangeId: exchange._id } },
			]);
			emitToUser(exchange.buyerId.toString(), "exchange:dispute_resolved", { exchangeId: exchange._id, outcome });
			emitToUser(exchange.sellerId.toString(), "exchange:dispute_resolved", { exchangeId: exchange._id, outcome });
		} catch (_) {}

		res.status(200).json({ success: true, message: "Dispute resolved", data: exchange });
	} catch (error) {
		console.error("Error in resolveDispute:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 9. Get all exchanges (paginated, filterable by status)
//     Improvement: pagination + auto-expiry sweep
// ──────────────────────────────────────────────────────────────────────────
export const getUserExchanges = async (req, res) => {
	try {
		const userId = req.userId;
		const { status, page = 1, limit = 10 } = req.query;

		const query = { $or: [{ buyerId: userId }, { sellerId: userId }] };
		if (status) query.status = status;

		const skip = (Number(page) - 1) * Number(limit);
		const total = await Exchange.countDocuments(query);

		const exchanges = await Exchange.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(Number(limit))
			.populate("buyerId", "name profilePicture trustScore")
			.populate("sellerId", "name profilePicture trustScore")
			.populate("listingId", "title images price");

		res.status(200).json({
			success: true,
			total,
			page: Number(page),
			totalPages: Math.ceil(total / Number(limit)),
			count: exchanges.length,
			data: exchanges,
		});
	} catch (error) {
		console.error("Error in getUserExchanges:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 10. Modernization: QR Handshake - Generate Token (Seller)
// ──────────────────────────────────────────────────────────────────────────
export const generateHandshakeToken = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.userId;

		const exchange = await Exchange.findById(id);
		if (!exchange) return res.status(404).json({ success: false, message: "Exchange not found" });

		if (exchange.sellerId.toString() !== userId) {
			return res.status(403).json({ success: false, message: "Only the seller can generate a handshake token" });
		}

		if (exchange.status !== "accepted" && !exchange.status.startsWith("completed_by")) {
			return res.status(400).json({ success: false, message: "Exchange is not in a valid state for handshake" });
		}

		// Generate 6-digit cryptographically secure token
		const crypto = await import("crypto");
		const token = crypto.randomInt(100000, 999999).toString();
		
		exchange.handshakeToken = token;
		exchange.handshakeExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
		exchange.handshakeRegenerated = (exchange.handshakeRegenerated || 0) + 1;
		addHistory(exchange, "handshake_token_generated", userId, `Token ready for scanning (Regeneration #${exchange.handshakeRegenerated})`);
		await exchange.save();

		// Inform buyer via socket
		try {
			emitToUser(exchange.buyerId.toString(), "exchange:handshake_ready", { exchangeId: exchange._id });
		} catch (_) {}

		res.status(200).json({
			success: true,
			message: "Handshake token generated",
			token, // Frontend uses this to render QR
			expiresAt: exchange.handshakeExpiresAt,
			regenerationCount: exchange.handshakeRegenerated
		});
	} catch (error) {
		console.error("Error in generateHandshakeToken:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 10b. Modernization: QR Handshake - Regenerate Token (Seller)
//      Allows seller to generate new token if previous one was lost/expired
//      Rate limited to prevent abuse (max 5 regenerations per exchange)
// ──────────────────────────────────────────────────────────────────────────
export const regenerateHandshakeToken = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.userId;

		const exchange = await Exchange.findById(id);
		if (!exchange) return res.status(404).json({ success: false, message: "Exchange not found" });

		if (exchange.sellerId.toString() !== userId) {
			return res.status(403).json({ success: false, message: "Only the seller can regenerate handshake token" });
		}

		if (exchange.status !== "accepted" && !exchange.status.startsWith("completed_by")) {
			return res.status(400).json({ success: false, message: "Exchange is not in a valid state for handshake" });
		}

		// Rate limiting: max 5 regenerations per exchange
		const regenerationCount = exchange.handshakeRegenerated || 0;
		if (regenerationCount >= 5) {
			return res.status(429).json({ 
				success: false, 
				message: "Maximum token regenerations (5) reached for this exchange. Please contact support if needed."
			});
		}

		// Security: Invalidate previous token
		const previousToken = exchange.handshakeToken;
		if (previousToken) {
			addHistory(exchange, "handshake_token_invalidated", userId, `Previous token invalidated for regeneration`);
		}

		// Generate new 6-digit cryptographically secure token
		const crypto = await import("crypto");
		const newToken = crypto.randomInt(100000, 999999).toString();
		
		exchange.handshakeToken = newToken;
		exchange.handshakeExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
		exchange.handshakeRegenerated = regenerationCount + 1;
		addHistory(exchange, "handshake_token_regenerated", userId, `New token generated (Regeneration #${exchange.handshakeRegenerated})`);
		await exchange.save();

		// Inform buyer via socket that a new token is ready
		try {
			emitToUser(exchange.buyerId.toString(), "exchange:handshake_regenerated", { 
				exchangeId: exchange._id,
				message: "Seller has generated a new verification code"
			});
		} catch (_) {}

		res.status(200).json({
			success: true,
			message: "Handshake token regenerated successfully. Previous token is now invalid.",
			token: newToken,
			expiresAt: exchange.handshakeExpiresAt,
			regenerationCount: exchange.handshakeRegenerated,
			remainingAttempts: 5 - exchange.handshakeRegenerated
		});
	} catch (error) {
		console.error("Error in regenerateHandshakeToken:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 11. Modernization: QR Handshake - Verify and Complete (Buyer)
// ──────────────────────────────────────────────────────────────────────────
export const verifyHandshake = async (req, res) => {
	try {
		const { id } = req.params;
		const { token } = req.body;
		const userId = req.userId;

		if (!token) return res.status(400).json({ success: false, message: "Verification token is required" });

		const exchange = await Exchange.findById(id);
		if (!exchange) return res.status(404).json({ success: false, message: "Exchange not found" });

		if (exchange.buyerId.toString() !== userId) {
			return res.status(403).json({ success: false, message: "Only the buyer can verify the handshake" });
		}

		if (!exchange.handshakeToken || exchange.handshakeToken !== token) {
			return res.status(400).json({ success: false, message: "Invalid verification token" });
		}

		if (exchange.handshakeExpiresAt < new Date()) {
			return res.status(400).json({ success: false, message: "Verification token has expired. Please ask the seller to generate a new one." });
		}

		// Success! Proceed to fully_completed status immediately
		exchange.status = "fully_completed";
		exchange.handshakeToken = null; // Clear token after use
		addHistory(exchange, "fully_completed_vid_handshake", userId);
		await exchange.save();

		// Atomic Logic
		await executeFullCompletion(exchange);

		res.status(200).json({
			success: true,
			message: "Handshake verified successfully! Exchange completed.",
			data: exchange
		});
	} catch (error) {
		console.error("Error in verifyHandshake:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 12. Modernization: Safe Zone Discovery
// ──────────────────────────────────────────────────────────────────────────
export const getSafeZones = async (req, res) => {
	try {
		// Mocked data for demo purposes. 
		// Real app would fetch from a 'SafeZone' collection or external API.
		const safeZones = [
			{ id: "sz_001", name: "Central Police Station Hub", address: "123 Main St, Downtown", type: "police", location: { lat: 40.7128, lng: -74.0060 } },
			{ id: "sz_002", name: "SuperFix Partner Garage", address: "45 Industrial Ave", type: "garage", location: { lat: 40.7306, lng: -73.9352 } },
			{ id: "sz_003", name: "Metro Library Plaza", address: "89 Knowledge Way", type: "public", location: { lat: 40.7580, lng: -73.9855 } },
		];

		res.status(200).json({
			success: true,
			count: safeZones.length,
			data: safeZones
		});
	} catch (error) {
		console.error("Error in getSafeZones:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// ──────────────────────────────────────────────────────────────────────────
// 13. Modernization: Handover Photo Proof
// ──────────────────────────────────────────────────────────────────────────
export const uploadHandoverPhoto = async (req, res) => {
	try {
		const { id } = req.params;
		const { photoUrl } = req.body;
		const userId = req.userId;

		if (!photoUrl) return res.status(400).json({ success: false, message: "Photo URL is required" });

		const exchange = await Exchange.findById(id);
		if (!exchange) return res.status(404).json({ success: false, message: "Exchange not found" });

		if (exchange.buyerId.toString() !== userId && exchange.sellerId.toString() !== userId) {
			return res.status(403).json({ success: false, message: "Not authorized" });
		}

		exchange.handoverPhotos.push(photoUrl);
		addHistory(exchange, "handover_photo_uploaded", userId, "Condition proof added");
		await exchange.save();

		res.status(200).json({
			success: true,
			message: "Handover photo uploaded successfully",
			photos: exchange.handoverPhotos
		});
	} catch (error) {
		console.error("Error in uploadHandoverPhoto:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
