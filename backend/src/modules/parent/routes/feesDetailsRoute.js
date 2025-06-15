const express = require('express');
const router = express.Router();
const feesController = require('../controller/feesDetailsController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');

// Debug middleware
router.use((req, res, next) => {
    console.log('Fees Route:', {
        path: req.path,
        method: req.method,
        userId: req.user?._id
    });
    next();
});

router.use(authMiddleware);
router.use(checkRole(['parent']));

router.get('/:studentId', feesController.getFeesDetails);
router.get('/:studentId/pending', feesController.getPendingFees);
router.get('/:studentId/history', feesController.getPaymentHistory);
router.post('/initiate-payment', feesController.initiatePayment);
router.post('/confirm-payment', feesController.confirmPayment);
router.get('/receipt/:paymentId', feesController.downloadReceipt);

module.exports = router;