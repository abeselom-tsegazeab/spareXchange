import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { TrendingUp, Search, Plus, BarChart3 } from "lucide-react";
import { useListingStore } from "../store/listingStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

const AnalyticsPage = () => {
	const { getHighDemandAnalytics, isLoading } = useListingStore();
	const [analytics, setAnalytics] = useState([]);

	useEffect(() => {
		fetchAnalytics();
	}, []);

	const fetchAnalytics = async () => {
		try {
			const response = await getHighDemandAnalytics();
			setAnalytics(response.analytics || []);
		} catch (error) {
			toast.error("Failed to load analytics");
		}
	};

	if (isLoading && analytics.length === 0) {
		return <LoadingSpinner />;
	}

	const maxSearchCount = Math.max(...analytics.map(a => a.searchCount), 1);

	return (
		<div className='min-h-screen bg-white dark:bg-gradient-to-b from-gray-900 via-green-900 to-emerald-900 text-gray-900 dark:text-white py-8'>
			<div className='container mx-auto px-4 max-w-6xl'>
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className='mb-8'
				>
					<h1 className='text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text flex items-center'>
						<BarChart3 size={40} className='mr-3 text-primary' />
						Market Insights	
					</h1>
					<p className='dark:text-gray-400 text-gray-600'>Discover high-demand items with low supply - opportunities for sellers!</p>
				</motion.div>

				{/* Insights Card */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className='mb-8 p-6 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-xl border border-green-700'
				>
					<div className='flex items-start'>
						<TrendingUp size={24} className='dark:text-green-400 text-primary mr-3 mt-1 flex-shrink-0' />
						<div>
							<h3 className='text-xl font-bold mb-2 dark:text-green-400 text-primary'>Seller Opportunity</h3>
							<p className='dark:text-gray-300 text-gray-600'>
								These are the items people are searching for but can't find on our platform. 
								By listing these items, you can meet market demand and increase your sales!
							</p>
						</div>
					</div>
				</motion.div>

				{/* Analytics Table */}
				{analytics.length === 0 ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className='text-center py-16 dark:bg-gray-800 bg-primary bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-700'
					>
						<Search size={64} className='mx-auto mb-4 text-gray-600' />
						<h3 className='text-2xl font-bold mb-2'>No data yet</h3>
						<p className='dark:text-gray-400 text-gray-500'>Analytics will appear once users start searching</p>
					</motion.div>
				) : (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
						className='dark:bg-gray-800 bg-primary bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-700 overflow-hidden'
					>
						<div className='p-6 border-b border-border'>
							<h2 className='text-2xl font-bold'>High Demand, Low Supply Items</h2>
						</div>
						
						<div className='overflow-x-auto'>
							<table className='w-full'>
								<thead className='bg-gray-900 bg-opacity-50'>
									<tr>
										<th className='px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Search Query</th>
										<th className='px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Search Count</th>
										<th className='px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Avg Results</th>
										<th className='px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Last Searched</th>
										<th className='px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>Demand Level</th>
									</tr>
								</thead>
								<tbody className='divide-y divide-border'>
									{analytics.map((item, index) => {
										const demandPercentage = (item.searchCount / maxSearchCount) * 100;
										
										return (
											<motion.tr
												key={item._id}
												initial={{ opacity: 0, x: -20 }}
												animate={{ opacity: 1, x: 0 }}
												transition={{ delay: index * 0.05 }}
												className='hover:bg-gray-700 hover:bg-opacity-30 transition'
											>
												<td className='px-6 py-4'>
													<div className='flex items-center'>
														<Search size={16} className='dark:text-green-400 text-white mr-2 flex-shrink-0' />
														<span className='font-medium capitalize'>{item._id}</span>
													</div>
												</td>
												<td className='px-6 py-4'>
													<span className='text-lg font-bold dark:text-green-400 text-accent'>{item.searchCount}</span>
												</td>
												<td className='px-6 py-4'>
													<span className='text-sm'>{item.avgResults.toFixed(1)}</span>
												</td>
												<td className='px-6 py-4'>
													<span className='text-sm dark:text-gray-400 text-accent'>
														{new Date(item.lastSearched).toLocaleDateString()}
													</span>
												</td>
												<td className='px-6 py-4'>
													<div className='w-full bg-accent dark:bg-gray-700 rounded-full h-2.5'>
														<div
															className='dark:bg-gradient-to-r dark:from-green-500 dark:to-emerald-600 bg-gradient-to-r from-gray-200 to-gray-600 h-2.5 rounded-full'
															style={{ width: `${demandPercentage}%` }}
														></div>
													</div>
												</td>
											</motion.tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</motion.div>
				)}

				{/* Visual Bar Chart */}
				{analytics.length > 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className='mt-8 p-6 dark:bg-gray-800 bg-primary bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl border border-gray-700'
					>
						<h3 className='text-xl font-bold mb-6'>Top 10 High-Demand Searches</h3>
						<div className='space-y-3'>
							{analytics.slice(0, 10).map((item, index) => {
								const percentage = (item.searchCount / maxSearchCount) * 100;
								
								return (
									<div key={item._id} className='flex items-center gap-4'>
										<div className='w-8 text-right text-sm dark:text-gray-400 text-gray-700'>#{index + 1}</div>
										<div className='flex-1'>
											<div className='flex items-center mb-1'>
												<span className='text-sm font-medium capitalize mr-3'>{item._id}</span>
												<span className='text-xs dark:text-gray-400 text-gray-700'>({item.searchCount} searches)</span>
											</div>
											<div className='w-full dark:bg-gray-700 bg-accent rounded-full h-3'>
												<motion.div
													initial={{ width: 0 }}
													animate={{ width: `${percentage}%` }}
													transition={{ delay: index * 0.1, duration: 0.5 }}
													className='dark:bg-gradient-to-r dark:from-green-500 dark:to-emerald-600 bg-gradient-to-r from-gray-200 to-gray-600 h-3 rounded-full'
												></motion.div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					</motion.div>
				)}

				{/* CTA */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.4 }}
					className='mt-8 text-center'
				>
					<Link
						to='/create-listing'
						className='inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition text-lg'
					>
						<Plus size={24} className='mr-2' />
						Create Listing to Meet Demand
					</Link>
				</motion.div>
			</div>
		</div>
	);
};

export default AnalyticsPage;
