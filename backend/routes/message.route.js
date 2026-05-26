import express from "express";
import { sendMessage, getConversation, getConversationsList, markAsRead, getUnreadMessagesCount } from "../controllers/message.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/conversations", verifyToken, getConversationsList);
router.get("/:userId", verifyToken, getConversation);
router.post("/", verifyToken, sendMessage);
router.put("/read/:senderId", verifyToken, markAsRead);
router.get("/unread-count", verifyToken, getUnreadMessagesCount);

export default router;
