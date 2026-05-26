import bcryptjs from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { generateSecret, generateURI, verify, generate } from "otplib";
import qrcode from "qrcode";
import { OAuth2Client } from "google-auth-library";
import { encrypt, decrypt } from "../utils/encryption.js";

import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import {
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendVerificationEmail,
	sendWelcomeEmail,
} from "../mailtrap/emails.js";
import { User } from "../models/user.model.js";

export const signup = async (req, res) => {
	const { email, password, name, userType } = req.body;

	try {
		if (!email || !password || !name) {
			throw new Error("All fields are required");
		}

		// Strong Password Validation
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
		if (!passwordRegex.test(password)) {
			return res.status(400).json({
				success: false,
				message: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
			});
		}

		const userAlreadyExists = await User.findOne({ email });
		console.log("userAlreadyExists", userAlreadyExists);

		if (userAlreadyExists) {
			return res.status(400).json({ success: false, message: "User already exists" });
		}

		const hashedPassword = await bcryptjs.hash(password, 10);
		// Secure Random Verification Token (6 digits)
		const verificationToken = crypto.randomInt(100000, 999999).toString();

		const userTypeMapping = {
			user: "individual",
			business: "repair-shop",
			recycler: "recycler",
		};
		const normalizedUserType = userTypeMapping[userType] || userType || "individual";

		// Assign default permissions based on user type
		const basePermissions = ["create_listings", "propose_exchanges"];
		if (normalizedUserType === "garage" || normalizedUserType === "recycler" || normalizedUserType === "repair-shop") {
			basePermissions.push("create_bulk_listings");
		}

		// Admin users are auto-verified and get full admin permissions
		const isAdminUser = normalizedUserType === "admin";
		const finalPermissions = isAdminUser
			? ["admin", "view_stats", "view_reports", "moderate_content", "run_jobs"]
			: basePermissions;

		const user = new User({
			email,
			password: hashedPassword,
			name,
			userType: normalizedUserType,
			isVerified: isAdminUser, // Auto-verify admin users
			verificationToken: isAdminUser ? undefined : verificationToken,
			verificationTokenExpiresAt: isAdminUser ? undefined : Date.now() + 24 * 60 * 60 * 1000, // 24 hours
			permissions: finalPermissions
		});

		await user.save();

		// jwt
		const { accessToken, refreshToken } = generateTokenAndSetCookie(res, user._id, true);
		user.refreshToken = refreshToken;
		await user.save();

		// Send verification email only for non-admin users
		let emailSent = false;
		if (!isAdminUser) {
			try {
				emailSent = await sendVerificationEmail(user.email, verificationToken);
			} catch (err) {
				console.error("Verification email failed", err);
			}
		}

		const responseMessage = isAdminUser
			? "Admin account created successfully"
			: emailSent
				? "User created successfully"
				: "User created successfully (verification email failed; please re-send verification email from your profile)";

		res.status(201).json({
			success: true,
			message: responseMessage,
			accessToken,
			user: {
				...user._doc,
				password: undefined,
				refreshToken: undefined,
			},
		});
	} catch (error) {
		res.status(400).json({ success: false, message: error.message });
	}
};

export const verifyEmail = async (req, res) => {
	const { code } = req.body;
	try {
		const user = await User.findOne({
			verificationToken: code,
			verificationTokenExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({ success: false, message: "Invalid or expired verification code" });
		}

		user.isVerified = true;
		user.verificationToken = undefined;
		user.verificationTokenExpiresAt = undefined;

		// Grant send_notifications permission to verified users
		if (!user.permissions.includes("send_notifications")) {
			user.permissions.push("send_notifications");
		}

		await user.save();

		try {
			await sendWelcomeEmail(user.email, user.name);
		} catch (err) {
			console.error("Welcome email failed: ", err);
		}

		res.status(200).json({
			success: true,
			message: "Email verified successfully",
			user: {
				...user._doc,
				password: undefined,
			},
		});
	} catch (error) {
		console.log("error in verifyEmail ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const login = async (req, res) => {
	const { email, password, rememberMe } = req.body;
	try {
		const user = await User.findOne({ email });
		if (!user || user.isActive === false) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}
		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(400).json({ success: false, message: "Invalid credentials" });
		}

		if (user.isBanned) {
			return res.status(403).json({ success: false, message: "Your account has been suspended. Please contact support." });
		}

		user.rememberMe = rememberMe !== undefined ? !!rememberMe : true;
		user.lastLogin = new Date();
		await user.save();

		if (user.isMfaEnabled) {
			return res.status(200).json({
				success: true,
				mfaRequired: true,
				message: "MFA verification required",
				email: user.email // Client will use this for validateMFALogin
			});
		}

		const { accessToken, refreshToken } = generateTokenAndSetCookie(res, user._id, user.rememberMe);
		user.refreshToken = refreshToken;
		await user.save();

		res.status(200).json({
			success: true,
			message: "Logged in successfully",
			accessToken,
			user: {
				...user._doc,
				password: undefined,
				refreshToken: undefined,
			},
		});
	} catch (error) {
		console.log("Error in login ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const logout = async (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (refreshToken) {
		const user = await User.findOne({ refreshToken });
		if (user) {
			user.refreshToken = undefined;
			await user.save();
		}
	}
	res.clearCookie("token");
	res.clearCookie("refreshToken");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		// Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

		// send email
		await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);

		res.status(200).json({ success: true, message: "Password reset link sent to your email" });
	} catch (error) {
		console.log("Error in forgotPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		console.log("Reset Password Request:");
		console.log("Token:", token);
		console.log("Password received:", password ? "Yes" : "No");

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			console.log("Invalid or expired token - User not found or token expired");
			return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

		console.log("User found:", user.email);
		console.log("Updating password for user:", user._id);

		// update password
		const hashedPassword = await bcryptjs.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		console.log("Password updated successfully for user:", user.email);

		try {
			await sendResetSuccessEmail(user.email);
			console.log("Success email sent");
		} catch (err) {
			console.error("Reset success email failed: ", err);
		}

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		if (user.isBanned) {
			return res.status(403).json({ success: false, message: "Account suspended" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};

export const requestRoleVerification = async (req, res) => {
	try {
		const { userType, expertise, documents } = req.body;
		const user = await User.findById(req.userId);

		if (!user) return res.status(404).json({ success: false, message: "User not found" });

		// Update user fields for review
		user.userType = userType || user.userType; // 'garage', 'repair-shop', 'recycler', or 'technician' (expertise only)
		if (expertise) user.expertise = expertise;
		if (documents && Array.isArray(documents)) {
			user.verificationDocs = documents;
		}

		user.roleStatus = "pending";
		await user.save();

		res.status(200).json({
			success: true,
			message: "Verification request submitted successfully. An admin will review it soon.",
			user
		});
	} catch (error) {
		console.log("Error in requestRoleVerification ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const resendVerificationEmail = async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		if (!user) return res.status(404).json({ success: false, message: "User not found" });
		if (user.isVerified) {
			return res.status(400).json({ success: false, message: "Email already verified" });
		}

		const verificationToken = crypto.randomInt(100000, 999999).toString();
		user.verificationToken = verificationToken;
		user.verificationTokenExpiresAt = Date.now() + 24 * 60 * 60 * 1000;
		await user.save();

		await sendVerificationEmail(user.email, verificationToken);

		res.status(200).json({ success: true, message: "Verification email resent successfully" });
	} catch (error) {
		console.error("Error resending verification email:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const refreshToken = async (req, res) => {
	const cookieRefreshToken = req.cookies.refreshToken;

	if (!cookieRefreshToken) {
		return res.status(401).json({ success: false, message: "Refresh token not found - please login again" });
	}

	try {
		const decoded = jwt.verify(cookieRefreshToken, process.env.JWT_REFRESH_SECRET || "refresh_secret_123");
		const user = await User.findById(decoded.userId);

		// If user doesn't exist or refresh token doesn't match (already logged out), reject
		if (!user) {
			res.clearCookie("token");
			res.clearCookie("refreshToken");
			return res.status(401).json({ success: false, message: "User not found - please login again" });
		}

		if (user.refreshToken !== cookieRefreshToken) {
			// Refresh token was invalidated (e.g., user logged out)
			res.clearCookie("token");
			res.clearCookie("refreshToken");
			return res.status(401).json({ success: false, message: "Session expired - please login again" });
		}

		// Generate new pair
		const { accessToken, refreshToken: newRefreshToken } = generateTokenAndSetCookie(res, user._id, user.rememberMe);

		user.refreshToken = newRefreshToken;
		await user.save();

		res.status(200).json({ success: true, accessToken, user: { ...user._doc, password: undefined, refreshToken: undefined } });
	} catch (error) {
		console.log("Error in refreshToken ", error);
		res.clearCookie("token");
		res.clearCookie("refreshToken");
		res.status(401).json({ success: false, message: "Invalid or expired refresh token - please login again" });
	}
};

// --- MFA Logic ---

export const setupMFA = async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		if (!user) return res.status(404).json({ success: false, message: "User not found" });

		const secret = generateSecret();
		const otpauth = generateURI({ label: user.email, issuer: "SpareXChange", secret });
		const qrCodeUrl = await qrcode.toDataURL(otpauth);

		// Store encrypted secret
		user.mfaSecret = encrypt(secret);
		await user.save();

		const backupCodes = Array.from({ length: 5 }, () => crypto.randomBytes(4).toString("hex"));
		user.mfaBackupCodes = backupOfBackupCodes(backupCodes); // We'll hash these if we were ultra-secure

		res.status(200).json({
			success: true,
			qrCodeUrl,
			secret,
			backupCodes
		});
	} catch (error) {
		console.error("Error in setupMFA:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

function backupOfBackupCodes(codes) {
	// Simple storage for now, ideally hashed
	return codes;
}

export const verifyMFA = async (req, res) => {
	try {
		const { code } = req.body;
		const user = await User.findById(req.userId);
		if (!user || !user.mfaSecret) {
			return res.status(400).json({ success: false, message: "MFA setup not initiated" });
		}

		const decryptedSecret = decrypt(user.mfaSecret);
		const isValid = verify({ token: code, secret: decryptedSecret });
		if (!isValid) {
			return res.status(400).json({ success: false, message: "Invalid verification code" });
		}

		user.isMfaEnabled = true;
		await user.save();

		res.status(200).json({ success: true, message: "MFA enabled successfully" });
	} catch (error) {
		console.error("Error in verifyMFA:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const validateMFALogin = async (req, res) => {
	try {
		const { email, code } = req.body;
		const user = await User.findOne({ email });

		if (!user || !user.isMfaEnabled) {
			return res.status(400).json({ success: false, message: "MFA not enabled or user not found" });
		}

		const decryptedSecret = decrypt(user.mfaSecret);
		const isValid = verify({ token: code, secret: decryptedSecret });
		const isBackupUsed = !isValid && user.mfaBackupCodes.includes(code);

		if (!isValid && !isBackupUsed) {
			return res.status(400).json({ success: false, message: "Invalid MFA code" });
		}

		if (isBackupUsed) {
			user.mfaBackupCodes = user.mfaBackupCodes.filter(c => c !== code);
			await user.save();
		}

		// Success -> issue tokens
		const { accessToken, refreshToken } = generateTokenAndSetCookie(res, user._id, user.rememberMe);
		user.refreshToken = refreshToken;
		await user.save();

		res.status(200).json({
			success: true,
			accessToken,
			user: { ...user._doc, password: undefined, refreshToken: undefined, mfaSecret: undefined }
		});
	} catch (error) {
		console.error("Error in validateMFALogin:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

// --- Real Google OAuth2 Implementation ---
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
	try {
		const { credential, rememberMe } = req.body;
		if (!credential) return res.status(400).json({ success: false, message: "Google ID Token (credential) is required" });

		// Verify the ID Token from Google
		const ticket = await client.verifyIdToken({
			idToken: credential,
			audience: process.env.GOOGLE_CLIENT_ID,
		});

		const payload = ticket.getPayload();
		const { email, name, picture, sub: googleId } = payload;

		if (!email) return res.status(400).json({ success: false, message: "Email not provided by Google" });

		let user = await User.findOne({ email });

		const isNewUser = !user;
		if (isNewUser) {
			// SIGNUP: Create new user if they don't exist
			const randomPassword = crypto.randomBytes(16).toString("hex") + "A1!";
			user = new User({
				email,
				name,
				profilePicture: picture,
				isVerified: true, // Social accounts are pre-verified
				password: await bcryptjs.hash(randomPassword, 10), 
				permissions: ["create_listings", "propose_exchanges"],
				authProvider: "google",
				googleId: googleId
			});
			await user.save();
			console.log(`New user signed up via Google: ${email}`);
		} else {
			// LOGIN: Link Google ID if not already linked (optional security enhancement)
			if (!user.googleId) {
				user.googleId = googleId;
			}
			console.log(`User logged in via Google: ${email}`);
		}

		if (user.isBanned) return res.status(403).json({ success: false, message: "Account suspended" });

		user.rememberMe = rememberMe !== undefined ? !!rememberMe : true;
		const { accessToken, refreshToken } = generateTokenAndSetCookie(res, user._id, user.rememberMe);
		user.refreshToken = refreshToken;
		user.lastLogin = new Date();
		await user.save();

		res.status(200).json({
			success: true,
			message: isNewUser ? "Signed up successfully via Google" : "Logged in successfully via Google",
			accessToken,
			user: {
				...user._doc,
				password: undefined,
				refreshToken: undefined
			}
		});
	} catch (error) {
		console.error("Error in googleLogin:", error);
		res.status(401).json({ success: false, message: "Invalid Google token or verification failed" });
	}
};

// Verify admin password (for sensitive operations)
export const verifyPassword = async (req, res) => {
	try {
		const { password } = req.body;
		
		if (!password) {
			return res.status(400).json({ success: false, message: "Password is required" });
		}

		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({ success: false, message: "User not found" });
		}

		const isPasswordValid = await bcryptjs.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ success: false, message: "Incorrect password" });
		}

		res.status(200).json({ success: true, message: "Password verified" });
	} catch (error) {
		console.error("Error in verifyPassword:", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
