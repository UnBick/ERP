const haversine = require('haversine-distance');

/**
 * Calculate distance between two geographic points
 * @param {Object} point1 { lat: number, lng: number }
 * @param {Object} point2 { lat: number, lng: number }
 * @returns {number} Distance in meters
 */
const calculateDistance = (point1, point2) => {
    try {
        if (!point1 || !point2 || !point1.lat || !point1.lng || !point2.lat || !point2.lng) {
            throw new Error('Invalid coordinates provided');
        }

        const p1 = { latitude: point1.lat, longitude: point1.lng };
        const p2 = { latitude: point2.lat, longitude: point2.lng };
        
        return haversine(p1, p2); // Returns distance in meters
    } catch (error) {
        console.error('Error calculating distance:', error);
        return null;
    }
};

/**
 * Calculate estimated time of arrival
 * @param {Object} currentLocation { lat: number, lng: number }
 * @param {Object} destination { lat: number, lng: number }
 * @param {number} averageSpeed Speed in km/h, defaults to 30
 * @returns {number} ETA in minutes
 */
const calculateETA = (currentLocation, destination, averageSpeed = 30) => {
    try {
        const distance = calculateDistance(currentLocation, destination);
        if (!distance) return null;

        // Convert distance to kilometers and speed to meters per second
        const distanceKm = distance / 1000;
        const speedMps = (averageSpeed * 1000) / 3600;

        // Calculate time in minutes
        const timeMinutes = Math.round((distanceKm / averageSpeed) * 60);

        return timeMinutes;
    } catch (error) {
        console.error('Error calculating ETA:', error);
        return null;
    }
};

/**
 * Optimize route for multiple stops
 * @param {Object} start Starting point { lat: number, lng: number }
 * @param {Array} stops Array of stops { lat: number, lng: number }
 * @returns {Array} Optimized array of stops
 */
const optimizeRoute = (start, stops) => {
    try {
        if (!start || !Array.isArray(stops) || stops.length === 0) {
            throw new Error('Invalid parameters for route optimization');
        }

        // Simple nearest neighbor algorithm
        let currentPoint = start;
        const remainingStops = [...stops];
        const optimizedRoute = [];

        while (remainingStops.length > 0) {
            let nearestIndex = 0;
            let shortestDistance = calculateDistance(currentPoint, remainingStops[0]);

            // Find nearest stop
            remainingStops.forEach((stop, index) => {
                const distance = calculateDistance(currentPoint, stop);
                if (distance < shortestDistance) {
                    shortestDistance = distance;
                    nearestIndex = index;
                }
            });

            // Add nearest stop to route
            currentPoint = remainingStops[nearestIndex];
            optimizedRoute.push(remainingStops[nearestIndex]);
            remainingStops.splice(nearestIndex, 1);
        }

        return optimizedRoute;
    } catch (error) {
        console.error('Error optimizing route:', error);
        return stops;
    }
};

/**
 * Format duration for display
 * @param {number} minutes Duration in minutes
 * @returns {string} Formatted duration string
 */
const formatDuration = (minutes) => {
    try {
        if (!minutes || minutes < 0) return 'N/A';

        if (minutes < 60) {
            return `${minutes} min`;
        }

        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
    } catch (error) {
        console.error('Error formatting duration:', error);
        return 'N/A';
    }
};

/**
 * Check if a stop is within proximity radius
 * @param {Object} busLocation Current bus location
 * @param {Object} stopLocation Stop location
 * @param {number} radiusMeters Proximity radius in meters
 * @returns {boolean} Whether the bus is within the radius
 */
const isWithinProximity = (busLocation, stopLocation, radiusMeters = 100) => {
    try {
        const distance = calculateDistance(busLocation, stopLocation);
        return distance <= radiusMeters;
    } catch (error) {
        console.error('Error checking proximity:', error);
        return false;
    }
};

module.exports = {
    calculateDistance,
    calculateETA,
    optimizeRoute,
    formatDuration,
    isWithinProximity
};
