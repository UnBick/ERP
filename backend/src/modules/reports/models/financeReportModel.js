const mongoose = require('mongoose');

const financeReportSchema = new mongoose.Schema({
    reportType: {
        type: String,
        enum: ['Income', 'Expenditure', 'Fee Collection'],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    transactionDetails: {
        paymentMode: {
            type: String,
            enum: ['cash', 'online', 'cheque', 'bank_transfer']
        },
        referenceNumber: String,
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded']
        }
    },
    relatedTo: {
        model: {
            type: String,
            enum: ['Student', 'Staff', 'Vendor', 'Other']
        },
        id: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'relatedTo.model'
        }
    },
    reportPeriod: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    summary: {
        totalAmount: Number,
        totalTransactions: Number,
        statistics: mongoose.Schema.Types.Mixed
    },
    exportFormat: {
        type: String,
        enum: ['pdf', 'csv', 'excel'],
        default: 'csv'
    },
    fileUrl: String,
    status: {
        type: String,
        enum: ['draft', 'generated', 'archived'],
        default: 'draft'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
financeReportSchema.index({ reportType: 1, 'reportPeriod.startDate': 1, 'reportPeriod.endDate': 1 });
financeReportSchema.index({ 'relatedTo.model': 1, 'relatedTo.id': 1 });

// Virtual for formatted amount
financeReportSchema.virtual('formattedAmount').get(function() {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(this.amount);
});

// Pre-save middleware to update summary
financeReportSchema.pre('save', async function(next) {
    if (this.isModified('amount')) {
        this.summary = await this.constructor.calculateSummary(
            this.reportType,
            this.reportPeriod.startDate,
            this.reportPeriod.endDate
        );
    }
    next();
});

// Static method to calculate summary
financeReportSchema.statics.calculateSummary = async function(reportType, startDate, endDate) {
    const summary = await this.aggregate([
        {
            $match: {
                reportType,
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalTransactions: { $sum: 1 },
                averageAmount: { $avg: '$amount' }
            }
        }
    ]);

    return summary[0] || {
        totalAmount: 0,
        totalTransactions: 0,
        averageAmount: 0
    };
};

const FinanceReport = mongoose.model('FinanceReport', financeReportSchema);

module.exports = FinanceReport;