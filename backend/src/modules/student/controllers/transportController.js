const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const Transport = require('../models/studentTransportModel');
const Bus = require('../models/busModel');
const Stop = require('../models/stopModel');
const Route = require('../models/routeModel');
const { calculateDistance, calculateETA } = require('../../../utils/transportUtils');
const { WebSocket } = require('ws');
const { sendNotification } = require('../../../utils/notificationUtils');

// WebSocket connections store
const connections = new Map();

exports.getBuses = catchAsync(async (req, res) => {
    const buses = await Bus.find()
        .populate('driver', 'name phone')
        .populate('route')
        .populate({
            path: 'currentLocation',
            select: 'coordinates timestamp speed'
        });

    const enhancedBuses = await Promise.all(buses.map(async bus => {
        const eta = await calculateETA(
            bus.currentLocation.coordinates,
            bus.route.stops[bus.nextStopIndex]
        );

        return {
            id: bus._id,
            number: bus.number,
            route: bus.route.name,
            driver: bus.driver.name,
            status: determineStatus(bus),
            eta,
            location: bus.currentLocation.coordinates,
            capacity: bus.capacity,
            occupancy: bus.currentOccupancy
        };
    }));

    res.json(ApiResponse.success('Buses retrieved successfully', enhancedBuses));
});

exports.getStops = catchAsync(async (req, res) => {
    const { routeId } = req.query;
    
    let query = {};
    if (routeId) query.route = routeId;

    const stops = await Stop.find(query)
        .populate('route')
        .populate({
            path: 'nextBus',
            select: 'number eta'
        });

    const enhancedStops = stops.map(stop => ({
        id: stop._id,
        name: stop.name,
        location: stop.location,
        nextBus: stop.nextBus?.number,
        eta: stop.nextBus?.eta,
        schedule: stop.schedule
    }));

    res.json(ApiResponse.success('Stops retrieved successfully', enhancedStops));
});

exports.updateBusLocation = catchAsync(async (req, res) => {
    const { busId } = req.params;
    const { location, speed, timestamp } = req.body;

    const bus = await Bus.findByIdAndUpdate(
        busId,
        {
            currentLocation: {
                coordinates: location,
                speed,
                timestamp
            },
            lastUpdated: new Date()
        },
        { new: true }
    );

    // Broadcast location update to connected clients
    const wsMessage = JSON.stringify({
        type: 'locationUpdate',
        busId,
        location,
        eta: await calculateETA(location, bus.route.stops[bus.nextStopIndex])
    });

    connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(wsMessage);
        }
    });

    res.json(ApiResponse.success('Bus location updated successfully'));
});

exports.getRouteHistory = catchAsync(async (req, res) => {
    const { busId, date } = req.query;

    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    const history = await Transport.find({
        bus: busId,
        timestamp: {
            $gte: startDate,
            $lt: endDate
        }
    }).sort('timestamp');

    res.json(ApiResponse.success('Route history retrieved successfully', history));
});

exports.updateAlertSettings = catchAsync(async (req, res) => {
    const { userId } = req.user;
    const settings = req.body;

    await Transport.findOneAndUpdate(
        { user: userId },
        { alertSettings: settings },
        { new: true, upsert: true }
    );

    res.json(ApiResponse.success('Alert settings updated successfully'));
});

exports.handleBusDeparture = catchAsync(async (req, res) => {
    const { busId, stopId } = req.params;

    const bus = await Bus.findById(busId)
        .populate('route')
        .populate('subscribers');

    // Send notifications to subscribed users
    await Promise.all(bus.subscribers.map(user => 
        sendNotification({
            type: 'transport',
            recipient: user.email,
            subject: 'Bus Departure Alert',
            message: `Bus ${bus.number} has departed from ${stopId}`
        })
    ));

    res.json(ApiResponse.success('Departure handled successfully'));
});

exports.handleBusArrival = catchAsync(async (req, res) => {
    const { busId, stopId } = req.params;

    const [bus, stop] = await Promise.all([
        Bus.findById(busId).populate('subscribers'),
        Stop.findById(stopId)
    ]);

    // Send notifications to subscribers
    await Promise.all(bus.subscribers.map(user => 
        sendNotification({
            type: 'transport',
            recipient: user.email,
            subject: 'Bus Arrival Alert',
            message: `Bus ${bus.number} is arriving at ${stop.name}`
        })
    ));

    res.json(ApiResponse.success('Arrival handled successfully'));
});

// Helper Functions
const determineStatus = (bus) => {
    const now = new Date();
    const schedule = bus.route.schedule;
    
    if (!bus.currentLocation) return 'Not Available';
    
    const delay = calculateDelay(bus.currentLocation.timestamp, schedule);
    
    if (delay <= 5) return 'On Time';
    if (delay <= 15) return 'Slightly Delayed';
    return 'Delayed';
};

const calculateDelay = (currentTime, schedule) => {
    const expectedTime = new Date(schedule);
    return Math.floor((currentTime - expectedTime) / (1000 * 60));
};

module.exports = exports;