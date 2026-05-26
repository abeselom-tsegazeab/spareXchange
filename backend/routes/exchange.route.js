import express from "express";
import {
	proposeExchange,
	getExchangeById,
	updateExchangeStatus,
	makeCounterOffer,
	negotiateExchange,
	completeExchange,
	openDispute,
	resolveDispute,
	getUserExchanges,
	getSafeZones,
	generateHandshakeToken,
	regenerateHandshakeToken,
	verifyHandshake,
	uploadHandoverPhoto,
} from "../controllers/exchange.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// Collection routes
router.get("/", verifyToken, getUserExchanges);            // GET  /api/exchanges?status=&page=&limit=
router.post("/", verifyToken, proposeExchange);             // POST /api/exchanges

// Item routes
router.get("/:id", verifyToken, getExchangeById);                   // GET  /api/exchanges/:id
router.put("/:id/status", verifyToken, updateExchangeStatus);       // PUT  /api/exchanges/:id/status
router.put("/:id/counter-offer", verifyToken, makeCounterOffer);    // PUT  /api/exchanges/:id/counter-offer
router.put("/:id/negotiate", verifyToken, negotiateExchange);       // PUT  /api/exchanges/:id/negotiate
router.put("/:id/complete", verifyToken, completeExchange);         // PUT  /api/exchanges/:id/complete
router.post("/:id/dispute", verifyToken, openDispute);              // POST /api/exchanges/:id/dispute
router.put("/:id/dispute/resolve", verifyToken, authorize(["admin"]), resolveDispute);    // PUT  /api/exchanges/:id/dispute/resolve (admin)

// Modernization Routes
router.get("/info/safe-zones", verifyToken, getSafeZones);
router.put("/:id/handshake/generate", verifyToken, generateHandshakeToken);
router.put("/:id/handshake/regenerate", verifyToken, regenerateHandshakeToken);
router.put("/:id/handshake/verify", verifyToken, verifyHandshake);
router.put("/:id/handover-photo", verifyToken, uploadHandoverPhoto);

export default router;
