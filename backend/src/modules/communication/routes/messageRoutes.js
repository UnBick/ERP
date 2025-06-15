const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../../../middleware/authMiddleware');
const validate = require('../../../utils/validationUtil');
const messageValidation = require('../validations/messageValidation');

// Debug middleware
router.use((req, res, next) => {
    console.log('Message route:', {
        path: req.path,
        method: req.method,
        query: req.query
    });
    next();
});

// Apply middlewares
router.use(authMiddleware);

// GET routes
router.get('/recipients', messageController.getRecipients);
router.get('/messages/:recipientId', messageController.getMessages);
router.get('/inbox', messageController.getInbox);
router.get('/teachers', authMiddleware, messageController.getTeachersForStudent);

// POST routes
router.post('/send', validate(messageValidation.sendMessage), messageController.sendMessage);

// PUT routes
router.put('/messages/:messageId/:action', messageController.updateMessage);

// DELETE routes
router.delete('/messages/:messageId', messageController.deleteMessage);

module.exports = router;
