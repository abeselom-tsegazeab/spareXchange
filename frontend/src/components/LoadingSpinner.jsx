import { motion } from "framer-motion";

const LoadingSpinner = ({ size = "default", fullScreen = true, text = "Loading..." }) => {
	// Size variants
	const sizeClasses = {
		xs: "w-6 h-6 border-2",
		sm: "w-10 h-10 border-3",
		default: "w-16 h-16 border-4",
		lg: "w-24 h-24 border-4"
	};

	const spinnerSize = sizeClasses[size] || sizeClasses.default;

	// Full screen wrapper or inline
	if (fullScreen) {
		return (
			<div className='min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-green-900 to-emerald-900 flex items-center justify-center cursor-default select-none'>
				<div className='text-center'>
					<motion.div
						className={`${spinnerSize} border-t-green-500 border-gray-200 dark:border-gray-700 rounded-full`}
						animate={{ rotate: 360 }}
						transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
					/>
					{text && (
						<p className='mt-4 text-gray-600 dark:text-gray-400 text-sm font-medium select-none'>{text}</p>
					)}
				</div>
			</div>
		);
	}

	// Inline spinner (for buttons, small sections)
	return (
		<div className='flex items-center justify-center cursor-default select-none'>
			<motion.div
				className={`${spinnerSize} border-t-green-500 border-gray-200 dark:border-gray-700 rounded-full`}
				animate={{ rotate: 360 }}
				transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
			/>
			{text && size !== "xs" && (
				<span className='ml-2 text-gray-600 dark:text-gray-400 text-sm select-none'>{text}</span>
			)}
		</div>
	);
};

export default LoadingSpinner;
