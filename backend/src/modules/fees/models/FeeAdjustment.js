const mongoose = require('mongoose');

const adjustmentSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['percentage', 'amount'],
        default: 'percentage'
    },
    value: {
        type: Number,
        default: 0
    }
});

const feeAdjustmentSchema = new mongoose.Schema({
    general: adjustmentSchema,
    obc: adjustmentSchema,
    sc: adjustmentSchema,
    st: adjustmentSchema,
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Check if model exists before creating
module.exports = mongoose.models.FeeAdjustment || mongoose.model('FeeAdjustment', feeAdjustmentSchema);
