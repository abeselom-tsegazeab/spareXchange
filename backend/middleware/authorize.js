import { User } from "../models/user.model.js";

export const authorize = (requiredPermissions) => {
	return async (req, res, next) => {
		try {
			const user = await User.findById(req.userId);
			if (!user) {
				return res.status(401).json({ success: false, message: "User not found" });
			}

			if (user.isBanned) {
				return res.status(403).json({ success: false, message: "Account suspended" });
			}

			// Admin bypass or specific permission check
			const hasPermission = user.permissions.includes("admin") || 
								 requiredPermissions.some(p => user.permissions.includes(p));

			if (!hasPermission) {
				return res.status(403).json({ 
					success: false, 
					message: "Access Denied: You do not have the required permissions." 
				});
			}

			next();
		} catch (error) {
			console.error("Error in authorize middleware:", error);
			res.status(500).json({ success: false, message: "Server error" });
		}
	};
};
