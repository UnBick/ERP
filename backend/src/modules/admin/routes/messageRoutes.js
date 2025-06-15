const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Message Settings Routes
router.get('/settings/messages', messageController.getSettings);
router.patch('/settings/messages', messageController.updateSettings);

// Message Templates Routes
router.get('/settings/message-templates', messageController.getTemplates);
router.post('/settings/message-templates', messageController.createTemplate);
router.put('/settings/message-templates/:id', messageController.updateTemplate);
router.delete('/settings/message-templates/:id', messageController.deleteTemplate);

// Message History Routes
router.get('/messages/history', messageController.getHistory);
router.post('/messages/send', messageController.sendMessage);
router.post('/messages/schedule', messageController.scheduleMessage); // Now defined

module.exports = router;
