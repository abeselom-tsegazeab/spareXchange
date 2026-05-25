import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const PasswordChangeForm = () => {
	const { updatePassword, isLoading } = useAuthStore();
	const [passwordForm, setPasswordForm] = useState({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		if (passwordForm.newPassword !== passwordForm.confirmPassword) {
			toast.error("New passwords do not match");
			return;
		}

		if (passwordForm.newPassword.length < 8) {
			toast.error("New password must be at least 8 characters long");
			return;
		}

		try {
			await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
			toast.success("Password updated successfully!");
			setPasswordForm({
				currentPassword: '',
				newPassword: '',
				confirmPassword: ''
			});
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to update password");
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className='bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700'
		>
			<h2 className='text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2'>
				<Lock className="text-green-600 dark:text-green-400" size={24} />
				Change Password
			</h2>
			<form onSubmit={handleSubmit} className='space-y-4'>
				<div>
					<label className='block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300'>
						Current Password
					</label>
					<div className='relative'>
						<input
							type={showCurrentPassword ? 'text' : 'password'}
							value={passwordForm.currentPassword}
							onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
							required
							className='w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 pr-10'
							placeholder="Enter current password"
						/>
						<button
							type="button"
							onClick={() => setShowCurrentPassword(!showCurrentPassword)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
						>
							{showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
				</div>

				<div>
					<label className='block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300'>
						New Password
					</label>
					<div className='relative'>
						<input
							type={showNewPassword ? 'text' : 'password'}
							value={passwordForm.newPassword}
							onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
							required
							minLength={8}
							className='w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 pr-10'
							placeholder="Enter new password (min 8 characters)"
						/>
						<button
							type="button"
							onClick={() => setShowNewPassword(!showNewPassword)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
						>
							{showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
				</div>

				<div>
					<label className='block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300'>
						Confirm New Password
					</label>
					<div className='relative'>
						<input
							type={showConfirmPassword ? 'text' : 'password'}
							value={passwordForm.confirmPassword}
							onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
							required
							minLength={8}
							className='w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 pr-10'
							placeholder="Confirm new password"
						/>
						<button
							type="button"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
						>
							{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
						</button>
					</div>
					{passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
						<p className="text-sm text-red-600 dark:text-red-400 mt-1">Passwords do not match</p>
					)}
				</div>

				<button
					type="submit"
					disabled={isLoading || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword || passwordForm.newPassword !== passwordForm.confirmPassword}
					className='w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{isLoading ? 'Updating...' : 'Update Password'}
				</button>
			</form>
		</motion.div>
	);
};

export default PasswordChangeForm;
