import { Report } from "../models/report.model.js";
import { Listing } from "../models/listing.model.js";
import { User } from "../models/user.model.js";
import { emitToUser } from "../utils/socket.js";

// Get all reports (Admin only)
export const getAllReports = async (req, res) => {
	try {
		const { status, targetModel, reason, page = 1, limit = 20 } = req.query;
		
		const query = {};
		if (status) query.status = status;
		if (targetModel) query.targetModel = targetModel;
		if (reason) query.reason = reason;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const reports = await Report.find(query)
			.populate("reporter", "name email")
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const totalReports = await Report.countDocuments(query);

		res.status(200).json({
			success: true,
			count: reports.length,
			totalReports,
			page: parseInt(page),
			totalPages: Math.ceil(totalReports / parseInt(limit)),
			reports
		});
	} catch (error) {
		console.error("Error in getAllReports:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get report by ID
export const getReportById = async (req, res) => {
	try {
		const { id } = req.params;
		
		const report = await Report.findById(id)
			.populate("reporter", "name email userType");

		if (!report) {
			return res.status(404).json({ success: false, message: "Report not found" });
		}

		// If target is a listing, include listing details
		if (report.targetModel === "Listing") {
			const listing = await Listing.findById(report.targetId)
				.populate("seller", "name email");
			report._doc.targetDetails = listing;
		}

		// If target is a user, include user details
		if (report.targetModel === "User") {
			const user = await User.findById(report.targetId).select("-password");
			report._doc.targetDetails = user;
		}

		res.status(200).json({ success: true, report });
	} catch (error) {
		console.error("Error in getReportById:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Update report status (resolve, dismiss, etc.)
export const updateReportStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, moderatorNote, action } = req.body;

		if (!["pending", "reviewed", "resolved", "dismissed"].includes(status)) {
			return res.status(400).json({ success: false, message: "Invalid status" });
		}

		const report = await Report.findById(id);
		if (!report) {
			return res.status(404).json({ success: false, message: "Report not found" });
		}

		report.status = status;
		if (moderatorNote) report.moderatorNote = moderatorNote;

		// If action is provided, take additional actions
		if (action) {
			if (action === "remove_listing" && report.targetModel === "Listing") {
				const listing = await Listing.findById(report.targetId);
				if (listing) {
					listing.isActive = false;
					listing.status = "suspended";
					await listing.save();

					// Notify listing owner
					emitToUser(listing.seller.toString(), "listing_suspended", {
						listingId: listing._id,
						reason: moderatorNote || "Your listing has been suspended due to a report violation."
					});
				}
			}

			if (action === "ban_user") {
				const targetUser = await User.findById(report.targetId);
				if (targetUser && targetUser.userType !== "admin") {
					targetUser.isBanned = true;
					await targetUser.save();

					emitToUser(targetUser._id.toString(), "account_banned", {
						reason: moderatorNote || "Your account has been banned due to multiple violations."
					});
				}
			}

			if (action === "warn_user") {
				const targetUser = await User.findById(report.targetId);
				if (targetUser) {
					emitToUser(targetUser._id.toString(), "account_warning", {
						reason: moderatorNote || "You have received a warning for violating platform guidelines."
					});
				}
			}
		}

		await report.save();

		// Notify the reporter about the resolution
		emitToUser(report.reporter.toString(), "report_resolved", {
			reportId: report._id,
			status: report.status,
			message: `Your report has been ${status}.`
		});

		res.status(200).json({
			success: true,
			message: `Report status updated to ${status}`,
			report
		});
	} catch (error) {
		console.error("Error in updateReportStatus:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get reports statistics
export const getReportStats = async (req, res) => {
	try {
		const now = new Date();
		const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

		// Total reports
		const totalReports = await Report.countDocuments();

		// Reports by status
		const reportsByStatus = await Report.aggregate([
			{ $group: { _id: "$status", count: { $sum: 1 } } }
		]);

		// Reports by target model
		const reportsByTarget = await Report.aggregate([
			{ $group: { _id: "$targetModel", count: { $sum: 1 } } }
		]);

		// Reports by reason
		const reportsByReason = await Report.aggregate([
			{ $group: { _id: "$reason", count: { $sum: 1 } } }
		]);

		// Recent reports (last 30 days)
		const recentReports = await Report.countDocuments({ createdAt: { $gte: last30Days } });

		// Average resolution time (for resolved reports)
		const resolvedReports = await Report.find({ 
			status: "resolved",
			updatedAt: { $exists: true }
		}).select("createdAt updatedAt");

		let avgResolutionTime = 0;
		if (resolvedReports.length > 0) {
			const totalHours = resolvedReports.reduce((sum, report) => {
				const hours = (report.updatedAt - report.createdAt) / (1000 * 60 * 60);
				return sum + hours;
			}, 0);
			avgResolutionTime = totalHours / resolvedReports.length;
		}

		res.status(200).json({
			success: true,
			stats: {
				totalReports,
				recentReportsLast30Days: recentReports,
				reportsByStatus,
				reportsByTarget,
				reportsByReason,
				avgResolutionTimeHours: avgResolutionTime.toFixed(2)
			}
		});
	} catch (error) {
		console.error("Error in getReportStats:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Delete a report (Admin cleanup)
export const deleteReport = async (req, res) => {
	try {
		const { id } = req.params;
		
		const report = await Report.findByIdAndDelete(id);
		if (!report) {
			return res.status(404).json({ success: false, message: "Report not found" });
		}

		res.status(200).json({
			success: true,
			message: "Report deleted successfully"
		});
	} catch (error) {
		console.error("Error in deleteReport:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
