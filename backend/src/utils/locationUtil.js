const SCHOOL_COORDINATES = {
    latitude: 23.385592,
    longitude: 85.281191,
    radius: 100 // Radius in meters within which attendance is allowed
};

/**
 * Calculates the distance between two points using the Haversine formula
 * @param {Object} location - {latitude, longitude}
 * @returns {number} Distance in meters
 */
const calculateDistance = (location) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (location.latitude * Math.PI) / 180;
    const φ2 = (SCHOOL_COORDINATES.latitude * Math.PI) / 180;
    const Δφ = ((SCHOOL_COORDINATES.latitude - location.latitude) * Math.PI) / 180;
    const Δλ = ((SCHOOL_COORDINATES.longitude - location.longitude) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Validates if a given location is within school premises
 * @param {Object} location - {latitude, longitude}
 * @returns {Promise<boolean>} True if location is valid
 */
const validateLocation = async (location) => {
    // Basic validation - ensure location has lat and lng
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
        return false;
    }

    // Add your school's location boundaries here
    const schoolBounds = {
        minLat: 0, // Replace with actual minimum latitude
        maxLat: 90, // Replace with actual maximum latitude
        minLng: 0, // Replace with actual minimum longitude
        maxLng: 180 // Replace with actual maximum longitude
    };

    return location.lat >= schoolBounds.minLat && 
           location.lat <= schoolBounds.maxLat && 
           location.lng >= schoolBounds.minLng && 
           location.lng <= schoolBounds.maxLng;
};

module.exports = { validateLocation };