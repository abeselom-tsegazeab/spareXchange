import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Recycle, Shuffle, Users, Wrench, Leaf, Truck, Car, Cpu, Smartphone, Gamepad2, Camera, Watch, Headphones, Laptop } from "lucide-react";
import ListingCard from "../components/ListingCard";
import CategoryCard from "../components/CategoryCard";
import InteractiveMap from "../components/InteractiveMap";
import PersonalizedCTA from "../components/PersonalizedCTA";
import ActivityFeed from "../components/ActivityFeed";
import SocialProofNotification from "../components/SocialProofNotification";
import AnimatedFooter from "../components/AnimatedFooter";
import { useTheme } from "../contexts/ThemeContext";

const LandingPage = () => {
	const { darkMode } = useTheme();
	return (
		<div className={`min-h-screen overflow-hidden ${darkMode ? 'bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white' : 'bg-gradient-to-br from-gray-100 via-green-50 to-emerald-50 text-gray-900'}`}>
			<SocialProofNotification />
			{/* Floating Shapes */}
			<div className='absolute inset-0 overflow-hidden'>
				<motion.div
					className='absolute w-64 h-64 bg-green-500 rounded-full opacity-10 blur-3xl'
					animate={{
						y: ["0%", "100%", "0%"],
						x: ["0%", "100%", "0%"],
						scale: [1, 1.2, 1],
						opacity: [0.1, 0.15, 0.1],
					}}
					transition={{
						duration: 20,
						ease: "easeInOut",
						repeat: Infinity,
					}}
					style={{ top: "-10%", left: "10%" }}
				/>
				<motion.div
					className='absolute w-48 h-48 bg-emerald-500 rounded-full opacity-10 blur-3xl'
					animate={{
						y: ["100%", "0%", "100%"],
						x: ["0%", "100%", "0%"],
						scale: [1, 1.3, 1],
						opacity: [0.1, 0.2, 0.1],
					}}
					transition={{
						duration: 25,
						ease: "easeInOut",
						repeat: Infinity,
					}}
					style={{ bottom: "-10%", right: "10%" }}
				/>
				{/* Additional floating elements for hero section */}
				<motion.div
					className='absolute w-32 h-32 bg-teal-500 rounded-full opacity-5 blur-2xl'
					animate={{
						y: ["0%", "-50%", "0%"],
						x: ["0%", "30%", "0%"],
						rotate: [0, 180, 360],
					}}
					transition={{
						duration: 15,
						ease: "easeInOut",
						repeat: Infinity,
					}}
					style={{ top: "20%", right: "20%" }}
				/>
				<motion.div
					className='absolute w-24 h-24 bg-lime-500 rounded-full opacity-5 blur-2xl'
					animate={{
						y: ["0%", "50%", "0%"],
						x: ["0%", "-30%", "0%"],
						rotate: [0, -180, -360],
					}}
					transition={{
						duration: 18,
						ease: "easeInOut",
						repeat: Infinity,
					}}
					style={{ bottom: "30%", left: "20%" }}
				/>
			</div>

			

			{/* Hero Section */}
			<section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-24 flex flex-col items-center text-center relative z-10'>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.8, ease: 'easeOut' }}
					className='relative mb-6 sm:mb-8'
				>
					<div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-30 animate-pulse'></div>
					<motion.h1
						className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold relative bg-gradient-to-r ${darkMode ? 'from-white via-green-200 to-emerald-300' : 'from-gray-800 via-green-600 to-emerald-700'} text-transparent bg-clip-text`}
						initial={{ y: 20 }}
						animate={{ y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
					>
						Find, Buy & Sell Spare Parts
					</motion.h1>
				</motion.div>
				<motion.p
					className={`text-base sm:text-lg md:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 sm:mb-10 max-w-3xl`}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2 }}
				>
					A cross-platform marketplace connecting users, garages, repair shops, recyclers, and electronics enthusiasts to buy, sell, and exchange affordable and compatible spare parts for vehicles, machinery, and electronics. Trade directly with peers or purchase from verified sellers.
				</motion.p>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className='flex flex-wrap justify-center gap-3 sm:gap-4 mb-12 sm:mb-16'
				>
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						transition={{ type: "spring", stiffness: 400, damping: 10 }}
					>
						<Link
							to='/marketplace'
							className={`px-6 py-3 sm:px-8 sm:py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base sm:text-lg hover:from-green-600 hover:to-emerald-700 transition duration-300 shadow-lg hover:shadow-green-500/30 relative overflow-hidden group ${darkMode ? '' : 'shadow-md'}`}
						>
							<span className='relative z-10 flex items-center'>
								Explore Marketplace
								<motion.svg 
									className='ml-2 w-4 h-4 sm:w-5 sm:h-5'
									width='20'
									height='20'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									whileHover={{ x: 5 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<path d='M5 12h14'/>
									<path d='M12 5l7 7-7 7'/>
								</motion.svg>
							</span>
							<div className='absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
						</Link>
					</motion.div>
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						transition={{ type: "spring", stiffness: 400, damping: 10 }}
					>
						<Link
							to='/signup'
							className={`px-6 py-3 sm:px-8 sm:py-4 rounded-lg border-2 ${darkMode ? 'border-green-500 text-green-400 hover:bg-green-500 hover:text-white' : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'} font-bold text-base sm:text-lg transition duration-300 relative overflow-hidden group ${darkMode ? '' : 'shadow-md'}`}
						>
							<span className='relative z-10 flex items-center'>
								Join the Community
								<motion.svg 
									className='ml-2 w-4 h-4 sm:w-5 sm:h-5'
									width='20'
									height='20'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									whileHover={{ x: 5 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/>
									<circle cx='9' cy='7' r='4'/>
									<line x1='19' y1='8' x2='19' y2='14'/>
									<line x1='22' y1='11' x2='16' y2='11'/>
								</motion.svg>
							</span>
							<div className='absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
						</Link>
					</motion.div>
				</motion.div>
				
				{/* Animated Stats */}
				<motion.div 
					className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl w-full'
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.6 }}
				>
					{[
						{ number: '10K+', label: 'Parts Listed' },
						{ number: '5K+', label: 'Happy Users' },
						{ number: '500+', label: 'Repair Shops' }
					].map((stat, index) => (
						<motion.div 
							key={index}
							className={`bg-gray-800 bg-opacity-40 backdrop-blur-lg rounded-xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700 hover:border-green-500' : 'border-gray-300 hover:border-green-500'} transition-all duration-300 cursor-pointer relative overflow-hidden ${darkMode ? '' : 'bg-white shadow-md'}`}
							whileHover={{ 
								y: -5, 
								boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.2)',
								scale: 1.02
							}}
							whileTap={{ scale: 0.98 }}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
						>
							<div className='absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl'></div>
							<motion.div 
								className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-1 sm:mb-2 relative z-10`}
								whileHover={{ scale: 1.05 }}
								transition={{ type: "spring", stiffness: 300 }}
							>
								<span className='relative inline-block'>
									{stat.number}
									<motion.span 
										className='absolute -inset-1 bg-green-400 rounded-lg blur opacity-0 group-hover:opacity-20'
										animate={{ 
											opacity: [0, 0.2, 0],
											scale: [1, 1.1, 1]
										}}
										transition={{ 
											duration: 2,
											repeat: Infinity,
											repeatType: "reverse",
											ease: "easeInOut"
										}}
									></motion.span>
								</span>
							</motion.div>
							<div className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'} relative z-10`}>
								{stat.label}
							</div>
						</motion.div>
					))}
				</motion.div>
			</section>

			{/* Features Section */}
			<section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10'>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className='relative mb-12 sm:mb-16'
				>
					<div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-20'></div>
					<motion.h2
						className={`text-3xl sm:text-4xl font-bold text-center relative bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-500' : 'from-green-600 to-emerald-700'} text-transparent bg-clip-text`}
						initial={{ y: 20 }}
						whileInView={{ y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.3 }}
					>
						Platform Features
					</motion.h2>
				</motion.div>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
					{[
						{
							icon: Recycle,
							title: "Buy & Sell Spare Parts",
							description: "Find affordable spare parts for vehicles, machinery, and electronics from verified sellers in our secure marketplace.",
						},
						{
							icon: Shuffle,
							title: "Exchange Program",
							description: "Trade your spare parts directly with other users through our peer-to-peer exchange system.",
						},
						{
							icon: Users,
							title: "Community Network",
							description: "Connect with garages, repair shops, recyclers, and electronics enthusiasts in a collaborative ecosystem.",
						},
						{
							icon: Leaf,
							title: "Eco Points System",
							description: "Earn rewards for recycling spare parts and contributing to sustainable practices.",
						},
						{
							icon: Wrench,
							title: "Technician Support",
							description: "Request professional technician assistance for complex repairs and installations.",
						},
						{
							icon: Truck,
							title: "Real-Time Matching",
							description: "Instantly find compatible spare parts with our advanced search and matching algorithms.",
						},
					].map((feature, index) => (
						<motion.div
							key={index}
							className={`bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-2xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700 hover:border-green-500' : 'border-gray-300 hover:border-green-500'} transition duration-300 group cursor-pointer relative overflow-hidden ${darkMode ? '' : 'bg-white shadow-md'}`}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							whileHover={{ 
								y: -10,
								boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
								borderColor: '#10b981'
							}}
							whileTap={{ scale: 0.98 }}
						>
							<div className='absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl'></div>
							<feature.icon className={`w-8 h-8 sm:w-12 sm:h-12 ${darkMode ? 'text-green-500' : 'text-green-600'} mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10`} />
							<h3 className={`text-xl sm:text-2xl font-bold mb-2 sm:mb-2 group-hover:text-green-400 transition-colors duration-300 relative z-10 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h3>
							<p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'} relative z-10`}>{feature.description}</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* How It Works Section */}
			<section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10'>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className='relative mb-12 sm:mb-16'
				>
					<div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-20'></div>
					<motion.h2
						className={`text-3xl sm:text-4xl font-bold text-center relative bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-500' : 'from-green-600 to-emerald-700'} text-transparent bg-clip-text`}
						initial={{ y: 20 }}
						whileInView={{ y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.3 }}
					>
						How It Works
					</motion.h2>
				</motion.div>
				<div className='grid grid-cols-1 sm:grid-cols-3 gap-6'>
					{[
						{
							number: "01",
							title: "List or Find Parts",
							description: "Post your spare parts for sale or exchange, or browse our extensive catalog of available components."
						},
						{
							number: "02",
							title: "Connect & Transact",
							description: "Communicate with sellers/buyers and securely complete purchases or exchanges through our platform."
						},
						{
							number: "03",
							title: "Trade or Recycle",
							description: "Trade parts directly with peers or recycle unused components to earn Eco Points."
						}
					].map((step, index) => (
						<motion.div
							key={index}
							className={`bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-lg rounded-2xl p-4 sm:p-6 border ${darkMode ? 'border-gray-700' : 'border-gray-300'} text-center group cursor-pointer relative overflow-hidden ${darkMode ? '' : 'bg-white shadow-md'}`}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: index * 0.1 }}
							whileHover={{ 
								y: -10,
								boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
								borderColor: '#10b981'
							}}
							whileTap={{ scale: 0.98 }}
						>
							<div className='absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl'></div>
							<div className={`text-4xl sm:text-5xl font-bold ${darkMode ? 'text-green-500' : 'text-green-600'} mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 relative z-10`}>{step.number}</div>
							<h3 className={`text-xl sm:text-2xl font-bold mb-3 sm:mb-4 group-hover:text-green-400 transition-colors duration-300 relative z-10 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{step.title}</h3>
							<p className={`text-sm sm:text-base ${darkMode ? 'text-gray-300' : 'text-gray-600'} relative z-10`}>{step.description}</p>
						</motion.div>
					))}
				</div>
			</section>

			{/* Categories Showcase */}
			<section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10'>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className='relative mb-12 sm:mb-16'
				>
					<div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-20'></div>
					<motion.h2
						className={`text-3xl sm:text-4xl font-bold text-center relative bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-500' : 'from-green-600 to-emerald-700'} text-transparent bg-clip-text`}
						initial={{ y: 20 }}
						whileInView={{ y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.3 }}
					>
						Popular Categories
					</motion.h2>
				</motion.div>
				<div className='grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6'>
					{[
						{ name: "Automotive", count: "2.5K" },
						{ name: "Electronics", count: "1.8K" },
						{ name: "Mobile Devices", count: "3.2K" },
						{ name: "Gaming", count: "900" },
						{ name: "Cameras", count: "750" },
						{ name: "Wearables", count: "1.2K" },
						{ name: "Audio", count: "1.5K" },
						{ name: "Computers", count: "2.1K" }
					].map((category, index) => (
						<CategoryCard key={index} category={category} index={index} />
					))}
				</div>
			</section>

			{/* Recent Listings Preview */}
			<section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10'>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className='relative mb-12 sm:mb-16 text-center'
				>
					<div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-20 mx-auto left-1/2 transform -translate-x-1/2'></div>
					<motion.h2
						className={`text-3xl sm:text-4xl font-bold relative bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-500' : 'from-green-600 to-emerald-700'} text-transparent bg-clip-text`}
						initial={{ y: 20 }}
						whileInView={{ y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.3 }}
					>
						Recent Listings
					</motion.h2>
					<motion.p
						className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4 max-w-2xl mx-auto`}
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						Check out the latest spare parts added to our marketplace
					</motion.p>
				</motion.div>
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
					{[
						{ title: "iPhone 12 Pro Max Battery", price: "25", condition: "New", seller: "TechSolutions", location: "San Francisco, CA", timeAgo: "2 hours ago" },
						{ title: "BMW X5 Brake Pads", price: "85", condition: "Refurbished", seller: "AutoPartsHub", location: "Los Angeles, CA", timeAgo: "5 hours ago" },
						{ title: "PlayStation 5 Controller", price: "45", condition: "Like New", seller: "GameSwap", location: "New York, NY", timeAgo: "1 day ago" },
						{ title: "Dell XPS 13 Screen", price: "120", condition: "Used", seller: "LaptopRepair", location: "Chicago, IL", timeAgo: "1 day ago" }
					].map((listing, index) => (
						<ListingCard key={index} listing={listing} index={index} />
					))}
				</div>
				<motion.div
					className='text-center mt-10'
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						transition={{ type: "spring", stiffness: 400, damping: 10 }}
					>
						<Link
							to='/marketplace'
							className={`inline-block px-6 py-3 sm:px-8 sm:py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-base sm:text-lg hover:from-green-600 hover:to-emerald-700 transition duration-300 shadow-lg hover:shadow-green-500/30 relative overflow-hidden group ${darkMode ? '' : 'shadow-md'}`}
						>
							<span className='relative z-10 flex items-center justify-center'>
								View All Listings
								<motion.svg 
									className='ml-2 w-4 h-4 sm:w-5 sm:h-5'
									width='20'
									height='20'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									whileHover={{ x: 5 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<path d='M5 12h14'/>
									<path d='M12 5l7 7-7 7'/>
								</motion.svg>
							</span>
							<div className='absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
						</Link>
					</motion.div>
				</motion.div>
			</section>

			{/* Interactive Map Section */}
			<section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10'>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className='relative mb-12 sm:mb-16 text-center'
				>
					<div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-20 mx-auto left-1/2 transform -translate-x-1/2'></div>
					<motion.h2
						className={`text-3xl sm:text-4xl font-bold relative bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-500' : 'from-green-600 to-emerald-700'} text-transparent bg-clip-text`}
						initial={{ y: 20 }}
						whileInView={{ y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.3 }}
					>
						User Activity Map
					</motion.h2>
					<motion.p
						className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4 max-w-2xl mx-auto`}
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						See where our community is most active around the world
					</motion.p>
				</motion.div>
				<div className='max-w-4xl mx-auto'>
					<InteractiveMap />
				</div>
			</section>

			{/* Personalized CTA Section */}
			<section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10'>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className='relative mb-12 sm:mb-16 text-center'
				>
					<div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-20 mx-auto left-1/2 transform -translate-x-1/2'></div>
					<motion.h2
						className={`text-3xl sm:text-4xl font-bold relative bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-500' : 'from-green-600 to-emerald-700'} text-transparent bg-clip-text`}
						initial={{ y: 20 }}
						whileInView={{ y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.3 }}
					>
						Personalized for You
					</motion.h2>
					<motion.p
						className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4 max-w-2xl mx-auto`}
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						Experience tailored recommendations based on your activity
					</motion.p>
				</motion.div>
				<div className='max-w-4xl mx-auto'>
					<PersonalizedCTA />
				</div>
			</section>

			{/* Activity Feed Section */}
			<section className='container mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10'>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className='relative mb-12 sm:mb-16 text-center'
				>
					<div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-20 mx-auto left-1/2 transform -translate-x-1/2'></div>
					<motion.h2
						className={`text-3xl sm:text-4xl font-bold relative bg-gradient-to-r ${darkMode ? 'from-green-400 to-emerald-500' : 'from-green-600 to-emerald-700'} text-transparent bg-clip-text`}
						initial={{ y: 20 }}
						whileInView={{ y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.3 }}
					>
						Live Activity Feed
					</motion.h2>
					<motion.p
						className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-4 max-w-2xl mx-auto`}
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						Real-time updates of transactions happening across our platform
					</motion.p>
				</motion.div>
				<div className='max-w-2xl mx-auto'>
					<ActivityFeed />
				</div>
			</section>

			{/* CTA Section */}
			<section className='container mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center relative z-10'>
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					whileInView={{ scale: 1, opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
					className='relative mb-8 sm:mb-12'
				>
					<div className='absolute -inset-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full blur-xl opacity-20'></div>
					<motion.h2
						className={`text-3xl sm:text-4xl md:text-5xl font-bold relative bg-gradient-to-r ${darkMode ? 'from-white to-green-300' : 'from-gray-800 to-green-600'} text-transparent bg-clip-text`}
						initial={{ y: 20 }}
						whileInView={{ y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.3 }}
					>
						Join the Circular Economy Revolution
					</motion.h2>
				</motion.div>
				<motion.p
					className={`text-base sm:text-lg md:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-8 sm:mb-10 max-w-2xl mx-auto`}
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.2 }}
				>
					Reduce e-waste, save money, and contribute to a sustainable future by joining our community of spare part enthusiasts.
				</motion.p>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						transition={{ type: "spring", stiffness: 400, damping: 10 }}
					>
						<Link
							to='/signup'
							className={`inline-block px-8 py-3 sm:px-10 sm:py-4 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg sm:text-xl hover:from-green-600 hover:to-emerald-700 transition duration-300 shadow-lg hover:shadow-green-500/30 relative overflow-hidden group ${darkMode ? '' : 'shadow-md'}`}
						>
							<span className='relative z-10 flex items-center justify-center'>
								Get Started Today
								<motion.svg 
									className='ml-2 w-5 h-5 sm:w-6 sm:h-6'
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
									strokeLinejoin='round'
									whileHover={{ x: 5 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									<path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/>
									<circle cx='9' cy='7' r='4'/>
									<line x1='19' y1='8' x2='19' y2='14'/>
									<line x1='22' y1='11' x2='16' y2='11'/>
								</motion.svg>
							</span>
							<div className='absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left'></div>
						</Link>
					</motion.div>
				</motion.div>
			</section>

			<AnimatedFooter />
		</div>
	);
};

export default LandingPage;