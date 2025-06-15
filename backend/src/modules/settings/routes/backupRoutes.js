const express = require('express');
const router = express.Router();
const catchAsync = require('../../../utils/catchAsync');
const { authMiddleware } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const backupController = require('../controllers/backupController');

// All routes require authentication and admin role
router.use(authMiddleware, checkRole(['admin']));

router.get('/history', backupController.getBackupHistory);
router.post('/create', backupController.createBackup);
router.post('/restore/:backupId', backupController.restoreBackup);
router.post('/schedule', backupController.scheduleBackup);
router.get('/schedule', backupController.getBackupSchedule);
router.delete('/:backupId', backupController.deleteBackup);

module.exports = router;
