const mongoose = require('mongoose');

const payrollDetailSchema = new mongoose.Schema({
    staff: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: true
    },
    basicSalary: {
        type: Number,
        required: true
    },
    allowances: {
        type: Map,
        of: Number,
        default: {}
    },
    deductions: {
        type: Map,
        of: Number,
        default: {}
    },
    netSalary: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'processed', 'paid'],
        default: 'pending'
    },
    paymentDate: Date
});

const payrollReportSchema = new mongoose.Schema({
    month: {
        type: String,
        required: true,
        enum: [
            'January', 'February', 'March', 'April',
            'May', 'June', 'July', 'August',
            'September', 'October', 'November', 'December'
        ]
    },
    year: {
        type: Number,
        required: true,
        min: 2000,
        max: 2100
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    payrollDetails: [payrollDetailSchema],
    summary: {
        totalStaff: Number,
        totalSalaryPaid: Number,
        totalAllowances: Number,
        totalDeductions: Number,
        netPayrollAmount: Number
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    exportFormat: {
        type: String,
        enum: ['pdf', 'csv', 'excel'],
        default: 'pdf'
    },
    fileUrl: String,
    status: {
        type: String,
        enum: ['draft', 'generated', 'approved', 'processed'],
        default: 'draft'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvalDate: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
payrollReportSchema.index({ month: 1, year: 1 });
payrollReportSchema.index({ 'payrollDetails.staff': 1 });
payrollReportSchema.index({ status: 1 });

// Calculate summary before saving
payrollReportSchema.pre('save', function(next) {
    if (this.isModified('payrollDetails')) {
        const summary = this.payrollDetails.reduce((acc, detail) => {
            acc.totalStaff++;
            acc.totalSalaryPaid += detail.basicSalary;
            acc.totalAllowances += Array.from(detail.allowances.values())
                .reduce((sum, val) => sum + val, 0);
            acc.totalDeductions += Array.from(detail.deductions.values())
                .reduce((sum, val) => sum + val, 0);
            return acc;
        }, {
            totalStaff: 0,
            totalSalaryPaid: 0,
            totalAllowances: 0,
            totalDeductions: 0
        });

        summary.netPayrollAmount = summary.totalSalaryPaid + 
            summary.totalAllowances - summary.totalDeductions;

        this.summary = summary;
    }
    next();
});

// Virtual for formatted date
payrollReportSchema.virtual('formattedPeriod').get(function() {
    return `${this.month} ${this.year}`;
});

const PayrollReport = mongoose.model('PayrollReport', payrollReportSchema);

module.exports = PayrollReport;