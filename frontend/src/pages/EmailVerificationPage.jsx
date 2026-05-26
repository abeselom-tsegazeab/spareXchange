import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { CheckCircle, Mail, Recycle } from "lucide-react";
import { Button } from "../components/ui/button";

const EmailVerificationPage = () => {
	const [isResending, setIsResending] = useState(false);
	const [resent, setResent] = useState(false);
	const [code, setCode] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const navigate = useNavigate();

	const { error, isLoading, verifyEmail, resendVerificationEmail } = useAuthStore();

	const handleResend = async () => {
		setIsResending(true);
		try {
			await resendVerificationEmail();
			setResent(true);
			toast.success("Verification email sent successfully!");
			setTimeout(() => setResent(false), 3000);
		} catch (error) {
			console.error("Error resending email:", error);
			toast.error(error.response?.data?.message || "Failed to resend verification email");
		} finally {
			setIsResending(false);
		}
	};
	const handleChange = (index, value) => {
		const newCode = [...code];

		// Handle pasted content
		if (value.length > 1) {
			const pastedCode = value.slice(0, 6).split("");
			for (let i = 0; i < 6; i++) {
				newCode[i] = pastedCode[i] || "";
			}
			setCode(newCode);

			// Focus on the last non-empty input or the first empty one
			const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
			const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
			inputRefs.current[focusIndex].focus();
		} else {
			newCode[index] = value;
			setCode(newCode);

			// Move focus to the next input field if value is entered
			if (value && index < 5) {
				inputRefs.current[index + 1].focus();
			}
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !code[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = code.join("");
		try {
			await verifyEmail(verificationCode);
			toast.success("Email verified successfully!");
			navigate("/dashboard");
		} catch (error) {
			console.log(error);
		}
	};

	// Auto submit when all fields are filled
	useEffect(() => {
		if (code.every((digit) => digit !== "")) {
			handleSubmit(new Event("submit"));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [code]);

	return (
		<>


			<div className="min-h-screen flex">
				{/* Left side - Image */}
				<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-green-600/90 to-green-900/90 z-10" />
					<img
						src="https://images.unsplash.com/photo-1766650189458-bb0e7969ba5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvJTIwcGFydHMlMjBtZWNoYW5pY2FsJTIwd29ya3Nob3B8ZW58MXx8fHwxNzc0MDI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
						alt="Email Verification"
						className="absolute inset-0 w-full h-full object-cover"
					/>
					<div className="relative z-20 flex flex-col justify-center items-start p-16 text-white">
						<div className="flex items-center gap-3 mb-12">
							<div className="bg-white p-3 rounded-xl">
								<Recycle className="w-8 h-8 text-green-600" />
							</div>
							<h1 className="text-4xl text-white">SpareXchange</h1>
						</div>
						<h2 className="text-5xl mb-6 leading-tight text-white">
							Almost There!
						</h2>
						<p className="text-xl text-green-50 max-w-md">
							Just one more step to join our community of buyers, sellers, and recyclers.
						</p>
					</div>
				</div>

				{/* Right side - Content */}
				<div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 dark:text-white">
					<div className="w-full max-w-md space-y-8">
						{/* Mobile Logo */}
						<div className="lg:hidden flex items-center gap-3 justify-center">
							<div className="bg-green-600 p-2 rounded-lg">
								<Recycle className="w-6 h-6 text-white" />
							</div>
							<h1 className="text-2xl">SpareXchange</h1>
						</div>

						{/* Icon */}
						<div className="flex justify-center">
							<div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center">
								<Mail className="w-12 h-12 text-primary" />
							</div>
						</div>

						{/* Header */}
						<div className="text-center">
							<h2 className="text-3xl mb-2">Verify Your Email</h2>
							<p className="text-muted-foreground">
								We've sent a verification link to your email
							</p>{
								// <p className="text-foreground mt-1">
								// 	john.doe@example.com
								// </p>
							}
						</div>

						{/* Instructions */}
						<div className="bg-secondary p-6 rounded-lg">
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
									<p className="text-sm text-foreground">
										Check your inbox for an email from SpareXchange
									</p>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
									<p className="text-sm text-foreground">
										Copy the 6-digit code from the email and enter it below
									</p>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
									<p className="text-sm text-foreground">
										You'll be redirected to your dashboard
									</p>
								</div>
							</div>
						</div>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<div className='flex justify-between'>
								{code.map((digit, index) => (
									<input
										key={index}
										ref={(el) => (inputRefs.current[index] = el)}
										type='text'
										maxLength='6'
										value={digit}
										onChange={(e) => handleChange(index, e.target.value)}
										onKeyDown={(e) => handleKeyDown(index, e)}
										className='w-12 h-12 text-center text-2xl font-bold bg-gray-200 text-black border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none'
									/>
								))}
							</div>
							{error && <p className='text-red-500 font-semibold mt-2'>{error}</p>}
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								type='submit'
								disabled={isLoading || code.some((digit) => !digit)}
								className='w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50'
							>
								{isLoading ? "Verifying..." : "Verify Email"}
							</motion.button>
						</form>

						{/* Resend Section */}
						<div className="text-center space-y-4">
							<p className="text-sm text-muted-foreground">
								Didn't receive the email?
							</p>
							<Button
								onClick={handleResend}
								disabled={isResending || resent}
								variant="outline"
								className="w-full"
							>
								{isResending ? 'Sending...' : resent ? 'Email Sent!' : 'Resend Verification Email'}
							</Button>
							{resent && (
								<p className="text-sm text-primary">
									Verification email sent successfully!
								</p>
							)}
						</div>

						{/* Note */}
						<div className="bg-muted p-4 rounded-lg">
							<p className="text-xs text-muted-foreground text-center">
								Make sure to check your spam folder if you don't see the email in your inbox.
								The verification link expires in 24 hours.
							</p>
						</div>

						{/* Back to Login Link */}
						<p className="text-center text-sm text-muted-foreground">
							<a href="/login" className="text-primary hover:underline">
								Back to Login
							</a>
						</p>
					</div>
				</div>
			</div>










		</>
	);
};
export default EmailVerificationPage;
