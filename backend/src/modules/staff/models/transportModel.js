const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    arrivalTime: String,
    departureTime: String,
    sequence: Number
});

const transportRouteSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    stops: [stopSchema],
    schedule: {
        startTime: String,
        endTime: String,
        days: [String]
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add index for geolocation queries
transportRouteSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('TransportRoute', transportRouteSchema);