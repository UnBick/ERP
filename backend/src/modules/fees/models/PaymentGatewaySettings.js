const mongoose = require('mongoose');

const gatewayConfigSchema = new mongoose.Schema({
    enabled: {
        type: Boolean,
        default: false
    },
    mode: {
        type: String,
        enum: ['test', 'live'],
        default: 'test'
    },
    merchantId: {
        type: String,
        trim: true
    },
    apiKey: {
        type: String,
        trim: true
    },
    secretKey: {
        type: String,
        trim: true
    },
    saltKey: {
        type: String,
        trim: true
    },
    saltIndex: {
        type: String,
        trim: true
    },
    virtualAddress: {
        type: String,
        trim: true
    },
    upiKey: {
        type: String,
        trim: true
    }
});

const paymentGatewaySettingsSchema = new mongoose.Schema({
    sbi: gatewayConfigSchema,
    phonepe: gatewayConfigSchema,
    bhim: gatewayConfigSchema,
    defaultGateway: {
        type: String,
        enum: ['sbi', 'phonepe', 'bhim'],
        default: 'sbi'
    },
    lastUpdatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    webhookUrl: {
        type: String,
        trim: true
    },
    callbackUrl: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Add method to mask sensitive data when returning settings
paymentGatewaySettingsSchema.methods.toJSON = function() {
    const obj = this.toObject();
    const sensitiveFields = ['apiKey', 'secretKey', 'saltKey', 'upiKey'];
    
    ['sbi', 'phonepe', 'bhim'].forEach(gateway => {
        if (obj[gateway]) {
            sensitiveFields.forEach(field => {
                if (obj[gateway][field]) {
                    obj[gateway][field] = '******';
                }
            });
        }
    });
    
    return obj;
};

// Check if model exists before creating
module.exports = mongoose.models.PaymentGatewaySettings || mongoose.model('PaymentGatewaySettings', paymentGatewaySettingsSchema);
