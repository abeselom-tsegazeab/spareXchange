// Forced update to resolve nodemon caching issues
import express from "express";
import {
	createRecyclingSubmission,
	getUserRecyclingSubmissions,
	getAllRecyclingSubmissions,
	getRecyclingSubmission,
	approveRecyclingSubmission,
	rejectRecyclingSubmission,
	completeRecyclingSubmission,
	verifyRecyclingByToken,
	getNearbyRecyclers,
} from "../controllers/recyclingSubmission.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { authorize } from "../middleware/authorize.js";

const router = express.Router();

// Protected routes (require authentication)
router.get("/", verifyToken, authorize(["admin", "moderator"]), getAllRecyclingSubmissions); // for admin
router.get("/user", verifyToken, getUserRecyclingSubmissions);
router.get("/discovery", verifyToken, getNearbyRecyclers);
router.get("/:id", verifyToken, getRecyclingSubmission);

router.post("/", verifyToken, createRecyclingSubmission);
router.post("/verify-token", verifyToken, authorize(["recycler", "admin"]), verifyRecyclingByToken);
router.post("/:id/approve", verifyToken, authorize(["recycler", "admin"]), approveRecyclingSubmission); // for admin/recycler
router.put("/:id/reject", verifyToken, authorize(["recycler", "admin"]), rejectRecyclingSubmission); // for admin/recycler
router.put("/:id/complete", verifyToken, authorize(["admin"]), completeRecyclingSubmission); // for admin only

export default router;