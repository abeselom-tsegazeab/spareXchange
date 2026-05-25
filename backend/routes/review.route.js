import express from "express";
import { createReview, getUserReviews, getReviewableExchanges } from "../controllers/review.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.post("/", verifyToken, createReview);
router.get("/user/:userId", getUserReviews);
router.get("/reviewable", verifyToken, getReviewableExchanges); // Get completed exchanges eligible for review

export default router;
