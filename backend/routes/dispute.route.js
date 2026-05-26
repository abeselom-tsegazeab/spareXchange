import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { 
	createDispute, 
	getDisputes, 
	updateDisputeStatus, 
	getDisputeById,
	getDisputeStats,
	deleteDispute 
} from "../controllers/dispute.controller.js";

const router = express.Router();

// User routes
router.post("/", verifyToken, createDispute);

// Admin routes
router.get("/", verifyToken, isAdmin, getDisputes);
router.get("/stats", verifyToken, isAdmin, getDisputeStats);
router.get("/:id", verifyToken, isAdmin, getDisputeById);
router.patch("/:id", verifyToken, isAdmin, updateDisputeStatus);
router.delete("/:id", verifyToken, isAdmin, deleteDispute);

export default router;
