import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useMessageStore } from "../store/messageStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
	MessageCircle,
	Clock,
	Search,
	ArrowLeft
} from "lucide-react";

const MessagesPage = () => {
	const navigate = useNavigate();
	const { conversations, loading, getConversations } = useMessageStore();
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		fetchConversations();
	}, []);

	const fetchConversations = async () => {
		try {
			await getConversations();
		} catch (error) {
			toast.error("Failed to load conversations");
		}
	};

	const handleConversationClick = (userId) => {
		navigate(`/messages/${userId}`);
	};

	const filteredConversations = conversations.filter(conv =>
		conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const formatTime = (date) => {
		const now = new Date();
		const messageDate = new Date(date);
		const diffInHours = (now - messageDate) / (1000 * 60 * 60);

		if (diffInHours < 1) {
			const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
			return `${diffInMinutes}m ago`;
		} else if (diffInHours < 24) {
			return `${Math.floor(diffInHours)}h ago`;
		} else {
			return messageDate.toLocaleDateString();
		}
	};

	if (loading && conversations.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<div className="min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 py-8 px-4">
		<div className="max-w-4xl mx-auto">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
			>
				{/* Header */}
				<div className="mb-6">
					<div className="flex items-center gap-4 mb-4">
						<button
							onClick={() => navigate(-1)}
							className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
						>
							<ArrowLeft className="w-6 h-6" />
						</button>
						<h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
					</div>

					{/* Search Bar */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-5 h-5" />
						<input
							type="text"
							placeholder="Search conversations..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
					</div>
				</div>

				{/* Conversations List */}
				<div className="bg-primary dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
					{filteredConversations.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-16 px-4">
							<MessageCircle className="w-16 h-16 text-gray-400 mb-4" />
							<h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
								{searchTerm ? "No conversations found" : "No messages yet"}
							</h3>
							<p className="text-gray-500 dark:text-gray-400 text-center">
								{searchTerm
									? "Try a different search term"
									: "Start a conversation by messaging someone about their listing"}
							</p>
						</div>
					) : (
						<div className="divide-y divide-gray-200 dark:divide-gray-700 ">
							{filteredConversations.map((conv, index) => (
								<motion.div
									key={conv.user._id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: index * 0.05 }}
									className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors "
									onClick={() => handleConversationClick(conv.user._id)}
								>
									<div className="flex items-center gap-4  ">
										{/* Avatar */}
										<div className="flex-shrink-0 ">
											{conv.user.profilePicture ? (
												<img
													src={conv.user.profilePicture}
													alt={conv.user.name}
													className="w-12 h-12 rounded-full object-cover"
												/>
											) : (
												<div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
													{conv.user.name.charAt(0).toUpperCase()}
												</div>
											)}
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-center justify-between mb-1">
												<h3 className="font-semibold text-gray-900 dark:text-white truncate">
													{conv.user.name}
												</h3>
												<div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
													<Clock className="w-4 h-4" />
													<span>{formatTime(conv.lastMessageAt)}</span>
												</div>
											</div>
											<p className={`text-sm truncate ${
												!conv.isRead && !conv.sentByMe
													? "text-gray-900 dark:text-white font-semibold"
													: "text-gray-600 dark:text-gray-400"
											}`}>
												{conv.sentByMe ? "You: " : ""}
												{conv.lastMessage}
											</p>
										</div>

										{/* Unread Indicator */}
										{!conv.isRead && !conv.sentByMe && (
											<div className="flex-shrink-0">
												<div className="w-3 h-3 bg-green-500 rounded-full"></div>
											</div>
										)}
									</div>
								</motion.div>
							))}
						</div>
					)}
				</div>
			</motion.div>
		</div>
		</div>
	);
};

export default MessagesPage;
