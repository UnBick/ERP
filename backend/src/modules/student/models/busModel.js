const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    },
    capacity: {
        type: Number,
        required: true
    },
    currentOccupancy: {
        type: Number,
        default: 0
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    conductor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    currentLocation: {
        coordinates: {
            type: [Number],
            default: undefined
        },
        timestamp: Date,
        speed: Number
    },
    nextStopIndex: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'maintenance', 'inactive'],
        default: 'active'
    },
    maintenanceHistory: [{
        date: Date,
        type: String,
        description: String,
        cost: Number
    }]
}, { timestamps: true });

busSchema.index({ number: 1 });
busSchema.index({ route: 1 });
busSchema.index({ 'currentLocation.coordinates': '2dsphere' });
module.exports = mongoose.model('Bus', busSchema);