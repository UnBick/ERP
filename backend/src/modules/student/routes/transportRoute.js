const express = require('express');
const router = express.Router();
const { 
    getBuses,
    getStops,
    updateBusLocation,
    getRouteHistory,
    updateAlertSettings,
    handleBusDeparture,
    handleBusArrival
} = require('../controllers/transportController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { validateDriver, validateStudent } = require('../../../middleware/roleMiddleware');
const cache = require('../../../middleware/cacheMiddleware');
const wsMiddleware = require('../../../middleware/websocketMiddleware');

/**
 * @route   GET /api/transport/buses
 * @desc    Get all buses with real-time locations
 */
router.get(
    '/buses',
    [
        authMiddleware,
        cache('30 seconds')
    ],
    getBuses
);

/**
 * @route   GET /api/transport/stops
 * @desc    Get all stops with next bus information
 */
router.get(
    '/stops',
    [
        authMiddleware,
        cache('1 minute')
    ],
    getStops
);

/**
 * @route   POST /api/transport/bus/:busId/location
 * @desc    Update bus location (Driver only)
 */
router.post(
    '/bus/:busId/location',
    [
        authMiddleware,
        validateDriver,
        wsMiddleware
    ],
    updateBusLocation
);

/**
 * @route   GET /api/transport/route/history
 * @desc    Get route history for a specific bus
 */
router.get(
    '/route/history',
    [authMiddleware],
    getRouteHistory
);

/**
 * @route   PUT /api/transport/alerts
 * @desc    Update transport alert settings
 */
router.put(
    '/alerts',
    [
        authMiddleware,
        validateStudent
    ],
    updateAlertSettings
);

/**
 * @route   POST /api/transport/bus/:busId/departure/:stopId
 * @desc    Handle bus departure from stop
 */
router.post(
    '/bus/:busId/departure/:stopId',
    [
        authMiddleware,
        validateDriver
    ],
    handleBusDeparture
);

/**
 * @route   POST /api/transport/bus/:busId/arrival/:stopId
 * @desc    Handle bus arrival at stop
 */
router.post(
    '/bus/:busId/arrival/:stopId',
    [
        authMiddleware,
        validateDriver
    ],
    handleBusArrival
);

module.exports = router;