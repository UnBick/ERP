const express = require('express');
const router = express.Router();
const { authenticate } = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');
const validate = require('../../../utils/validationUtil');
const feesValidation = require('../validations/feesValidation');
const feesController = require('../controller/feesController');

// Apply middleware
router.use(authenticate);
router.use(checkRole(['admin', 'accountant']));

// Fee Structure Routes
router.get('/structure', feesController.getFeeStructures);
router.post(
    '/structure',
    validate(feesValidation.feeStructure.create),
    feesController.createFeeStructure
);
router.put(
    '/structure/:id',
    validate(feesValidation.feeStructure.update),
    feesController.updateFeeStructure
);
router.delete('/structure/:id', feesController.deleteFeeStructure);

// Fee Adjustment Routes
router.get('/adjustments', feesController.getFeeAdjustments);
router.post(
    '/adjustments',
    validate(feesValidation.feeAdjustment.create),
    feesController.createFeeAdjustment
);
router.put(
    '/adjustments/:id',
    validate(feesValidation.feeAdjustment.update),
    feesController.updateFeeAdjustment
);

// Transport Fee Routes
router.get('/transport', feesController.getTransportFees);
router.post(
    '/transport',
    validate(feesValidation.transportFee.create),
    feesController.createTransportFee
);
router.put(
    '/transport/:id',
    validate(feesValidation.transportFee.update),
    feesController.updateTransportFee
);

// Late Fee Routes
router.get('/late-fee', feesController.getLateFees);
router.post(
    '/late-fee',
    validate(feesValidation.lateFee.create),
    feesController.createLateFee
);
router.put(
    '/late-fee/:id',
    validate(feesValidation.lateFee.update),
    feesController.updateLateFee
);
router.patch(
    '/waive-late-fee/:feeId',
    validate(feesValidation.waiveLateFee),
    feesController.waiveLateFee
);

// Fee Collection Routes
router.get('/collections', feesController.getFeeCollections);
router.post(
    '/collect',
    validate(feesValidation.feeCollection.create),
    feesController.createFeeCollection
);
router.get('/pending', feesController.getPendingFees);
router.get('/receipts', feesController.getAllReceipts);

// Report Routes
router.get('/reports/collection', feesController.getCollectionReport);
router.get('/reports/defaulters', feesController.getDefaultersReport);

// Fee Payment Status Routes
router.get('/student/:studentId', feesController.getStudentFees);
router.get('/class/:classId', feesController.getClassFees);
router.get('/outstanding', feesController.getOutstandingFees);

// Fee Receipt Generation
router.get('/receipt/:receiptId/download', feesController.downloadReceipt);
router.get('/receipt/:receiptId/print', feesController.printReceipt);

module.exports = router;