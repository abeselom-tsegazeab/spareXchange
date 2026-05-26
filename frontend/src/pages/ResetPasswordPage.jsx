import { useState } from "react";
// import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'

import { Recycle, Eye, EyeOff, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const ResetPasswordPage = () => {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);
	const [formData, setFormData] = useState({
		password: '',
		confirmPassword: '',
	});

	const updateFormData = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};
	//============================ FOR THE FUTURE========================
	// remove this comment and add this variable to the 'reset password' button later in time
	// const passwordRequirements = [
	// 	{ text: 'At least 8 characters', met: formData.password.length >= 8 },
	// 	{ text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
	// 	{ text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
	// 	{ text: 'Contains number', met: /[0-9]/.test(formData.password) },
	// ];


	const { resetPassword } = useAuthStore();

	const { token } = useParams();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (formData.password.length < 8) {
			toast.error("Password must be at least 8 characters long");
			return;
		}

		try {
			console.log("Submitting password reset...");
			console.log("Token:", token);
			console.log("Password length:", formData.password.length);
			
			const result = await resetPassword(token, formData.password);
			
			console.log("Password reset successful:", result);
			toast.success("Password reset successfully! Redirecting to login...");
			setIsSuccess(true);
			setTimeout(() => {
				navigate("/login");
			}, 2000);
		} catch (error) {
			console.error("Password reset failed:", error);
			toast.error(error.response?.data?.message || "Error resetting password");
		}
	};

	// const passwordRequirements = [
	// 	{ text: 'At least 8 characters', met: formData.password.length >= 8 },
	// 	{ text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
	// 	{ text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
	// 	{ text: 'Contains number', met: /[0-9]/.test(formData.password) },
	// ];

	return (
		<div className="min-h-screen flex">
			{/* Left side - Image */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-green-600/90 to-green-900/90 z-10" />
				<img
					src="https://images.unsplash.com/photo-1766650189458-bb0e7969ba5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvJTIwcGFydHMlMjBtZWNoYW5pY2FsJTIwd29ya3Nob3B8ZW58MXx8fHwxNzc0MDI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
					alt="Reset Password"
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
						Create New Password
					</h2>
					<p className="text-xl text-green-50 max-w-md">
						Choose a strong password to keep your account secure and continue your auto parts journey.
					</p>
				</div>
			</div>

			{/* Right side - Form */}
			<div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-background text-black dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 dark:text-white">
				<div className="w-full max-w-md space-y-8">
					{/* Mobile Logo */}
					<div className="lg:hidden flex items-center gap-3 justify-center">
						<div className="bg-green-600 p-2 rounded-lg">
							<Recycle className="w-6 h-6 text-white" />
						</div>
						<h1 className="text-2xl">SpareXchange</h1>
					</div>
					{!isSuccess ?

						(
							<>
								{/* Header */}
								<div className="text-center lg:text-left">
									<h2 className="text-3xl mb-2">Reset Password</h2>
									<p className="text-muted-foreground">
										Enter your new password below
									</p>
								</div>
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="space-y-2">
										<Label htmlFor="password">New Password</Label>
										<div className="relative">
											<Input
												id="password"
												type={showPassword ? 'text' : 'password'}
												placeholder="••••••••"
												value={formData.password}
												onChange={(e) => updateFormData('password', e.target.value)}
												required
												className="bg-[var(--input-background)] border border-border pr-10"
											/>
											<Button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
											>
												{showPassword ? (
													<EyeOff className="w-5 h-5" />
												) : (
													<Eye className="w-5 h-5" />
												)}
											</Button>
										</div>
									</div>
									<div className="space-y-2">
										<Label htmlFor="confirmPassword">Confirm New Password</Label>
										<div className="relative">
											<Input
												id="confirmPassword"
												type={showConfirmPassword ? 'text' : 'password'}
												placeholder="••••••••"
												value={formData.confirmPassword}
												onChange={(e) => updateFormData('confirmPassword', e.target.value)}
												required
												className="bg-input-background border border-border pr-10 text-black"
											/>
											<Button
												type="button"
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
											>
												{showConfirmPassword ? (
													<EyeOff className="w-5 h-5" />
												) : (
													<Eye className="w-5 h-5" />
												)}
											</Button>
										</div>
									</div>
									{formData.confirmPassword && formData.password !== formData.confirmPassword && (
										<p className="text-sm text-[var(--destructive)]">Passwords do not match</p>
									)}

									{/*password strength checker*/}
									{formData.password &&
										<PasswordStrengthMeter password={formData.password} />
									}


									<Button
										type="submit"
										className="w-full bg-[var(--primary)] hover:bg-[#16a34a]/90"
										disabled={
											!formData.password ||
											formData.password !== formData.confirmPassword
										}
									>
										Reset Password
									</Button>



								</form>
							</>) :

						(<>
							{/* Success Message */}
							<div className="text-center space-y-6">
								<div className="flex justify-center">
									<div className="w-24 h-24 bg-[var(--secondary)] rounded-full flex items-center justify-center">
										<CheckCircle className="w-12 h-12 text-primary" />
									</div>
								</div>

								<div>
									<h2 className="text-3xl mb-2">Password Reset Successful!</h2>
									<p className="text-[var(--muted-foreground)]">
										Your password has been reset successfully. Redirecting you to signin...
									</p>
								</div>
								<div className=" border relative">
									<p className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1">or</p>
								</div>
								<>

									<div className="bg-[var(--secondary)] p-6 rounded-lg">
										<p className="text-sm text-[var(--foreground)]">
											If not redirected automatically use button bellow to go to login page.
										</p>
									</div>

									<Link to="/login">
										<Button className="w-full bg-[var(--primary)] hover:bg-[#16a34a]/90 mt-4">
											Continue to Login
										</Button>
									</Link>
								</>
							</div>
						</>)
					}

				</div>

			</div>



		</div>

	);
};
export default ResetPasswordPage;
