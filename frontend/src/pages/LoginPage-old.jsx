import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const navigate = useNavigate();

	const { login, isLoading, error } = useAuthStore();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			await login(email, password);
			navigate("/dashboard");
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center relative overflow-hidden'>
			{/* Floating background elements */}
			<div className='absolute inset-0 z-0'>
				<motion.div
					className='absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500 rounded-full opacity-10 blur-3xl'
					animate={{
						y: [0, -30, 0],
						x: [0, 20, 0],
					}}
					transition={{
						duration: 8,
						ease: "easeInOut",
						repeat: Infinity,
					}}
				/>
				<motion.div
					className='absolute bottom-1/3 right-1/4 w-48 h-48 bg-green-500 rounded-full opacity-10 blur-3xl'
					animate={{
						y: [0, 30, 0],
						x: [0, -20, 0],
					}}
					transition={{
						duration: 10,
						ease: "easeInOut",
						repeat: Infinity,
					}}
				/>
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='max-w-md w-full bg-gray-800 bg-opacity-60 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-gray-700 z-10 relative'
			>
				<div className='p-8'>
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.2, duration: 0.5 }}
						className='text-center mb-8'
					>
						<h2 className='text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
							Welcome Back
						</h2>
						<p className='text-gray-400'>Sign in to continue your journey</p>
					</motion.div>

					<form onSubmit={handleLogin}>
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.3, duration: 0.5 }}
						>
							<Input
								icon={Mail}
								type='email'
								placeholder='Email Address'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.4, duration: 0.5 }}
						>
							<Input
								icon={Lock}
								type='password'
								placeholder='Password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</motion.div>

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5, duration: 0.5 }}
							className='flex items-center justify-between mb-6'
						>
							<Link to='/forgot-password' className='text-sm text-green-400 hover:underline hover:text-green-300 transition-colors'>
								Forgot password?
							</Link>
						</motion.div>

						{error && (
							<motion.p
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								className='text-red-500 font-semibold mb-2 text-center'
							>
								{error}
							</motion.p>
						)}

						<motion.button
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.6, duration: 0.5 }}
							className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 relative overflow-hidden'
							type='submit'
							disabled={isLoading}
						>
							{isLoading ? (
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									className='flex items-center justify-center'
								>
									<Loader className='w-6 h-6 animate-spin mx-auto' />
								</motion.div>
							) : (
								<motion.span
									whileHover={{ scale: 1.05 }}
									className='flex items-center justify-center'
								>
									Login
								</motion.span>
							)}
							{/* Animated background for button */}
							{!isLoading && (
								<motion.div
									className='absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 hover:opacity-20 transition-opacity'
									whileHover={{ opacity: 0.2 }}
								/>
							)}
						</motion.button>
					</form>
				</div>
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.7, duration: 0.5 }}
					className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center border-t border-gray-700'
				>
					<p className='text-sm text-gray-400'>
						Don't have an account?{" "}
						<Link to='/signup' className='text-green-400 hover:underline hover:text-green-300 transition-colors'>
							Sign up
						</Link>
					</p>
				</motion.div>
			</motion.div>
		</div>
	);
};
export default LoginPage;
