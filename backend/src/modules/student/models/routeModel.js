const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    stops: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop'
    }],
    distance: {
        type: Number,
        required: true
    },
    estimatedTime: {
        type: Number,  // in minutes
        required: true
    },
    fare: {
        type: Number,
        required: true
    },
    schedule: [{
        dayOfWeek: {
            type: String,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        },
        departureTime: String,
        arrivalTime: String
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'maintenance'],
        default: 'active'
    }
}, { timestamps: true });

routeSchema.index({ name: 1 });
module.exports = mongoose.model('Route', routeSchema);