import express from "express";
import { 
	createTechnicianRequest, 
	getUserTechnicianRequests, 
	getAllTechnicianRequests,
	getTechnicianRequest,
	submitQuote,
	acceptQuote,
	generateVerificationToken,
	completeWithToken,
	cancelTechnicianRequest
} from "../controllers/technicianRequest.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// General / Discovery
router.get("/", verifyToken, getAllTechnicianRequests); // Global discovery for technicians/admins
router.get("/my-requests", verifyToken, getUserTechnicianRequests);
router.get("/:id", verifyToken, getTechnicianRequest);

// User Actions
router.post("/", verifyToken, createTechnicianRequest);
router.post("/:id/accept-quote/:techId", verifyToken, acceptQuote);
router.post("/:id/complete-handshake", verifyToken, completeWithToken);
router.put("/:id/cancel", verifyToken, cancelTechnicianRequest);

// Technician Actions
router.post("/:id/quote", verifyToken, submitQuote);
router.post("/:id/handshake-token", verifyToken, generateVerificationToken);

export default router;