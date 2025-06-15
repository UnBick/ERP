const express = require('express');
const router = express.Router();
const busTrackingController = require('../controllers/busTrackingController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { checkRole } = require('../../../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(checkRole(['parent']));

router.get('/bus-location', busTrackingController.getBusLocation);
router.get('/bus-stops', busTrackingController.getBusStops);

module.exports = router;
