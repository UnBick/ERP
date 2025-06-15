const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    address: String,
    landmark: String,
    route: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Route'
    },
    sequence: Number,
    schedule: [{
        busId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Bus'
        },
        arrivalTime: String,
        departureTime: String
    }],
    type: {
        type: String,
        enum: ['pickup', 'drop', 'both'],
        default: 'both'
    }
}, { timestamps: true });

stopSchema.index({ location: '2dsphere' });
stopSchema.index({ route: 1, sequence: 1 });
module.exports = mongoose.model('Stop', stopSchema);