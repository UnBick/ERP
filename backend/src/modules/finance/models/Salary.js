const mongoose = require('mongoose');

const allowanceSchema = new mongoose.Schema({
    hra: { type: Number, default: 0 },
    da: { type: Number, default: 0 },
    travelAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 }
});

const deductionSchema = new mongoose.Schema({
    pf: { type: Number, default: 0 },
    tds: { type: Number, default: 0 },
    professionalTax: { type: Number, default: 0 }
});

const salarySchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    staffName: {
        type: String,
        required: true
    },
    basicPay: {
        type: Number,
        required: true
    },
    allowances: {
        type: allowanceSchema,
        default: () => ({})
    },
    deductions: {
        type: deductionSchema,
        default: () => ({})
    },
    totalAllowances: {
        type: Number,
        default: 0
    },
    totalDeductions: {
        type: Number,
        default: 0
    },
    netPay: {
        type: Number,
        required: true
    },
    month: {
        type: Number,
        required: true,
        min: 1,
        max: 12
    },
    year: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'paid'],
        default: 'pending'
    },
    remarks: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Salary', salarySchema);
