import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes in ms
const WARNING_PERIOD = 30 * 1000; // 30 seconds warning countdown

export const InactivityHandler = () => {
	const { isAuthenticated, logout, rememberMe } = useAuthStore();
	const [showWarning, setShowWarning] = useState(false);
	const [countdown, setCountdown] = useState(30);
	
	const activityTimerRef = useRef(null);
	const warningIntervalRef = useRef(null);

	const handleLogout = async () => {
		try {
			await logout();
			toast.error("You have been logged out due to inactivity.", {
				duration: 5000,
				icon: "⏱️",
			});
		} catch (err) {
			console.error("Failed to automatically logout", err);
		}
	};

	const resetTimer = () => {
		// Only run inactivity logic if logged in AND rememberMe is false
		if (!isAuthenticated || rememberMe) return;

		// Clear existing timers
		if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
		if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);

		setShowWarning(false);

		// Set a timer to show warning 30s before the inactivity limit
		activityTimerRef.current = setTimeout(() => {
			setShowWarning(true);
			setCountdown(30);
		}, INACTIVITY_LIMIT - WARNING_PERIOD);
	};

	useEffect(() => {
		if (isAuthenticated && !rememberMe) {
			const events = ["mousemove", "mousedown", "keypress", "scroll", "touchstart", "click"];
			
			const eventHandler = () => {
				// Don't reset if warning modal is active, user must click "Stay Connected" explicitly
				if (!showWarning) {
					resetTimer();
				}
			};

			events.forEach((event) => {
				window.addEventListener(event, eventHandler);
			});

			resetTimer();

			return () => {
				events.forEach((event) => {
					window.removeEventListener(event, eventHandler);
				});
				if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
				if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
			};
		} else {
			// Clear timers if logged out or rememberMe is enabled
			if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
			if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
			setShowWarning(false);
		}
	}, [isAuthenticated, rememberMe, showWarning]);

	// Countdown effect when warning is showing
	useEffect(() => {
		if (showWarning) {
			warningIntervalRef.current = setInterval(() => {
				setCountdown((prev) => {
					if (prev <= 1) {
						clearInterval(warningIntervalRef.current);
						handleLogout();
						return 0;
					}
					return prev - 1;
				});
			}, 1000);
		}

		return () => {
			if (warningIntervalRef.current) clearInterval(warningIntervalRef.current);
		};
	}, [showWarning]);

	if (!showWarning) return null;

	return (
		<AnimatePresence>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-md">
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					exit={{ opacity: 0, scale: 0.95 }}
					className="max-w-md w-full bg-gray-800 bg-opacity-65 backdrop-filter backdrop-blur-xl border border-gray-700 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
				>
					{/* Glowing decorative background indicator */}
					<div className="absolute -top-10 -left-10 w-32 h-32 bg-red-500 rounded-full opacity-10 blur-2xl animate-pulse" />
					<div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-500 rounded-full opacity-10 blur-2xl animate-pulse" />
					
					<div className="flex flex-col items-center text-center">
						<div className="w-16 h-16 bg-red-950 bg-opacity-30 rounded-full flex items-center justify-center border border-red-500 mb-4 animate-bounce">
							<ShieldAlert className="w-8 h-8 text-red-400" />
						</div>

						<h3 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-red-400 to-amber-400 text-transparent bg-clip-text">
							Inactivity Warning
						</h3>
						
						<p className="text-gray-300 mb-6 text-sm">
							You have been inactive. For your security, you will be automatically logged out in:
						</p>

						<div className="text-6xl font-extrabold text-red-400 mb-6 font-mono tracking-wider animate-pulse">
							{countdown}s
						</div>

						<div className="flex flex-col sm:flex-row gap-3 w-full">
							<button
								onClick={resetTimer}
								className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold rounded-lg shadow-md transition duration-200"
							>
								Stay Connected
							</button>
							<button
								onClick={handleLogout}
								className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-650 text-gray-200 border border-gray-600 font-bold rounded-lg transition duration-200 flex items-center justify-center gap-2"
							>
								<LogOut className="w-4 h-4" />
								Log Out
							</button>
						</div>
					</div>
				</motion.div>
			</div>
		</AnimatePresence>
	);
};

export default InactivityHandler;
