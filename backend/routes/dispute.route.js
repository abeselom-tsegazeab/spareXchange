import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { createDispute, getDisputes, updateDisputeStatus } from "../controllers/dispute.controller.js";

const router = express.Router();

router.post("/", verifyToken, createDispute);
router.get("/", verifyToken, isAdmin, getDisputes);
router.patch("/:id", verifyToken, isAdmin, updateDisputeStatus);

export default router;
