import {
	PASSWORD_RESET_REQUEST_TEMPLATE,
	PASSWORD_RESET_SUCCESS_TEMPLATE,
	VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { sendEmail } from "./nodemailer.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
	try {
		const subject = "Verify your email";
		const html = VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken);

		const result = await sendEmail(email, subject, html);

		if (result) {
			console.log("Verification email sent successfully");
			return result;
		} else {
			throw new Error("Failed to send verification email");
		}
	} catch (error) {
		console.error(`Error sending verification`, error);
		throw new Error(`Error sending verification email: ${error}`);
	}
};

export const sendWelcomeEmail = async (email, name) => {
	try {
		const subject = "Welcome to our app!";
		const html = `<p>Hi ${name},</p><p>Welcome to our app! We're excited to have you on board.</p>`;

		const result = await sendEmail(email, subject, html);

		if (result) {
			console.log("Welcome email sent successfully");
			return result;
		} else {
			throw new Error("Failed to send welcome email");
		}
	} catch (error) {
		console.error(`Error sending welcome email`, error);
		throw new Error(`Error sending welcome email: ${error}`);
	}
};

export const sendPasswordResetEmail = async (email, resetURL) => {
	try {
		const subject = "Reset your password";
		const html = PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL);

		const result = await sendEmail(email, subject, html);

		if (result) {
			console.log("Password reset email sent successfully");
			return result;
		} else {
			throw new Error("Failed to send password reset email");
		}
	} catch (error) {
		console.error(`Error sending password reset email`, error);
		throw new Error(`Error sending password reset email: ${error}`);
	}
};

export const sendResetSuccessEmail = async (email) => {
	try {
		const subject = "Password Reset Successful";
		const html = PASSWORD_RESET_SUCCESS_TEMPLATE;

		const result = await sendEmail(email, subject, html);

		if (result) {
			console.log("Password reset success email sent successfully");
			return result;
		} else {
			throw new Error("Failed to send password reset success email");
		}
	} catch (error) {
		console.error(`Error sending password reset success email`, error);
		throw new Error(`Error sending password reset success email: ${error}`);
	}
};
