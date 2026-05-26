// import { motion } from "framer-motion";
// import Input from "../components/Input";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Recycle, Eye, EyeOff,Loader } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const SignUpPage = () => {
	const { darkMode } = useTheme();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		password: "",
		confirmPassword: "",
		accountType: "user",
		agreeToTerms: false,
	});

	//============================ FOR THE FUTURE========================
	// remove this comment and add this variable to the 'Create Account' button later in time
	// const passwordRequirements = [
	// 	{ text: 'At least 8 characters', met: formData.password.length >= 8 },
	// 	{ text: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
	// 	{ text: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
	// 	{ text: 'Contains number', met: /[0-9]/.test(formData.password) },
	// ];
	const navigate = useNavigate();

	const { signup, error, isLoading } = useAuthStore();

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	const handleSignUp = async (e) => {
		e.preventDefault();

		if (formData.password !== formData.confirmPassword) {
			toast.error("Passwords do not match");
			return;
		}

		if (!formData.agreeToTerms) {
			toast.error("Please agree to the Terms of Service and Privacy Policy");
			return;
		}

		try {
			await signup(formData.email, formData.password, formData.fullName, formData.accountType);
			toast.success("Account created successfully! Please verify your email.");
			navigate("/verify-email");
		} catch (error) {
			console.log(error);
		}
	};
	const updateFormData = (field, value) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};
	return (
		<section className={`min-h-screen flex ${darkMode ? 'bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white' : 'bg-white text-gray-900'}`}>
			{/* Left side - Image */}
			<section className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${darkMode ? '' : 'bg-gradient-to-br from-gray-100 via-green-50 to-emerald-50'}`}>
				<div className="absolute inset-0 bg-gradient-to-br from-green-600/90 to-green-900/90 z-10" />
				<img
					src="https://images.unsplash.com/photo-1766650189458-bb0e7969ba5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvJTIwcGFydHMlMjBtZWNoYW5pY2FsJTIwd29ya3Nob3B8ZW58MXx8fHwxNzc0MDI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
					alt="Auto Parts Workshop"
					className="absolute inset-0 w-full h-full object-cover"
				/>

				<div className="relative z-20 flex flex-col justify-center items-start p-16 text-white">

					<div className="flex items-center gap-3 mb-12">
						<div className="bg-white p-3 rounded-xl">
							<Recycle className="w-8 h-8 text-green-600" />
						</div>
						<h1 className="text-4xl text-white">
							SpareXchange
						</h1>
					</div>

					<h2 className="text-5xl mb-6 leading-tight text-white">
						Join Our Community
					</h2>

					<p className="text-xl text-green-50 max-w-md mb-8">
						"Whether you're an individual, repair shop, garage,
						or recycling center - find and exchange spare parts
						with ease."
					</p>

					<div className="space-y-4">
						<div className="flex items-start gap-3">
							<div className="bg-green-500 rounded-full p-1 mt-1">
								<svg
									className="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<div>
								<h3 className="text-white mb-1">
									Search & Exchange Parts
								</h3>
								<p className="text-green-100 text-sm">
									Find exactly what you need from verified
									sellers
								</p>
							</div>
						</div>

						<div className="flex items-start gap-3">
							<div className="bg-green-500 rounded-full p-1 mt-1">
								<svg
									className="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<div>
								<h3 className="text-white mb-1">
									Secure Transactions
								</h3>
								<p className="text-green-100 text-sm">
									Safe and reliable platform for all users
								</p>
							</div>
						</div>
						<div className="flex items-start gap-3">
							<div className="bg-green-500 rounded-full p-1 mt-1">
								<svg
									className="w-4 h-4 text-white"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							</div>
							<div>
								<h3 className="text-white mb-1">
									Cross-Platform Access
								</h3>
								<p className="text-green-100 text-sm">
									Available on web and mobile devices
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>


			{/* Right side - Form */}

			<section className={`w-full lg:w-1/2 flex items-center justify-center p-8 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white' : 'bg-white text-gray-900'}`}>
				<div className="w-full max-w-md space-y-6">
					{/* Mobile Logo */}
					<article className="lg:hidden flex items-center gap-3 justify-center">
						<div className="bg-green-600 p-2 rounded-lg">
							<Recycle className="w-6 h-6 text-white" />
						</div>
						<h1 className="text-2xl">SpareXchange</h1>
					</article>

					{/* Header */}
					<header className="text-center lg:text-left">
						<h2 className="text-3xl mb-2">Create Account</h2>
						<p className="text-muted-foreground">
							Get started with SpareXchange today
						</p>
					</header>

					{/* Form */}
					<form onSubmit={handleSignUp} className="space-y-5">
						<div className="space-y-2">
							<Label htmlFor="fullName">Full Name</Label>
							<Input
								id="fullName"
								type="text"
								placeholder="Abebe Kebede"
								value={formData.fullName}
								onChange={(e) =>
									updateFormData("fullName", e.target.value)
								}
								required
								className="bg-input-background border border-border"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="abebekebede@example.com"
								value={formData.email}
								onChange={(e) =>
									updateFormData("email", e.target.value)
								}
								required
								className="bg-input-background border border-border"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									value={formData.password}
									onChange={(e) =>
										updateFormData("password", e.target.value)
									}
									required
									className="bg-input-background border border-border pr-10"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="confirmPassword">
								Confirm Password
							</Label>
							<div className="relative">
								<Input
									id="confirmPassword"
									type={
										showConfirmPassword ? "text" : "password"
									}
									placeholder="••••••••"
									value={formData.confirmPassword}
									onChange={(e) =>
										updateFormData(
											"confirmPassword",
											e.target.value,
										)
									}
									required
									className="bg-input-background border border-border pr-10"
								/>
								<button
									type="button"
									onClick={() =>
										setShowConfirmPassword(!showConfirmPassword)
									}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								>
									{showConfirmPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>
						{formData.password &&
							<PasswordStrengthMeter password={formData.password} />
						}

						<div className="space-y-2">
							<Label>Account Type</Label>
							<div className="grid grid-cols-2 gap-3">
								<button
									type="button"
									onClick={() =>
										updateFormData("accountType", "user")
									}
									className={`p-4 border rounded-lg transition-all ${formData.accountType === "user"
										? "border-primary bg-secondary text-black dark:text-black dark:bg-secondary]"
										: "border-border hover:border-primary/50"
										}`}
								>
									<div className="text-sm">User</div>
								</button>
								<button
									type="button"
									onClick={() =>
										updateFormData("accountType", "business")
									}
									className={`p-4 border rounded-lg transition-all ${formData.accountType === "business"
										? "border-primary bg-secondary text-black dark:text-black dark:bg-secondary]"
										: "border-border hover:border-primary/50"
										}`}
								>
									<div className="text-sm">Business</div>
								</button>
								<button
									type="button"
									onClick={() => {
										updateFormData("accountType", "recycler")
										console.log('recycler')
									}
									}
									className={`p-4 border rounded-lg transition-all ${formData.accountType === "recycler"
										? "border-primary bg-secondary text-black dark:text-black dark:bg-secondary]"
										: "border-border hover:border-primary/50"
										}`}
								>
									<div className="text-sm">Recycler</div>
								</button>
							</div>
						</div>

						<div className="flex items-start space-x-2">
							<Checkbox
								id="terms"
								checked={formData.agreeToTerms}
								onCheckedChange={(checked) =>
									updateFormData(
										"agreeToTerms",
										checked,
									)
								}
								required
								className="color-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10 border-[var(--primary)] focus:ring-[var(--primary)]"
							/>
							<label
								htmlFor="terms"
								className="text-sm text-muted-foreground cursor-pointer leading-relaxed"
							>
								I agree to the{" "}
								<Link
									to="/terms"
									className="text-primary hover:underline"
								>
									Terms of Service
								</Link>{" "}
								and{" "}
								<Link
									to="/privacy"
									className="text-primary hover:underline"
								>
									Privacy Policy
								</Link>
							</label>
						</div>

						<Button
							type="submit"
							className="w-full bg-primary hover:bg-primary/90"
							disabled={
								!formData.password ||
								formData.password !== formData.confirmPassword
							}
						>
							{isLoading ? (
								<Loader className='w-6 h-6 animate-spin mx-auto' />
							) : (
								"Create Account"
							)}
						</Button>
					</form>

				</div>
			</section>
		</section>



	);
};
export default SignUpPage;
