const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route',
        required: true
    },
    vehicle: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle'
    },
    pickupPoint: {
        location: String,
        time: String,
        landmark: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    dropPoint: {
        location: String,
        time: String,
        landmark: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },
    type: {
        type: String,
        enum: ['one-way', 'two-way'],
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    fees: {
        amount: Number,
        paid: Boolean,
        dueDate: Date
    }
}, { timestamps: true });

transportSchema.index({ student: 1, route: 1 });
transportSchema.index({ vehicle: 1 });

module.exports = mongoose.model('Transport', transportSchema);