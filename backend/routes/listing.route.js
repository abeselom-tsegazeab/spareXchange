import express from "express";
import { 
	createListing, 
	getListings, 
	getListing, 
	updateListing, 
	deleteListing, 
	getUserListings,
	toggleListingAvailability,
	getRecommendations,
	bulkCreateListings,
	renewListing,
	reportListing,
	voteCompatibility,
	getHighDemandAnalytics,
	getAllListingsAdmin
} from "../controllers/listing.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

// Public routes
router.get("/", getListings);
router.get("/recommendations", verifyToken, getRecommendations);
router.get("/analytics/high-demand", verifyToken, getHighDemandAnalytics);

import { authorize } from "../middleware/authorize.js";

// Admin routes
router.get("/admin/all", verifyToken, authorize(["view_stats"]), getAllListingsAdmin);

// Protected routes (require authentication) - SPECIFIC routes BEFORE parameterized routes
router.get("/my-listings", verifyToken, getUserListings);
router.post("/", verifyToken, authorize(["create_listings"]), createListing);
router.post("/bulk", verifyToken, authorize(["create_bulk_listings"]), bulkCreateListings);
router.put("/:id/renew", verifyToken, renewListing);
router.post("/:id/report", verifyToken, reportListing);
router.put("/:id", verifyToken, updateListing); // Owner check is inside controller
router.delete("/:id", verifyToken, deleteListing); // Owner check is inside controller
router.put("/:id/toggle-availability", verifyToken, toggleListingAvailability);
router.put("/:id/compatibility/:vehicleId/vote", verifyToken, voteCompatibility);
router.get("/:id", getListing);

export default router;