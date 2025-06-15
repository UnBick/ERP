const express = require('express');
const router = express.Router();
const feesController = require('../controller/feesController');
const authMiddleware = require('../../../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Basic CRUD routes for fee collections
router.route('/collections')
  .get(feesController.getFeeCollections)
  .post(feesController.createFeeCollection);

router.route('/collections/:id')
  .put(feesController.updateFeeCollection)
  .delete(feesController.deleteFeeCollection);

// Fee structures routes
router.route('/structures')
  .get(feesController.getFeeStructures)
  .post(feesController.createFeeStructure);

// Fee adjustments routes
router.route('/adjustments')
  .get(feesController.getFeeAdjustments)
  .put(feesController.updateFeeAdjustments);

// Transport fee routes
router.route('/transport')
  .get(feesController.getTransportFees)
  .post(feesController.createTransportFee);

// Late fee penalty routes
router.route('/penalties')
  .get(feesController.getLateFees)
  .post(feesController.createLateFee);

router.route('/penalties/:id')
  .put(feesController.updateLateFee)
  .delete(feesController.deleteLateFee);

// Report routes
router.get('/reports/collection', feesController.getCollectionReport);
router.get('/reports/defaulters', feesController.getDefaultersReport);
router.get('/pending', feesController.getPendingFees);

module.exports = router;
