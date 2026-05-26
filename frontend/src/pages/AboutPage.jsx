import { motion } from "framer-motion";
import { Leaf, Users, Recycle, Globe } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Link } from "react-router-dom";

const AboutPage = () => {
	const { darkMode } = useTheme();
	return (
		<div className='min-h-screen  text-white py-12 dark:bg-gradient-to-r from-gray-900 via-green-900 to-emerald-900'>
			<div className='container mx-auto px-4'>
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className='text-center mb-16'
				>
					<h1 className='text-5xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
						About SpareXChange
					</h1>
					<p className={`text-xl ${darkMode ? "text-primary" : "text-black"} max-w-3xl mx-auto`}>
						Building a sustainable future through spare part exchange and circular economy principles
					</p>
				</motion.div>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16'>
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className='bg-primary rounded-2xl p-8 border border-gray-700'
					>
						<h2 className='text-3xl font-bold mb-6'>Our Mission</h2>
						<p className=' mb-6 text-lg text-gray-100'>
							At SpareXChange, we believe in creating a world where resources are valued, reused, and recycled rather than discarded. Our mission is to connect people who have spare parts they no longer need with those who need them, reducing electronic waste and promoting sustainability.
						</p>
						<p className=' mb-6 text-lg text-gray-100'>
							We're building a community-driven platform that empowers individuals, repair shops, and businesses to participate in the circular economy by facilitating the exchange, buying, and selling of spare parts for vehicles, machinery, and electronics.
						</p>
						<div className='flex items-center mt-8'>
							<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 mr-2">
								<Leaf className='text-green-500' size={24} />
							</div>
							<span className='text-xl font-semibold'>Reducing e-waste one part at a time</span>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className='bg-primary rounded-2xl p-8 border border-gray-700'
					>
						<h2 className='text-3xl font-bold mb-6 '>How We Make a Difference</h2>
						<div className='space-y-6'>
							<div className='flex items-start'>
								<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 mr-2">
									<Recycle className='text-green-500  flex-shrink-0' size={24} />
								</div>
								<div>
									<h3 className='text-xl font-semibold mb-2'>Resource Efficiency</h3>
									<p className='text-gray-100'>
										Extending the life of spare parts reduces the need for new manufacturing, conserving raw materials and energy.
									</p>
								</div>
							</div>
							<div className='flex items-start'>
								<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 mr-2">
									<Globe className='text-green-500 flex-shrink-0' size={24} />
								</div>
								<div>
									<h3 className='text-xl font-semibold mb-2'>Environmental Impact</h3>
									<p className='text-gray-100'>
										Each exchanged part prevents potential e-waste, reducing landfill burden and environmental pollution.
									</p>
								</div>
							</div>
							<div className='flex items-start'>
								<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 mr-2">
									<Users className='text-green-500 flex-shrink-0' size={24} />
								</div>
								<div>
									<h3 className='text-xl font-semibold mb-2'>Community Building</h3>
									<p className='text-gray-100'>
										Fostering connections between repair professionals, DIY enthusiasts, and environmentally conscious consumers.
									</p>
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.6 }}
					className='bg-primary rounded-2xl p-8 border border-gray-700 mb-16'
				>
					<h2 className='text-3xl font-bold mb-6 text-white text-center'>Our Vision</h2>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
						<div className='text-center'>
							<div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4'>
								<Leaf size={32} className='text-green-400' />
							</div>
							<h3 className='text-xl font-semibold mb-2'>Sustainability</h3>
							<p className='text-gray-100'>
								Creating a world where sustainability is the norm, not the exception, in resource utilization.
							</p>
						</div>
						<div className='text-center'>
							<div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4'>
								<Users size={32} className='text-green-400' />
							</div>
							<h3 className='text-xl font-semibold mb-2'>Community</h3>
							<p className='text-gray-100'>
								Building a global community of environmentally conscious individuals and businesses.
							</p>
						</div>
						<div className='text-center'>
							<div className='w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4'>
								<Recycle size={32} className='text-green-400' />
							</div>
							<h3 className='text-xl font-semibold mb-2'>Innovation</h3>
							<p className='text-gray-100'>
								Developing cutting-edge technology solutions that facilitate the circular economy.
							</p>
						</div>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.8 }}
					className='text-center'
				>
					<h2 className='text-3xl font-bold mb-6 text-green-400'>Join Us in Making a Difference</h2>
					<p className={`text-xl ${darkMode ? "text-primary" : "text-black"} max-w-3xl mx-auto mb-8`}>
						Together, we can create a more sustainable future by rethinking how we use and reuse resources.
					</p>
					<Link
						to='/signup'
						className='inline-block px-8 py-4 bg-primary text-white font-bold rounded-lg hover:bg-primary/80 transition duration-300'
					>
						Get Started Today
					</Link>
				</motion.div>
			</div>
		</div>
	);
};

export default AboutPage;