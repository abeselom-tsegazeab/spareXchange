import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, MapPin, Edit3, Star, Package, CreditCard, Settings, LogOut, CheckCircle, AlertCircle, Clock, ShieldCheck, Award, Shield } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCommunityStore } from "../store/communityStore";
import { useTheme } from "../contexts/ThemeContext";
import PointsRedemptionModal from "../components/PointsRedemptionModal";

const ProfilePage = () => {
	const { darkMode } = useTheme();
	const navigate = useNavigate();
	const { user, logout, requestVerificationWithFiles } = useAuthStore();
	const { userAchievements, getUserAchievements } = useCommunityStore();
	const [activeTab, setActiveTab] = useState("profile");
	const [showRedemptionModal, setShowRedemptionModal] = useState(false);
	const [accountType, setAccountType] = useState("individual");
	const [verificationFiles, setVerificationFiles] = useState([]);
	const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);
	// const [notificationSettings, setNotificationSettings] = useState({
	// 	messages_buyers: true,
	// 	messages_sellers: true,
	// 	new_listings: true,
	// 	eco_points: true,
	// 	announcements: true,
	// });
	const [privacySettings, setPrivacySettings] = useState({
		show_profile: true,
		allow_messaging: true,
		display_points: false,
	});

	useEffect(() => {
		// Load user achievements when profile page mounts
		getUserAchievements();
	}, []);

	if (!user) return null;

	// Mock listings data
	const listings = [
		{
			id: 1,
			title: "Car Engine Block - Toyota Camry 2015",
			price: 450,
			status: "Active",
			views: 124,
			interested: 8,
		},
		{
			id: 2,
			title: "Laptop Battery - Dell Inspiron 15",
			price: 85,
			status: "Sold",
			views: 89,
			interested: 5,
		},
		{
			id: 3,
			title: "Motorcycle Carburetor - Honda CB125",
			price: 120,
			status: "Active",
			views: 67,
			interested: 3,
		},
	];

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	const handleEditProfile = () => {
		navigate("/edit-profile");
	};

	const handleAddListing = () => {
		navigate("/create-listing");
	};

	const handleEditListing = (listingId) => {
		navigate(`/edit-listing/${listingId}`);
	};

	const handleDeleteListing = async (listingId) => {
		if (window.confirm("Are you sure you want to delete this listing?")) {
			// Call API to delete listing
			console.log("Deleting listing:", listingId);
		}
	};

	// const handleNotificationChange = (key) => {
	// 	setNotificationSettings({
	// 		...notificationSettings,
	// 		[key]: !notificationSettings[key],
	// 	});
	// };

	const handlePrivacyChange = (key) => {
		setPrivacySettings({
			...privacySettings,
			[key]: !privacySettings[key],
		});
	};

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);
		if (files.length > 5) {
			alert("Maximum 5 documents allowed");
			return;
		}
		setVerificationFiles(files);
	};

	const removeFile = (index) => {
		setVerificationFiles(prev => prev.filter((_, i) => i !== index));
	};

	const handleSubmitVerification = async () => {
		if (verificationFiles.length === 0) {
			alert("Please upload at least one verification document");
			return;
		}

		setIsSubmittingVerification(true);
		try {
			await requestVerificationWithFiles(accountType, verificationFiles);
			alert("Verification request submitted successfully! An admin will review your documents.");
			setVerificationFiles([]);
		} catch (error) {
			console.error("Error submitting verification:", error);
			alert(error.response?.data?.message || "Failed to submit verification request");
		} finally {
			setIsSubmittingVerification(false);
		}
	};

	const isAdmin = user?.userType === "admin";

	const tabs = [
		{ id: "profile", name: "Profile", icon: User },
		...(isAdmin ? [] : [{ id: "listings", name: "My Listings", icon: Package }]),
		{ id: "payments", name: "Payments", icon: CreditCard },
		{ id: "settings", name: "Settings", icon: Settings },
		{ id: "security", name: "Security", icon: Shield },
	];

	return (
		<div className={`min-h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white' : 'bg-white text-gray-900'}`}>
			<div className='container mx-auto px-4 py-8'>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					{/* Profile Header */}
					<div className='bg-primary dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700'>
						<div className='flex flex-col md:flex-row items-center md:items-start'>
							<div className='w-24 h-24 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center mb-4 md:mb-0 md:mr-6'>
								<span className='text-3xl font-bold text-white'>{user.name.charAt(0)}</span>
							</div>
							<div className='flex-1 text-center md:text-left'>
								<h1 className='text-3xl font-bold mb-2 flex items-center'>
									{user.name}
									{isAdmin && (
										<ShieldCheck className='ml-2 text-red-400' size={24} title='Administrator' />
									)}
									{!isAdmin && user.roleStatus === "verified" && (
										<ShieldCheck className='ml-2 text-blue-400' size={24} title='Verified Professional' />
									)}
								</h1>
								<div className='flex flex-wrap justify-center md:justify-start gap-4 mb-4'>
									<div className='flex items-center text-gray-700 dark:text-gray-300'>
										<Mail size={16} className='mr-2' />
										<span>{user.email}</span>
									</div>
									<div className='flex items-center text-gray-700 dark:text-gray-300'>
										<MapPin size={16} className='mr-2' />
										<span>{user.location || "Location not set"}</span>
									</div>
									<div className='flex items-center'>
										{isAdmin ? (
											<span className='flex items-center text-red-600 dark:text-red-400 text-sm bg-red-100 dark:bg-red-900 dark:bg-opacity-30 px-2 py-1 rounded-full'>
												<ShieldCheck size={14} className='mr-1' /> Administrator
											</span>
										) : user.roleStatus === "none" && (
											<span className='flex items-center text-yellow-600 dark:text-yellow-500 text-sm bg-yellow-100 dark:bg-yellow-900 dark:bg-opacity-30 px-2 py-1 rounded-full'>
												<AlertCircle size={14} className='mr-1' /> Unverified
											</span>
										)}
										{!isAdmin && user.roleStatus === "rejected" && (
											<span className='flex items-center text-red-600 dark:text-red-500 text-sm bg-red-100 dark:bg-red-900 dark:bg-opacity-30 px-2 py-1 rounded-full'>
												<AlertCircle size={14} className='mr-1' /> Verification Declined
											</span>
										)}
										{/* Admin Feedback Note */}
										{!isAdmin && user.roleStatus === "rejected" && user.verificationNote && (
											<div className='w-full mt-2 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg'>
												<div className='flex items-start gap-2'>
													<AlertCircle size={16} className='text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0' />
													<div>
														<p className='text-xs font-semibold text-red-600 dark:text-red-400 mb-1'>Admin Feedback:</p>
														<p className='text-sm text-red-700 dark:text-red-300'>{user.verificationNote}</p>
													</div>
												</div>
											</div>
										)}
										{!isAdmin && user.roleStatus === "pending" && (
											<span className='flex items-center text-blue-600 dark:text-blue-400 text-sm bg-blue-100 dark:bg-blue-900 dark:bg-opacity-30 px-2 py-1 rounded-full'>
												<Clock size={14} className='mr-1' /> Verification Pending
											</span>
										)}
										{!isAdmin && user.roleStatus === "verified" && (
											<span className='flex items-center text-green-600 dark:text-green-400 text-sm bg-green-100 dark:bg-green-900 dark:bg-opacity-30 px-2 py-1 rounded-full'>
												<CheckCircle size={14} className='mr-1' /> Verified {user.userType}
											</span>
										)}
									</div>
								</div>
								<div className='flex flex-wrap justify-center md:justify-start gap-6 mb-4'>
									{!isAdmin && (
										<>
											<div className='text-center'>
												<div className='text-2xl font-bold text-green-600 dark:text-white'>{user.ecoPoints}</div>
												<div className='text-sm text-gray-700 dark:text-gray-300'>Eco Points</div>
											</div>
											<div className='text-center'>
												<div className='text-2xl font-bold text-gray-900 dark:text-white'>{user.listings}</div>
												<div className='text-sm text-gray-700 dark:text-gray-300'>Listings</div>
											</div>
											<div className='text-center'>
												<div className='flex items-center justify-center'>
													<Star size={16} className='text-yellow-600 dark:text-yellow-400 fill-current mr-1' />
													<span className='text-2xl font-bold text-gray-900 dark:text-white'>{user.rating}</span>
												</div>
												<div className='text-sm text-gray-700 dark:text-gray-300'>{user.reviews} Reviews</div>
											</div>
										</>
									)}
									{isAdmin && (
										<div className='text-center'>
											<div className='text-2xl font-bold text-red-600 dark:text-red-400'>Admin</div>
											<div className='text-sm text-gray-700 dark:text-gray-300'>Platform Administrator</div>
										</div>
									)}
								</div>
								<div className='text-sm text-gray-700 dark:text-gray-300'>
									Member since {user.memberSince}
								</div>
							</div>
							<div className='mt-4 md:mt-0'>
								<button onClick={handleEditProfile} className='flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition duration-300'>
									<Edit3 size={16} className='mr-2' />
									Edit Profile
								</button>
							</div>
						</div>
					</div>

					{/* Tabs */}
					<div className='flex flex-wrap gap-2 mb-8 border-b border-gray-700'>
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center px-4 py-2 rounded-t-lg transition duration-300 ${activeTab === tab.id
									? "bg-primary text-white dark:bg-gray-800 border-b-2 border-green-400"
									: "text-black hover:text-primary"
									}`}
							>
								<tab.icon size={16} className='mr-2' />
								{tab.name}
							</button>
						))}
						<button
							onClick={handleLogout}
							className='flex items-center px-4 py-2 rounded-t-lg text-red-400 hover:text-red-600 transition duration-300 ml-auto'
						>
							<LogOut size={16} className='mr-2' />
							Logout
						</button>
					</div>

					{/* Tab Content */}
					{activeTab === "profile" && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-700'
						>
							<h2 className='text-2xl font-bold mb-6'>Personal Information</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div>
									<h3 className='text-lg font-bold mb-4'>Contact Details</h3>
									<div className='space-y-4'>
										<div>
											<label className='block text-sm text-gray-400 mb-1'>Full Name</label>
											<div className='px-4 py-2 bg-gray-700 rounded-lg'>{user.name}</div>
										</div>
										<div>
											<label className='block text-sm text-gray-400 mb-1'>Email Address</label>
											<div className='px-4 py-2 bg-gray-700 rounded-lg'>{user.email}</div>
										</div>
										<div>
											<label className='block text-sm text-gray-400 mb-1'>Phone Number</label>
											<div className='px-4 py-2 bg-gray-700 rounded-lg'>{user.phone}</div>
										</div>
										<div>
											<label className='block text-sm text-gray-400 mb-1'>Location</label>
											<div className='px-4 py-2 bg-gray-700 rounded-lg'>{user.location || "Not set"}</div>
										</div>
									</div>

									{!isAdmin && (user.roleStatus === "none" || user.roleStatus === "rejected") && (
										<div className='mt-8 p-4 bg-gray-700 bg-opacity-70 rounded-lg border border-yellow-600 border-opacity-50'>
											<h3 className='text-lg font-bold mb-2 flex items-center text-yellow-500'>
												<AlertCircle size={20} className='mr-2' />
												{user.roleStatus === "rejected" ? "Reapply for Verification" : "Get Verified"}
											</h3>
											
											{/* Show admin feedback if rejected */}
											{user.roleStatus === "rejected" && user.verificationNote && (
												<div className='mb-4 p-3 bg-red-900/40 border border-red-600 rounded-lg'>
													<p className='text-xs font-semibold text-red-400 mb-1'>💡 Reason for Rejection:</p>
													<p className='text-sm text-red-300'>{user.verificationNote}</p>
												</div>
											)}
											
											<p className='text-sm text-gray-300 mb-4'>
												{user.roleStatus === "rejected" 
													? "Your previous verification request was declined. Please review the feedback above and submit a new request with updated documents."
													: "To post spare parts or work as a technician, you must verify your identity."
												}
											</p>
											<div className='space-y-4'>
												<div>
													<label className='block text-xs text-gray-400 mb-1'>Account Type</label>
													<select
														value={accountType}
														onChange={(e) => setAccountType(e.target.value)}
														className='w-full bg-gray-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-green-500'
													>
														<option value='individual'>Individual Seller</option>
														<option value='technician'>Technician</option>
														<option value='repair-shop'>Repair Shop</option>
														<option value='garage'>Garage</option>
														<option value='recycler'>Recycler</option>
													</select>
												</div>
												
												<div>
													<label className='block text-xs text-gray-400 mb-1'>
														Verification Documents (Required)
													</label>
													<input
														type="file"
														multiple
														accept="image/*,.pdf"
														onChange={handleFileChange}
														className='w-full bg-gray-600 rounded px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-green-600 file:text-white file:text-sm file:font-semibold hover:file:bg-green-700'
													/>
													<p className='text-xs text-gray-500 mt-1'>
														Upload up to 5 documents (PDF, JPG, PNG, WebP, or GIF)
													</p>
													<p className='text-xs text-gray-500 mt-1'>
														Accepted: ID Card, Passport, Driver's License, Recycling License, Technician License, or relevant certificates
													</p>
													
													{verificationFiles.length > 0 && (
														<div className='mt-2 space-y-2'>
															<p className='text-xs text-gray-400'>Selected files:</p>
															{verificationFiles.map((file, index) => (
																<div key={index} className='flex items-center justify-between bg-gray-600 rounded px-3 py-2'>
																	<span className='text-xs text-gray-300 truncate flex-1'>
																		{file.name} ({(file.size / 1024).toFixed(1)} KB)
																	</span>
																	<button
																		onClick={() => removeFile(index)}
																		className='text-red-400 hover:text-red-300 ml-2'
																	>
																		✕
																	</button>
																</div>
															))}
														</div>
													)}
												</div>

												<button
													onClick={handleSubmitVerification}
													disabled={isSubmittingVerification || verificationFiles.length === 0}
													className='w-full py-2 bg-green-600 rounded font-bold hover:bg-green-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed'
												>
													{isSubmittingVerification ? 'Submitting...' : 'Submit Verification Request'}
												</button>
											</div>
										</div>
									)}
								</div>
								<div>
									{!isAdmin && (
										<>
											<h3 className='text-lg font-bold mb-4 flex items-center'>
												<Award size={20} className='mr-2 text-yellow-400' />
												Eco Achievements
											</h3>
											<div className='bg-gray-700 rounded-lg p-4 mb-4'>
												<div className='flex justify-between items-center mb-2'>
													<span className='text-gray-300'>Total Eco Points</span>
													<span className='text-2xl font-bold text-green-400'>{user.ecoPoints}</span>
												</div>
												<div className='w-full bg-gray-600 rounded-full h-2'>
													<div
														className='bg-green-500 h-2 rounded-full'
														style={{ width: `${Math.min(100, (user.ecoPoints / 2000) * 100)}%` }}
													></div>
												</div>
												<div className='text-sm text-gray-400 mt-2 flex justify-between'>
													<span>{2000 - user.ecoPoints} points to next level</span>
													<button
														onClick={() => {
															if (user.roleStatus !== "verified") {
																alert("Only verified users can redeem points.");
															} else {
																setShowRedemptionModal(true);
															}
														}}
														className='text-green-400 hover:text-green-300 font-bold ml-4'
													>
														Redeem Rewards
													</button>
												</div>
											</div>
																					
											{/* Achievements Summary */}
											{userAchievements?.stats && (
												<div className='bg-gray-700 rounded-lg p-4 mb-4'>
													<div className='flex justify-between items-center mb-3'>
														<span className='text-gray-300'>Achievements Unlocked</span>
														<span className='text-lg font-bold text-yellow-400'>
															{userAchievements.stats.totalUnlocked}/{userAchievements.stats.totalUnlocked + userAchievements.stats.totalLocked}
														</span>
													</div>
													<div className='w-full bg-gray-600 rounded-full h-2 mb-3'>
														<div
															className='bg-yellow-500 h-2 rounded-full'
															style={{ width: `${userAchievements.stats.completionPercentage}%` }}
														></div>
													</div>
													<div className='flex flex-wrap gap-2 mb-3'>
														{userAchievements.unlocked?.slice(0, 4).map((achievement) => (
															<span
																key={achievement.id}
																className='text-2xl'
																title={achievement.name}
															>
																{achievement.icon}
															</span>
														))}
														{userAchievements.unlocked?.length > 4 && (
															<span className='text-xs text-gray-400 self-center'>
																+{userAchievements.unlocked.length - 4} more
															</span>
														)}
													</div>
													<Link
														to="/achievements"
														className='text-green-400 hover:text-green-300 text-sm font-bold'
													>
														View All Achievements →
													</Link>
												</div>
											)}
																					
											<div className='grid grid-cols-2 gap-4'>
												<div className='bg-gray-700 rounded-lg p-4 text-center'>
													<div className='text-2xl font-bold text-green-400'>{user.listings}</div>
													<div className='text-sm text-gray-400'>Items Listed</div>
												</div>
												<div className='bg-gray-700 rounded-lg p-4 text-center'>
													<div className='text-2xl font-bold text-green-400'>12</div>
													<div className='text-sm text-gray-400'>Items Recycled</div>
												</div>
											</div>
										</>
									)}
									{isAdmin && (
										<div>
											<h3 className='text-lg font-bold mb-4 flex items-center'>
												<ShieldCheck size={20} className='mr-2 text-red-400' />
												Admin Privileges
											</h3>
											<div className='bg-gray-700 rounded-lg p-4 space-y-3'>
												<div className='flex items-center justify-between p-3 bg-gray-800 rounded'>
													<span className='text-gray-300'>User Management</span>
													<Link to='/admin/users' className='text-green-400 hover:text-green-300 text-sm font-bold'>
														Manage →
													</Link>
												</div>
												<div className='flex items-center justify-between p-3 bg-gray-800 rounded'>
													<span className='text-gray-300'>Analytics Dashboard</span>
													<Link to='/admin/analytics' className='text-green-400 hover:text-green-300 text-sm font-bold'>
														View →
													</Link>
												</div>
												<div className='flex items-center justify-between p-3 bg-gray-800 rounded'>
													<span className='text-gray-300'>Report Management</span>
													<Link to='/admin/reports' className='text-green-400 hover:text-green-300 text-sm font-bold'>
														Moderate →
													</Link>
												</div>
												<div className='flex items-center justify-between p-3 bg-gray-800 rounded'>
													<span className='text-gray-300'>Platform Settings</span>
													<Link to='/admin' className='text-green-400 hover:text-green-300 text-sm font-bold'>
														Configure →
													</Link>
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</motion.div>
					)}

					{activeTab === "listings" && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
						>
							<div className='flex justify-between items-center mb-6'>
								<h2 className='text-2xl font-bold'>My Listings</h2>
								<button onClick={handleAddListing} className='px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300'>
									+ Add New Listing
								</button>
							</div>
							<div className='bg-primary dark:bg-gray-800 rounded-xl border border-gray-700 overflow-hidden'>
								<table className='w-full'>
									<thead className='bg-gray-600'>
										<tr>
											<th className='text-left p-4'>Item</th>
											<th className='text-left p-4'>Price</th>
											<th className='text-left p-4'>Status</th>
											<th className='text-left p-4'>Views</th>
											<th className='text-left p-4'>Interested</th>
											<th className='text-left p-4'>Actions</th>
										</tr>
									</thead>
									<tbody>
										{listings.map((listing) => (
											<tr key={listing.id} className='border-b border-gray-700 hover:bg-gray-750'>
												<td className='p-4'>
													<div className='font-medium'>{listing.title}</div>
												</td>
												<td className='p-4'>${listing.price}</td>
												<td className='p-4'>
													<span className={`px-2 py-1 rounded-full text-xs font-bold ${listing.status === "Active"
														? "bg-green-900 text-green-300"
														: "bg-gray-700 text-gray-300"
														}`}>
														{listing.status}
													</span>
												</td>
												<td className='p-4'>{listing.views}</td>
												<td className='p-4'>{listing.interested}</td>
												<td className='p-4'>
													<button onClick={() => handleEditListing(listing.id)} className='text-green-400 hover:text-green-300 mr-3'>
														Edit
													</button>
													<button onClick={() => handleDeleteListing(listing.id)} className='text-red-400 hover:text-red-300'>
														Delete
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</motion.div>
					)}

					{activeTab === "payments" && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-700'
						>
							<h2 className='text-2xl font-bold mb-6'>Payment History</h2>
							<div className='text-center py-12'>
								<CreditCard size={48} className='mx-auto text-gray-500 mb-4' />
								<h3 className='text-xl font-bold mb-2'>No payment history yet</h3>
								<p className='text-gray-400 mb-4'>Your transactions will appear here once you start buying or selling</p>
								<Link
									to='/marketplace'
									className='px-4 py-2 bg-gray-800 dark:bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg hover:from-green-600 hover:to-emerald-700 transition duration-300'
								>
									Start Shopping
								</Link>
							</div>
						</motion.div>
					)}

					{activeTab === "settings" && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-700'
						>
							<h2 className='text-2xl font-bold mb-6'>Account Settings</h2>
							<div className='space-y-6'>
								<div>
									<h3 className='text-lg font-bold mb-4'>Notification Preferences</h3>
									<div className='space-y-3'>
										{[
											"Messages from buyers",
											"Messages from sellers",
											"New listings in my categories",
											"Eco points updates",
											"Platform announcements"
										].map((item, index) => (
											<div key={index} className='flex items-center justify-between p-3 bg-gray-700 rounded-lg'>
												<span>{item}</span>
												<label className='switch'>
													<input type='checkbox' defaultChecked />
													<span className='slider round'></span>
												</label>
											</div>
										))}
									</div>
								</div>
								<div>
									<h3 className='text-lg font-bold mb-4'>Privacy Settings</h3>
									<div className='space-y-3'>
										{[
											{ label: "Show my profile to other users", key: "show_profile" },
											{ label: "Allow messaging from anyone", key: "allow_messaging" },
											{ label: "Display my Eco Points publicly", key: "display_points" },
										].map((item) => (
											<div key={item.key} className='flex items-center justify-between p-3 bg-gray-700 rounded-lg'>
												<span>{item.label}</span>
												<label className='switch'>
													<input
														type='checkbox'
														checked={privacySettings[item.key]}
														onChange={() => handlePrivacyChange(item.key)}
													/>
													<span className='slider round'></span>
												</label>
											</div>
										))}
									</div>
								</div>
							</div>
						</motion.div>
					)}

					{activeTab === "security" && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className='bg-primary dark:bg-gray-800 rounded-xl p-6 border border-gray-700'
						>
							<h2 className='text-2xl font-bold mb-6'>Security Settings</h2>
							<div className='space-y-6'>
								<div className='p-4 bg-gray-700 rounded-lg'>
									<h3 className='text-lg font-bold mb-2'>Two-Factor Authentication</h3>
									<p className='text-gray-300 mb-4'>
										{user.isMfaEnabled
											? "Two-factor authentication is enabled on your account"
											: "Add an extra layer of security to your account"}
									</p>
									<button
										onClick={() => {
											if (user.isMfaEnabled) {
												alert("MFA is already enabled. Please contact support to disable it.");
											} else {
												window.location.href = "/mfa/setup";
											}
										}}
										className={`px-4 py-2 rounded font-bold transition duration-300 ${user.isMfaEnabled
											? "bg-gray-600 text-gray-400 cursor-not-allowed"
											: "bg-green-600 hover:bg-green-700 text-white"
											}`}
									>
										{user.isMfaEnabled ? "Enabled" : "Enable MFA"}
									</button>
								</div>
							</div>
						</motion.div>
					)}
				</motion.div>

				{/* Points Redemption Modal */}
				<PointsRedemptionModal 
					isOpen={showRedemptionModal} 
					onClose={() => setShowRedemptionModal(false)} 
				/>
			</div>
		</div>
	);
};

export default ProfilePage;