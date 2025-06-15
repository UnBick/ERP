const express = require('express');
const router = express.Router();
const messageController = require('../controller/messageController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const upload = require('../../../middleware/uploadMiddleware');

// Debug middleware
router.use((req, res, next) => {
    console.log('Parent Communication Route:', {
        path: req.path,
        method: req.method,
        userId: req.user?._id
    });
    next();
});

router.use(authMiddleware);
router.use(checkRole(['parent']));

// Routes with proper middleware and handlers
router.get('/teachers', messageController.getTeachers);
router.get('/messages/:teacherId', messageController.getMessages);
router.post('/send', upload.array('attachments'), messageController.sendMessage);
router.put('/messages/:messageId/read', messageController.markAsRead);

module.exports = router;
