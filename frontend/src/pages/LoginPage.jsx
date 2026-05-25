import { useEffect, useState } from "react";
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Recycle, Eye, EyeOff, Loader } from 'lucide-react';
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../contexts/ThemeContext";
import toast from "react-hot-toast";
const LoginPage = () => {
	const { darkMode } = useTheme();
	const [showPassword, setShowPassword] = useState(false);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);
	const navigate = useNavigate();


	const { login, isLoading, error, mfaRequired, isAuthenticated } = useAuthStore();

	useEffect(() => {
		if (error) {
			toast.error(error);
		}
	}, [error]);

	useEffect(() => {
		if (mfaRequired) {
			navigate("/mfa/verify");
		} else if (isAuthenticated) {
			navigate("/dashboard");
		}
	}, [mfaRequired, isAuthenticated, navigate]);

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			await login(email, password, rememberMe);
			if (!mfaRequired) {
				toast.success("Logged in successfully!");
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<section className={`min-h-screen flex ${darkMode ? 'bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white' : 'bg-white text-gray-900'}`}>
			{/* Left side - Image */}
			<section className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
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
						<h1 className="text-4xl text-white">SpareXchange</h1>
					</div>
					<h2 className="text-5xl mb-6 leading-tight text-white">
						Your Marketplace for<br />Spare Parts
					</h2>
					<p className="text-xl text-green-50 max-w-md">
						Connect with sellers, find the parts you need, and keep your properties running smoothly.
					</p>
				</div>
			</section>

			{/* Right side - Form */}
			<section className={`w-full lg:w-1/2 flex items-center justify-center p-8 ${darkMode ? 'bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white' : 'bg-white text-gray-900'}`}>
				<div className="w-full max-w-md space-y-8">
					{/* Mobile Logo */}
					<div className="lg:hidden flex items-center gap-3 justify-center">
						<div className="bg-green-600 p-2 rounded-lg">
							<Recycle className="w-6 h-6 text-white" />
						</div>
						<h1 className="text-2xl">SpareXchange</h1>
					</div>

					{/* Header */}
					<header className="text-center lg:text-left">
						<h2 className="text-3xl mb-2">Welcome Back</h2>
						<p className="text-muted-foreground">
							Sign in to your account to continue
						</p>
					</header>

					{/* Form */}
					<form onSubmit={handleLogin} className="space-y-6">
						<div className="space-y-2">
							<Label htmlFor="email">Email Address</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="bg-input-background border border-border bg-gray-100"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<div className="relative">
								<Input
									id="password"
									type={showPassword ? 'text' : 'password'}
									placeholder="••••••••"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									className="bg-input-background border border-border pr-10 text-black bg-gray-100"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-black"
								>
									{showPassword ? (
										<EyeOff className="w-5 h-5" />
									) : (
										<Eye className="w-5 h-5" />
									)}
								</button>
							</div>
						</div>

						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<Checkbox
									id="remember"
									checked={rememberMe}
									onCheckedChange={(checked) => setRememberMe(!!checked)}
								/>
								<label
									htmlFor="remember"
									className="text-sm text-muted-foreground cursor-pointer select-none"
								>
									Remember me
								</label>
							</div>
							<Link
								to="/forgot-password"
								className="text-sm text-primary hover:underline"
							>
								Forgot password?
							</Link>
						</div>

						<Button type="submit" className="w-full bg-primary hover:bg-primary/80 z-10">
							{isLoading ? (
								<Loader className='w-6 h-6 animate-spin mx-auto' />
							) : (
								"Sign In"
							)}
						</Button>
					</form>

					{/* Sign Up Link */}
					<p className="text-center text-sm text-muted-foreground">
						Don't have an account?{' '}
						<Link to="/signup" className="text-primary hover:underline">
							Sign up for free
						</Link>
					</p>
				</div>
			</section>
		</section>
	);
};
export default LoginPage;
