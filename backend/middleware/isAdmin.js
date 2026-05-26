import { User } from "../models/user.model.js";

export const isAdmin = async (req, res, next) => {
	try {
		const user = await User.findById(req.userId);
		if (user && user.userType === "admin") {
			next();
		} else {
			return res.status(403).json({ success: false, message: "Admin access required" });
		}
	} catch (error) {
		res.status(500).json({ success: false, message: "Authorization error" });
	}
};
