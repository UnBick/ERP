const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    type: {
        type: String,
        enum: ['academic', 'sports', 'laboratory', 'library', 'other'],
        required: true
    },
    specifications: {
        area: String,
        capacity: Number,
        location: String,
        features: [String],
        equipment: [{
            name: String,
            quantity: Number,
            condition: String
        }]
    },
    staffInCharge: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    },
    images: [String],
    maintenanceSchedule: [{
        date: Date,
        type: String,
        description: String,
        status: String
    }],
    status: {
        type: String,
        enum: ['active', 'maintenance', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

module.exports = mongoose.model('Facility', facilitySchema);