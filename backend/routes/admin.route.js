import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { 
	getAllUsers, 
	toggleUserBan, 
	verifyRoleStatus, 
	verifyUserEmail,
	getPlatformStats,
	getPendingVerifications,
	runSavedSearchAlertsJob,
	deleteUser,
	makeUserAdmin,
	removeUserAdmin
} from "../controllers/admin.controller.js";
import {
	getComprehensiveStats,
	getTimeSeriesAnalytics,
	getUserEngagementMetrics,
	getExchangePerformance,
	getCategoryPerformance,
	getSustainabilityMetrics,
	getSearchAnalytics,
	getReviewAnalytics
} from "../controllers/analytics.controller.js";
import {
	getAllReports,
	getReportById,
	updateReportStatus,
	getReportStats,
	deleteReport
} from "../controllers/report.controller.js";

const router = express.Router();

import { authorize } from "../middleware/authorize.js";

// Existing admin routes
router.get("/stats", verifyToken, authorize(["view_stats"]), getPlatformStats);
router.get("/users", verifyToken, authorize(["view_users"]), getAllUsers);
router.get("/verifications/pending", verifyToken, authorize(["verify_roles"]), getPendingVerifications);
router.post("/users/:id/ban", verifyToken, authorize(["ban_users"]), toggleUserBan);
router.post("/users/:id/verify", verifyToken, authorize(["verify_roles"]), verifyRoleStatus);
router.post("/users/:id/verify-email", verifyToken, authorize(["verify_roles"]), verifyUserEmail);
router.delete("/users/:id", verifyToken, authorize(["ban_users"]), deleteUser);
router.patch("/users/:id/make-admin", verifyToken, authorize(["ban_users"]), makeUserAdmin);
router.patch("/users/:id/remove-admin", verifyToken, authorize(["ban_users"]), removeUserAdmin);
router.post("/jobs/saved-search-alerts", verifyToken, authorize(["run_jobs"]), runSavedSearchAlertsJob);

// Advanced analytics routes
router.get("/analytics/comprehensive", verifyToken, authorize(["view_stats"]), getComprehensiveStats);
router.get("/analytics/trends", verifyToken, authorize(["view_stats"]), getTimeSeriesAnalytics);
router.get("/analytics/engagement", verifyToken, authorize(["view_stats"]), getUserEngagementMetrics);
router.get("/analytics/exchanges", verifyToken, authorize(["view_stats"]), getExchangePerformance);
router.get("/analytics/categories", verifyToken, authorize(["view_stats"]), getCategoryPerformance);
router.get("/analytics/sustainability", verifyToken, authorize(["view_stats"]), getSustainabilityMetrics);
router.get("/analytics/searches", verifyToken, authorize(["view_stats"]), getSearchAnalytics);
router.get("/analytics/reviews", verifyToken, authorize(["view_stats"]), getReviewAnalytics);

// Report management routes
router.get("/reports", verifyToken, authorize(["view_reports"]), getAllReports);
router.get("/reports/stats", verifyToken, authorize(["view_stats"]), getReportStats);
router.get("/reports/:id", verifyToken, authorize(["view_reports"]), getReportById);
router.put("/reports/:id", verifyToken, authorize(["moderate_content"]), updateReportStatus);
router.delete("/reports/:id", verifyToken, authorize(["moderate_content"]), deleteReport);

export default router;
