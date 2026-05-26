import { Message } from "../models/message.model.js";
import { User } from "../models/user.model.js";
import { Exchange } from "../models/exchange.model.js";
import { emitToUser } from "../utils/socket.js";

export const sendMessage = async (req, res) => {
	try {
		const { receiverId, content, listingId } = req.body;
		const senderId = req.userId;

		if (!receiverId || !content) {
			return res.status(400).json({ success: false, message: "Receiver and content are required." });
		}

		const newMessage = new Message({
			senderId,
			receiverId,
			content,
			listingId,
		});

		await newMessage.save();

		// Real-time Notification
		emitToUser(receiverId, "new_message", {
			from: senderId,
			text: content, // Changed 'message' to 'content' as per existing variable
			conversationId: newMessage._id, // Using the new message's ID as a unique identifier for this specific message within a conversation
		});

		res.status(201).json({ success: true, message: "Message sent successfully.", data: newMessage });
	} catch (error) {
		console.error("Error in sendMessage: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const getConversation = async (req, res) => {
	try {
		const { userId: otherUserId } = req.params;
		const userId = req.userId;

		const messages = await Message.find({
			$or: [
				{ senderId: userId, receiverId: otherUserId },
				{ senderId: otherUserId, receiverId: userId },
			],
		})
			.sort({ createdAt: 1 })
			.populate("senderId", "name profilePicture")
			.populate("receiverId", "name profilePicture")
			.populate("listingId", "title images");

		res.status(200).json({ success: true, messages });
	} catch (error) {
		console.error("Error in getConversation: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const getConversationsList = async (req, res) => {
	try {
		const userId = req.userId;

		// Find distinct users we have conversed with
		const messages = await Message.find({
			$or: [{ senderId: userId }, { receiverId: userId }],
		})
			.sort({ createdAt: -1 })
			.populate("senderId", "name profilePicture")
			.populate("receiverId", "name profilePicture");

		const conversationsMap = new Map();

		messages.forEach((msg) => {
			const isSender = msg.senderId._id.toString() === userId.toString();
			const otherUser = isSender ? msg.receiverId : msg.senderId;
			const otherUserIdStr = otherUser._id.toString();

			if (!conversationsMap.has(otherUserIdStr)) {
				conversationsMap.set(otherUserIdStr, {
					user: {
						_id: otherUser._id,
						name: otherUser.name,
						profilePicture: otherUser.profilePicture,
					},
					lastMessage: msg.content,
					lastMessageAt: msg.createdAt,
					isRead: msg.isRead,
					sentByMe: isSender,
					hasResponse: !isSender && !msg.isRead, // Flag indicating the other user has responded and it's unread
				});
			}
		});

		const conversationsList = Array.from(conversationsMap.values());

		res.status(200).json({ success: true, conversations: conversationsList });
	} catch (error) {
		console.error("Error in getConversationsList: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const markAsRead = async (req, res) => {
	try {
		const { senderId } = req.params;
		const receiverId = req.userId;

		await Message.updateMany(
			{ senderId, receiverId, isRead: false },
			{ $set: { isRead: true } }
		);
		res.status(200).json({ success: true, message: "Messages marked as read" });
	} catch (error) {
		console.error("Error in markAsRead: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const getUnreadMessagesCount = async (req, res) => {
	try {
		const userId = req.userId;

		const count = await Message.countDocuments({
			receiverId: userId,
			isRead: false
		});

		res.status(200).json({ success: true, count });
	} catch (error) {
		console.error("Error in getUnreadMessagesCount: ", error);
		res.status(500).json({ success: false, message: "Server error" });
	}
};
