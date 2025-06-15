const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff', // Updated to match the Staff model name
        required: true
    },
    staffName: {
        type: String,
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
    basicPay: {
        type: Number,
        required: true
    },
    allowances: {
        hra: Number,
        da: Number,
        travelAllowance: Number,
        medicalAllowance: Number
    },
    deductions: {
        pf: Number,
        tds: Number,
        professionalTax: Number
    },
    totalAllowances: Number,
    totalDeductions: Number,
    netPay: Number,
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    },
    paymentMode: String,
    paymentDate: Date,
    remarks: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create indexes for frequently queried fields
payrollSchema.index({ staffId: 1, year: 1, month: 1 });
payrollSchema.index({ status: 1 });
payrollSchema.index({ isActive: 1 });

const Payroll = mongoose.model('Payroll', payrollSchema);
module.exports = Payroll;