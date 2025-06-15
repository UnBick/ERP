const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['report_card', 'certificate', 'letter', 'id_card'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    variables: [{
        name: String,
        description: String,
        defaultValue: String
    }],
    header: {
        enabled: Boolean,
        content: String,
        logo: String
    },
    footer: {
        enabled: Boolean,
        content: String
    },
    style: {
        font: String,
        fontSize: String,
        colors: {
            primary: String,
            secondary: String
        },
        layout: Object
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'archived'],
        default: 'draft'
    }
}, { timestamps: true });

templateSchema.index({ type: 1, status: 1 });
module.exports = mongoose.model('Template', templateSchema);