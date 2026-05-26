import express from "express";
import {
	login,
	logout,
	signup,
	verifyEmail,
	forgotPassword,
	resetPassword,
	checkAuth,
	requestRoleVerification,
	resendVerificationEmail,
	refreshToken,
	setupMFA,
	verifyMFA,
	validateMFALogin,
	googleLogin,
	verifyPassword
} from "../controllers/auth.controller.js";

const syncPermissions = (user) => {
	const defaultPerms = ["create_listings", "propose_exchanges"];
	if (user.role === "admin" && !user.permissions.includes("admin")) {
		user.permissions.push("admin");
	}
	// ... more logic as needed
};
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/resend-verification", verifyToken, resendVerificationEmail);

router.post("/reset-password/:token", resetPassword);
router.get("/refresh-token", refreshToken);
router.post("/request-verification", verifyToken, requestRoleVerification);

// MFA Routes
router.post("/mfa/setup", verifyToken, setupMFA);
router.post("/mfa/verify", verifyToken, verifyMFA);
router.post("/mfa/validate", validateMFALogin);

// OAuth2 Routes
router.post("/oauth/google", googleLogin);

// Password verification for sensitive operations
router.post("/verify-password", verifyToken, verifyPassword);

export default router;
