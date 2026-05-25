import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import Input from "../components/Input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Mail } from "lucide-react";
import { Recycle, Loader, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const ForgotPasswordPage = () => {
	const [email, setEmail] = useState("");
	const [isSubmitted, setIsSubmitted] = useState(false);

	const { isLoading, forgotPassword, error, message } = useAuthStore();

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
		if (message && !isSubmitted) {
			toast.success(message);
		}
	}, [error, message, isSubmitted]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await forgotPassword(email);
			setIsSubmitted(true);
		} catch (error) {
			console.error("Error sending reset email:", error);
		}
	};

	return (
		<div className="min-h-screen flex">
			{/* Left side - Image */}
			<div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-green-600/90 to-green-900/90 z-10" />
				<img
					src="https://images.unsplash.com/photo-1766650189458-bb0e7969ba5d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXRvJTIwcGFydHMlMjBtZWNoYW5pY2FsJTIwd29ya3Nob3B8ZW58MXx8fHwxNzc0MDI1NDUyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
					alt="Forgot Password"
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
						Don't Worry
					</h2>
					<p className="text-xl text-green-50 max-w-md">
						We'll help you reset your password and get you back to finding the parts you need.
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
					{!isSubmitted ?
						(
							<>
								{/* Header */}
								<div className="text-center lg:text-left">
									<h2 className="text-3xl mb-2">Forgot Password?</h2>
									<p className="text-muted-foreground">
										Enter your email and we'll send you a reset link
									</p>
								</div>

								{/* Form */}
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="space-y-2">
										<Label htmlFor="email">Email Address</Label>
										<Input
											id="email"
											icon={Mail}
											type='email'
											placeholder='Email Address'
											value={email}
											onChange={(e) => setEmail(e.target.value)}
											required
											className="bg-input-background border border-border text-black"
										/>
									</div>
									<Button type="submit" className="w-full bg-primary hover:bg-primary/90">
										<Mail className="w-4 h-4 mr-2" />
										{isLoading ? <Loader className='size-6 animate-spin mx-auto' /> : "Send Reset Link"}

									</Button>


								</form>
								{/* Back to Login */}
								<div className="text-center">
									<Link
										to="/login"
										className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
									>
										<ArrowLeft className="w-4 h-4" />
										Back to Login
									</Link>
								</div>

							</>
						)
						: (
							<>
								{/* Success Message */}
								<div className="text-center space-y-6">
									<div className="flex justify-center">
										<div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center">
											<Mail className="w-12 h-12 text-primary" />
										</div>
									</div>

									<div>
										<h2 className="text-3xl mb-2">Check Your Email</h2>
										<p className="text-muted-foreground">
											We've sent a password reset link to
										</p>
										<p className="text-foreground mt-1">{email}</p>
									</div>

									<div className="bg-secondary p-6 rounded-lg text-left">
										<p className="text-sm text-foreground mb-2">
											Please check your inbox and click the reset link to create a new password.
										</p>
										<p className="text-sm text-muted-foreground">
											The link will expire in 1 hour for security reasons.
										</p>
									</div>

									<div className="space-y-3">
										<p className="text-sm text-muted-foreground">
											Didn't receive the email?
										</p>
										<Button
											onClick={() => setIsSubmitted(false)}
											variant="outline"
											className="w-full"
										>
											Try Another Email
										</Button>
									</div>

									<Link
										to="/login"
										className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
									>
										<ArrowLeft className="w-4 h-4" />
										Back to Login
									</Link>
								</div>
							</>
						)}</div>
			</div>

		</div>


	);
};
export default ForgotPasswordPage;
