import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
	const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
	if (!token) return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });

		req.userId = decoded.userId;
		next();
	} catch (error) {
		console.log("Error in verifyToken ", error);
		if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
			return res.status(401).json({ success: false, message: "Unauthorized - invalid or expired token" });
		}
		return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
	}
};

// Optional token verification - doesn't fail if no token
export const verifyTokenOptional = (req, res, next) => {
	const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
	if (!token) {
		// No token, continue without setting userId
		return next();
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		if (decoded) {
			req.userId = decoded.userId;
		}
	} catch (error) {
		// Invalid token, continue without setting userId
		console.log("Optional token verification failed:", error.message);
	}
	next();
};
