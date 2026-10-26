const express = require('express');
const router = express.Router();
const {
  getUserConversations,
  getOrCreateConversation,
  getConversationMessages,
  sendMessage,
} = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getUserConversations);
router.post('/', getOrCreateConversation);
router.get('/:id/messages', getConversationMessages);
router.post('/:id/messages', sendMessage);

module.exports = router;
