const mongoose = require('mongoose');

const publishSettingSchema = new mongoose.Schema({
    examType: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExamType',
        required: true
    },
    publishType: {
        type: String,
        enum: ['immediate', 'scheduled'],
        default: 'immediate'
    },
    requireAllSubjects: {
        type: Boolean,
        default: true
    },
    classWiseSchedule: [{
        class: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Class'
        },
        publishDateTime: Date,
        isPublished: {
            type: Boolean,
            default: false
        }
    }],
    autoPublish: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PublishSetting', publishSettingSchema);
