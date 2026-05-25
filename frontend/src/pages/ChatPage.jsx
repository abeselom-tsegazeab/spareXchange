import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useMessageStore } from "../store/messageStore";
import { useAuthStore } from "../store/authStore";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import {
	ArrowLeft,
	Send
} from "lucide-react";
import { initSocket, onNewMessage, offNewMessage } from "../utils/socket";

const ChatPage = () => {
	const { userId } = useParams();
	const navigate = useNavigate();
	const { user } = useAuthStore();
	const { currentConversation, loading, getConversation, sendMessage, markAsRead } = useMessageStore();
	const [newMessage, setNewMessage] = useState("");
	const [otherUser, setOtherUser] = useState(null);
	const messagesEndRef = useRef(null);

	useEffect(() => {
		fetchConversation();
		
		// Initialize socket for real-time messaging
		if (user) {
			initSocket(user._id);
			
			// Listen for new messages
			onNewMessage((data) => {
				if (data.from === userId) {
					// Refresh conversation when new message arrives
					fetchConversation();
				}
			});
		}

		return () => {
			offNewMessage();
		};
	}, [userId, user]);

	useEffect(() => {
		scrollToBottom();
	}, [currentConversation]);

	useEffect(() => {
		// Mark conversation as read
		if (userId && currentConversation.length > 0) {
			markAsRead(userId);
		}
	}, [currentConversation.length]);

	const fetchConversation = async () => {
		try {
			const messages = await getConversation(userId);
			if (messages.length > 0) {
				const msg = messages[0];
				// Handle both populated and non-populated senderId
				const senderId = typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId;
				const isSender = senderId.toString() === userId;
				
				// Set otherUser to the full user object (populated) or just the ID
				if (isSender) {
					// If I'm the sender, the other user is the receiver
					setOtherUser(typeof msg.receiverId === 'object' ? msg.receiverId : { _id: msg.receiverId, name: 'User' });
				} else {
					// If I'm the receiver, the other user is the sender
					setOtherUser(typeof msg.senderId === 'object' ? msg.senderId : { _id: msg.senderId, name: 'User' });
				}
			}
		} catch (error) {
			toast.error("Failed to load conversation");
		}
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!newMessage.trim()) return;

		try {
			await sendMessage(userId, newMessage.trim());
			setNewMessage("");
			scrollToBottom();
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to send message");
		}
	};

	const formatTime = (date) => {
		return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	};

	if (loading && currentConversation.length === 0) {
		return <LoadingSpinner />;
	}

	return (
		<div className="min-h-screen bg-white dark:bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 py-8 px-4">
		<div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="flex-1 flex flex-col bg-primary dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700"
			>
				{/* Header */}
				<div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
					<div className="flex items-center gap-4">
						<button
							onClick={() => navigate("/messages")}
							className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors"
						>
							<ArrowLeft className="w-6 h-6 text-gray-900 dark:text-white" />
						</button>
						{otherUser && (
							<>
								{otherUser.profilePicture ? (
									<img
										src={otherUser.profilePicture}
										alt={otherUser.name || 'User'}
										className="w-10 h-10 rounded-full object-cover"
									/>
								) : (
									<div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold">
										{(otherUser.name || 'U').charAt(0).toUpperCase()}
									</div>
								)}
								<div>
									<h2 className="font-semibold text-lg text-gray-900 dark:text-white">{otherUser.name || 'User'}</h2>
									<p className="text-sm text-gray-600 dark:text-gray-400">Online</p>
								</div>
							</>
						)}
					</div>
				</div>

				{/* Messages */}
				<div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800">
					{currentConversation.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-center">
							<p className="text-gray-500 dark:text-gray-400">
								No messages yet. Start the conversation!
							</p>
						</div>
					) : (
						currentConversation.map((msg, index) => {
							// Handle both populated and non-populated senderId
							const senderId = msg.senderId ? (typeof msg.senderId === 'object' ? msg.senderId._id : msg.senderId) : null;
							const isMyMessage = senderId?.toString() === user?._id.toString();
							return (
								<motion.div
									key={msg._id}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: index * 0.05 }}
									className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
								>
									<div
										className={`max-w-[70%] px-4 py-2 rounded-lg ${
											isMyMessage
												? "bg-green-500 text-white"
												: "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
										}`}
									>
										<p className="break-words">{msg.content}</p>
										<p className={`text-xs mt-1 ${
											isMyMessage ? "text-green-100" : "text-gray-500 dark:text-gray-400"
										}`}>
											{formatTime(msg.createdAt)}
											{isMyMessage && msg.isRead && " ✓✓"}
										</p>
									</div>
								</motion.div>
							);
						})
					)}
					<div ref={messagesEndRef} />
				</div>

				{/* Message Input */}
				<form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900">
					<div className="flex items-center gap-2">
						<input
							type="text"
							value={newMessage}
							onChange={(e) => setNewMessage(e.target.value)}
							placeholder="Type a message..."
							className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
						/>
						<button
							type="submit"
							disabled={!newMessage.trim()}
							className="p-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
						>
							<Send className="w-5 h-5" />
						</button>
					</div>
				</form>
			</motion.div>
		</div>
		</div>
	);
};

export default ChatPage;
