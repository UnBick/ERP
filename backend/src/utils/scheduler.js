const cron = require('node-cron');
const Message = require('../modules/communication/models/Message');

// Schedule cleanup of old deleted messages
cron.schedule('0 0 * * *', async () => { // Runs daily at midnight
    try {
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

        await Message.deleteMany({
            isDeleted: true,
            deletedAt: { $lt: oneYearAgo }
        });

        console.log('Cleaned up old deleted messages');
    } catch (error) {
        console.error('Error cleaning up old messages:', error);
    }
});
