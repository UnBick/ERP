const mongoose = require('mongoose');

const transportFeeSchema = new mongoose.Schema({
    minDistance: {
        type: Number,
        required: [true, 'Minimum distance is required'],
        min: [0, 'Distance cannot be negative']
    },
    maxDistance: {
        type: Number,
        required: [true, 'Maximum distance is required'],
        validate: {
            validator: function(value) {
                return value > this.minDistance;
            },
            message: 'Maximum distance must be greater than minimum distance'
        }
    },
    cost: {
        type: Number,
        required: [true, 'Cost is required'],
        min: [0, 'Cost cannot be negative']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.models.TransportFee || mongoose.model('TransportFee', transportFeeSchema);