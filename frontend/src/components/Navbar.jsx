import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, Package, Leaf, Home, Info, HelpCircle, Phone, LogOut, LogIn, Sun, Moon, ChevronDown, Trophy, PlusCircle, List, TrendingUp, LayoutDashboard, Handshake, Wrench, Search, MessageCircle, Bell, Shield, Users, Award, Activity, Settings, Webhook, ShoppingCart } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import { useTheme } from "../contexts/ThemeContext";
import { useNotificationStore } from "../store/notificationStore";
import { useMessageStore } from "../store/messageStore";
import { useCartStore } from "../store/cartStore";

const Navbar = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth < 820);
	const location = useLocation();
	const navigate = useNavigate();
	const { isAuthenticated, user, logout, isLoading } = useAuthStore();
	const { darkMode, toggleDarkMode } = useTheme();
	const { unreadCount: unreadNotifications, getUnreadCount } = useNotificationStore();
	const { unreadCount: unreadMessages, getUnreadMessagesCount, getConversations } = useMessageStore();
	const { cartItems, initializeCart, getCartCount } = useCartStore();
	const [conversationsWithResponses, setConversationsWithResponses] = useState(0);
	const mobileMenuRef = useRef(null);
	const navigationDropdownRef = useRef(null);
	const inboxDropdownRef = useRef(null);
	const listingsDropdownRef = useRef(null);
	const communityDropdownRef = useRef(null);

	// Handle window resize to toggle mobile view
	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < 820);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	// Close mobile menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
				setIsMenuOpen(false);
			}
		};

		if (isMenuOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isMenuOpen]);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (navigationDropdownRef.current && !navigationDropdownRef.current.contains(event.target)) {
				setIsNavigationDropdownOpen(false);
			}
			if (inboxDropdownRef.current && !inboxDropdownRef.current.contains(event.target)) {
				setIsInboxDropdownOpen(false);
			}
			if (listingsDropdownRef.current && !listingsDropdownRef.current.contains(event.target)) {
				setIsListingsDropdownOpen(false);
			}
			if (communityDropdownRef.current && !communityDropdownRef.current.contains(event.target)) {
				setIsCommunityDropdownOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// Fetch unread counts and initialize cart on mount
	useEffect(() => {
		if (isAuthenticated) {
			getUnreadCount().catch(() => {});
			getUnreadMessagesCount().catch(() => {});
			// Fetch conversations to check for responses
			const fetchConversationsWithResponses = async () => {
				try {
					const conversations = await getConversations();
					// Count conversations where owner has responded (hasResponse flag is true)
					const responseCount = conversations.filter(conv => conv.hasResponse).length;
					setConversationsWithResponses(responseCount);
				} catch (error) {
					console.error("Failed to fetch conversations:", error);
				}
			};
			fetchConversationsWithResponses();
		}
		initializeCart(); // Initialize cart from backend
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated]);

	const [isNavigationDropdownOpen, setIsNavigationDropdownOpen] = useState(false);
	const [isMobileNavigationDropdownOpen, setIsMobileNavigationDropdownOpen] = useState(false);
	const [isInboxDropdownOpen, setIsInboxDropdownOpen] = useState(false);
	const [isMobileInboxDropdownOpen, setIsMobileInboxDropdownOpen] = useState(false);
	const [isListingsDropdownOpen, setIsListingsDropdownOpen] = useState(false);
	const [isCommunityDropdownOpen, setIsCommunityDropdownOpen] = useState(false);

	// Nav links for unauthenticated users
	const publicNavLinks = [
		{ name: "Home", path: "/", icon: Home },
		{ name: "About", path: "/about", icon: Info },
		{ name: "FAQ", path: "/faq", icon: HelpCircle },
		{ name: "Contact", path: "/contact", icon: Phone },
	];

	// Navigation dropdown items - different for admin vs users
	const isAdmin = user?.userType === "admin";
	const navigationDropdownItems = isAdmin
		? [
				{ name: "Admin Panel", path: "/admin", icon: Shield },
				{ name: "Marketplace", path: "/marketplace", icon: Package },
			]
		: [
				{ name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
				{ name: "Marketplace", path: "/marketplace", icon: Package },
				{ name: "My Exchanges", path: "/my-exchanges", icon: Handshake },
			];

	// Inbox dropdown items
	const inboxDropdownItems = [
		{ name: "Messages", path: "/messages", icon: MessageCircle },
		{ name: "Notifications", path: "/notifications", icon: Bell },
	];

	// Listings dropdown items - different for admin vs users
	const listingsDropdownItems = isAdmin
		? [
				{ name: "Item Listings", path: "/admin/listings", icon: List },
				{ name: "Technician Requests", path: "/admin/technician-requests", icon: Wrench },
				{ name: "Analytics", path: "/analytics", icon: TrendingUp },
				{ name: "Leaderboard", path: "/leaderboard", icon: Trophy },
			]
		: [
				{ name: "Create Listing", path: "/create-listing", icon: PlusCircle },
				{ name: "My Listings", path: "/my-listings", icon: List },
				{ name: "Saved Searches", path: "/saved-searches", icon: Search },
				{ name: "Analytics", path: "/analytics", icon: TrendingUp },
				{ name: "Leaderboard", path: "/leaderboard", icon: Trophy },
				{ name: "Find Requests", path: "/technician-requests", icon: Wrench },
				{ name: "My Requests", path: "/technician-requests/my-requests", icon: List },
				{ name: "Create Request", path: "/technician-requests/create", icon: PlusCircle },
			];

	// Community dropdown items
	const communityDropdownItems = [
		{ name: "Activity Feed", path: "/activity-feed", icon: Activity },
		{ name: "Achievements", path: "/achievements", icon: Award },
		{ name: "Leaderboard", path: "/leaderboard", icon: Trophy },
	];

	// For public users, show public nav links directly
	const visibleNavLinks = !isAuthenticated ? publicNavLinks : [];

	const isActive = (path) => {
		if (path === "/" && location.pathname === "/") return true;
		if (path !== "/" && location.pathname.startsWith(path)) return true;
		return false;
	};

	return (
		<nav className={`${darkMode ? "bg-primary text-white" : "bg-white"} border-b border-border sticky top-0 z-50 `}>
			<div className=' mx-auto px-4'>
				<div className='flex items-center justify-between h-16  flex-wrap'>
					{/* Logo */}
					<Link to='/' className='flex items-center'>
						<span className={`text-xl md:text-2xl font-bold ${darkMode ? "bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text " : "bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text"} `}>
							SpareXChange
						</span>
					</Link>

					{/* Desktop Navigation */}
					<div className={`${isMobile || isMenuOpen ? 'hidden' : 'flex'} items-center space-x-2 lg:space-x-4`}>
						{isAuthenticated && (
							<div className='relative' ref={navigationDropdownRef}>
								<button
									onClick={() => setIsNavigationDropdownOpen(!isNavigationDropdownOpen)}
									className={`flex items-center px-1.5 py-2 rounded-md text-xs md:text-sm font-medium transition duration-300 text-muted-foreground hover:text-foreground hover:bg-accent`}
								>
									<LayoutDashboard size={14} className='mr-1.5' />
									<span className='hidden md:inline'>Navigation</span>
									<ChevronDown size={14} className={`ml-1 transition-transform ${isNavigationDropdownOpen ? 'rotate-180' : ''}`} />
								</button>

								{isNavigationDropdownOpen && (
									<div className='absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50'>
										{navigationDropdownItems.map((item) => (
											<Link
												key={item.path}
												to={item.path}
												onClick={() => setIsNavigationDropdownOpen(false)}
												className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200'
											>
												<item.icon size={16} className='mr-2' />
												{item.name}
											</Link>
										))}
									</div>
								)}
							</div>
						)}

						{isAuthenticated && (
							<div className='relative' ref={inboxDropdownRef}>
								<button
									onClick={() => setIsInboxDropdownOpen(!isInboxDropdownOpen)}
									className={`flex items-center px-1.5 py-2 rounded-md text-xs md:text-sm font-medium transition duration-300 text-muted-foreground hover:text-foreground hover:bg-accent`}
								>
									<Bell size={14} className='mr-1.5' />
									<span className='hidden md:inline'>Inbox</span>
									<ChevronDown size={14} className={`ml-1 transition-transform ${isInboxDropdownOpen ? 'rotate-180' : ''}`} />
									{(unreadNotifications > 0 || unreadMessages > 0 || conversationsWithResponses > 0) && (
										<span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
									)}
								</button>

								{isInboxDropdownOpen && (
									<div className='absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50'>
										{inboxDropdownItems.map((item) => {
											const hasMessageResponses = item.name === 'Messages' && conversationsWithResponses > 0;
											const hasNewNotifications = item.name === 'Notifications' && unreadNotifications > 0;
											return (
												<Link
													key={item.path}
													to={item.path}
													onClick={() => setIsInboxDropdownOpen(false)}
													className='flex items-center justify-between px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200'
												>
													<div className="flex items-center gap-2">
														<item.icon size={16} className='mr-2' />
														{item.name}
														{(hasMessageResponses || hasNewNotifications) && (
															<span className="w-2 h-2 bg-red-500 rounded-full"></span>
														)}
													</div>
												</Link>
											);
										})}
									</div>
								)}
							</div>
						)}

						{isAuthenticated && (
							<div className='relative' ref={listingsDropdownRef}>
								<button
									onClick={() => setIsListingsDropdownOpen(!isListingsDropdownOpen)}
									className={`flex items-center px-1.5 py-2 rounded-md text-xs md:text-sm font-medium transition duration-300 text-muted-foreground hover:text-foreground hover:bg-accent`}
								>
									<Package size={14} className='mr-1.5' />
									<span className='hidden md:inline'>Listings</span>
									<ChevronDown size={14} className={`ml-1 transition-transform ${isListingsDropdownOpen ? 'rotate-180' : ''}`} />
								</button>

								{isListingsDropdownOpen && (
									<div className='absolute top-full left-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50'>
										{listingsDropdownItems.map((item) => (
											<Link
												key={item.path}
												to={item.path}
												onClick={() => setIsListingsDropdownOpen(false)}
												className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200'
											>
												<item.icon size={16} className='mr-2' />
												{item.name}
											</Link>
										))}
									</div>
								)}
							</div>
						)}

						{isAuthenticated && (
							<div className='relative' ref={communityDropdownRef}>
								<button
									onClick={() => setIsCommunityDropdownOpen(!isCommunityDropdownOpen)}
									className={`flex items-center px-1.5 py-2 rounded-md text-xs md:text-sm font-medium transition duration-300 text-muted-foreground hover:text-foreground hover:bg-accent`}
								>
									<Users size={14} className='mr-1.5' />
									<span className='hidden md:inline'>Community</span>
									<ChevronDown size={14} className={`ml-1 transition-transform ${isCommunityDropdownOpen ? 'rotate-180' : ''}`} />
								</button>

								{isCommunityDropdownOpen && (
									<div className='absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50'>
										{communityDropdownItems.map((item) => (
											<Link
												key={item.path}
												to={item.path}
												onClick={() => setIsCommunityDropdownOpen(false)}
												className='flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition duration-200'
											>
												<item.icon size={16} className='mr-2' />
												{item.name}
											</Link>
										))}
									</div>
								)}
							</div>
						)}
					</div>

					{/* Search and Actions */}
					<div className={`${isMobile ? 'hidden' : 'flex'} items-center space-x-1 lg:space-x-2 min-w-max`}>
						{isAuthenticated && (
							<Link to="/cart" className='relative p-2 rounded-full hover:bg-accent transition duration-300'>
								<ShoppingCart size={20} className='text-muted-foreground' />
								{getCartCount() > 0 && (
									<span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
										{getCartCount() > 9 ? '9+' : getCartCount()}
									</span>
								)}
							</Link>
						)}
						<button
							onClick={toggleDarkMode}
							className='p-2 rounded-full hover:bg-accent transition duration-300'
							aria-label='Toggle dark mode'
						>
							{darkMode ? <Sun size={20} className='text-yellow-400' /> : <Moon size={20} className='text-muted-foreground' />}
						</button>

						{isAuthenticated ? (
							<div className='flex items-center space-x-2 min-w-max'>
								{user?.ecoPoints !== undefined && (
									<span className='text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground border border-border hidden sm:inline-flex items-center'>
										<Leaf className='inline mr-1 h-3 w-3' />
										{user.ecoPoints}
									</span>
								)}
								<UserMenu user={user} logout={logout} isLoading={isLoading} navigate={navigate} />
							</div>
						) : (
							<div className='flex items-center space-x-2 min-w-max'>
								<Link to='/login' className='flex items-center px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition duration-300'>
									<LogIn size={16} className='mr-2' /> <span className='hidden lg:inline'>Login</span>
								</Link>
								<Link to='/signup' className={`flex items-center px-3 py-2 rounded-md text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition duration-300 dark:bg-white dark:text-primary dark:hover:bg-accent dark:hover:text-black`}>
									<User size={16} className='mr-2' /> <span className='hidden md:inline'>Sign Up</span>
								</Link>
							</div>
						)}
					</div>

					{/* Mobile menu button */}
					<div className={`${isMobile ? 'flex' : 'hidden'} items-center space-x-2 z-50`}>
						<button
							onClick={toggleDarkMode}
							className='p-2 rounded-full hover:bg-accent transition duration-300'
							aria-label='Toggle dark mode'
						>
							{darkMode ? <Sun size={20} className='text-yellow-400' /> : <Moon size={20} className='text-muted-foreground' />}
						</button>
						{isAuthenticated && (
							<UserMenu user={user} logout={logout} isLoading={isLoading} navigate={navigate} mobile />
						)}
						<button
							onClick={() => setIsMenuOpen(!isMenuOpen)}
							className='p-2 rounded-md text-muted-foreground hover:text-primary hover:bg-accent focus:outline-none'
						>
							{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMobile && isMenuOpen && (
					<div
						ref={mobileMenuRef}
						className='absolute top-16 left-0 right-0 bg-background border-b border-border shadow-xl z-50 animate-fadeInDown'
					>
						<div className='px-4 py-3 space-y-1'>
							{visibleNavLinks.map((link) => (
								<Link
									key={link.path}
									to={link.path}
									className={`flex items-center px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 transform hover:translate-x-2 ${isActive(link.path)
										? "text-green-400 bg-accent"
										: "text-muted-foreground hover:text-foreground hover:bg-accent"
										}`}
									onClick={() => setIsMenuOpen(false)}
								>
									<link.icon size={20} className='mr-3' />
									{link.name}
								</Link>
							))}
							
							{isAuthenticated && (
								<div>
									<button
										onClick={() => setIsMobileNavigationDropdownOpen(!isMobileNavigationDropdownOpen)}
										className='flex items-center w-full px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300'
									>
										<LayoutDashboard size={20} className='mr-3' />
										Navigation
										<ChevronDown size={16} className={`ml-auto transition-transform ${isMobileNavigationDropdownOpen ? 'rotate-180' : ''}`} />
									</button>
							
									{isMobileNavigationDropdownOpen && (
										<div className='ml-8 mt-1 space-y-1'>
											{navigationDropdownItems.map((item) => (
												<Link
													key={item.path}
													to={item.path}
													onClick={() => {
														setIsMenuOpen(false);
														setIsMobileNavigationDropdownOpen(false);
													}}
													className='flex items-center px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-accent hover:text-white transition duration-200'
												>
													<item.icon size={16} className='mr-2' />
													{item.name}
												</Link>
											))}
										</div>
									)}
								</div>
							)}
							
							{isAuthenticated && (
								<div>
									<button
										onClick={() => setIsMobileInboxDropdownOpen(!isMobileInboxDropdownOpen)}
										className='flex items-center w-full px-4 py-3 rounded-lg text-base font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-300'
									>
										<Bell size={20} className='mr-3' />
										Inbox
										{(unreadNotifications > 0 || unreadMessages > 0 || conversationsWithResponses > 0) && (
											<span className="ml-auto w-3 h-3 bg-red-500 rounded-full"></span>
										)}
										<ChevronDown size={16} className={`ml-2 transition-transform ${isMobileInboxDropdownOpen ? 'rotate-180' : ''}`} />
									</button>
							
									{isMobileInboxDropdownOpen && (
										<div className='ml-8 mt-1 space-y-1'>
											{inboxDropdownItems.map((item) => {
												const hasMessageResponses = item.name === 'Messages' && conversationsWithResponses > 0;
												const hasNewNotifications = item.name === 'Notifications' && unreadNotifications > 0;
												return (
													<Link
														key={item.path}
														to={item.path}
														onClick={() => {
															setIsMenuOpen(false);
															setIsMobileInboxDropdownOpen(false);
														}}
														className='flex items-center justify-between px-4 py-2 rounded-lg text-sm text-gray-300 hover:bg-accent hover:text-white transition duration-200'
													>
														<div className="flex items-center gap-2">
															<item.icon size={16} className='mr-2' />
															{item.name}
															{(hasMessageResponses || hasNewNotifications) && (
																<span className="w-2 h-2 bg-red-500 rounded-full"></span>
															)}
														</div>
													</Link>
												);
											})}
										</div>
									)}
								</div>
							)}
							<div className='pt-4 pb-3 border-t border-border mt-2 dark:border-gray-700'>
								{isAuthenticated && (
									<div className='flex items-center justify-between px-3 mb-4'>
										<button
											onClick={toggleDarkMode}
											className='p-3 rounded-full bg-accent hover:bg-accent/80 transition duration-300 ml-auto'
											aria-label='Toggle dark mode'
										>
											{darkMode ? <Sun size={20} className='text-yellow-400' /> : <Moon size={20} className='text-muted-foreground' />}
										</button>
									</div>
								)}
								{!isAuthenticated && (
									<div className='flex items-center justify-between px-3 mb-4'>
										<button
											onClick={toggleDarkMode}
											className='p-3 rounded-full bg-accent hover:bg-accent/80 transition duration-300'
											aria-label='Toggle dark mode'
										>
											{darkMode ? <Sun size={20} className='text-yellow-400' /> : <Moon size={20} className='text-muted-foreground' />}
										</button>
									</div>
								)}

								{isAuthenticated ? (
									<div className='mt-3 px-3 space-y-3'>
										{user?.ecoPoints !== undefined && (
											<div className='flex items-center justify-between'>
												<span className='text-sm font-medium text-muted-foreground'>EcoPoints</span>
												<span className='text-xs px-3 py-1.5 rounded-full bg-accent text-muted-foreground font-semibold flex items-center border border-border'>
													<Leaf className='inline mr-1.5 h-3.5 w-3.5' />
													{user.ecoPoints}
												</span>
											</div>
										)}
										<div className='flex space-x-3'>
											<Link
												to='/profile'
												className='flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent text-muted-foreground hover:bg-accent/80 transition duration-300'
												onClick={() => setIsMenuOpen(false)}
											>
												<User size={18} className='mr-2' />
												Profile
											</Link>
											<button
												disabled={isLoading}
												onClick={async () => {
													await logout();
													navigate("/");
													setIsMenuOpen(false);
												}}
												className='flex-1 flex items-center justify-center px-4 py-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition duration-300 disabled:opacity-50'
											>
												<LogOut size={18} className='mr-2' />
												Logout
											</button>
										</div>
									</div>
								) : (
									<div className='mt-3 px-3 space-y-3'>
										<Link to='/login' className='flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent text-muted-foreground hover:bg-accent/80 transition duration-300' onClick={() => setIsMenuOpen(false)}>
											<LogIn size={18} className='mr-2' /> Login
										</Link>
										<Link to='/signup' className='flex items-center justify-center px-4 py-2.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition duration-300 dark:bg-green-600 dark:hover:bg-green-700' onClick={() => setIsMenuOpen(false)}>
											<User size={18} className='mr-2' /> Sign Up
										</Link>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};

const UserMenu = ({ user, logout, isLoading, navigate, mobile = false }) => {
	const [isOpen, setIsOpen] = useState(false);
	const menuRef = useRef(null);
	const isAdmin = user?.userType === "admin";

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	const handleLogout = async () => {
		await logout();
		navigate("/");
		setIsOpen(false);
	};

	if (mobile) {
		return (
			<>
				<button
					onClick={() => setIsOpen(!isOpen)}
					className='p-1 rounded-full hover:bg-accent transition-all duration-300 transform hover:scale-105 group'
				>
					{user?.profilePicture ? (
						<img
							src={user.profilePicture}
							alt={user?.name || user?.email}
							className='w-8 h-8 rounded-full object-cover border-2 border-green-400'
						/>
					) : (
						<div className='bg-gray-700 p-1.5 rounded-full'>
							<User size={20} className='text-white group-hover:text-green-400 group-hover:drop-shadow-[0_0_4px_rgba(72,187,120,0.5)] transition-all duration-300' />
						</div>
					)}
				</button>
				{isOpen && (
					<div
						ref={menuRef}
						className='absolute right-0 top-12 w-56 bg-background/90 backdrop-blur-lg rounded-xl shadow-2xl border border-border z-[100] animate-bounceIn'
					>
						<div className='p-3 border-b border-border bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-xl dark:from-gray-800 dark:to-gray-900'>
							<div className='flex items-center space-x-2'>
								{user?.profilePicture ? (
									<img
										src={user.profilePicture}
										alt={user?.name || user?.email}
										className='w-10 h-10 rounded-full object-cover border-2 border-green-400'
									/>
								) : (
									<div className='bg-gray-700 p-1.5 rounded-full'>
										<User size={18} className='text-green-400' />
									</div>
								)}
								<div>
									<p className='text-sm font-bold text-white truncate'>{user?.name || user?.email}</p>
									{user?.ecoPoints !== undefined && (
										<div className='flex items-center mt-1'>
											<Leaf className='h-3 w-3 text-green-500 mr-1' />
											<span className='text-xs font-semibold text-green-400'>{user.ecoPoints} EcoPoints</span>
										</div>
									)}
								</div>
							</div>
						</div>
						<Link
							to='/profile'
							className='block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
							onClick={() => setIsOpen(false)}
						>
							<div className='flex items-center'>
								<User size={14} className='mr-2 text-green-400' />
								<span className='font-medium'>Profile</span>
							</div>
						</Link>
						<Link
							to={isAdmin ? '/my-listings' : '/my-listings'}
							className='block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
							onClick={() => setIsOpen(false)}
						>
							<div className='flex items-center'>
								<List size={14} className='mr-2 text-green-400' />
								<span className='font-medium'>{isAdmin ? 'Listings' : 'My Listings'}</span>
							</div>
						</Link>
						{!isAdmin && (
							<Link
								to='/create-listing'
								className='block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
								onClick={() => setIsOpen(false)}
							>
								<div className='flex items-center'>
									<PlusCircle size={14} className='mr-2 text-green-400' />
									<span className='font-medium'>Create Listing</span>
								</div>
							</Link>
						)}
						<Link
							to='/saved-searches'
							className='block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
							onClick={() => setIsOpen(false)}
						>
							<div className='flex items-center'>
								<Search size={14} className='mr-2 text-green-400' />
								<span className='font-medium'>Saved Searches</span>
							</div>
						</Link>
						<Link
							to='/notifications/preferences'
							className='block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
							onClick={() => setIsOpen(false)}
						>
							<div className='flex items-center'>
								<Settings size={14} className='mr-2 text-blue-400' />
								<span className='font-medium'>Notification Settings</span>
							</div>
						</Link>
						<Link
							to='/notifications/history'
							className='block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
							onClick={() => setIsOpen(false)}
						>
							<div className='flex items-center'>
								<Activity size={14} className='mr-2 text-purple-400' />
								<span className='font-medium'>Notification History</span>
							</div>
						</Link>
						<Link
							to='/notifications/webhooks'
							className='block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
							onClick={() => setIsOpen(false)}
						>
							<div className='flex items-center'>
								<Webhook size={14} className='mr-2 text-orange-400' />
								<span className='font-medium'>Webhooks</span>
							</div>
						</Link>
						{user?.userType === "admin" && (
							<>
								<Link
									to='/admin'
									className='block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
									onClick={() => setIsOpen(false)}
								>
									<div className='flex items-center'>
										<Shield size={14} className='mr-2 text-red-400' />
										<span className='font-medium'>Admin Panel</span>
									</div>
								</Link>
								<Link
									to='/notifications/stats'
									className='block px-4 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
									onClick={() => setIsOpen(false)}
								>
									<div className='flex items-center'>
										<TrendingUp size={14} className='mr-2 text-green-400' />
										<span className='font-medium'>Notification Stats</span>
									</div>
								</Link>
							</>
						)}
						<button
							disabled={isLoading}
							onClick={handleLogout}
							className='block w-full text-left px-4 py-2.5 text-sm text-muted-foreground hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2 disabled:opacity-50'
						>
							<div className='flex items-center'>
								<LogOut size={14} className='mr-2' />
								<span className='font-medium'>Logout</span>
							</div>
						</button>
					</div>
				)}
			</>
		);
	}

	return (
		<div className='relative' ref={menuRef}>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='flex items-center p-1 rounded-full hover:bg-accent transition-all duration-300 transform hover:scale-105 group'
			>
				{user?.profilePicture ? (
					<img
						src={user.profilePicture}
						alt={user?.name || user?.email}
						className='w-8 h-8 rounded-full object-cover border-2 border-green-400'
					/>
				) : (
					<div className='bg-gray-700 p-1.5 rounded-full'>
						<User size={20} className='text-white group-hover:text-green-400 group-hover:drop-shadow-[0_0_4px_rgba(72,187,120,0.5)] transition-all duration-300' />
					</div>
				)}
				<ChevronDown size={16} className={`text-white group-hover:text-green-400 ml-1 transition-all duration-300 ${isOpen ? 'rotate-180' : ''}`} />
			</button>
			{isOpen && (
				<div className='absolute right-0 top-12 w-64 bg-background/90 backdrop-blur-lg rounded-xl shadow-2xl border border-border z-[100] animate-bounceIn'>
					<div className='p-4 border-b border-border bg-gradient-to-r from-gray-800 to-gray-900 rounded-t-xl dark:from-gray-800 dark:to-gray-900'>
						<div className='flex items-center space-x-3'>
							{user?.profilePicture ? (
								<img
									src={user.profilePicture}
									alt={user?.name || user?.email}
									className='w-12 h-12 rounded-full object-cover border-2 border-green-400'
								/>
							) : (
								<div className='bg-gray-700 p-2 rounded-full'>
									<User size={24} className='text-green-400' />
								</div>
							)}
							<div>
								<p className='text-sm font-bold text-white truncate'>{user?.name || user?.email}</p>
								{user?.ecoPoints !== undefined && (
									<div className='flex items-center mt-1'>
										<Leaf className='h-4 w-4 text-green-500 mr-1' />
										<span className='text-xs font-semibold text-green-400'>{user.ecoPoints} EcoPoints</span>
									</div>
								)}
							</div>
						</div>
					</div>
					<Link
						to='/profile'
						className='block px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
						onClick={() => setIsOpen(false)}
					>
						<div className='flex items-center'>
							<User size={16} className='mr-2 text-green-400' />
							<span className='font-medium'>Profile</span>
						</div>
					</Link>
					<Link
						to={isAdmin ? '/my-listings' : '/my-listings'}
						className='block px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
						onClick={() => setIsOpen(false)}
					>
						<div className='flex items-center'>
							<List size={16} className='mr-2 text-green-400' />
							<span className='font-medium'>{isAdmin ? 'Listings' : 'My Listings'}</span>
						</div>
					</Link>
					{!isAdmin && (
						<Link
							to='/create-listing'
							className='block px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
							onClick={() => setIsOpen(false)}
						>
							<div className='flex items-center'>
								<PlusCircle size={16} className='mr-2 text-green-400' />
								<span className='font-medium'>Create Listing</span>
							</div>
						</Link>
					)}
					<Link
						to='/saved-searches'
						className='block px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
						onClick={() => setIsOpen(false)}
					>
						<div className='flex items-center'>
							<Search size={16} className='mr-2 text-green-400' />
							<span className='font-medium'>Saved Searches</span>
						</div>
					</Link>
					{user?.userType === "admin" && (
						<Link
							to='/admin'
							className='block px-4 py-3 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2'
							onClick={() => setIsOpen(false)}
						>
							<div className='flex items-center'>
								<Shield size={16} className='mr-2 text-red-400' />
								<span className='font-medium'>Admin Panel</span>
							</div>
						</Link>
					)}
					<button
						disabled={isLoading}
						onClick={handleLogout}
						className='block w-full text-left px-4 py-3 text-sm text-muted-foreground hover:bg-red-500/20 hover:text-red-400 transition-all duration-200 transform hover:translate-x-1 rounded-lg mx-2 disabled:opacity-50'
					>
						<div className='flex items-center'>
							<LogOut size={16} className='mr-2' />
							<span className='font-medium'>Logout</span>
						</div>
					</button>
				</div>
			)}
		</div>
	);
};

export default Navbar;