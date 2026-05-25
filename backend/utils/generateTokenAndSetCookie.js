import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (res, userId, rememberMe = true) => {
	const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: "15m",
	});

	const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET || "refresh_secret_123", {
		expiresIn: rememberMe ? "7d" : "15m",
	});

	// Set Access Token Cookie
	const tokenOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	};

	if (rememberMe) {
		tokenOptions.maxAge = 15 * 60 * 1000; // 15 minutes
	}

	res.cookie("token", accessToken, tokenOptions);

	// Set Refresh Token Cookie
	const refreshTokenOptions = {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "strict",
	};

	if (rememberMe) {
		refreshTokenOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
	}

	res.cookie("refreshToken", refreshToken, refreshTokenOptions);

	return { accessToken, refreshToken };
};
