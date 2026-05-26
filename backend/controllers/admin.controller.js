import { User } from "../models/user.model.js";
import { Listing } from "../models/listing.model.js";
import { Exchange } from "../models/exchange.model.js";
import { emitToUser } from "../utils/socket.js";
import { processSavedSearchAlerts } from "../services/savedSearchAlerts.service.js";

// Get all users (Admin only)
export const getAllUsers = async (req, res) => {
	try {
		const { userType, isBanned, isActive, search } = req.query;
		const query = { isActive: isActive !== "false" };
		
		if (userType) query.userType = userType;
		if (isBanned) query.isBanned = isBanned === "true";
		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: "i" } },
				{ email: { $regex: search, $options: "i" } }
			];
		}

		const users = await User.find(query).select("-password");
		res.status(200).json({ success: true, count: users.length, users });
	} catch (error) {
		console.error("Error in getAllUsers:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Toggle Ban Status
export const toggleUserBan = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		
		if (!user) return res.status(404).json({ success: false, message: "User not found" });
		if (user.userType === "admin") return res.status(403).json({ success: false, message: "Cannot ban an admin" });

		user.isBanned = !user.isBanned;
		await user.save();

		res.status(200).json({ success: true, message: `User ${user.isBanned ? "banned" : "unbanned"}`, isBanned: user.isBanned });
	} catch (error) {
		console.error("Error in toggleUserBan:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Delete user (Admin only)
export const deleteUser = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}
		
		if (user.userType === "admin") {
			return res.status(403).json({ success: false, message: "Cannot delete an admin account" });
		}

		// Soft delete: mark as inactive instead of hard delete
		user.isActive = false;
		user.email = `${user.email}_deleted_${Date.now()}`; // Free up email
		await user.save();

		res.status(200).json({ 
			success: true, 
			message: `User ${user.name} has been deleted`,
			userId: id
		});
	} catch (error) {
		console.error("Error in deleteUser:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Make user an admin (Admin only)
export const makeUserAdmin = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}
		
		if (user.userType === "admin") {
			return res.status(400).json({ success: false, message: "User is already an admin" });
		}

		// Store previous user type for logging
		const previousType = user.userType;
		const userName = user.name;
		
		// Update user to admin
		user.userType = "admin";
		user.roleStatus = "verified"; // Auto-verify admin role
		
		// Add admin permissions if not already present
		const adminPermissions = ["admin", "view_stats", "view_reports", "view_users", "ban_users", "verify_roles", "moderate_content", "run_jobs"];
		adminPermissions.forEach(perm => {
			if (!user.permissions.includes(perm)) {
				user.permissions.push(perm);
			}
		});
		
		await user.save();

		// Notify the user about promotion (non-critical, don't fail if this fails)
		try {
			if (emitToUser && typeof emitToUser === 'function') {
				emitToUser(id, 'admin_promotion', {
					message: `Congratulations! You have been promoted to admin from ${previousType}.`,
					promotedBy: req.userId,
					timestamp: new Date().toISOString()
				});
				console.log(`Notification sent to user ${id} about admin promotion`);
			}
		} catch (notifyError) {
			console.error('Failed to notify user about promotion (non-critical):', notifyError.message);
		}

		res.status(200).json({ 
			success: true, 
			message: `User ${userName} has been promoted to admin`,
			userId: id,
			previousType,
			newType: "admin"
		});
	} catch (error) {
		console.error("Error in makeUserAdmin:", error);
		console.error("Error details:", error.message);
		res.status(500).json({ success: false, message: "Server error", error: error.message });
	}
};

// Remove admin privileges from user (Admin only)
export const removeUserAdmin = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}
		
		if (user.userType !== "admin") {
			return res.status(400).json({ success: false, message: "User is not an admin" });
		}

		// Prevent self-demotion
		if (id === req.userId) {
			return res.status(403).json({ success: false, message: "You cannot remove your own admin privileges" });
		}

		// Store user info before update
		const userName = user.name;

		// Update user to regular user (default to "individual" type)
		user.userType = "individual";
		user.roleStatus = "pending"; // Reset role status
		
		// Remove admin permissions
		const adminPermissions = ["admin", "view_stats", "view_reports", "view_users", "ban_users", "verify_roles", "moderate_content", "run_jobs"];
		user.permissions = user.permissions.filter(perm => !adminPermissions.includes(perm));
		
		// Add default user permissions
		const defaultPerms = ["create_listings", "propose_exchanges"];
		defaultPerms.forEach(perm => {
			if (!user.permissions.includes(perm)) {
				user.permissions.push(perm);
			}
		});
		
		await user.save();

		// Notify the user about demotion (non-critical, don't fail if this fails)
		try {
			if (emitToUser && typeof emitToUser === 'function') {
				emitToUser(id, 'admin_demotion', {
					message: `Your admin privileges have been revoked by a senior administrator.`,
					demotedBy: req.userId,
					timestamp: new Date().toISOString()
				});
				console.log(`Notification sent to user ${id} about admin demotion`);
			}
		} catch (notifyError) {
			console.error('Failed to notify user about demotion (non-critical):', notifyError.message);
		}

		res.status(200).json({ 
			success: true, 
			message: `Admin privileges removed from ${userName}`,
			userId: id,
			previousType: "admin",
			newType: "individual"
		});
	} catch (error) {
		console.error("Error in removeUserAdmin:", error);
		console.error("Error details:", error.message);
		console.error("Error stack:", error.stack);
		res.status(500).json({ success: false, message: "Server error", error: error.message });
	}
};

// Verify User/Technician Role
export const verifyRoleStatus = async (req, res) => {
	try {
		const { id } = req.params;
		const { status, note } = req.body; // verified, rejected

		const user = await User.findById(id);
		if (!user) return res.status(404).json({ success: false, message: "User not found" });

		user.roleStatus = status;
		
		// Always update verification note - set to empty string if not provided
		// This ensures fresh message on each rejection
		user.verificationNote = note ? note.trim() : "";
		
		if (status === "verified") {
			user.verifiedSeller = true; // Automatically make them a verified seller too
			
			// Grant permissions based on userType
			const permsToAdd = [];
			if (user.userType === "technician") permsToAdd.push("receive_service_requests");
			if (user.userType === "recycler") permsToAdd.push("receive_pickup_requests");
			if (user.userType === "garage") permsToAdd.push("create_bulk_listings");
			
			// Grant send_notifications permission to all verified users
			if (!user.permissions.includes("send_notifications")) {
				permsToAdd.push("send_notifications");
			}

			permsToAdd.forEach(p => {
				if (!user.permissions.includes(p)) user.permissions.push(p);
			});
			
			// Send welcome notification for verified users
			emitToUser(id, "role_verified", {
				status,
				userType: user.userType,
				note: "",
				message: `Congratulations! Your request for ${user.userType} status has been approved. Welcome to the ${user.userType} community! You now have access to exclusive features and benefits.`
			});
		} else if (status === "rejected") {
			// Send rejection notification with fresh note
			emitToUser(id, "role_verified", {
				status,
				userType: user.userType,
				note: user.verificationNote,
				message: `Your request for ${user.userType} status has been declined.${user.verificationNote ? ` Reason: ${user.verificationNote}` : ' Please review the requirements and try again.'}`
			});
		}
		
		// Save user to database
		await user.save();
		
		res.status(200).json({ 
			success: true, 
			message: `Role status updated to ${status}`, 
			user,
			note: note || ""
		});
	} catch (error) {
		console.error("Error in verifyRoleStatus:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Verify User Email (Admin can verify users directly)
export const verifyUserEmail = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await User.findById(id);
		
		if (!user) return res.status(404).json({ success: false, message: "User not found" });
		
		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;
		
		// Grant send_notifications permission to verified users
		if (!user.permissions.includes("send_notifications")) {
			user.permissions.push("send_notifications");
		}
		
		await user.save();
		
		res.status(200).json({ 
			success: true, 
			message: "User email verified successfully",
			user: { ...user._doc, password: undefined }
		});
	} catch (error) {
		console.error("Error in verifyUserEmail:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get Pending Verifications
export const getPendingVerifications = async (req, res) => {
	try {
		const pendingUsers = await User.find({ roleStatus: "pending" }).select("name email userType verificationDocs createdAt");
		res.status(200).json({ success: true, count: pendingUsers.length, users: pendingUsers });
	} catch (error) {
		console.error("Error in getPendingVerifications:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Get Platform Statistics
export const getPlatformStats = async (req, res) => {
	try {
		const totalUsers = await User.countDocuments();
		const totalListings = await Listing.countDocuments();
		const totalExchanges = await Exchange.countDocuments({ status: "fully_completed" });
		
		const usersByType = await User.aggregate([
			{ $group: { _id: "$userType", count: { $sum: 1 } } }
		]);

		res.status(200).json({
			success: true,
			stats: {
				totalUsers,
				totalListings,
				totalExchanges,
				usersByType
			}
		});
	} catch (error) {
		console.error("Error in getPlatformStats:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// Run saved-search alert processing on demand (Admin)
export const runSavedSearchAlertsJob = async (req, res) => {
	try {
		const { limitSearches, limitListingsPerSearch } = req.body || {};
		const result = await processSavedSearchAlerts({
			limitSearches: Number.isFinite(Number(limitSearches)) ? Number(limitSearches) : 200,
			limitListingsPerSearch: Number.isFinite(Number(limitListingsPerSearch)) ? Number(limitListingsPerSearch) : 5,
		});

		res.status(200).json({
			success: true,
			message: "Saved-search alerts job executed.",
			result,
		});
	} catch (error) {
		console.error("Error in runSavedSearchAlertsJob:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
