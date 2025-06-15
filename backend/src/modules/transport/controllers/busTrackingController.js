const catchAsync = require('../../../utils/catchAsync');
const ApiResponse = require('../../../utils/apiResponse');
const BusRoute = require('../models/busRouteModel');
const BusLocation = require('../models/busLocationModel');
const Student = require('../../student/models/studentModel');

exports.getBusLocation = catchAsync(async (req, res) => {
    const { busId } = req.query;
    const parent = await Parent.findOne({ user: req.user._id });
    
    // Get student's bus route
    const student = await Student.findOne({ 
        parent: parent._id,
        'transportInfo.isUsingTransport': true 
    }).populate('transportInfo.busRoute');

    if (!student) {
        return res.status(404).json(
            ApiResponse.error('No student found using transport service')
        );
    }

    const busLocation = await BusLocation.findOne({
        busRoute: student.transportInfo.busRoute._id
    }).populate('busRoute');

    if (!busLocation) {
        return res.status(404).json(
            ApiResponse.error('Bus location not found')
        );
    }

    const nextStop = await calculateNextStop(busLocation);
    const eta = await calculateETA(busLocation, nextStop);

    res.json(ApiResponse.success('Bus location retrieved successfully', {
        location: busLocation.currentLocation,
        nextStop,
        eta,
        routeInfo: busLocation.busRoute,
        driverInfo: {
            name: busLocation.busRoute.driverName,
            contact: busLocation.busRoute.driverContact
        },
        busInfo: {
            number: busLocation.busRoute.busNumber,
            capacity: busLocation.busRoute.capacity
        }
    }));
});

exports.getBusStops = catchAsync(async (req, res) => {
    const parent = await Parent.findOne({ user: req.user._id });
    const student = await Student.findOne({ 
        parent: parent._id,
        'transportInfo.isUsingTransport': true 
    }).populate('transportInfo.busRoute');

    if (!student?.transportInfo?.busRoute) {
        return res.status(404).json(
            ApiResponse.error('No bus route found for student')
        );
    }

    res.json(ApiResponse.success('Bus stops retrieved successfully', {
        stops: student.transportInfo.busRoute.stops
    }));
});

// Helper functions
const calculateNextStop = async (busLocation) => {
    const currentLocation = busLocation.currentLocation;
    const stops = busLocation.busRoute.stops;
    
    // Find the next stop based on current location and route
    let nextStop = stops[0];
    let minDistance = Infinity;

    stops.forEach(stop => {
        const distance = calculateDistance(
            currentLocation.coordinates[1],
            currentLocation.coordinates[0],
            stop.location.coordinates[1],
            stop.location.coordinates[0]
        );
        if (distance < minDistance) {
            minDistance = distance;
            nextStop = stop;
        }
    });

    return nextStop;
};

const calculateETA = async (busLocation, nextStop) => {
    // Calculate ETA based on distance and average speed
    const distance = calculateDistance(
        busLocation.currentLocation.coordinates[1],
        busLocation.currentLocation.coordinates[0],
        nextStop.location.coordinates[1],
        nextStop.location.coordinates[0]
    );

    const averageSpeed = 30; // km/h
    const eta = Math.round((distance / averageSpeed) * 60); // minutes
    return eta;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};

const deg2rad = (deg) => {
    return deg * (Math.PI/180);
};
