import express from "express";
import { getTechnicians, getTechnicianById, redeemPoints, requestRoleVerification, updateProfile, getLeaderboard, getLeaderboardStats, listSavedSearches, createSavedSearch, updateSavedSearch, deleteSavedSearch } from "../controllers/user.controller.js";
import { getActivityFeed, getUserPublicActivity, getCommunityHighlights } from "../controllers/activityFeed.controller.js";
import { getPublicUserProfile, getUserPublicListings, getUserReviewsSummary, getUserStats } from "../controllers/publicProfile.controller.js";
import { getAchievementDefinitions, checkAndUnlockAchievements, getUserAchievements, getAchievementLeaderboard } from "../controllers/achievement.controller.js";
import { verifyToken, verifyTokenOptional } from "../middleware/verifyToken.js";
import { upload, uploadProfilePicture } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/technicians", getTechnicians);
router.get("/technicians/:id", getTechnicianById);
router.post("/redeem-points", verifyToken, redeemPoints);
router.post("/verify-role", verifyToken, upload.array("documents", 5), requestRoleVerification);
router.put("/profile", verifyToken, uploadProfilePicture.single("profilePicture"), updateProfile);
router.get("/leaderboard", verifyToken, getLeaderboard);
router.get("/leaderboard/stats", verifyToken, getLeaderboardStats);

// Saved searches (Module 6)
router.get("/saved-searches", verifyToken, listSavedSearches);
router.post("/saved-searches", verifyToken, createSavedSearch);
router.patch("/saved-searches/:id", verifyToken, updateSavedSearch);
router.delete("/saved-searches/:id", verifyToken, deleteSavedSearch);

// ────────────────────────────────────────────────────────────────────────
// Community Engagement Routes (Module 10)
// ────────────────────────────────────────────────────────────────────────

// Activity Feed
router.get("/feed", verifyToken, getActivityFeed);
router.get("/feed/community", getCommunityHighlights);
router.get("/feed/:userId", verifyToken, getUserPublicActivity);

// Public User Profiles
router.get("/profile/:userId/public", getPublicUserProfile);
router.get("/profile/:userId/listings", verifyTokenOptional, getUserPublicListings);
router.get("/profile/:userId/reviews", getUserReviewsSummary);
router.get("/profile/:userId/stats", getUserStats);

// Achievements & Badges
router.get("/achievements", verifyToken, getUserAchievements);
router.get("/achievements/definitions", getAchievementDefinitions);
router.post("/achievements/check", verifyToken, checkAndUnlockAchievements);
router.get("/achievements/leaderboard", getAchievementLeaderboard);

export default router;
